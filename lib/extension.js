const Anternet = require('anternet');
const RefMap = require('./ref-map');
const Stream = require('./stream');


const MSG_TYPE_READ = 0x06;
const CHUNK_MAX_LENGTH = 512;
const FLAGS_LAST = 0x01;
const FLAGS_EOF = 0x03;

class Extension extends Anternet.Extension {

  init() {
    this.refs = new RefMap();
  }

  destroy() {
    this.refs.clear();
    this.refs = null;

    super.destroy();
  }

  getEvents() {
    return {
      [MSG_TYPE_READ]: this.onRead.bind(this),
    };
  }

  stream(source, port, address, opts = {}) {
    return this.refs.add(source, {
      port,
      address,
      start: opts.start || 0,
      end: opts.end,
    });
  }

  read(refId, port, address, opts = {}) {
    return new Stream((offset, length, callback) => {
      this.anternet.request(MSG_TYPE_READ, [refId, offset, length], port, address, (err, args) => {
        if (err) return callback(err);

        if (args.length < 2 || !Number.isInteger(args[0]) || !(args[1] instanceof Buffer)) {
          return callback(new Error('Unexpected response'));
        }

        return callback(null, args.shift(), args.shift(), args);
      });
    }, opts);
  }

  reqRead(refId, port, address, position, length, callback) {
    const buffers = [];

    let resPos = position;
    this.anternet.request(MSG_TYPE_READ, [refId, position, length], port, address, (err, args) => {
      if (err) return callback(err);

      if (args.length < 2 || !Number.isInteger(args[0]) || !(args[1] instanceof Buffer)) {
        callback(new Error('Unexpected response'));
        return;
      }

      const offset = args.shift();
      const buffer = args.shift();
      const flags = args.shift() || 0;

      if (offset < position || offset + buffer.length > position + length) {
        callback(new Error('Unexpected offset'));
        return;
      }

      buffers.push({ start: offset, end: offset + buffer.length, buffer, flags });

      if (resPos !== offset) return true;

      buffers.sort((a, b) => a.start - b.start);

      let i = 1;
      while (i < buffers.length && buffers[i].start === buffers[i - 1].end) i++;

      resPos = buffers[i].end;
      const endFlags = buffer[i - 1].flags;

      const result = buffers.splice(0, i).map(item => item.buffer);
      const hasMore = buffers.length > 0 || !endFlags;

      callback(Buffer.concat(result, resPos - offset));

      if (!hasMore) {
        process.nextTick(() => callback(null, endFlags === FLAGS_EOF));
      }

      return hasMore;
    });
  }

  onRead(rid, args, rinfo) {
    if (args.length < 2 || !Number.isInteger(args[0]) || !Number.isInteger(args[1])
      || !Number.isInteger(args[2]) || args[1] < 1 || args[2] < 1) {
      this.anternet.error(Anternet.Errors.BAD_REQUEST, rid, 'Unknown streamer-read format',
          rinfo.port, rinfo.address);
      return;
    }

    const refId = args[0];

    const ref = this.refs.get(refId);
    if (!ref || ref.port !== rinfo.port || ref.address !== rinfo.address) {
      this.anternet.error(Anternet.Errors.NOT_FOUND, rid, 'Streamer-reference not found',
        rinfo.port, rinfo.address);
      return;
    }

    const offset = args[1] + ref.start;
    let length = args[2];

    if (offset + length > ref.end) {
      length = ref.end - offset;
    }

    const buffer = Buffer.allocUnsafe(length);
    ref.source.read(buffer, 0, length, offset, (err, bytesRead) => {
      if (err) {
        this.anternet.error(Anternet.Errors.UNKNOWN, rid, 'Unknown read error',
          rinfo.port, rinfo.address);
        return;
      }

      let pos = 0;
      let res;
      do {
        const chunkSize = Math.min(bytesRead - pos, CHUNK_MAX_LENGTH);
        const start = pos;
        pos += chunkSize;

        res = [start, buffer.slice(start, pos)];
        if (pos >= bytesRead) res.push(bytesRead < length ? FLAGS_EOF : FLAGS_LAST);

        this.anternet.response(rid, res, rinfo.port, rinfo.address);
      } while (res.length === 3);
    });
  }
}

module.exports = Extension;
