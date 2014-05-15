
var should  = require('should');
var request = require('supertest');
var path    = require('path');
var Glory   = require('../index');

describe('basic test', function () {
  var glory;
  var errorMessage = 'oh, something wrong!';

  before(function () {
    glory = Glory({
      views      : path.join(__dirname, './fixtures/views'),
      staticRoot : '/assets',
      staticPath : path.join(__dirname, './fixtures/public')
    });

    glory.app.get('/error', function (req, res, next) {
      next(new Error(errorMessage));
    });

    glory.app.get('/', function (req, res, next) {
      res.render('index.html', { title: 'hello world!' });
    });

    glory.tail();
  });

  it('get static resource', function (done) {

    request(glory.app)
      .get('/assets/base.css')
      .expect(200)
      .expect('Content-Type', /css/)
      .end(function (e, res) {
        should.not.exist(e);
        done();  
      });

  });

  it('get /', function (done) {

    request(glory.app)
      .get('/')
      .expect(200)
      .expect('Content-Type', /html/)
      .end(function (e, res) {
        should.not.exist(e);
        res.text.should.eql('<h1>hello world!</h1>');
        done();
      });
  });

  it('get /error', function (done) {

    request(glory.app)
      .get('/error')
      .expect(500)
      .expect('Content-Type', /html/)
      .end(function (e, res) {
        should.not.exist(e);
        res.text.should.match(new RegExp(errorMessage));
        done();
      });
  });

  it('get /none-exist', function (done) {

    request(glory.app)
      .get('/none-exist')
      .expect(404)
      .expect('Content-Type', /html/)
      .end(function (e, res) {
        should.not.exist(e);
        done();
      });
  });

});