'use strict';

var config = require('properties-parser').read('.env');

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/varroa-dev'
  },

  aws: config,

  seedDB: true
};
