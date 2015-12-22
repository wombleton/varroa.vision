import tensorflow as tf
import data

sets = data.init()

x = tf.placeholder('float', shape=[None, 16384])
W = tf.Variable(tf.zeros([16384, 2]))
b = tf.Variable(tf.zeros([2]))
y = tf.nn.softmax(tf.matmul(x,W) + b)

y_ = tf.placeholder('float', [None, 2])
cross_entropy = -tf.reduce_sum(y_ * tf.log(tf.clip_by_value(y, 1e-30, 1.0)))
train_step = tf.train.GradientDescentOptimizer(0.01).minimize(cross_entropy)

init = tf.initialize_all_variables()

# Add ops to save and restore all the variables.
# saver = tf.train.Saver()

sess = tf.Session()
sess.run(init)

correct_prediction = tf.equal(tf.argmax(y,1), tf.argmax(y_,1))
accuracy = tf.reduce_mean(tf.cast(correct_prediction, 'float'))

for i in range(100):
  batch_xs, batch_ys = sets.train.next_batch(50)
  sess.run(train_step, feed_dict={x: batch_xs, y_: batch_ys})


  # test_images, test_labels = sets.test.next_batch(25)
  # print sess.run(y, feed_dict={x: test_images})
  # print sess.run(tf.argmax(y, 1), feed_dict={x: test_images, y_: test_labels})
  # print sess.run(tf.argmax(y_, 1), feed_dict={x: test_images, y_: test_labels})

#save_path = saver.save(sess, 'hellmurky.ckpt')
# print 'Model saved in file: ', save_path

test_images, test_labels = sets.test.next_batch(25)

print sess.run(y, feed_dict={x: test_images, y_: test_labels})
print sess.run(tf.argmax(y, 1), feed_dict={x: test_images, y_: test_labels})
print sess.run(tf.argmax(y_, 1), feed_dict={x: test_images, y_: test_labels})
print sess.run(accuracy, feed_dict={x: test_images, y_: test_labels})
