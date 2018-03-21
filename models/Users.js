/*
* Model representing our users.
* EXAMPLE USER:
*   { 'email': 'rachelro@mit.edu'
*     'passHash': 'salted hash of password'
*     'parties': [
*                   party: partyId,
*                   itemsBringing: [itemId]
*                ]
*   }

* Emails and passwords are always strings.
*/

var inputValidation = require('../utils/validation.js');
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var bcrypt = require('bcryptjs');

var userSchema = mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  passHash: {
    type: String,
    required: true
  },
  parties: [
            { party: {type: ObjectId, ref: "Party"},
             itemsBringing: [{type: ObjectId, ref: "Item"}]
            }
            ]
});


var userModel = mongoose.model('User', userSchema);

var Users = (function(userModel) {
  var that = {};

  /*
    Find this user in the Users collection.

    Params:
      - email: email of the user to find
    Callback:
      - success: send null response along with the document matching the query
      - if user not found: send message 'No such user!'
      - err: on failure, an error message
  */
  that.findUser = function(email, callback) {
    userModel.findOne({ email: email }, function(err, result) {
      if (err) callback({ msg: err });
      if (result !== null) {
        callback(null, result);
      } else {
        callback({ msg: 'No such user!' });
      }
    });
  }

  /*
    Checks password the user enters to make sure it matches this user's
    real password.

    Params:
      - email: email of the user
      - password: password entered
    Callback:
      - success (password matches): send tuple including null response along
        with a boolean indicating the match (true) and the user document
        matching the query
      - if password doesn't match: send tuple including null response along
        with a boolean indicating no match (false) and null to indicate no
        matching document
      - err: on failure, an error message
  */
  that.checkPassword = function(email, password, callback) {
    userModel.findOne({ email: email }, function(err, result) {
      if (err) callback({ msg: err });
      if (result !== null && bcrypt.compareSync(password, result.passHash)) {
        callback(null, true, result);
      } else {
        callback(null, false, null);
      }
    });
  }

  /*
    Checks to make sure the email this person is trying to register with has
    not been used before. Also limits the email to be at least 6 chars.

    Params:
      - email: email to register
      - password: password entered
    Callback:
      - success (email not used): save user in collection and send null response
      - if not valid email: send back 'Usernames should be a valid email'
      - if email taken already: send back response that it is taken
      - err: on failure, an error message
  */
  that.createUser = function(email, password, callback) {
    userModel.findOne({ email: email}, function(err, result) {
      if (err) callback({ msg: err});
      if (result !== null) {
        callback({ taken: true});
      } else if (email.length < 6) {
        callback({ msg: 'Usernames should be a valid email' });
      } else {
        var hashedPass = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        var user = new userModel({ email: email,
                                   passHash: hashedPass  });
        user.save(function(err) {
          if (err) callback({ msg: err });
          callback(null);
        });
      }
    });
  }

  /*
    Find the user document with this email address.

    Params:
      - email: email of user to find
    Callback:
      - success: send null response along with user document matching the query
      - if not valid email: send back 'Usernames should be a valid email'
      - if user not in collection: send message 'No such user!'
      - err: on failure, an error message
  */
  that.findUserByEmail = function(email, callback) {
    userModel.findOne({ 'email': email }, function(err, result) {
      if (err) callback({ msg: err});
      if (result !== null) {
        callback(null, result);
      } else {
        callback({ msg: 'No such user!' });
      }
    });
  }

  /*
    Find the user document with this id.

    Params:
      - id: id of user to find
    Callback:
      - success: send null response along with user document matching the query
      - if user not in collection: send message 'No such user!'
      - err: on failure, an error message
  */
  that.findUserById = function(id, callback) {
    userModel.findOne({ '_id': id }, function(err, result) {
      if (err) callback({ msg: err});
      if (result !== null) {
        callback(null, result);
      } else {
        callback({ msg: 'No such user!' });
      }
    });
  }

  Object.freeze(that);
  return that;

})(userModel);

module.exports = Users;
