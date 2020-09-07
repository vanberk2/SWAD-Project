/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
/* eslint-disable no-shadow */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
const express = require('express');
const { check, validationResult } = require('express-validator');

const mongoose = require('mongoose');

const router = express.Router();

const bcrypt = require('bcrypt');

const saltRounds = 10;

var User = require('../models/user');

mongoose.connect('mongodb://mongodb:27017');
// mongoose.connect('mongodb+srv://root:s1mpl3@cluster0-pcjvm.gcp.mongodb.net/test', {useNewUrlParser: true})

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error: '));

async function regUser(req, res) {
  var userExists = false;

  var hashpass = await bcrypt.hash(req.body.password, saltRounds);

  User.findOne({ username: req.body.username })
    .exec()
    .then(async (result) => {
      if (result !== null) {
        console.log('username found!');
        userExists = true;
      }

      if (userExists === true) {
        res.render('login', {
          regStatus: 'That username is already taken!',
        });
      } else if (userExists === false) {
        new User({
          username: req.body.username,
          password: hashpass,
          answer: 0,
          pastAnswer: 0,
        }).save();

        req.session.username = req.body.username;

        res.render('questions', {
          username: req.body.username,
        });
      }
    });
}

async function loginUser(req, res) {
  var hashpass;
  User.findOne({ username: req.body.username })
    .exec()
    .then((result) => {
      if (result != null) {
        hashpass = result.password;
        bcrypt.compare(req.body.password, hashpass, function(err, match) {
          if (err) throw err;
          else if (match) {
            req.session.username = req.body.username;
            res.render('questions', {
              username: req.body.username,
            });
          }
        });
      } else {
        res.render('login', {
          liStatus: 'That username/password combination is not correct.',
        });
      }
    });
}

async function saveAnswer(req, res) {
  var npastAnswer;
  var qid = req.body.id;
  console.log(
    `lookin for user: ${req.session.username} and answer ${req.body.answer} w/ id ${qid}`,
  );
  User.findOne({ username: req.session.username })
    .exec()
    .then((result) => {
      if (result != null) {
        console.log(`found result, answer is ${result.answer[qid]}`);
        if (result.answer[qid] !== undefined) {
          npastAnswer = result.answer[qid];
          result.answer[qid] = req.body.answer;
          result.pastAnswer = npastAnswer;
          result.markModified('answer');
          result.markModified('pastAnswer');
          result.save();
        } else {
          result.answer[qid] = req.body.answer;
          result.markModified('answer');
          result.save();
        }
        console.log(`result.answer[qid] is ${result.answer[qid]}`);
        res.render('answer', {
          answer: req.body.answer,
          pastAnswer: npastAnswer,
        });
      }
    });
}

async function findAnswers(req, res) {
  User.findOne({ username: req.session.username })
    .exec()
    .then((result) => {
      if (result != null) {
        if (result.answer[1] !== undefined) {
          res.render('answers', {
            scubaAnswered: true,
          });
        } else {
          res.render('answers');
        }
      }
    });
}

/* GET home page. */
router.get('/', (req, res) => {
  if (!req.session.username) {
    res.render('login');
  } else {
    res.render('questions', {
      username: req.session.username,
    });
  }
});

router.post(
  '/register',
  [
    check('username')
      .not()
      .isEmpty()
      .trim()
      .escape()
      .withMessage('You must provide a username!'),
    check('password')
      .isLength({ min: 1, max: 30 })
      .withMessage('Your password must be between 8-30 characters'),
  ],
  (req, res) => {
    if (!req.session.username) {
      regUser(req, res);
    } else {
      res.render('questions', { username: req.session.username });
    }
  },
);

router.post(
  '/login',
  [
    check('username')
      .not()
      .isEmpty()
      .trim()
      .escape()
      .withMessage('You must provide a username!'),
    check('password')
      .isLength({ min: 1, max: 30 })
      .withMessage('Your password must be between 8-30 characters'),
  ],
  (req, res) => {
    loginUser(req, res);
  },
);

router.post('/logout', (req, res) => {
  // DESTROY the users session and
  // redirect them to loggedout page
  // if already not logged in then render logged out page
  // otherwise destroy session and log out
  if (!req.session.username) {
    res.render('login');
  } else {
    req.session.destroy();
    res.render('login', {
      liStatus: 'You have successfully logged out.',
    });
  }
});

router.post(
  '/answer',
  [
    check('answer')
      .not()
      .isNumeric()
      .withMessage('Your answer must be numeric.'),
  ],
  (req, res) => {
    if (!req.session.username) {
      res.render('login');
    } else {
      saveAnswer(req, res);
    }
  },
);

router.post('/next', (req, res) => {
  // TODO - SHOULD FIND NEXT UNANSWERED QUESTION BELONGING TO USER
  res.render('question', {
    username: req.session.username,
  });
});

router.get('/question', (req, res) => {
  // TODO - SHOULD FIND NEXT UNANSWERED QUESTION BELONGING TO USER
  res.render('question', {
    username: req.session.username,
  });
});

router.get('/answers', (req, res) => {
  if (!req.session.username) {
    res.render('login');
  } else {
    findAnswers(req, res);
  }
});

router.get('/credits', (req, res) => {
  res.render('credits');
});

router.post('/update', (req, res) => {
  // TODO - SHOULD ACTUALLY UPDATE
  res.render('answers', {
    username: req.session.username,
  });
});

// delete collections when we shut down app
// db.dropCollection('users');

module.exports = router;
