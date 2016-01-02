var http = require('http');
var fs = require('fs');
var async = require('async');

var PORT = 3000;

var size = 64 * 64 * 4;

var testCount = 0;
var testData = fs.openSync('../test-data.txt', 'r');
var testLabels = fs.readFileSync('../test-labels.txt', 'utf8').split('\n');
var testMax = testLabels.length;

var trainCount = 0;
var trainData = fs.openSync('../train-data.txt', 'r');
var trainLabels = fs.readFileSync('../train-labels.txt', 'utf8').split('\n');
var trainMax = trainLabels.length;

function handle (req, res) {
  async.parallel({
    test: function (callback) {
      var num = 10;
      var buf = new Buffer(num * size);
      if (testCount + num < testMax) {
        fs.read(testData, buf, 0, num * size, testCount * size, function (err, s, buf) {
          var result = [];
          var i = 0;

          for (i; i < num; i++) {
            result.push({
              data: buf.slice(i * size, (i + 1) * size).toString('hex'),
              label: testLabels.shift()
            });
          }
          testCount += num;
          callback(err, result);
        });
      } else {
        callback(null, []);
      }
    },
    train: function (callback) {
      var num = 100;
      var buf = new Buffer(num * size);
      if (trainCount + num < trainMax) {
        fs.read(trainData, buf, 0, num * size, trainCount * size, function (err, s, buf) {
          var result = [];
          var i = 0;

          for (i; i < num; i++) {
            result.push({
              data: buf.slice(i * size, (i + 1) * size).toString('hex'),
              label: trainLabels.shift()
            });
          }
          trainCount += num;
          callback(err, result);
        });
      } else {
        callback(null, []);
      }
    }
  }, function (err, results) {
    if (err) {
      console.log(err);
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify(results));
  });
}

// Create a server
var server = http.createServer(handle);

// Lets start our server
server.listen(PORT, function () {
  console.log('Server listening on: http://localhost:%s', PORT);
});
