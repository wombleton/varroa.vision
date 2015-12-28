var convnetjs = require('convnet');

const net = new convnetjs.Net();
net.makeLayers([
  {
    type: 'input',
    out_sx: 32,
    out_sy: 32,
    out_depth: 3
  },
  {
    type: 'conv',
    sx: 5,
    filters: 16,
    stride: 1,
    pad: 2,
    activation: 'relu'
  },
  {
    type: 'pool',
    sx: 2,
    stride: 2
  },
  {
    type: 'conv',
    sx: 5,
    filters: 20,
    stride: 1,
    pad: 2,
    activation: 'relu'
  },
  {
    type: 'pool',
    sx: 2,
    stride: 2
  },
  {
    type: 'conv',
    sx: 5,
    filters: 20,
    stride: 1,
    pad: 2,
    activation: 'relu'
  },
  {
    type: 'pool',
    sx: 2,
    stride: 2
  },
  {
    type: 'softmax',
    num_classes: 2
  }
]);

const trainer = new convnetjs.SGDTrainer(net, {
  method: 'adadelta',
  batch_size: 4,
  l2_decay: 0.0001
});

net.onFinishBatch(function () {
});

setInterval(function () {
  net.step();
}, 0);
