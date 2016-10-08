const Source = require('../source');

class SourceBuffer extends Source {
  constructor(buffer) {
    if (!(buffer instanceof Buffer)) throw new Error('Expected first argument to be Buffer');

    super();
    this.buffer = buffer;

    process.nextTick(() => {
      this.ready();
    });
  }

  read(buffer, offset, length, position, callback) {
    const bytesRead = this.buffer.copy(buffer, offset, position, position + length);

    process.nextTick(() => {
      callback(null, bytesRead, buffer);
    });
  }

  close(cb) {
    this.buffer = null;
    process.nextTick(() => super.close(cb));
  }
}

module.exports = SourceBuffer;
