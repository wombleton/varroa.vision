'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UploadSchema = new Schema({
  acl: String,
  bucket: String,
  contentType: String,
  encoding: String,
  key: String,
  name: String,
  size: Number,
  uploaderName: String,
  valid: Boolean,
  url: String
});

module.exports = mongoose.model('Upload', UploadSchema);
