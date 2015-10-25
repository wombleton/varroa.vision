'use strict';

var _ = require('lodash');
var Tile = require('./tile.model');

// Get list of tiles
exports.index = function (req, res) {
  Tile.find(function (err, tiles) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(tiles);
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
