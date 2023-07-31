var User = require('../models/user');
var OAuthUser = require('../models/oauthUser');

auth = {
    // Define a middleware function to check if the user is logged in
    isLoggedIn: (req, res, next) => {
    // Check if the user is authenticated
    if (req.session.userId || (req.session.passport && req.session.passport.user)) {
      // User is logged in, proceed to the next middleware
      next();
    } else {
      // User is not logged in, redirect to the login page
      req.flash("error", "Authentication Required, Login first!")
      res.redirect("/users/login");
    }
  },

  userInfo: (req, res, next) => {
    if (req.session && req.session.userId) {
      User.findById(req.session.userId, "-password")
        .then((user) => {
          if (user) {
            req.user = user;
            res.locals.user = user;
            next();
          } else {
            req.user = null;
            res.locals.user = null;
            next();
          }
        })
        .catch((err) => {
          req.user = null;
          res.locals.user = null;
          next(err);
        });
    } else if (req.session.passport && req.session.passport.user) {
      OAuthUser.findById(req.session.passport.user)
        .then((user) => {
          if (user) {
            req.user = user;
            res.locals.user = user;
            next();
          } else {
            req.user = null;
            res.locals.user = null;
            next();
          }
        })
        .catch((err) => {
          req.user = null;
          res.locals.user = null;
          next(err);
        });
    } else {
      req.user = null;
      res.locals.user = null;
      next();
    }
  },    

}

module.exports = auth;