var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
const mongoStore = require("connect-mongo");
var session = require('express-session');
var flash = require('connect-flash');
var auth = require('./middlewares/auth');
const googleStrategy = require("./modules/passport");
var passport = require('passport');

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const MongoStore = require("connect-mongo");
var OAuthUser = require('./models/oauthUser');

var app = express();

const mongoURI = "mongodb://localhost:27017/passport";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

require('dotenv').config();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Middleware for session management
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongoUrl: mongoURI
    })
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Serialize the user to store in the session
passport.serializeUser((user, done) => {
  // Save the user ID in the session
  done(null, user.id);
});

// Deserialize the user from the session based on the user ID
passport.deserializeUser((id, done) => {
  // Find the user based on the ID stored in the session
  OAuthUser.findById(id).then((user) => {
    done(null, user);
  }).catch((err) => {
    done(err, null);
  })
});

app.use(flash());
app.use(auth.userInfo);

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
