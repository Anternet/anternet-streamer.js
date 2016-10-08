# anternet-streamer.js

[![build](https://img.shields.io/travis/Anternet/anternet-streamer.js.svg?branch=master)](https://travis-ci.org/Anternet/anternet-streamer.js)
[![npm](https://img.shields.io/npm/v/anternet-streamer.svg)](https://npmjs.org/package/anternet-streamer)
[![Join the chat at https://gitter.im/Anternet/anternet.js](https://badges.gitter.im/Anternet/anternet.js.svg)](https://gitter.im/Anternet/anternet.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm](https://img.shields.io/npm/l/anternet-streamer.svg)](LICENSE)


[Anternet](https://www.npmjs.com/package/anternet) library for streaming large data chunks over UDP protocol.
 

## Example File Server

```js
const fs = require('fs');
const Anternet = require('anternet');
const Streamer = require('anternet-streamer');
const Source = Streamer.Source;

const anternet = new Anternet();
const streamer = new Streamer(anternet);

const msgType = 1001; // custom message type

// service files on `msgType`
anternet.on(msgType, (rid, args, rinfo) => {
  const filePath = args[0];
  
  // create a new source only if not exists already
  const source = streamer.get(filePath, path => Source.fromFile(path));
  
  // create a private referance for this peer
  const ref = streamer.stream(source, rinfo.port, rinfo.address, {start: 10, end: 8000});

  // send the referance back to the peer
  anternet.response(rid, [ref], rinfo.port, rinfo.address);
});

// other peer address
const address = '127.0.0.1';
const port = 12345;

// request "foo.js" from other peer
anternet.request(msgType, ['foo.js'], port, address, (err, args, rinfo) => {
  if (err) throw err;

  const ref = args[0];
  streamer.read(ref, port, address).pipe(process.stdout);
});
```

## License

[MIT License](LICENSE).
Copyright &copy; 2016 [Moshe Simantov](https://github.com/moshest)



