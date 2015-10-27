'use strict';

const _ = require('lodash');
const moment = require('moment');
const Tile = require('./tile.model');

// Get list of tiles
exports.index = function (req, res) {
  Tile.find(function (err, tiles) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(tiles);
  });
};

// Get a random tile to vote on.
// 90% of the time it's a low vote count.
// 10% of the time it's high vote count outside the cooldown
exports.random = function (req, res) {
  const roll = _.random(1, 10);
  const skip = _.random(0, 1000);
  let find;
  let sort;
  if (roll === 10) {
    find = {
      votedAt: {
        $lt: moment().subtract(1, 'week').toDate()
      },
      voteCount: {
        $lt: 3
      }
    };
    sort = {
      hash: 1,
      voteCount: 1
    };
  } else {
    find = {};
    sort = {
      hash: 1,
      voteCount: -1
    };
  }
  Tile
    .findOne(find)
    .sort(sort)
    .skip(skip)
    .exec(function (err, tile) {
      if (err) {
        return handleError(res, err);
      }
      if (!tile) {
        // we might not have any old tiles yet
        if (roll === 10) {
          return exports.random(req, res);
        } else {
          return res.sendStatus(404);
        }
      }
      return res.json(tile);
    });
};

// record a vote
exports.vote = function (req, res) {
  const body = req.body || {};

  Tile.findByIdAndUpdate(req.params.id, {
    $inc: {
      voteCount: 1
    },
    $push: {
      votes: {
        bee: !!body.bee,
        parasite: !!body.parasite,
        bad: !!body.bad,
        ponder_time: body.ponder_time,
        ip_address: req.ip
      }
    }
  },
  { 'new': true },
  function (err, tile) {
    if (err) {
      return handleError(res, err);
    }
    return res.status(201).json(tile);
  });
};

// Get a single tile
exports.show = function (req, res) {
  Tile.findById(req.params.id, function (err, tile) {
    if (err) { return handleError(res, err); }
    if (!tile) { return res.sendStatus(404); }
    return res.json(tile);
  });
};

// Creates a new tile in the DB.
exports.create = function (req, res) {
  var tile = _.defaults(req.body, {
    x: 0,
    y: 0,
    size: 64
  });

  if (!tile.url) {
    return handleError(res, { message: 'Url is required.' }, 400);
  }

  Tile.create(tile, function (err, tile) {
    if (err) {
      return handleError(res, err);
    }
    return res.status(201).json(tile);
  });
};

// Updates an existing tile in the DB.
exports.update = function (req, res) {
  if (req.body._id) { delete req.body._id; }
  Tile.findById(req.params.id, function (err, tile) {
    if (err) { return handleError(res, err); }
    if (!tile) { return res.sendStatus(404); }
    var updated = _.merge(tile, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(tile);
    });
  });
};

// Deletes a tile from the DB.
exports.destroy = function (req, res) {
  Tile.findById(req.params.id, function (err, tile) {
    if (err) { return handleError(res, err); }
    if (!tile) { return res.sendStatus(404); }
    tile.remove(function (err) {
      if (err) { return handleError(res, err); }
      return res.sendStatus(204);
    });
  });
};

function handleError (res, err, status) {
  status = status || 500;
  return res.status(status).send(err);
}
