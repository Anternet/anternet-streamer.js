
class RefMap extends Map {

  constructor(limit) {
    super();

    this.sources = new Map();

    this.limit = limit;
    this.last = Math.floor(Math.random() * this.limit);
  }

  add(source, opts) {
    const refCount = this.sources.get(source);
    if (!refCount) {
      this.sources.set(source, 1);
    } else {
      this.sources.set(source, refCount + 1);
    }

    const start = this.last;
    if (++this.last > this.limit) this.last = 0;

    while (this.has(this.last)) {
      if (++this.last > this.limit) this.last = 0;

      if (this.last === start) throw new Error('Can\'t add new value; map is full');
    }

    this.set(this.last, Object.assign({ source }, opts));
    return this.last;
  }

  delete(key) {
    const ref = this.get(key);
    if (!ref) return false;

    const refCount = this.sources.get(ref.source);
    if (refCount > 1) {
      this.sources.set(ref.source, refCount - 1);
    } else {
      ref.source.close();
      this.sources.delete(ref.source);
    }

    return super.delete(key);
  }

  clear() {
    super.clear();

    this.sources.forEach((key, ref) => ref.source.close());
    this.sources.clear();
  }

}

module.exports = RefMap;
