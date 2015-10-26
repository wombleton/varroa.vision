require('babel/register');
const config = require('./server/config/environment');
const mongoose = require('mongoose');
mongoose.connect(config.mongo.uri, config.mongo.options);
const knox = require('knox');
const tilenol = require('tilenol');
const path = require('path');
const fs = require('fs');
const async = require('async');
const mime = require('mime-types');
const md5 = require('md5');
const Tile = require('./server/api/tile/tile.model');
const client = knox.createClient({
  bucket: 'varroa-tiles',
  key: config.aws.AWS_ACCESS_KEY_ID,
  secret: config.aws.AWS_SECRET_ACCESS_KEY
});

const q = async.queue(function (task, callback) {
  console.log('Slicing %s...', task.path);
  tilenol.slice({
    onTile: function (name, stdout, cb) {
      const ext = path.extname(name);
      const buffs = [];

      stdout.on('data', function (d) {
        buffs.push(d);
      });
      stdout.on('end', function () {
        const headers = {
          'Content-Type': mime.lookup(ext)
        };
        const buffer = Buffer.concat(buffs);
        const hash = md5(buffer);
        const awsName = hash + ext;

        client.putBuffer(buffer, awsName, headers, function (err, result) {
          if (err) {
            console.log(err);
            return cb(err);
          }

          const tile = {
            hash: hash,
            url: result.req.url,
            name: name
          };

          Tile.findOneAndUpdate({
            hash: hash
          }, tile, {
            upsert: true
          }, function (err) {
            cb(err);
          });
        });
      });
    },
    path: task.path
  }, function (err, count) {
    if (err) {
      console.log(err);
    } else {
      fs.unlink(task.path);
      console.log('Generated %s tiles.', count);
    }
    callback(err, count);
  });
}, 1);

fs.readdir(path.join('srcfiles'), function (err, files) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  files.forEach(function (file) {
    q.push({
      path: path.resolve('srcfiles', file)
    });
  });
});
