const EventEmitter = require('events');
const SourceBuffer = require('./sources/buffer');
const SourceFile = require('./sources/file');

class Source extends EventEmitter {

  static from(obj, encoding = 'utf8') {
    const buf = obj instanceof Buffer ? obj : Buffer.from(obj, encoding);
    return new SourceBuffer(buf);
  }

  static fromFile(fd, opts = {}) {
    return new SourceFile(fd, opts);
  }

  constructor() {
    super();

    this.isReady = false;
  }

  read(buffer, offset, length, position, callback) {
    if (!this.isReady) {
      if (this.isReady === null) throw new Error('Source already closed');

      this.on('ready', () => {
        this.read(buffer, offset, length, position, callback);
      });
      return;
    }

    this._read(buffer, offset, length, position, callback); // eslint-disable-line
  }

  ready() {
    this.isReady = true;
    this.emit('ready');
  }

  close() {
    this.isReady = null;
    this.emit('close');
  }

  _read(buffer, offset, length, position, callback) {
    callback(new Error('Not implemented'));
  }
}

module.exports = Source;

Source.File = SourceFile;
Source.Buffer = SourceBuffer;
