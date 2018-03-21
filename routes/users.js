var express = require('express');
var router = express.Router();
var utils = require('../utils/utils');
var _ = require('lodash');
var Users = require('../models/Users');

/*
  Require authentication on ALL access to /notes/*
  Clients which are not logged in will receive a 403 error code.

  Cited from 6.170 staff version of fritter-react
*/
var requireAuthentication = function(req, res, next) {
  if (!req.currentUser) {
    utils.sendErrorResponse(res, 403, 'Must be logged in to use this feature.');
  } else {
    next();
  }
};

router.put('/logout', requireAuthentication);

/*
  For both login and create user, we want to send an error code if the user
  is logged in, or if the client did not provide a username and password
  This function returns true if an error code was sent; the caller should return
  immediately in this case.
*/
var invalidLogin = function(req, res) {
  if (req.currentUser) {
    utils.sendErrorResponse(res, 403, 'There is already a user logged in.');
    return true;
  } else if (!(req.body.email && req.body.password)) {
    utils.sendErrorResponse(res, 400, 'Email or password not provided.');
    return true;
  }
  return false;
};

/*
  POST /users
  Request body:
    - username
    - password
  Response:
    - success: true if user creation succeeded; false otherwise
    - err: on error, an error message
*/
router.post('/', function(req, res) {
  Users.createUser(req.body.email, req.body.password, function(err) {
    if (err) {
      if (err.taken) {
        utils.sendErrorResponse(res, 400, 'That email is already taken!');
      } else if (err.msg) {
        utils.sendErrorResponse(res, 400, err.msg);
      } else {
        utils.sendErrorResponse(res, 500, 'An unknown error has occurred.');
      }
    } else {
      utils.sendSuccessResponse(res);
    }
  });
})

/*
  POST /users/login
  Request body:
    - username
    - password
  Response:
    - success: true if login succeeded; false otherwise
    - content: on success, an object with a single field 'user', the object of the logged in user
    - err: on error, an error message
*/
router.post('/login', function(req, res) {
  if (invalidLogin(req, res)) {
    return;
  }
  Users.checkPassword(req.body.email, req.body.password, function(err, match, user) {
    if (match) {
      req.session.email = req.body.email;
      utils.sendSuccessResponse(res, { user: user });
    } else {
      utils.sendErrorResponse(res, 403, 'Invalid email or password.');
    }
  });
});

/*
  GET /users/current
  No request parameters
  Response:
    - success.loggedIn: true if there is a user logged in; false otherwise
    - success.user: if success.loggedIn, the currently logged in user
*/
router.get('/current', function(req, res) {
  if (req.currentUser) {
    utils.sendSuccessResponse(res, { loggedIn: true, user: req.currentUser });
  } else {
    utils.sendSuccessResponse(res, { loggedIn: false });
  }
});

/*
  POST /users/logout
  Request body: empty
  Response:
    - success: true if logout succeeded; false otherwise
    - err: on error, an error message
    - err handled by the authentication middleware (never gets here if not logged in)
*/
router.put('/logout', function(req, res) {
  req.session.destroy();
  utils.sendSuccessResponse(res);
});

module.exports = router;
