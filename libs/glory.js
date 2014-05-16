module.exports = create;

var yi      = require('yi');
var path    = require('path');
var express = require('express');

function create (config) {
  return new Glory(config);
}

function Glory (config) {
  this.config = config || {};
  this.initPath();
  this.initApp();
  this.initViewEngine();
  this.initStatic();
  this.initFavicon();
  this.initCookie();
  this.initSession();
  this.initShine();
  this.initCsrf();
}

Glory.prototype.initApp = function () {
  var logger = require('morgan');
  var bodyParser    = require('body-parser');
  var multipart;
  var app = this.app = express();

  
  this.isProduction = app.get('env') === 'production';

  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded());

  if (this.config.multipart !== false) {
    multipart = require('connect-multiparty');
    app.use(multipart( this.config.multipart || {}));  
  }

  if (this.config['x-powered-by'] === false) {
    app.disable('x-powered-by');
  }

};

Glory.prototype.initPath = function () {
  var appPath = this.config.path;

  if (appPath) {

    if ( ! this.config.views) {
      this.config.views = path.join(appPath, './views');
    }

    if ( ! this.config.staticPath) {
      this.config.staticPath = path.join(appPath, './public'); 
    }
  }

};

Glory.prototype.initViewEngine = function () {
  var swig;

  if ( ! this.config.views ) { return; }

  swig = require('swig');
  // var swigExtras   = require('swig-extras');

  this.app.engine('html', swig.renderFile);
  this.app.set('view engine', 'html');
  this.app.set('views', this.config.views);

  // swigExtras.useFilter(swig, 'nl2br');
  if ( ! this.isProduction ) {
    this.app.set('view cache', false);
    swig.setDefaults({ cache: false });
  }  
};

Glory.prototype.initFavicon = function () {
  if (this.config.favicon === false) { return; }

  this.app.use(require('static-favicon')(this.config.favicon));
};

Glory.prototype.initCookie = function () {
  if (this.config.cookie === false) { return; }

  this.app.use(require('cookie-parser')(this.config.cookieSecret));
};

Glory.prototype.initSession = function () {
  var config;

  if (this.config.session === false) { return; }

  config = yi.merge(yi.clone(this.config.session), {
    keys: ['express', 'glory'],
    maxAge: 60 * 60 * 1000
  });

  this.app.use(require('cookie-session')(config));
};

Glory.prototype.initCsrf = function () {
  if (this.config.csrf === true) {
    this.app.use(require('csurf')());  
  }
};

Glory.prototype.initShine = function () {
  if (this.config.shine === false) { return; }
  
  this.app.use(require('shine')());  
};

Glory.prototype.initStatic = function () {
  var staticRoot;

  // console.log(this.config);

  if ( ! this.config.staticPath ) { return; }

  staticRoot = this.config.staticRoot || '/';

  if (this.config.stylus) {
    this.app.use(staticRoot, require('stylus').middleware({
      src      : this.config.staticPath,
      compress : (app.isProduction ? true : false),
      force    : (app.isProduction ?  false : true)
    }));  
  }
  // console.log('ready to set static resources: %s, %s', staticRoot, this.config.staticPath);
  this.app.use(staticRoot, express.static(this.config.staticPath));
};

Glory.prototype.tail = function () {
  if (this.config.tailbone === false) { return; }

  require('tailbone').create(this.config.tailbone).enable(this.app);
};

Glory.prototype.ready = function (callback) {
  var config = yi.merge(this.config.port, {
    pro: '8001',
    dev: '3001'
  });
  
  this.app.set('port', this.isProduction ? config.pro : config.dev);
  this.tail();

  this.app.listen(this.app.get('port'), callback);
};