var GoogleStrategy = require("passport-google-oauth20").Strategy;
var OAuthUser = require('../models/oAuthUser');
var passport = require('passport');
require("dotenv").config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    OAuthUser.findOne({ oAuthId: profile.id })
    .then((user) => {
      if (!user) {
        const newUser = {
            oAuthId: profile.id,
            fullname: profile.displayName,
            email: profile._json.email,
          };

        OAuthUser.create(newUser).then((newUser) => {
            return cb(null, newUser);
        });
      } else {
        return cb(null, user);
      }
    })
    .catch((err) => {
      return cb(err, null);
    });
  }
));