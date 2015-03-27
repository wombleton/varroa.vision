/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var path = require('path');
var mime = require('mime-types');
var Upload = require('./upload.model');
var config = require('../../config/environment');
var mongoose = require('mongoose');

var pipe = require('multipart-pipe');
var knox = require('knox');
var s3 = knox.createClient({
  bucket: 'varroa',
  key: config.AWS_ACCESS_KEY_ID,
  secret: config.AWS_SECRET_ACCESS_KEY
});

// Get a single thing
exports.show = function(req, res) {
  Upload.findById(req.params.id, function (err, upload) {
    if(err) { return handleError(res, err); }
    if(!upload) { return res.send(404); }
    return res.json(upload);
  });
};

function getKey(part, type) {
  return part + ';' + type;
}

exports.persistFiles = function(req, res, next) {
  const filenames = {};

  pipe.s3(s3, {
    allow: /^image\/.*$/,
    filename: function(part, type) {
      var key = getKey(part, type);
      if (!filenames[key]) {
        filenames[key] = mongoose.Types.ObjectId() + '.' + mime.extension(type);
      }
      return filenames[key];
    },
    limit: '16mb'
  })(req, res, next);
};

// Creates a new thing in the DB.
exports.create = function(req, res) {
  const { name } = req.form;

  const files = _.map(req.files, (file) => {
    const contentType = mime.lookup(file);

    return {
      acl: 'public-read',
      contentType: contentType,
      encoding: mime.charset(contentType),
      id: path.basename(file),
      name: name || 'Anonymous',
      url: `http://varroa.s3.amazonaws.com/${file}`
    };
  });

  Upload.create(files, (err, ok) => {
    if (err) {
      handleError(res, err);
    } else {
      res.json(201, {
        ok: true,
        count: files.length,
        detail: ok
      });
    }
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
