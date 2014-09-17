var session = require('express-session');
var AerospikeStore = require('./')(session);

var store = new AerospikeStore();
store.on('connect',function(){
  console.log('connect');
});
