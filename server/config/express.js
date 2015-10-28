/**
 * Express configuration
 */

'use strict';

var express = require('express');
var morgan = require('morgan');
var compression = require('compression');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var path = require('path');
var config = require('./environment');
var passport = require('passport');

module.exports = function (app) {
  var env = app.get('env');

  app.set('views', config.root + '/server/views');
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.use(compression());
  app.use(methodOverride());
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(passport.initialize());
  if (env === 'production') {
    app.use(express.static(path.join(config.root, 'dist')));
    app.set('appPath', config.root + 'dist');
    app.use(morgan('dev'));
  } else if (env === 'development' || env === 'test') {
    app.use(require('connect-livereload')());
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'bower_components')));
    app.set('appPath', '.tmp');
    app.use(morgan('dev'));
    app.use(errorHandler()); // Error handler - has to be last
  }
};
