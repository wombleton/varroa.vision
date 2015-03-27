'use strict';

var config = require('properties-parser').read('.env'),
    _ = require('lodash');

_.extend(config, {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/varroa-dev'
  },

  seedDB: true
});

// Development specific configuration
// ==================================
module.exports = config;
