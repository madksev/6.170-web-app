/*
* Model representing our parties.
* EXAMPLE PARTY:
*   { 'host': userId
*     'title': "Rachel's 21st"
*     'location': "Anna's apartment"
*     'date': 'A Date() object representing when the party will be held.'
*     'description': 'Gonna be a rager!'
*     'invited': [rachelro@mit.edu, madksev@mit.edu],
*     'attending': [userId],
*     'supplies': [itemId],
*     'closedOut': true or false,
*     'payments': {
*                   payer: userId,
*                   payee: userId,
*                   amount: 5
*                 }
*   }
* Invited is a list of emails of people who the host invites to the party
* date is always a Date() parsable object (printable as a string)
*/
var inputValidation = require('../utils/validation.js');
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Item = require('./Items.js');
var Users = require('./Users.js');

var splitter = require('../utils/costSplitting.js');


var partySchema = mongoose.Schema({
  host: {type: ObjectId, ref: "User"},
  title: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  date: { type: Date, default: Date.now },
  description: {
    type: String,
    required: true
  },
  invited: [String],
  attending: [{type: ObjectId, ref: "User"}],
  supplies: [{type: ObjectId, ref: "Item"}],
  closedOut: { type: Boolean, default: false},
  payments: [
    {
      payer: {type: ObjectId, ref: "User"},
      payee: {type: ObjectId, ref: "User"},
      amount: Number,
    }
  ],
});

partySchema.path("title").validate(function (titleInput) {
  var trimmed = titleInput.trim();
  return trimmed.length > 0 && trimmed.length < 100;
}, 'Title Validation error');

partySchema.path("location").validate(function (locationInput) {
  return inputValidation.validateTextInputLength(locationInput);
}, 'Loction Validation error');

partySchema.path("description").validate(function (descriptionInput) {
  return inputValidation.validateTextInputLength(descriptionInput);
}, 'Title Validation error');


var partyModel = mongoose.model('Party', partySchema);

var Parties = (function(partyModel) {

  var that = {};

  /*
    Creates a party, and saves in Party collection

    Params:
      - party: party json object
    Callback:
      - success: send null response along with new party object
      - err: on failure, an error message
  */
  that.addParty = function(party, callback) {
    Users.findUser(party.host, function(err, user) {
      if (err) {
        console.log(err);
      }
      if (party.supplies.length > 0) {
        Item.createItems(party.supplies, function(err, docs) {
          if (err) {
            console.log(err);
          }
          var newParty = new partyModel({
            host: user,
            title: party.title,
            location: party.location,
            date: party.date,
            description: party.description,
            invited: party.invited,
            attending: [user],
            supplies: docs
          });
          newParty.save(function(err, newParty) {
            if (err) callback({ msg: err});
            callback(null, newParty);
          });
        });
      } else {
        var newParty = new partyModel({
          host: user,
          title: party.title,
          location: party.location,
          date: party.date,
          description: party.description,
          invited: party.invited,
          attending: [user],
          supplies: []
        });
        newParty.save(function(err, newParty) {
          if (err) callback({ msg: err});
          callback(null, newParty);
        });
      }
    });
  }

  /*
    Finds a party

    Params:
      - partyId: id of party to find
    Callback:
      - success: send null response along with the result of the query
      - err: on failure, an error message
  */
  that.findParty = function(partyId, callback) {
    var populateQuery = [
      {path: 'attending', model: 'User'},
      {path: 'host', model: 'User'}
    ];
    partyModel.findOne({ _id: partyId }).populate(populateQuery).exec(function(err, result) {
      if (err) {
        callback({ msg: err });
      }
      else if (result !== null) {
        callback(null, result);
      } else {
        callback({ msg: 'No such party!' });
      }
    });
  }

  /*
    Deletes a party

    Params:
      - partyId: id of party to delete
    Callback:
      - success: send null response
      - err: on failure, an error message
  */
  that.deleteParty = function(partyId, callback) {
    partyModel.findOne({ _id: partyId }, function(err, result) {
      if (err) callback({ msg: err });
      else if (result !== null) {
        result.remove();
        callback(null);
      } else {
        callback({ msg: 'No such party!'});
      }
    });
  }

  /*
    Finds all parties a user is invited to or attending

    Params:
      - email: email of the user
    Callback:
      - success: send null response along with the result of the query
      - no results: send response 'No such parties!'
      - err: on failure, an error message
  */
  that.findPartiesByInvitedOrAttending = function(email, callback) {
    Users.findUser(email, function(err, user) {
      if (!user) {
        callback({msg: 'No user exists with email '+ email});
      } else {
        var populateQuery = [{path: 'supplies', model: 'Item', populate: {
            path: 'contributor', model: 'User'
          }},
          {path: 'attending', model: 'User'}, {path: 'host', model: 'User'},
          {path: 'payments.payer', model:'User'},
          {path: 'payments.payee', model:'User'},
        ];
        var findQuery = { $or : [
              {attending: mongoose.Types.ObjectId(user._id)},
              {invited: email}
          ]};
        partyModel.find(findQuery).populate(populateQuery).sort('-date').exec(function(err, result) {
          if (err) callback({ msg: err });
          if (result) {
            callback(null, result);
          } else {
            callback({ msg: 'No such parties!'});
          }
        });
      }
      
    });

  }

  /*
    Invites a guest by email to a party

    Params:
      - partyId: id of party
      - email: email of guest to invite
    Callback:
      - success: send null response along with updated party document
      - email already in invited list: send message detailing this
      - party not found: message 'Party does not exist!'
  */
  that.inviteGuest = function(partyId, email, callback) {
    partyModel.findOne({_id: partyId, invited: {$in: [email]}}).exec(function(err, result) {
      if (err) callback({ msg: err });
      else if (result) {
        callback({ msg: 'Email already in invited list!'});
      } else {
        // add email to invited list
        partyModel.findByIdAndUpdate(partyId, { $push: {invited: email } }).populate({path: 'host', model: 'User'}).exec(function(err, updatedDoc) {
          if (err) callback({ msg: err });
          else {
            if (updatedDoc == null) {
              callback({ msg: 'Party does not exist!'});
            } else {
              callback(null, updatedDoc);
            }
          }
        });
      }
    });
  }


  /*
    Removes a guest from a party's invited list

    Params:
      - partyId: id of party
      - email: email of guest to remove from invited
    Callback:
      - success: send null response
      - if no result: send message 'No such guest!'
      - err: on failure, an error message
  */
  that.removeGuest = function(partyId,  email, callback) {
    partyModel.update({_id: partyId}, {$pull: { invited: { $in: [email] }}}, function(err, result) {
      if (err) callback({ msg: err });
      if (result !== null) {
        callback(null);
      } else {
        callback({ msg: 'No such guest!'});
      }
    });
  };


  /*
    Adds an item the guest or host wants to be at this party

    Params:
      - partyId: id of party
      - itemName: name of the item
      - itemQuantity: quantity of the item to be brought
      - itemUnit: unit of the item to be brought
    Callback:
      - success: send null response
      - if no result: send message 'Party does not exist!'
      - err: on failure, an error message
  */
  that.addItem = function(partyId, itemName, itemQuantity, itemUnit, callback) {
    Item.createItem(itemName, itemQuantity, itemUnit, function(err, item) {
      if (err) {
        callback(err);
      } else {
        partyModel.update({ _id: partyId }, { $push: {supplies: item._id } }, function(err, updatedDoc) {
          if (err) callback({ msg: err });
          else {
            if (updatedDoc !== null) {
              callback(null);
            } else {
              callback({msg: 'Party does not exist!'});
            }
          }
        });
      }
    });
  }

  /*
    Removes an item that people no longer want to be at this party

    Params:
      - partyId: id of party
      - itemId: id of the item to remove
    Callback:
      - success: send null response
      - if no result: send message 'Party does not exist!'
      - err: on failure, an error message
  */
  that.deleteItem = function(partyId, itemId, callback) {
    partyModel.findOne({ _id: partyId, supplies: {$in: [itemId]}}).exec(function(err, result) {
      if (err) callback({ msg: err });
      if (result !== null) {
        partyModel.update({_id: partyId}, {$pull: {supplies : {$in: [itemId]}}}, function(err, updatedDoc) {
          if (err) callback({ msg: err });
          else {
            if (updatedDoc == null) {
              callback({ msg: 'Party does not exist!'});
            } else {
              callback(null);
            }
          }
        });
      } else {
        callback({ msg: 'Item does not exist!'});
      }
    });
  }

  /*
    Add cost to a contribution

    Params:
      - partyId: id of party
      - itemId: id of the item with which to update cost
      - cost: cost of the contribution
    Callback:
      - success: send null response
      - err: on failure, an error message
  */
  that.addCost = function(partyId, itemId, cost, callback) {
    Item.addCost(partyId, itemId, cost, function(err, result) {
      if (err) callback({ msg: err });
      else {
        callback(null);
      }
    })
  }

  /*
    Allows a user to claim an item on the supplies list for this party if they
    are attending

    Params:
      - partyId: id of party
      - itemId: id of the item to claim
      - userId: id of user claiming the item
      - quantity: quantity the user would like to bring
    Callback:
      - success: send null response
      - if the user trying to claim is not on the attending list: send message
        'User must be attending in order to claim items'
      - err: on failure, an error message
  */

  that.claimItem = function(partyId, itemId, userId, quantity, callback) {
    partyModel.findOne({_id: partyId}).populate({path: 'attending', model: 'User'}).exec(function(err, party) {
      if (err) callback({msg: err});
      else {
        var attendingUserIds = party.attending.map(function(user) {
          return user.id;
        });
        if (attendingUserIds.indexOf(userId.toString()) == -1) {
          callback({msg: 'User must be attending in order to claim items'});
        } else {
          Item.addContributor(partyId, itemId, userId, quantity, function(err, result) {
            if (err) callback({ msg: err });
            else {
              if(result.quantity > 0){
                that.addItem(result.partyId, result.name, result.quantity, result.unit, function(err) {
                  callback(null);
                })
              } else {
                callback(null);
              }
            }
          });
        }
      }
    });
  }

  /*
    Allows a user to RSVP for this party

    Params:
      - partyId: id of party
      - userId: id of user
      - attending: boolean of whether user is attending (true if yes, false
        if no)
    Callback:
      - success: send null response
      - if party not found: send message 'Party does not exist!'
      - err: on failure, an error message
  */
  that.rsvp = function(partyId, userId, attending, callback) {
    if (attending) {
      Users.findUserById(userId, function(err, result) {
        partyModel.findOne({ _id: partyId }, function(err, desiredParty) {
          if (err) callback({msg: err});
          else {
            if (desiredParty == null) {
              callback({ msg: 'Party does not exist!'});
            }
            else if (desiredParty.invited.indexOf(result.email) != -1) {
              partyModel.update({ _id: partyId }, { $addToSet: {attending: userId }, $pull: {invited : result.email} }, function(err, updatedDoc) {
               if (err) callback({ msg: err });
               else {
                 if (updatedDoc == null) {
                   callback({ msg: 'Party does not exist!'});
                 } else {
                   callback(null);
                 }
               }
             });
            }
            else if (desiredParty.invited.indexOf(result.email) == -1) {
              callback({msg: 'User is not invited'});
            }
          }
        })
      });
    } else {
      Users.findUserById(userId, function(err, result) {
        partyModel.findByIdAndUpdate(partyId, { $pull: { attending: userId, invited : result.email } }).populate({path: 'supplies', model: 'Item', populate: {
          path: 'contributor', model: 'User'
        }}).exec(function(err, updatedDoc) {
          if (err) callback({ msg: err });
          else {
            if (updatedDoc == null) {
              callback({ msg: 'Party does not exist!'});
            } else {
              Item.removeContributor(updatedDoc.supplies, userId, function(err) {
                if (err) callback({ msg: err});
                else {
                  callback(null);
                }
              });
            }
          }
        });
      });
    }
  }

  /*
    Get payments (split costs) for this party

    Params:
      - party: party object
    Returns:
      - payments to the splitter to split costs among attendees based on the
        cost each attendee has paid for their contributions
  */
  var getPayments = function(party) {
    var contributions = {};
    for (var i = 0; i < party.attending.length; i++) {
      contributions[party.attending[i]] = 0;
    }
    for (var i = 0; i < party.supplies.length; i++) {
      var item = party.supplies[i];
      if (item.contributor != null) {
        contributions[item.contributor] = contributions[item.contributor] + item.cost;
      }
    }
    // Now have all the contributions by each user, now will use splitter to split the costs.
    var payments = [];
    for (user in contributions) {
      payments.push([user, contributions[user]]);
    }
    return splitter.splitCosts(payments);
  }

  /*
    Close out this party, no longer allowing guests to take any actions towards
    claiming items or inputting costs. This will be performed by the host. After
    the party is closed out, costs will be split so attendees can know who owes
    each other what.

    Params:
      - partyId: id of party
    Callback:
      - success: send null response
      - if party not found: send message 'Party does not exist!'
      - err: on failure, an error message
  */
  that.closeOutParty = function(partyId, callback) {
    partyModel.findOne({ _id: partyId }).populate('supplies').exec(function(err, result) {
      if (err) callback({ msg: err });
      else if (result !== null) {
        var payments = getPayments(result);
        partyModel.update({ _id: partyId}, { closedOut: true, payments: payments}, function(err, updatedDoc) {
          callback(null);
        });
      } else {
        callback({ msg: 'Party does not exist!' });
      }
    });
  }

  /*
    When this party is closed out, removes payments from the outstanding list
    of owed payments for attendees who indicate they have paid back or been
    paid back for money owed.

    Params:
      - partyId: id of party
      - userId: id of user who paid someone back or got paid back (user that
        clicks button indicating payments were made)
    Callback:
      - success: send null response
      - if party not found: send message 'Party does not exist!'
      - err: on failure, an error message
  */
  that.clearPayments = function(partyId, userId, callback) {
    partyModel.findOne({ _id: partyId}, function(err, result) {
      if (err) {
        callback({ msg: err});
      }
      if (result !== null) {
        var payments = result.payments.filter((payment) => {
          return (payment.payee != userId && payment.payer != userId);
        })
        partyModel.update({ _id: partyId}, { closedOut: true, payments: payments}, function(err, updatedDoc) {
          callback(null);
        });
      } else {
        callback({ msg: 'Party does not exist!' });
      }
    })
  }

  Object.freeze(that);
  return that;

})(partyModel);

module.exports = Parties;
