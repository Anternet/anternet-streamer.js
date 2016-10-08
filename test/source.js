const assert = require('assert');
const crypto = require('crypto');
const Streamer = require('../');
const Source = Streamer.Source;
const { describe, it } = global;

const testBuffer = crypto.randomBytes(8000);

describe('Source', () => {
  describe('.Buffer', () => {
    it('should create class', () => {
      const source = new Source.Buffer(testBuffer);
      assert(source instanceof Source.Buffer);

      source.close();
    });

    it('should be ready', (done) => {
      const source = new Source.Buffer(testBuffer);

      source.on('ready', () => {
        source.close();
        done();
      });
    });

    describe('.close()', () => {
      it('should be close', (done) => {
        const source = new Source.Buffer(testBuffer);

        source.on('ready', () => {
          source.close();
          source.on('close', done);
        });
      });
    });

    describe('.read()', () => {
      it('should read before ready', (done) => {
        const source = new Source.Buffer(testBuffer);

        const buffer = Buffer.alloc(100);
        const pos = 12;

        source.read(buffer, 0, buffer.length, pos, done);
      });

      it('should read after ready', (done) => {
        const source = new Source.Buffer(testBuffer);

        source.on('ready', () => {
          const buffer = Buffer.alloc(100);
          const pos = 12;

          source.read(buffer, 0, buffer.length, pos, done);
        });
      });

      it('should read 100 bytes', (done) => {
        const source = new Source.Buffer(testBuffer);

        const buffer = Buffer.alloc(100);
        const pos = 12;

        source.read(buffer, 0, buffer.length, pos, (err) => {
          if (err) return done(err);


          assert(buffer.equals(testBuffer.slice(pos, pos + buffer.length)));
          source.close();
          done();
        });
      });

      it('should read partial bytes', (done) => {
        const source = new Source.Buffer(testBuffer);

        const buffer = Buffer.alloc(100);
        const pos = 12;
        const start = 10;
        const length = 80;

        source.read(buffer, start, length, pos, (err) => {
          if (err) return done(err);

          const buffer2 = Buffer.alloc(buffer.length);
          testBuffer.copy(buffer2, start, pos, pos + length);

          assert(buffer.equals(buffer2));
          source.close();
          done();
        });
      });
    });
  });
  describe('.Buffer', () => {
    it('should create class', () => {
      const source = new Source.Buffer(testBuffer);
      assert(source instanceof Source.Buffer);

      source.close();
    });

    it('should be ready', (done) => {
      const source = new Source.Buffer(testBuffer);

      source.on('ready', () => {
        source.close();
        done();
      });
    });

    describe('.close()', () => {
      it('should be close', (done) => {
        const source = new Source.Buffer(testBuffer);

        source.on('ready', () => {
          source.close();
          source.on('close', done);
        });
      });
    });

    describe('.read()', () => {
      it('should read before ready', (done) => {
        const source = new Source.Buffer(testBuffer);

        const buffer = Buffer.alloc(100);
        const pos = 12;

        source.read(buffer, 0, buffer.length, pos, done);
      });

      it('should read after ready', (done) => {
        const source = new Source.Buffer(testBuffer);

        source.on('ready', () => {
          const buffer = Buffer.alloc(100);
          const pos = 12;

          source.read(buffer, 0, buffer.length, pos, done);
        });
      });

      it('should read 100 bytes', (done) => {
        const source = new Source.Buffer(testBuffer);

        const buffer = Buffer.alloc(100);
        const pos = 12;

        source.read(buffer, 0, buffer.length, pos, (err) => {
          if (err) return done(err);


          assert(buffer.equals(testBuffer.slice(pos, pos + buffer.length)));
          source.close();
          done();
        });
      });

      it('should read partial bytes', (done) => {
        const source = new Source.Buffer(testBuffer);

        const buffer = Buffer.alloc(100);
        const pos = 12;
        const start = 10;
        const length = 80;

        source.read(buffer, start, length, pos, (err) => {
          if (err) return done(err);

          const buffer2 = Buffer.alloc(buffer.length);
          testBuffer.copy(buffer2, start, pos, pos + length);

          assert(buffer.equals(buffer2));
          source.close();
          done();
        });
      });
    });
  });

  describe('.from', () => {
    it('(buffer) should create Source.Buffer', () => {
      const source = Source.from(testBuffer);
      assert(source instanceof Source.Buffer);

      source.close();
    });

    it('(string) should create Source.Buffer', () => {
      const source = Source.from('hello world!');
      assert(source instanceof Source.Buffer);

      source.close();
    });
  });

  // TODO test Source.File
  // TODO test .fromFile
});
