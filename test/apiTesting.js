var mocha = require('mocha')
var chai = require('chai')
  , chaiHttp = require('chai-http');
//var describe = require('mocha').describe
//var it = require('mocha').it
var assert = require('chai').assert
var expect = require('chai').expect
chai.use(chaiHttp);
var app = 'http://localhost'

console.log('User API Testing');

describe('#Add Friend API', function() {
    it('checking positive request', function(done) {
        chai.request(app)
            .post('/api/user/addFriend')
            .send({
                friends:
                  [
                    'andy@example.com',
                    'john@example.com'
                  ]
              })
            .end(function(err, res) {
                //console.log(JSON.stringify(res))
                expect(res).to.have.status(200);
                var resp = JSON.parse(res.text)
                assert.equal(resp.success, false);
                done(); 
            });
    });
    it('checking negative request', function(done) {
        chai.request(app)
            .post('/api/user/addFriend')
            .send({
                friends:
                  [
                    'andy1@example.com',
                    'john@example.com'
                  ]
              })
            .end(function(err, res) {
                //console.log(JSON.stringify(res))
                expect(res).to.have.status(200);
                var resp = JSON.parse(res.text)
                assert.equal(resp.success, false);
                done();
            });
    });
});

describe('#GET Friends List API', function() {
    it('checking positive request', function(done) {
        chai.request(app)
            .post('/api/user/getFriends')
            .send({
                email: 'andy@example.com'
              })
            .end(function(err, res) {
                //console.log(JSON.stringify(res))
                expect(res).to.have.status(200);
                var resp = JSON.parse(res.text)
                assert.equal(resp.success, true);
                assert.typeOf(resp.friends, 'array');
                assert.lengthOf(resp.friends, resp.count);
                done(); 
            });
    });
    it('checking negative request', function(done) {
        chai.request(app)
            .post('/api/user/getFriends')
            .send({
                email: 'andy1@example.com'
              })
            .end(function(err, res) {
                //console.log(JSON.stringify(res))
                expect(res).to.have.status(200);
                var resp = JSON.parse(res.text)
                assert.equal(resp.success, false);
                done();
            });
    });
});

describe('#GET Friends List API', function() {
    it('checking positive request', function(done) {
        chai.request(app)
            .post('/api/user/getCommonFriends')
            .send({
                friends:
                  [
                    'andy@example.com',
                    'john@example.com'
                  ]
              })
            .end(function(err, res) {
                //console.log(JSON.stringify(res))
                expect(res).to.have.status(200);
                var resp = JSON.parse(res.text)
                assert.equal(resp.success, true);
                assert.typeOf(resp.friends, 'array');
                assert.lengthOf(resp.friends, resp.count);
                done(); 
            });
    });
    it('checking negative request', function(done) {
        chai.request(app)
            .post('/api/user/getCommonFriends')
            .send({
                friends:
                  [
                    'andy@example.com',
                    'john1@example.com'
                  ]
              })
            .end(function(err, res) {
                //console.log(JSON.stringify(res))
                expect(res).to.have.status(200);
                var resp = JSON.parse(res.text)
                assert.equal(resp.success, false);
                done();
            });
    });
    it('checking negative request', function(done) {
        chai.request(app)
            .post('/api/user/getCommonFriends')
            .send({
                friends:
                  [
                    'andy@example.com'
                  ]
              })
            .end(function(err, res) {
                //console.log(JSON.stringify(res))
                expect(res).to.have.status(200);
                var resp = JSON.parse(res.text)
                assert.equal(resp.success, false);
                done();
            });
    });
});