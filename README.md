connect-aerospike
=================
connect-aerospike is a Aerospike session store backed by aerospike-client-nodejs.

## Installation

via npm:

```bash
$ npm install connect-aerospike
```

## Options

* `prefix` an optional prefix for each key,in case you are sharing your Aerospike servers and namespace with something generating its own keys.
* `hosts` Aerospike servers locations, can by array.
* `ttl` Aerospike content TTL in seconds.

## Usage

```
var session = require('express-session');
var sessionStore = require('connect-aerospike')(session);
app.use(session({
  secret:'secret key'
  store :new sessionStore({
    ttl: 86400
    hosts:['127.0.0.1:3000'],
    prefix:'sess:'
    }),
}));
```
