
var path = require('path');
var glory = require('../index')({
  path: __dirname
});

glory.app.get('/e', function (req, res, next) {
  next(new Error('ah, something wrong!'));
});

glory.app.get('/', function (req, res, next) {
  res.render('index.html', { title: 'hello world!' });
});

glory.ready(function () {
  console.log('glory ready, listen on ' + glory.app.get('port'));
});