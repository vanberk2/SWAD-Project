// Import the dependencies for testing
const assert = require('assert');
const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');

const app = require('../app');

axiosCookieJarSupport(axios);

const PORT = 3000;

describe('application', async () => {
  /* fill these in before each test */
  let server = {};
  let client = {};

  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = `http://localhost:${PORT}/`;
  axios.defaults.validateStatus = () => true;

  /* Utility functions
   */
  // Deterministic (for testing) Math.random replacement
  // https://gist.github.com/mathiasbynens/5670917

  const psrand = (() => {
    let seed = 0xaabbccd;
    return () => {
      /* eslint-disable no-bitwise */
      // Robert Jenkins� 32 bit integer hash function
      seed = (seed + 0x7ed55d16 + (seed << 12)) & 0xffffffff;
      seed = (seed ^ 0xc761c23c ^ (seed >>> 19)) & 0xffffffff;
      seed = (seed + 0x165667b1 + (seed << 5)) & 0xffffffff;
      seed = ((seed + 0xd3a2646c) ^ (seed << 9)) & 0xffffffff;
      seed = (seed + 0xfd7046c5 + (seed << 3)) & 0xffffffff;
      seed = (seed ^ 0xb55a4f09 ^ (seed >>> 16)) & 0xffffffff;
      return (seed & 0xfffffff) / 0x10000000;
      /* eslint-enable no-bitwise */
    };
  })();

  // https://gist.github.com/6174/6062387#gistcomment-2915959
  function getRandomString(length) {
    let s = '';
    do {
      s += psrand()
        .toString(36)
        .substr(2);
    } while (s.length < length);
    s = s.substr(0, length);
    return s;
  }
  // borrowed from instructor.js in hw2
  async function createRandomUser(axiosClient) {
    const newUser = {
      username: getRandomString(10),
      password: getRandomString(10),
      birthday: new Date().toISOString(),
    };
    const response = await axiosClient.post('/register', newUser);
    return { newUser, response };
  }

  beforeEach(async () => {
    client = axios.create();
    // make a new cookie jar every time you create a new client
    client.defaults.jar = new tough.CookieJar();

    server = app.listen(PORT);
  });

  afterEach(async () => {
    await server.close();
  });
  describe('sanity', async () => {
    it('can successfully send an index', async () => {
      const result = await client.get('/');
      assert.strictEqual(result.status, 200);
    });

    it("doesn't send files that don't exist", async () => {
      const result = await client.get('doesnotexist');
      assert.strictEqual(result.status, 404);
    });

    it('sends the raw index.html', async () => {
      const result = await client.get('/');
      assert(result.data.includes('How much do you value your life?'));
    });
  });

  describe('unauthenticated state', async () => {
    describe('register', async () => {
      it('allows a user to register', async () => {
        const { newUser, response } = await createRandomUser(client);
        assert(response.data.includes(`Welcome, ${newUser.username}`));
      });
      it('requires alphanumeric username', async () => {
        const newUser = {
          username: 'test*',
          password: 'test',
          birthday: new Date().toISOString(),
        };
        const response = await client.post('/register', newUser);
        assert(response.data.includes(`Your username must be alphanumeric!`));
      });
      it('does not allow duplicate usernames (case insensitive)', async () => {
        // copied from instructor.js
        const { newUser } = await createRandomUser(client);
        const client2 = axios.create();
        const secondResponse = await client2.post('/register', newUser);
        // The second registration does not succeed
        assert(
          !secondResponse.data.includes(
            `Welcome to Express, ${newUser.username}`,
          ),
        );
        // A useful error message is returned
        assert(secondResponse.data.includes('That username is already taken.'));
      });
      it('requires a password to register', async () => {
        const newUser = {
          username: 'test',
          birthday: new Date().toISOString(),
        };
        const response = await client.post('/register', newUser);
        assert(response.data.includes(`You must enter a password!`));
      });
      it('requires password to be 8-30 characters', async () => {
        const newUser = {
          username: 'tester',
          password: 'testin',
          birthday: new Date().toISOString(),
        };
        const response = await client.post('/register', newUser);
        assert(
          response.data.includes(
            `Your password must be between 8-30 characters.`,
          ),
        );
      });
      it('password can only contain alphanumeric characters and !@#%^&*$+._()', async () => {
        const newUser = {
          username: 'testy',
          password: '|||',
          birthday: new Date().toISOString(),
        };
        const response = await client.post('/register', newUser);
        assert(
          response.data.includes(
            `Passwords can only contain the characters 0-9, A-Z, a-z, and !@#%^&*$+._()`,
          ),
        );
      });
      it('requires valid birthday', async () => {
        const newUser = {
          username: 'testy',
          password: 'password',
          birthday: 'chicken',
        };
        const response = await client.post('/register', newUser);
        assert(response.data.includes(`Please enter a valid birthday`));
      });
    });

    describe('login', async () => {
      it('allows a registered user to login', async () => {
        const { newUser } = await createRandomUser(client);
        const client2 = axios.create();
        const response = await client2.post('/login', {
          username: newUser.username,
          password: newUser.password,
          birthday: newUser.birthday,
        });
        assert(response.data.includes(`Welcome, ${newUser.username}`));
      });
      it("doesn't allow login without the proper password", async () => {
        const { newUser } = await createRandomUser(client);
        const client2 = axios.create();
        const response = await client2.post('/login', {
          username: newUser.username,
          password: `wrong${newUser.password}`,
        });
        assert(
          response.data.includes(
            'That username/password combination is not correct.',
          ),
        );
        assert(response.data.includes('Sign up'));
      });
    });
  });

  describe('authenticated state', async () => {
    let userInfo;
    beforeEach(async () => {
      userInfo = await createRandomUser(client);
    });
    describe('logout', async () => {
      it('shows the login screen after submitting the logout form', async () => {
        const { response } = await client.post('/logout');
        assert(response.data.includes('Sign up'));
      });
      it('does not allow a user to answer questions if logged out', async () => {
        await client.post('/logout');
        const { response } = await client.post('/answer');
        assert(response.includes('You must be logged in to do that.'));
      });
      it('does not allow a user to access survey results if logged out', async () => {
        await client.post('/logout');
        const { response } = await client.post('/answers');
        assert(response.includes('You must be logged in to do that.'));
      });
    });

    describe('questions-list', async () => {
      it('lists all unanswered questions', async () => {
        await client.post('/answer', { id: '1', answer: '214' });
        const { response } = await client.get('/');
        assert(!response.includes('q1'));
      });
    });

    describe('answers-list', async () => {
      it('lists all answered questions', async () => {
        await client.post('/answer', { id: '1', answer: '214' });
        const { response } = await client.get('/answers.html');
        assert(response.includes('answer1'));
      });
      it("shows user's average answer for all questions", async () => {});
      it('shows users individual answer for each question', async () => {});
      it('shows average user answer for each question', async () => {});
    });

    describe('question', async () => {
      it('prompts user to answer question if unanswered', async () => {
        const { response } = await client.get('/question?id=1');
        assert(!response.includes('Update your answer?'));
        assert(!response.includes('Enter a positive integer'));
      });
      it('prompts user to update answer if answered', async () => {
        await client.post('/answer', { id: '1', answer: '214' });
        const { response } = await client.get('/question?id=1');
        assert(response.includes('Update your answer?'));
      });
      it('shows results if answered', async () => {
        await client.post('/answer', { id: '1', answer: '214' });
        const { response } = await client.get('/question?id=1');
        assert(response.includes('Your Answer:'));
      });
    });

    describe('next', async () => {
      it('opens next unanswered question (wraps around)', async () => {
        const { response } = await client.post('/next', { id: '1' });
        assert(response.includes('#2'));
      });
    });

    describe('answer', async () => {
      it('saves user answer', async () => {
        await client.post('/answer', { id: '1', answer: '1337' });
        const { response } = await client.get('/answers.html');
        assert(response.includes('1337'));
      });
      it('does not allow non-numeric answers', async () => {
        const { response } = await client.post('/answer', {
          id: '1',
          answer: 'chicken',
        });
        assert(response.includes('Your answer must be a positive integer.'));
      });
      it('calculates overall life worth based on user answer', async () => {});
      it('calculates overall life worth based on all answers to this question', async () => {});
      it('calculates per year worth based on user answer', async () => {});
      it('calculates per year worth based on all answers to this question', async () => {});
    });
  });
});
