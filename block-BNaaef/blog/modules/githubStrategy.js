var express = require('express');
var passport = require("passport");
var GitHubStrategy = require("passport-github").Strategy;
var oAuthUser = require("../models/oAuthUser");
require('dotenv').config();

// Define the findOrCreate function
function findOrCreate(profile, done) {
  oAuthUser
    .findOne({ oAuthId: profile.id })
    .then((user) => {
      if (user) {
        return done(null, user);
      } else {
        const newUser = new oAuthUser({
          oAuthId: profile.id,
          fullname: profile.displayName,
          email: profile._json.email || profile.username,
        });

        newUser
          .save()
          .then((createdUser) => {
            return done(null, createdUser);
          })
          .catch((err) => {
            return done(err, null);
          });
      }
    })
    .catch((err) => {
      return done(err, null);
    });
}

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/github/callback",
    },
    function (accessToken, refreshToken, profile, cb) {
      findOrCreate(profile, cb);
    }
  )
);
