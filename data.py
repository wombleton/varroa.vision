import numpy
import random

def dense_to_one_hot(labels_dense, num_classes=2):
  """Convert class labels from scalars to one-hot vectors."""
  num_labels = labels_dense.shape[0]
  print "num_labels: ", num_labels
  index_offset = numpy.arange(num_labels) * num_classes
  labels_one_hot = numpy.zeros((num_labels, num_classes))
  labels_one_hot.flat[index_offset + labels_dense.ravel()] = 1
  return labels_one_hot

class DataSet():
  def __init__(self, key):
    with open(key + '-labels.txt') as f:
      labels = f.read().splitlines()
      self._count = len(labels)
      labels = ['1' if l == 'bee' else '0' for l in labels ]
      labels = numpy.array(labels, dtype=numpy.uint8)
      self._labels = dense_to_one_hot(labels)

    with open(key + '-data.txt') as f:
      data = numpy.fromstring(f.read(), 'uint8')
      data = data.astype(numpy.float32)
      data = numpy.multiply(data, 1.0 / 255.0)
      self._data = data.reshape(self._count, 64 * 64 * 4)

    combined = zip(self._labels, self._data)

    random.shuffle(combined)
    self._labels[:], self._data[:] = zip(*combined)

    self._start = 0

  def next_batch(self, size):
    start = self._start
    self._start += size

    if self._start > self._count:
      combined = zip(self._labels, self._data)

      random.shuffle(combined)
      self._labels[:], self._data[:] = zip(*combined)
      start = self._start = 0

    end = start + size

    return self._data[start:end], self._labels[start:end]

class DataSets():
  def __init__(self):
    self.test = DataSet('test')
    self.train = DataSet('train')

    print('%d test files and %d train files' % (self.test._count, self.train._count))

def init():
  return DataSets()
