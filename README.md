connect-aerospike
=================
connect-aerospike is a Aerospike session store backed by [aerospike-client-nodejs](https://github.com/aerospike/aerospike-client-nodejs).

## Installation

via npm:

```bash
$ npm install connect-aerospike
```

## Options

* `ttl` Aerospike content TTL in seconds. (`Default: 86400`)
* `hosts` Aerospike servers locations, can by array. (`Default: '127.0.0.1:3000'`)
* `prefix` an optional prefix for each key,in case you are sharing your Aerospike servers and namespace with something generating its own keys. (`Default: 'sess:'`)
* `ns` Aerospike namespace. (`Default: 'session'`)
* `st` Aerospike set. (`Default: 'store'`)
* `timeout` maximum time in milliseconds to wait for the operation to complete. (`Default: 10`)

## Usage

```
var session = require('express-session');
var sessionStore = require('connect-aerospike')(session);
app.use(session({
  secret: 'secret key'
  store: new sessionStore({
    ttl: 86400
    hosts: ['127.0.0.1:3000'],
    prefix: 'sess_key:'
    ns: 'mysession_ns',
    st: 'mysession_st',
    timeout: 10
  })
}));
```
