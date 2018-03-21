var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport(
    smtpTransport('smtps://thepotluckapp%40gmail.com:getPotlucky@smtp.gmail.com')
);

// verify connection configuration
transporter.verify(function(error, success) {
   if (error) {
        console.log(error);
   } else {
        console.log('Server is ready to take our messages');
   }
});

var emailNotifications = function() {
	var that = Object.create(emailNotifications.prototype);

	that.sendEmail = function(recipient, partyTitle, partyHost, partyLocation, partyDate, partyDescription, subjectLine, additionalHtml) {
		var mailOptions = {
			from: '"Potluck Application" <thepotluckapp@gmail.com>',
			to: recipient,
			subject: subjectLine,
			html: ('<b>'+ subjectLine + '</b><br/>' +
				'<p>Title: ' + partyTitle + '<br/>' +
        		'Host: ' + partyHost + '<br/>' +
        		'Location: ' + partyLocation + '<br/>' +
        		'Date: ' + partyDate + '<br/>' +
        		'Description: ' + partyDescription + '<br/>' +
		        additionalHtml +
        		'<br/>~ Get Potlucky ~</p>')
		}

		// send mail with defined transport object
	    transporter.sendMail(mailOptions, function(error, info){
	        if(error){
	            return console.log(error);
	        }
	        console.log('Message sent: ' + info.response);
	        console.log(info.response.toString());
	        transporter.close(); // shut down the connection pool, no more messages.
	    });
	}

	Object.freeze(that);
	return that;
}

module.exports = emailNotifications();