var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var app = require('../app');

// Reset our mongoose collections so that the tests can run successfully.
for (var i in mongoose.connection.collections) {
  mongoose.connection.collections[i].remove(function() {});
}

var cookie;
var party1;
var populatedParty1;
var user2;
var cookie2;
var cookie3;

describe('Party API', function() {

	describe('GET /party/user/:email no parties', function() {

		it('Try to get parties without cookie', function(done) {
			request(app)
				.get('/party/user/madksev')
				.expect(403)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, false);
					assert.equal(res.body.err, 'Must be logged in to use this feature.');
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Register user and get new cookie', function(done) {
			request(app)
				.post('/users')
				.send({'email': 'madksev', 'password': 'testing'})
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
          assert.equal(res.body.success, true);
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Login a valid user', function(done) {
			request(app)
				.post('/users/login')
				.send({'email': 'madksev', 'password': 'testing'})
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.ok(res.headers['set-cookie']);
          cookie = res.headers['set-cookie'];
					assert.equal(res.body.success, true);
					assert.equal(res.body.content.user.email, 'madksev');
					assert.notEqual(res.body.content.user.passHash, undefined);
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Get parties for user with no parties', function(done) {
			request(app)
				.get('/party/user/madksev')
				.set({'cookie': cookie})
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, true);
					assert.equal(JSON.stringify(res.body.content.parties), JSON.stringify([]));
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Get parties for unregistered email', function(done) {
			request(app)
				.get('/party/user/maddog@mit.edu')
				.set({'cookie': cookie})
				.expect(404)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, false);
					assert.equal(res.body.err, 'No such user.');
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});
	});

	describe('POST /party', function() {

		it('Try to create a party while not logged in', function(done) {
			request(app)
				.post('/party')
				.expect(403)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, false);
					assert.equal(res.body.err, 'Must be logged in to use this feature.');
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Create a valid party', function(done) {
			request(app)
				.post('/party')
				.set({'cookie': cookie})
				.send({'party': {
									'title': 'Test Party',
									'location': 'Boston',
									'date': '2016-12-12T16:00:00',
									'description': 'Its party time',
									'guests':
										[{'entry1': 'guest1', 'entry2': 'guest1email'},
										{'entry1': 'guest2', 'entry2': 'guest2email'}],
									'items':
										[{'entry1': 'item1', 'entry2': 1, 'entry3': 'unit'},
										{'entry1': 'item2', 'entry2': 2, 'entry3': 'unit2'}]
									}
								})
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, true);
					assert.equal(res.body.content.title, 'Test Party');
					assert.equal(res.body.content.location, 'Boston');
					assert.equal(res.body.content.date, '2016-12-12T16:00:00.000Z');
					assert.equal(res.body.content.description, 'Its party time');
					assert.equal(JSON.stringify(res.body.content.invited.sort()), 
						JSON.stringify(['guest1email', 'guest2email']));
					assert.notEqual(res.body.content.host, undefined);
					assert.equal(res.body.content.attending.length, 1);
					assert.equal(res.body.content.supplies.length, 2);
					assert.equal(res.body.content.closedOut, false);
					assert.equal(res.body.content.payments.length, 0);
					party1 = res.body.content;
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});
	});

	describe('GET /party/:partyId', function() {

		it('Get a valid party', function(done) {
			request(app)
				.get('/party/'+party1._id)
				.set({'cookie': cookie})
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, true);
					assert.equal(res.body.content.party.title, 'Test Party');
					assert.equal(res.body.content.party.host.email, 'madksev');
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Get party without cookie', function(done) {
			request(app)
				.get('/party/'+party1._id)
				.expect(403)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, false);
					assert.equal(res.body.err, 'Must be logged in to use this feature.');
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Get a nonexistent party', function(done) {
			request(app)
				.get('/party/123')
				.set({'cookie': cookie})
				.expect(404)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, false);
					assert.notEqual(res.body.err, undefined);
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});
	});

	describe('GET /party/user/:email parties', function() {

		it('Get party for attending user', function(done) {
			request(app)
				.get('/party/user/madksev')
				.set({'cookie': cookie})
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, true);
					assert.equal(res.body.content.parties.length, 1);
					assert.equal(res.body.content.parties[0].title, 'Test Party');
					assert.equal(res.body.content.parties[0].attending.length, 1);
					assert.equal(res.body.content.parties[0].attending[0].email, 'madksev');
					populatedParty1 = res.body.content.parties[0];
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Create invited user', function(done) {
			request(app)
				.post('/users')
				.send({'email': 'guest1email', 'password': 'test'})
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, true);
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Login invited user', function(done) {
			request(app)
				.post('/users/login')
				.send({'email': 'guest1email', 'password': 'test'})
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, true);
					assert.equal(res.body.content.user.email, 'guest1email')
					assert.notEqual(res.body.content.user.passHash, undefined)
					user2 = res.body.content.user;
					assert.ok(res.headers['set-cookie']);
          cookie2 = res.headers['set-cookie'];
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Get party for invited user', function(done) {
			request(app)
				.get('/party/user/guest1email')
				.set({'cookie': cookie})
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, true);
					assert.equal(res.body.content.parties.length, 1);
					assert.equal(res.body.content.parties[0].title, 'Test Party');
					assert.equal(res.body.content.parties[0].invited.length, 2);
					assert.notEqual(res.body.content.parties[0].invited.indexOf('guest1email'), -1);
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});
	});

	describe('POST /party/:partyId/supplies', function() {

		it('Add supply without cookie', function(done) {
			request(app)
				.post('/party/'+party1._id+'/supplies')
        .send({'name': 'newSupply', 'quantity': 5, 'unit': 'newUnit'})
				.expect(403)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, false);
					assert.equal(res.body.err, 'Must be logged in to use this feature.');
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Add supply to valid party', function(done) {
			request(app)
				.post('/party/'+party1._id+'/supplies')
        .send({'name': 'newSupply', 'quantity': 5, 'unit': 'newUnit'})
				.set({'cookie': cookie})
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, true);
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Add supply to nonexistent party', function(done) {
			request(app)
				.post('/party/123/supplies')
        .send({'name': 'newSupply', 'quantity': 5, 'unit': 'newUnit'})
				.set({'cookie': cookie})
				.expect(404)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, false);
					assert.notEqual(res.body.err, undefined);
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});
	});

	describe('POST /party/:partyId/guests', function() {

		it('Add guest without cookie', function(done) {
			request(app)
				.post('/party/'+party1._id+'/guests')
				.send({'email': 'newguest'})
				.expect(403)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, false);
					assert.equal(res.body.err, 'Must be logged in to use this feature.');
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Add guest to valid party', function(done) {
			request(app)
				.post('/party/'+party1._id+'/guests')
				.set({'cookie': cookie})
				.send({'email': 'newguest'})
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, true);
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Add guest to nonexistent party', function(done) {
			request(app)
				.post('/party/123/guests')
				.set({'cookie': cookie})
				.send({'email': 'newguest'})
				.expect(404)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, false);
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});
	});

	describe('DELETE /party/:partyId/supplies/:itemId', function() {
		
		it('Delete item without cookie', function(done) {
			request(app)
				.delete('/party/'+party1._id+'/supplies/'+populatedParty1.supplies[0]._id)
				.expect(403)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, false);
					assert.equal(res.body.err, 'Must be logged in to use this feature.');
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Delete valid item from party', function(done) {
			request(app)
				.delete('/party/'+party1._id+'/supplies/'+populatedParty1.supplies[0]._id)
				.set({'cookie': cookie})
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, true);
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Delete nonexistent item from party', function(done) {
			request(app)
				.delete('/party/'+party1._id+'/supplies/'+populatedParty1.supplies[0]._id)
				.set({'cookie': cookie})
				.expect(404)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, false);
					assert.notEqual(res.body.err, undefined);
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});
	});

	describe('DELETE /party/:partyId/guests/:userId', function() {
		
		it('Delete guest without cookie', function(done) {
			request(app)
				.delete('/party/'+party1._id+'/guests/guest2email')
				.expect(403)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, false);
					assert.equal(res.body.err, 'Must be logged in to use this feature.');
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Delete guest from party', function(done) {
			request(app)
				.delete('/party/'+party1._id+'/guests/guest2email')
				.set({'cookie': cookie})
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, true);
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});
	});

	describe('PUT /party/:partyId/supplies/:itemId', function() {

		it('Claim item without cookie', function(done) {
			request(app)
				.put('/party/'+party1._id+'/supplies/'+populatedParty1.supplies[1]._id)
				.expect(403)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, false);
					assert.equal(res.body.err, 'Must be logged in to use this feature.');
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Try to claim item if not attending', function(done) {
			request(app)
				.put('/party/'+party1._id+'/supplies/'+populatedParty1.supplies[1]._id)
				.set({'cookie': cookie2})
				.expect(404)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, false);
					assert.equal(res.body.err, 'User must be attending in order to claim items')
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				}); 
		});

		it('Claim part of an item', function(done) {
			request(app)
				.put('/party/'+party1._id+'/supplies/'+populatedParty1.supplies[1]._id)
				.send({'quantity': 2})
				.set({'cookie': cookie})
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, true);
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Try to claim item for nonexistent party', function(done) {
			request(app)
				.put('/party/123/supplies/'+populatedParty1.supplies[1]._id)
				.set({'cookie': cookie})
				.expect(404)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, false);
					assert.notEqual(res.body.err, undefined);
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				}); 
		});

		it('Try to claim nonexistent item', function(done) {
			request(app)
				.put('/party/'+party1._id+'/supplies/123')
				.set({'cookie': cookie})
				.expect(404)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, false);
					assert.notEqual(res.body.err, undefined);
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				}); 
		});
	});

	describe('PUT /party/:partyId/sendReminders', function() {

		it('Send reminders without cookie', function(done) {
			request(app)
				.put('/party/'+party1._id+'/sendReminders')
				.expect(403)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, false);
					assert.equal(res.body.err, 'Must be logged in to use this feature.');
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Send reminders for a valid party', function(done) {
			request(app)
				.put('/party/'+party1._id+'/sendReminders')
				.set({'cookie': cookie})
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, true);
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Send reminders for a nonexistent party', function(done) {
			request(app)
				.put('/party/123/sendReminders')
				.set({'cookie': cookie})
				.expect(404)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, false);
					assert.notEqual(res.body.err, undefined);
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});
	});

	describe('PUT /party/:partyId/cost/:itemId', function() {

		it('Add cost without cookie', function(done) {
			request(app)
				.put('/party/'+party1._id+'/cost/'+populatedParty1.supplies[1]._id)
				.expect(403)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, false);
					assert.equal(res.body.err, 'Must be logged in to use this feature.');
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Add cost to an item', function(done) {
			request(app)
				.put('/party/'+party1._id+'/cost/'+populatedParty1.supplies[1]._id)
				.send({'cost': '10'})
				.set({'cookie': cookie})
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, true);
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Add cost to nonexistent item', function(done) {
			request(app)
				.put('/party/'+party1._id+'/cost/123')
				.send({'cost': '10'})
				.set({'cookie': cookie})
				.expect(404)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, false);
					assert.notEqual(res.body.err, undefined);
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});
	});

  describe('PUT /party/:partyId/guests', function() {

    it('Try to rsvp without a cookie', function(done) {
      request(app)
        .put('/party/'+party1._id+'/guests')
        .send({'attending': true})
        .expect(403)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(function(res) {
          assert.equal(res.body.success, false);
          assert.equal(res.body.err, 'Must be logged in to use this feature.');
        })
        .end(function(err, res) {
          if (err) done(err);
          else done();
        });
    });

    it('RSVP yes to a valid party', function(done) {
      request(app)
        .put('/party/'+party1._id+'/guests')
        .send({'attending': true})
        .set({'cookie': cookie2})
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(function(res) {
          assert.equal(res.body.success, true);
        })
        .end(function(err, res) {
          if (err) done(err);
          else done();
        });
    });

    it('Create invited user', function(done) {
      request(app)
        .post('/users')
        .send({'email': 'newguest', 'password': 'test'})
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(function(res) {
          assert.equal(res.body.success, true);
        })
        .end(function(err, res) {
          if (err) done(err);
          else done();
        });
    });

    it('Login invited user', function(done) {
      request(app)
        .post('/users/login')
        .send({'email': 'newguest', 'password': 'test'})
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(function(res) {
          assert.equal(res.body.success, true);
          assert.equal(res.body.content.user.email, 'newguest')
          assert.notEqual(res.body.content.user.passHash, undefined)
          user2 = res.body.content.user;
          assert.ok(res.headers['set-cookie']);
          cookie3 = res.headers['set-cookie'];
        })
        .end(function(err, res) {
          if (err) done(err);
          else done();
        });
    });

    it('RSVP no to a valid party', function(done) {
      request(app)
        .put('/party/'+party1._id+'/guests')
        .send({'attending': false})
        .set({'cookie': cookie3})
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(function(res) {
          assert.equal(res.body.success, true);
        })
        .end(function(err, res) {
          if (err) done(err);
          else done();
        });
    });
  });

  describe('POST /party/:partyId/closeout', function() {

    it('Close out party without cookie', function(done) {
      request(app)
        .post('/party/'+party1._id+'/closeout')
        .expect(403)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(function(res) {
          assert.equal(res.body.success, false);
          assert.equal(res.body.err, 'Must be logged in to use this feature.');
        })
        .end(function(err, res) {
          if (err) done(err);
          else done();
        });
    });

    it('Close out a valid party', function(done) {
      request(app)
        .post('/party/'+party1._id+'/closeout')
        .set({'cookie': cookie})
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(function(res) {
          assert.equal(res.body.success, true);
        })
        .end(function(err, res) {
          if (err) done(err);
          else done();
        });
    });

    it('Close out a nonexistent party', function(done) {
      request(app)
        .post('/party/123/closeout')
        .set({'cookie': cookie})
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(function(res) {
          assert.equal(res.body.success, false);
          assert.notEqual(res.body.err, undefined);
        })
        .end(function(err, res) {
          if (err) done(err);
          else done();
        });
    });
  });

  describe('GET /party/user/:email closedout party', function() {

    it('Get a party once closed out', function(done) {
      request(app)
        .get('/party/user/madksev')
        .set({'cookie': cookie})
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(function(res) {
          assert.equal(res.body.success, true);
          assert.equal(res.body.content.parties.length, 1);
          assert.equal(JSON.stringify(res.body.content.parties[0].invited), JSON.stringify([]));
          assert.equal(res.body.content.parties[0].attending.length, 2);
          assert.equal(res.body.content.parties[0].supplies.length, 2);
          assert.equal(res.body.content.parties[0].closedOut, true);
          assert.equal(res.body.content.parties[0].payments.length, 1);
          assert.equal(res.body.content.parties[0].payments[0].amount, 5);
          assert.equal(res.body.content.parties[0].payments[0].payer.email, 'guest1email');
          assert.equal(res.body.content.parties[0].payments[0].payee.email, 'madksev');
        })
        .end(function(err, res) {
          if (err) done(err);
          else done();
        });
    });
  });

  describe('POST /party/:partyId/clearPayments/:userId', function() {

    it('Clear payments without cookie', function(done) {
      request(app)
        .post('/party/'+party1._id+'/clearPayments/'+user._id)
        .expect(403)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(function(res) {
          assert.equal(res.body.success, false);
          assert.equal(res.body.err, 'Must be logged in to use this feature.');
        })
        .end(function(err, res) {
          if (err) done(err);
          else done();
        });
    });

    it('Clear payments for valid party', function(done) {
      request(app)
        .post('/party/'+party1._id+'/clearPayments/'+user._id)
        .set({'cookie': cookie})
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(function(res) {
          assert.equal(res.body.success, true);
        })
        .end(function(err, res) {
          if (err) done(err);
          else done();
        });
    });

    it('Clear payments for nonexistent party', function(done) {
      request(app)
        .post('/party/123/clearPayments'+user._id)
        .set({'cookie': cookie})
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(function(res) {
          assert.equal(res.body.success, false);
          assert.notEqual(res.body.err, undefined);
        })
        .end(function(err, res) {
          if (err) done(err);
          else done();
        });
    });
  });

  describe('DELETE /party/:partyId', function() {

    it('Delete party without cookie', function(done) {
      request(app)
        .delete('/party/'+party1._id)
        .expect(403)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(function(res) {
          assert.equal(res.body.success, false);
          assert.equal(res.body.err, 'Must be logged in to use this feature.');
        })
        .end(function(err, res) {
          if (err) done(err);
          else done();
        });
    });

    it('Delete valid party', function(done) {
      request(app)
        .delete('/party/'+party1._id)
        .set({'cookie': cookie})
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(function(res) {
          assert.equal(res.body.success, true);
        })
        .end(function(err, res) {
          if (err) done(err);
          else done();
        });
    });

    it('Delete nonexistent party', function(done) {
      request(app)
        .delete('/party/123/')
        .set({'cookie': cookie})
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(function(res) {
          assert.equal(res.body.success, false);
          assert.notEqual(res.body.err, undefined);
        })
        .end(function(err, res) {
          if (err) done(err);
          else done();
        });
    });
  });

  describe('GET /party/user/:email no parties', function() {

    it('Get a party once deleted', function(done) {
      request(app)
        .get('/party/user/madksev')
        .set({'cookie': cookie})
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(function(res) {
          assert.equal(res.body.success, true);
          assert.equal(res.body.content.parties.length, 0);
        })
        .end(function(err, res) {
          if (err) done(err);
          else done();
        });
    });
  });
});