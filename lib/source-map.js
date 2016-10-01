
class SourceMap extends Map {

  get(key, generator) {
    let source = super.get(key);

    if (!source) {
      source = generator(key);
      this.set(key, source);
    }

    return source;
  }

  set(key, source) {
    if (this.has(key)) throw new Error(`Source key '${key}' already exists`);

    const removeSource = () => {
      this.delete(key);

      source.removeListener('error', removeSource);
      source.removeListener('close', removeSource);
    };

    source.on('error', removeSource);
    source.on('close', removeSource);

    return super.set(key, source);
  }

}

module.exports = SourceMap;
