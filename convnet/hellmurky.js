var convnetjs = require('convnet');
var cnnutil = require('./util.js');
var $ = require('jquery');

const labelKey = ['notbee', 'bee'];

const net = new convnetjs.Net();
net.makeLayers([
  {
    type: 'input',
    out_sx: 64,
    out_sy: 64,
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

const trainImages = [];
const testImages = [];

function toVol (data) {
  const s = 64;
  const vol = new convnetjs.Vol(s, s, 3, 0.0);

  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      for (let z = 0; z < 3; z++) {
        const offset = 2 * (((y * s) + x) * 4 + z);
        const val = parseInt(data.substring(offset, offset + 2), 16);
        vol.set(x, y, z, val / 255.0 - 0.5);
      }
    }
  }

  return vol;
}

function loadImages () {
  $.get('http://localhost:3000', function success ({ test, train }) {
    test.forEach((el) => {
      testImages.push({
        label: el.label === 'notbee' ? 0 : 1,
        vol: toVol(el.data)
      });
    });
    train.forEach((el) => {
      trainImages.push({
        label: el.label === 'notbee' ? 0 : 1,
        vol: toVol(el.data)
      });
    });

    startTraining();

    if (test.length && train.length) {
      setTimeout(loadImages, 1000);
    }
  }, 'json');
}

function getTest () {
  return testImages[Math.floor(Math.random() * testImages.length)];
}

function getTrain () {
  const item = trainImages[Math.floor(Math.random() * trainImages.length)];

  const dx = Math.floor(Math.random() * 5 - 2);
  const dy = Math.floor(Math.random() * 5 - 2);

  return {
    label: item.label,
    vol: convnetjs.augment(item.vol, 32, dx, dy, Math.random() < 0.5)
  };
}

loadImages();

let count = 0;

const xLossWindow = new cnnutil.Window(100);
const wLossWindow = new cnnutil.Window(100);
const trainAccWindow = new cnnutil.Window(100);
const testAccWindow = new cnnutil.Window(50, 1);

function train () {
  const item = getTrain();

  const stats = trainer.train(item.vol, item.label);
  count++;

  const { cost_loss, l2_decay_loss } = stats;

  // keep track of stats such as the average training error and loss
  const prediction = net.getPrediction();
  var accurate = prediction === item.label ? 1.0 : 0.0;
  xLossWindow.add(cost_loss);
  wLossWindow.add(l2_decay_loss);
  trainAccWindow.add(accurate);

  $('#stats').html(`
    <div>Forward time per example: ${stats.fwd_time}ms</div>
    <div>Backprop time per example: ${stats.bwd_time}ms</div>
    <div>Classification loss: ${cnnutil.f2t(xLossWindow.get_average())}</div>
    <div>L2 Weight decay loss: ${cnnutil.f2t(wLossWindow.get_average())}</div>
    <div>Training accuracy: ${cnnutil.f2t(trainAccWindow.get_average())}</div>
    <div>Test accuracy: ${testAccWindow.get_average()}</div>
    <div>Examples seen: ${count}</div>
  `);

  if (count % 100 === 0) {
    predict();
  }
}

let correctCount = 0;
let testCount = 0;

function predict () {
  const item = getTest();

  const forward = net.forward(item.vol);
  const prediction = forward.w.reduce((memo, val, i) => {
    if (memo.chance < val) {
      return {
        chance: val,
        label: i
      };
    } else {
      return memo;
    }
  }, { label: -1, chance: 0 });

  const correct = prediction.label === item.label;
  testCount++;
  if (correct) {
    correctCount++;
  }

  testAccWindow.add(correctCount / testCount);
  const img = getImage(item.vol);
  const el = $(`
    <div class="test">
      <ul>
        <li class="${item.label === 0 ? correct ? 'accurate' : 'inaccurate' : ''}">
          ${labelKey[0]} ${forward.w[0].toFixed(3)}
        </li>
        <li class="${item.label === 1 ? correct ? 'accurate' : 'inaccurate' : ''}">
          ${labelKey[1]} ${forward.w[1].toFixed(3)}
        </li>
      </ul>
    </div>
  `);
  el.find('ul').after(img);

  $('#tests').prepend(el);
  $('#tests .test:nth-child(n + 201)').remove();
}

function getImage (vol) {
  const s = 64;
  const c = document.createElement('canvas');
  c.height = c.width = s;
  const ctx = c.getContext('2d');
  const g = ctx.createImageData(s, s);
  const mm = cnnutil.maxmin(vol.w);

  for (let z = 0; z < 3; z++) {
    for (let y = 0; y < vol.sy; y++) {
      for (let x = 0; x < vol.sx; x++) {
        const dval = Math.floor((vol.get(x, y, z) - mm.minv) / mm.dv * 255);

        const pp = ((y * s) + x) * 4 + z;
        g.data[pp] = dval;
        if (z === 0) { // alpha channel
          g.data[pp + 3] = 255;
        }
      }
    }
  }
  ctx.putImageData(g, 0, 0);
  return c;
}

let started = false;

function startTraining () {
  if (started) {
    return;
  }
  setInterval(train, 0);
  started = true;
}

const trainer = new convnetjs.SGDTrainer(net, {
  method: 'adadelta',
  batch_size: 4,
  l2_decay: 0.0001
});
