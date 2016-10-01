const EventEmitter = require('events');
const Anternet = require('anternet');
const Extension = require('./lib/extension');
const Source = require('./lib/source');
const SourceMap = require('./lib/source-map');


class Streamer extends EventEmitter {

  constructor(anternet) {
    super();

    this.extension = this.constructor.extend(anternet);
    this.sourceMap = new SourceMap();

    this.extension.join(this);
  }


  /** static methods **/

  static extend(anternet) {
    if (!(anternet instanceof Anternet)) {
      throw new Error('Invalid instance; Anternet instance expected');
    }

    return anternet.extend(Extension);
  }

  static release(anternet) {
    if (!(anternet instanceof Anternet)) {
      throw new Error('Invalid instance; Anternet instance expected');
    }

    return anternet.release(Extension);
  }


  /** protocol methods **/

  read(ref) {
    return this.extension.read(ref);
  }


  /** source methods **/

  get(key, generator) {
    return this.sourceMap.get(key, generator);
  }

  stream(source, port, address, opts = {}) {
    return this.extension.stream(source, port, address, opts);
  }
}

module.exports = Streamer;

Streamer.Source = Source;
Streamer.SourceMap = SourceMap;
