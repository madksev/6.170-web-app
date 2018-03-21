var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var app = require('../app');

// Reset our mongoose collections so that the tests can run successfully.
for (var i in mongoose.connection.collections) {
  mongoose.connection.collections[i].remove(function() {});
}

var cookie;

describe('Users API', function() {

	describe('POST /users', function() {

		it('Create a valid new user', function(done) {
      request(app)
        .post('/users')
        .send({'email': 'madksev@mit.edu', 'password': 'testing'})
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

    it('Try to create an already existing user', function(done) {
    	request(app)
    		.post('/users')
    		.send({'email': 'madksev@mit.edu', 'password': 'pass'})
    		.expect(400)
    		.expect('Content-Type', 'application/json; charset=utf-8')
    		.expect(function(res) {
    			assert.equal(res.body.success, false);
    			assert.equal(res.body.err, 'That email is already taken!')
    		})
    		.end(function(err, res) {
    			if (err) done(err);
    			else done();
    		});
    });

    it('Try to create user with too short email', function(done) {
    	request(app)
    		.post('/users')
    		.send({'email': 'hi', 'password': 'pass'})
    		.expect(400)
    		.expect('Content-Type', 'application/json; charset=utf-8')
    		.expect(function(res) {
    			assert.equal(res.body.success, false);
    			assert.equal(res.body.err, 'Usernames should be a valid email')
    		})
    		.end(function(err, res) {
    			if(err) done(err);
    			else done();
    		});
    });
	});

	describe('POST /users/login', function() {

		it('Login a valid user', function(done) {
			request(app)
				.post('/users/login')
				.send({'email': 'madksev@mit.edu', 'password': 'testing'})
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.ok(res.headers['set-cookie']);
          cookie = res.headers['set-cookie'];
					assert.equal(res.body.success, true);
					assert.equal(res.body.content.user.email, 'madksev@mit.edu');
					assert.notEqual(res.body.content.user.passHash, undefined);
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Login with the wrong password', function(done) {
			request(app)
				.post('/users/login')
				.send({'email': 'madksev@mit.edu', 'password': 'incorrect'})
				.expect(403)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, false);
					assert.equal(res.body.err, 'Invalid email or password.')
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Login with unregistered user', function(done) {
			request(app)
				.post('/users/login')
				.send({'email': 'no_user', 'password': 'pass'})
				.expect(403)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, false);
					assert.equal(res.body.err, 'Invalid email or password.')
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Login while user already logged in', function(done) {
			request(app)
				.post('/users/login')
				.set({'cookie': cookie})
				.send({'email': 'madksev@mit.edu', 'password': 'testing'})
				.expect(403)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, false);
					assert.equal(res.body.err, 'There is already a user logged in.');
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Login without providing email', function(done) {
			request(app)
				.post('/users/login')
				.send({'password': 'wrong'})
				.expect(400)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, false);
					assert.equal(res.body.err, 'Email or password not provided.');
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Login without providing password', function(done) {
			request(app)
				.post('/users/login')
				.send({'email': 'madksev@mit.edu'})
				.expect(400)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, false);
					assert.equal(res.body.err, 'Email or password not provided.');
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});
	});

	describe('GET /users/current', function() {

		it('Get current user when logged in', function(done) {
			request(app)
				.get('/users/current')
				.set({'cookie': cookie})
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, true);
					assert.equal(res.body.content.loggedIn, true);
					assert.equal(res.body.content.user.email, 'madksev@mit.edu')
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});

		it('Get current user when not logged in', function(done) {
			request(app)
				.get('/users/current')
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(function(res) {
					assert.equal(res.body.success, true);
					assert.equal(res.body.content.loggedIn, false);
				})
				.end(function(err, res) {
					if (err) done(err);
					else done();
				});
		});
	});

	describe('PUT /users/logout', function() {

		it('Logout user with valid cookie', function(done) {
			request(app)
				.put('/users/logout')
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

		it('Logout with invalid cookie', function(done) {
			request(app) 
				.put('/users/logout')
				.set({'cookie': cookie})
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

		it('Logout without a cookie', function(done) {
			request(app)
				.put('/users/logout')
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
	});
});


