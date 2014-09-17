/*
 *
 */
var aerospike = require('aerospike');
var _default_host = '127.0.0.1';
var _default_port = 3000;
var _default_log_level = 'info';
var _default_timeout = 10;
var _default_prefix = 'sess:';
var _default_ns = 'sess';
var _default_set = 'session';
var _default_ttl = 86400

module.exports = function(session){
  var Store = session.Store;

  function AerospikeStore(options){
    var self = this;
    options = options || {};
    Store.call(this,options);

    self.prefix = null == options.prefix ? _default_prefix : options.prefix;
    self.ns = null == options.ns ? _default_ns : options.ns;
    self.st = null == options.st ? _default_set : options.st;
    self.ttl = null == options.ttl ? _default_ttl : options.ttl;

    if(!options.client){
      if(!options.hosts){
          options.hosts = [_default_host];
      }
    }

    if(options.client){
      self.client = options.client;
    }else if(options.port || options.hosts){
      var hosts = options.hosts.map(function(host){
        var _val = host.split(':');
        var _host = _val[0];
        var _port = _val[1] || _default_port;
        return { addr:_host,port:_port};
      });
      self.client = aerospike.client({
        hosts:hosts,
        log:{
          level: _default_log_level
        },
        policies:{
          timeout: _default_timeout
        }
      });
    }
    // event
    self.client.connect(function(err){
     if(err.code != aerospike.status.AEROSPIKE_OK){
       console.error('Aerospike server connection Error : %j',err);
       self.emit('disconnect');
     }else{
       self.emit('connect');
     }
    });
  };

  AerospikeStore.prototype.__proto__ = Store.prototype;
  AerospikeStore.prototype.getKey = function(sid){
    return this.prefix + sid;
  };
  AerospikeStore.prototype.get = function(sid,fn){
    sid = this.getKey(sid);
    var key = aerospike.key(this.ns,this.st,sid);
    this.client.get(key,function(err,res,metadata,key){
      if(err.code != aerospike.status.AEROSPIKE_OK){
        return fn(err);
      }else{
        return fn(err,res);
      }
    });
  };
  AerospikeStore.prototype.set = function(sid,sess,fn){
    sid = this.getKey(sid);
    var maxAge = sess.cookie.maxAge;
    var ttl = this.ttl;
    var sess = JSON.stringify(sess);
    var key = aerospike.key(this.ns,this.st,sid);
    ttl = ttl || (typeof maxAge === 'number' ? maxAge/1000 | 0 : oneDay);
    var meta = {gen:0,ttl:ttl};
    this.client.put(key,sess,meta,fn);
  };
  AerospikeStore.prototype.destroy= function(sid,fn){
    sid = this.getKey(sid);
    var key = aerospike.key(this.ns,this.st,sid);
    this.client.remove(key,function(err,key){
      if(err.code != aerospike.status.AEROSPIKE_OK){
        console.logP('error %s',err.message);
      }
    });
  };
  return AerospikeStore;
};
