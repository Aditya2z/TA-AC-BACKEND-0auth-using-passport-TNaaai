var GoogleStrategy = require("passport-google-oauth20").Strategy;
var OAuthUser = require('../models/oauthUser');
var passport = require('passport');
require("dotenv").config();

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    OAuthUser.findOne({ googleId: profile.id })
    .then((user) => {
      if (!user) {
        const newUser = {
          googleId: profile.id,
          name: profile.displayName,
         email: profile._json.email,
        };

        OAuthUser.create(newUser).then((newUser) => {
            return cb(null, newUser);
        });
      } else {
        // If the user exists, return the existing user
        return cb(null, user);
      }
    })
    .catch((err) => {
      throw err;
    });
  }
));