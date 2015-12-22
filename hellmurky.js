require('babel/register');
const _ = require('lodash');
const config = require('./server/config/environment');
const mongoose = require('mongoose');
mongoose.connect(config.mongo.uri, config.mongo.options);
const fs = require('fs');
const async = require('async');
const Tile = require('./server/api/tile/tile.model');
const pixels = require('get-pixels');

const labels = fs.createWriteStream('hellmurky-labels.txt');
const data = fs.createWriteStream('hellmurky-data.txt');
const hashes = fs.createWriteStream('hellmurky-hashes.txt');

const q = async.queue(function (tile, callback) {
  console.log('Getting pixels for %s. %s tiles left to process.', tile.url, q.length());

  pixels(tile.url, function (err, arr) {
    if (err) {
      console.log(err);
      return callback(err);
    }
    if (arr.data.length !== 16384) {
      return callback();
    }
    q2.push({
      data: arr.data,
      hash: tile.hash,
      verdict: tile.verdict
    });
    callback();
  });

  if (q.length() === 0) {
    fillQueue(tile.hash);
  }
}, 10);

const q2 = async.queue(function (pixels, callback) {
  async.parallel([
    function (callback) {
      hashes.write(pixels.hash + '\n', callback);
    },
    function (callback) {
      labels.write(pixels.verdict + '\n', callback);
    },
    function (callback) {
      data.write(pixels.data, callback);
    }
  ], callback);
}, 1);

function fillQueue (hash) {
  Tile.find({
    hash: {
      $lt: hash
    }
  })
  .limit(500)
  .select('hash url verdict')
  .sort('-hash')
  .exec(function (err, tiles) {
    if (err) {
      console.log(err);
      return process.exit(1);
    }
    _.each(tiles, function (tile) {
      q.push(tile);
    });
  });
}

fillQueue('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz');
