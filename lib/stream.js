const stream = require('stream');

const REQ_MIN_LENGTH = 512;
const REQ_MAX_MUL = 2;
const ERRORS_MAX = 3;

class Stream extends stream.Readable {
  constructor(peerRead, opts = {}) {
    super(opts);

    this.peerRead = peerRead;
    this.buffers = [];
    this.errors = 0;

    this.reqOffset = 0;
    this.reqLength = REQ_MIN_LENGTH;
    this.reqMul = REQ_MAX_MUL;

    this.buffering = false;
    this.readingNext = false;
  }

  _read() {
    if (this.buffers.length) {
      const buffer = Buffer.concat(this.buffers);
      this.buffers = [];

      if (!this.push(buffer)) return;
    }

    this.buffering = false;
    this.readNext();
  }

  readNext() {
    if (this.readingNext) return;

    if (!this.peerRead) {
      this.push(null);
      return;
    }

    this.readingNext = true;

    this.peerRead(this.reqOffset, this.reqLength, (err, buffer, isEOF) => {
      if (err) {
        if (++this.errors > ERRORS_MAX) {
          this.emit('error', err);
          return;
        }

        this.reqLength = Math.round(this.reqLength / this.reqMul);
        this.reqMul = Math.sqrt(this.reqMul);

        this.readingNext = false;
        if (!this.buffering) this.push('');
        return;
      }

      this.errors = 0;
      if (!buffer) {
        this.reqLength = Math.round(this.reqLength * this.reqMul);
        this.readingNext = false;
        if (isEOF) this.peerRead = null;

        if (!this.buffering) this.readNext();
        return;
      }

      this.reqOffset += buffer.length;

      if (this.buffering) {
        this.buffers.push(buffer);
      } else {
        this.buffering = !this.push(buffer);
      }
    });
  }
}

module.exports = Stream;
