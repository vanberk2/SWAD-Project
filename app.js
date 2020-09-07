const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const hbs = require('express-handlebars');
const session = require('express-session');

const logger = require('morgan');
const indexRouter = require('./routes/index');

const app = express();

// view engine setup
// set up hbs with app
app.engine(
  'hbs',
  hbs({
    extname: 'hbs',
    defaultView: 'default',
    layoutsDir: path.join(__dirname, '/views/pages/'),
    partialsDir: path.join(__dirname, '/views/partials/'),
  }),
);
app.set('view engine', 'hbs');

// set up express-session with app
app.set('trust proxy', 1);
app.use(
  session({
    secret: 'confidential',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 50000 },
  }),
);

/* istanbul ignore if */
if (process.env.NODE_ENV !== 'test') {
  /* only log http requests when not testing */
  app.use(logger('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './static')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
