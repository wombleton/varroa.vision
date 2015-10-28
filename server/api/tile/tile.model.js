'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TileSchema = new Schema({
  createdAt: {
    default: Date.now,
    type: Date
  },
  hash: String,
  url: String,
  name: String,
  voteCount: {
    default: 0,
    type: Number
  },
  votedAt: Date,
  updatedAt: Date,
  verdict: String,
  votes: [
    {
      bee: Boolean,
      parasite: Boolean,
      bad: Boolean,
      ip_address: String,
      ponder_time: Number,
      timestamp: {
        default: Date.now,
        type: Date
      }
    }
  ]
});

TileSchema.pre('save', function (next) {
  this.updatedAt = new Date();

  next();
});

module.exports = mongoose.model('Tile', TileSchema);
