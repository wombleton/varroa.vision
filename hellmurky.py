import time
import BaseHTTPServer
import tensorflow as tf
import numpy

x = tf.placeholder('float', shape=[None, 16384])
W = tf.Variable(tf.zeros([16384, 2]))
b = tf.Variable(tf.zeros([2]))
y = tf.nn.softmax(tf.matmul(x, W) + b)

init = tf.initialize_all_variables()

# Add ops to save and restore all the variables.
saver = tf.train.Saver()

sess = tf.Session()
sess.run(init)

saver.restore(sess, 'hellmurky.ckpt')
print 'Model restored.'

HOST_NAME = 'localhost' # !!!REMEMBER TO CHANGE THIS!!!
PORT_NUMBER = 4321 # Maybe set this to 9000.

lfile = open('hellmurky-labels.txt')

f = open('hellmurky-data.txt')

y_ = tf.placeholder("float", [None, 2])

correct_prediction = tf.equal(tf.argmax(y,1), tf.argmax(y_,1))
accuracy = tf.reduce_mean(tf.cast(correct_prediction, "float"))

class MyHandler(BaseHTTPServer.BaseHTTPRequestHandler):
    def do_HEAD(s):
        s.send_response(200)
        s.send_header('Content-type', 'text/html')
        s.end_headers()
    def do_GET(s):
        """Respond to a GET request."""
        s.send_response(200)
        s.send_header('Content-type', 'application/json')
        s.end_headers()

        data = numpy.fromstring(f.read(16384 * 100), 'uint8')
        data = data.astype(numpy.float32)
        data = numpy.multiply(data, 1.0 / 255.0)
        data = data.reshape(100, 64 * 64 * 4)

        labels =  [next(lfile) for i in xrange(100)]
        labels = [ [0.0, 1.0] if l == 'bee\n' else [1.0, 0.0] for l in labels ]

        r = sess.run(y, feed_dict={ x: data })

        s.wfile.write(r)

if __name__ == '__main__':
    server_class = BaseHTTPServer.HTTPServer
    httpd = server_class((HOST_NAME, PORT_NUMBER), MyHandler)
    print time.asctime(), 'Server Starts - %s:%s' % (HOST_NAME, PORT_NUMBER)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    print time.asctime(), 'Server Stops - %s:%s' % (HOST_NAME, PORT_NUMBER)
