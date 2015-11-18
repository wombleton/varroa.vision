from itertools import islice
import numpy
import base64

class DataSet():
  def __init__(self, key):
    with open(key + '-labels.txt') as f:
      labels = f.read().splitlines()
      self._labels = [ [0.0, 1.0] if l == 'bee' else [1.0, 0.0] for l in labels ]

    self._count = len(self._labels)

    with open(key + '-data.txt') as f:
      data = numpy.fromstring(f.read(), 'uint8')
      data = data.astype(numpy.float32)
      data = numpy.multiply(data, 1.0 / 255.0)
      self._data = data.reshape(self._count, 64 * 64 * 4)

    self._indexes = numpy.arange(self._count)
    numpy.random.shuffle(self._indexes)
    self._start = 0

  def next_batch(self, size):
    start = self._start
    self._start += size

    if self._start > self._count:
      numpy.random.shuffle(self._indexes)
      start = self._start = 0

    end = start + size
    indexes = self._indexes[start:end]

    labels = [self._labels[i] for i in indexes]
    data = [self._data[i] for i in indexes]

    return data, labels

class DataSets():
  def __init__(self):
    self.test = DataSet('test')
    self.train = DataSet('train')

    print('%d test files and %d train files' % (self.test._count, self.train._count))

def init():
  return DataSets()
