var express = require('express');
var moment = require('moment');
var router = express.Router();
var utils = require('../utils/utils');
var mailer = require('../utils/emailNotifications.js');
var Parties = require('../models/Parties');
var Users = require('../models/Users');





/*
  Require authentication on ALL access to /parties/*
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

// Register the middleware handlers above.
router.all('*', requireAuthentication);

/*
  At this point, all requests are authenticated and checked:
  1. Clients must be logged into some account
*/


/*
  GET /party/user/:email
  Request parameters:
    - email: the email of the user to get parties for.
  Response:
    - success: true if the server succeeded in getting the parties which the user
        is invited to or attending.
    - content: on success, an object with a list of parties that the user is
        invited to or attending.
    - err: on failure, an error message
*/
router.get('/user/:email', function(req, res) {
  Parties.findPartiesByInvitedOrAttending(req.params.email, function(err, parties) {
    if (err) {
      utils.sendErrorResponse(res, 404, 'No such user.');
    } else {
      utils.sendSuccessResponse(res, { parties: parties });
    }
  });
});

/*
  GET /party/:partyId
  Request parameters:
    - partyId: the id of the party to get.
  Response:
    - success: true if the server succeeded in getting the party.
    - content: on success, the party object corresponding to the partyId passed in.
    - err: on failure, an error message
*/
router.get('/:partyId', function(req, res) {
  Parties.findParty(req.params.partyId, function(err, party) {
    if (err) {
      utils.sendErrorResponse(res, 404, err.msg);
    } else {
      utils.sendSuccessResponse(res, { party: party});
    }
  });
});


/*
  POST /party
  Request body:
    - content: the content of the party
  Response:
    - success: true if the server succeeded in posting the party.
    - err: on failure, an error message
*/
router.post('/', function(req, res) {
  var emailList = req.body.party.guests.map(function(guest) {
    return guest.entry2;
  });

  var supplyList = req.body.party.items.map(function(item) {
    return {name: item.entry1, quantity: item.entry2, unit: item.entry3};
  });
  Parties.addParty({
    host: req.currentUser.email,
    title: req.body.party.title,
    location: req.body.party.location,
    date: req.body.party.date,
    description: req.body.party.description,
    invited: emailList,
    supplies: supplyList
  }, function(err, newParty) {
    if (err) {
      if (err.msg) {
        utils.sendErrorResponse(res, 400, err.msg);
      } else {
        utils.sendErrorResponse(res, 500, 'An unknown error occurred.');
      }
    } else {
      //send emails to those invited
      var partyTitle = req.body.party.title;
      var partyHost = req.currentUser.email;
      var partyLocation = req.body.party.location;
      var partyDate = moment(req.body.party.date).format('MM/DD/YYYY [at] h:mm A');
      var partyDescription = req.body.party.description;
      var subjectLine = 'You have been invited to ' + partyTitle + '!';
      var additionalHtml = '<br/>Log in to Potluck at <a href="https://potluck-armr.herokuapp.com/">' +
        'https://potluck-armr.herokuapp.com/</a>' +
        ' with your existing ' +
        'Potluck account or register as a new user with this email ' +
        'to view more information and RSVP for this event!';
      emailList.forEach(function(recipient) {
        mailer.sendEmail(recipient, partyTitle, partyHost, partyLocation, partyDate, partyDescription, subjectLine, additionalHtml);
      });

      utils.sendSuccessResponse(res, newParty);
    }
  });
});

/*
  DELETE /party/:partyId
  Request parameters:
    - partyId: the unique ID of the party hosted by the logged in user to delete.
  Response:
    - success: true if the server succeeded in deleting the user's party
    - err: on failure, an error message
*/
router.delete('/:partyId', function(req, res) {
  Parties.deleteParty(req.params.partyId, function(err) {
    if (err) {
      utils.sendErrorResponse(res, 404, err.msg);
    } else {
      utils.sendSuccessResponse(res);
    }
  });
});

/*
  POST /party/:partyId/supplies
  Request parameters:
    - partyId: the unique ID of the party which the logged in user is invited to.
  Request body:
    - name: the name of the item to add
    - quantity: the number of the item to add to the supply list.
  Response:
    - success: true if the server succeeded in adding the item to the supply list.
    - err: on failure, an error message
*/
router.post('/:partyId/supplies', function(req, res) {
  Parties.addItem(req.params.partyId, req.body.name, req.body.quantity, req.body.unit, function(err) {
    if (err) {
      utils.sendErrorResponse(res, 404, err.msg);
    } else {
      utils.sendSuccessResponse(res);
    }
  });
});

/*
  POST /party/:partyId/closeout
  Request parameters:
    - partyId: the unique ID of the party which the logged in user is the host of.
  Response:
    - success: true if the server succeeded in closing out the party.
    - err: on failure, an error message
*/
router.post('/:partyId/closeout', function(req, res) {
  Parties.closeOutParty(req.params.partyId, function(err) {
    if (err) {
      utils.sendErrorResponse(res, 404, err.msg);
    } else {
      utils.sendSuccessResponse(res);
    }
  });
});

/*
  POST /party/:partyId/clearPayments/:userId
  Request parameters:
    - partyId: the unique ID of the party which the logged in user attended.
    - userId: the unique ID of the logged in uesr
  Response:
    - success: true if the server succeeded in clearing all payments to/from this user.
    - err: on failure, an error message
*/
router.post('/:partyId/clearPayments/:userId', function(req, res) {
  Parties.clearPayments(req.params.partyId, req.params.userId, function(err) {
    if (err) {
      utils.sendErrorResponse(res, 404, err.msg);
    } else {
      utils.sendSuccessResponse(res);
    }
  });
});

/*
  POST /party/:partyId/guests
  Request parameters:
    - partyId: the unique ID of the party which the logged in user is hosting.
  Request body:
    - email: email of the person to invite to the party.
  Response:
    - success: true if the server succeeded in adding the guest to the guest list.
    - err: on failure, an error message
*/
router.post('/:partyId/guests', function(req, res) {
  Parties.inviteGuest(req.params.partyId, req.body.email, function(err, party) {
    if (err) {
      utils.sendErrorResponse(res, 404, err.msg);
    } else {
      //send email to the newly invited guest
      var recipient = req.body.email;
      var partyTitle = party.title;
      var partyHost = party.host.email;
      var partyLocation = party.location;

      var partyDate = moment.utc(party.date).format('MM/DD/YYYY [at] h:mm A');
      var partyDescription = party.description;
      var subjectLine = 'You have been invited to ' + partyTitle + '!';
      var additionalHtml = '<br/>Log in to Potluck at <a href="https://potluck-armr.herokuapp.com/">' +
        'https://potluck-armr.herokuapp.com/</a> with your existing ' +
        'Potluck account or register as a new user with this email ' +
        'to view more information and RSVP for this event!';
      mailer.sendEmail(recipient, partyTitle, partyHost, partyLocation, partyDate, partyDescription, subjectLine, additionalHtml);

      utils.sendSuccessResponse(res);
    }
  });
});

/*
  DELETE /party/:partyId/supplies/:itemId
  Request parameters:
    - partyId: the unique ID of the party which the logged in user is hosting.
    - itemId: the unique ID of the item which the user would like to delete
  Response:
    - success: true if the server succeeded in deleting the item from the supply list.
    - err: on failure, an error message
*/
router.delete('/:partyId/supplies/:itemId', function(req, res) {
  Parties.deleteItem(req.params.partyId, req.params.itemId, function(err) {
    if (err) {
      utils.sendErrorResponse(res, 404, err.msg);
    } else {
      utils.sendSuccessResponse(res);
    }
  });
});

/*
  DELETE /party/:partyId/guests/:email
  Request parameters:
    - partyId: the unique ID of the party which the logged in user is hosting.
    - email: the unique email of the user which the logged in user would like to
        remove from invited list.
  Response:
    - success: true if the server succeeded in deleting the user from invited list.
    - err: on failure, an error message
*/
router.delete('/:partyId/guests/:email', function(req, res) {
  Parties.removeGuest(req.params.partyId, req.params.email, function(err) {
    if (err) {
      utils.sendErrorResponse(res, 404, err.msg);
    } else {
      utils.sendSuccessResponse(res);
    }
  });
});

/*
  PUT /party/:partyId/supplies/:itemId
  Request parameters:
    - partyId: the unique ID of the party which the logged in user is attending.
    - itemId: the unique ID of the item to be claimed.
  Response:
    - success: true if the server succeeded in claiming the item for the user.
    - err: on failure, an error message
*/
router.put('/:partyId/supplies/:itemId', function(req, res) {
  Parties.claimItem(req.params.partyId, req.params.itemId, req.currentUser._id, req.body.quantity, function(err) {
    if (err) {
      utils.sendErrorResponse(res, 404, err.msg);
    } else {
      utils.sendSuccessResponse(res);
    }
  });
});

/*
  PUT /party/:partyId/cost/:itemId
  Request parameters:
    - partyId: the unique ID of the party which the logged in user is attending.
    - itemId: the unique ID of the item to be claimed.
  Response:
    - success: true if the server succeeded in claiming the item for the user.
    - err: on failure, an error message
*/
router.put('/:partyId/cost/:itemId', function(req, res) {
  Parties.addCost(req.params.partyId, req.params.itemId, req.body.cost, function(err) {
    if (err) {
      utils.sendErrorResponse(res, 404, err.msg);
    } else {
      utils.sendSuccessResponse(res);
    }
  });
});

/*
  PUT /party/:partyId/guests
  Request parameters:
    - partyId: the unique ID of the party which the logged in user is invited to.
  Request body:
    - attending: a boolean saying whether the user is attending.
  Response:
    - success: true if the server succeeded in rsvping the user.
    - err: on failure, an error message
*/
router.put('/:partyId/guests', function(req, res) {
  Parties.rsvp(req.params.partyId, req.currentUser._id, req.body.attending, function(err) {
    if (err) {
      utils.sendErrorResponse(res, 404, err.msg);
    } else {
      utils.sendSuccessResponse(res);
    }
  });
});

/*
  PUT /party/:partyId/sendReminders
  Request parameters:
    - partyId: the unique ID of the party from which reminders should be sent
  Response:
    - success: true if the reminder emails are sent to all invited and attending
    - err: on failure, error message
*/
router.put('/:partyId/sendReminders', function(req, res) {
  Parties.findParty(req.params.partyId, function(err, party) {
    if (err) {
      utils.sendErrorResponse(res, 404, err.msg);
    } else {
      //send emails to all invited and attending
      var partyTitle = party.title;
      var partyHost = party.host.email;
      var partyLocation = party.location;
      var partyDate = moment.utc(party.date).format('MM/DD/YYYY [at] h:mm A');
      var partyDescription = party.description;
      var subjectLine = 'Reminder: ' + partyTitle + ' is coming up!';

      party.invited.forEach(function(email) {
        var additionalHtml = '<br/>Log in to Potluck at <a href="https://potluck-armr.herokuapp.com/">' +
          'https://potluck-armr.herokuapp.com/</a> with your existing ' +
          'Potluck account or register as a new user with this email ' +
          'to view more information and RSVP for this event!';
        mailer.sendEmail(email, partyTitle, partyHost, partyLocation, partyDate, partyDescription, subjectLine, additionalHtml);
      });

      party.attending.forEach(function(user) {
        var additionalHtml = '<br/>Log in to Potluck at <a href="https://potluck-armr.herokuapp.com/">' +
          'https://potluck-armr.herokuapp.com/</a> to view more information ' +
          'about this event!';
        mailer.sendEmail(user.email, partyTitle, partyHost, partyLocation, partyDate, partyDescription, subjectLine, additionalHtml);
      });

      utils.sendSuccessResponse(res);
    }
  });
});


module.exports = router;
