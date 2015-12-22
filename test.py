import tensorflow as tf
import data

sets = data.init()

x = tf.placeholder('float', shape=[None, 16384])
W = tf.Variable(tf.zeros([16384, 2]))
b = tf.Variable(tf.zeros([2]))
y = tf.nn.softmax(tf.matmul(x,W) + b)

y_ = tf.placeholder('float', [None, 2])

init = tf.initialize_all_variables()

# Add ops to save and restore all the variables.
saver = tf.train.Saver()

sess = tf.Session()
sess.run(init)

saver.restore(sess, 'hellmurky.ckpt')
print 'Model restored.'

correct_prediction = tf.equal(tf.argmax(y,1), tf.argmax(y_,1))
accuracy = tf.reduce_mean(tf.cast(correct_prediction, 'float'))
test_images, test_labels = sets.test.next_batch(25)

print sess.run(y, feed_dict={x: test_images, y_: test_labels})
print sess.run(tf.argmax(y, 1), feed_dict={x: test_images, y_: test_labels})
print sess.run(tf.argmax(y_, 1), feed_dict={x: test_images, y_: test_labels})
