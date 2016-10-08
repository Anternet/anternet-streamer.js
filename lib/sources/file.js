const Source = require('../source');
const fs = require('fs');

class SourceFile extends Source {
  constructor(path, opts = {}) {
    super();
    this.autoClose = (opts.autoClose === undefined || opts.autoClose);

    if (typeof path === 'string') {
      fs.open(path, opts.flags || 'r', opts.mode, (err, fd) => {
        if (err) return this.emit('error', err);

        this.ready(fd);
      });
    } else {
      process.nextTick(() => {
        this.ready(path);
      });
    }
  }

  ready(fd) {
    this.fd = fd;
    super.ready();
  }

  read(buffer, offset, length, position, callback) {
    fs.read(this.fd, buffer, offset, length, position, callback);
  }

  close(cb) {
    if (this.autoClose) {
      fs.close(this.fd, () => {
        // ignore any error

        this.fd = null;
        super.close(cb);
      });
    } else {
      this.fd = null;
      process.nextTick(() => super.close(cb));
    }
  }
}

module.exports = SourceFile;
