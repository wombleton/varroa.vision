'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TileSchema = new Schema({
  createdAt: {
    default: Date.now,
    type: Date
  },
  hash: {
    index: true,
    type: String
  },
  url: String,
  name: String,
  voteCount: {
    default: 0,
    type: Number
  },
  votedAt: Date,
  updatedAt: Date,
  hellmurky: String,
  verdict: {
    default: 'uncategorised',
    index: true,
    type: String
  },
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

TileSchema.index({
  voteCount: 1,
  hash: 1
});

TileSchema.index({
  voteCount: -1,
  hash: 1
});

TileSchema.pre('save', function (next) {
  this.updatedAt = new Date();

  next();
});

module.exports = mongoose.model('Tile', TileSchema);
