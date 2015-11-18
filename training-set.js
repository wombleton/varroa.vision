require('babel/register');
const _ = require('lodash');
const config = require('./server/config/environment');
const mongoose = require('mongoose');
mongoose.connect(config.mongo.uri, config.mongo.options);
const fs = require('fs');
const async = require('async');
const Tile = require('./server/api/tile/tile.model');
const pixels = require('get-pixels');

const trainLabels = fs.createWriteStream('train-labels.txt');
const trainData = fs.createWriteStream('train-data.txt');
const testLabels = fs.createWriteStream('test-labels.txt');
const testData = fs.createWriteStream('test-data.txt');

const q = async.queue(function (tile, callback) {
  const test = _.random(1, 10) === 10;

  const label = test ? testLabels : trainLabels;
  const data = test ? testData : trainData;

  console.log('Getting pixels for %s. %s tiles left to process.', tile.url, q.length());

  pixels(tile.url, function (err, arr) {
    if (err) {
      console.log(err);
      return callback(err);
    }
    if (arr.data.length !== 16384) {
      return callback();
    }

    label.write(tile.verdict + '\n', function () {
      data.write(arr.data, callback);
    });
  });
}, 1);

function fillQueue (hash) {
  Tile.find({
    verdict: {
      $in: ['bee', 'notbee']
    },
    hash: {
      $gt: hash
    }
  })
  .limit(50)
  .select('hash url verdict')
  .sort('hash')
  .exec(function (err, tiles) {
    if (err) {
      console.log(err);
      return process.exit(1);
    }
    _.each(tiles, function (tile) {
      q.push(tile);
    });

    if (tiles.length) {
      setTimeout(function () {
        fillQueue(_.last(tiles).hash);
      }, 0);
    }
  });
}

fillQueue('');
