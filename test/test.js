var assert = require('assert');
var session = require('express-session');
var AerospikeStore = require('../')(session);

store = new AerospikeStore();
store.set('abc',{cookie:{maxAge:2000},name:'y.p'},function(err,ok){
  assert.ok(err===null,'set error!!!!');
  assert.ok(ok.ns==='session','options namespace error!!!!');
  assert.ok(ok.set ==='store','options session error!!!!');
  store.get('abc',function(err,ok){
    console.dir(ok);
    assert.ok(err===null,'set error!!!!');
    assert.ok(ok.cookie.maxAge===2000,'get maxAge error!!!!');
    assert.ok(ok.name ==='y.p','get name error!!!!');
  });
});
