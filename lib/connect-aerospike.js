/*!
 * connect-aerospike
 * Copyright{c} 2014 tanaka.y.p <tanaka.y.p@gmail.com>
 */

/**
 * Module Dependencies.
 */
var aerospike = require('aerospike');

/**
 * const variables
 */
var _default_host = '127.0.0.1';
var _default_port = 3000;
var _default_log_level = '5';
var _default_timeout = 10;
var _default_prefix = 'sess:';
var _default_ns = 'session';
var _default_set = 'store';
var _default_ttl = 86400



/**
 * Return the AerospikeStore extending express session Store.
 *
 * @param {object} express session
 * @return {Function}
 * @api public
 */

module.exports = function(session){
  /**
   * Express's session Store
   */
  var Store = session.Store;


  /**
   * Initialize AerospikeStore with the given options
   *
   * pparam {Object} options
   * @api public
   */
  function AerospikeStore(options){
    var self = this;
    options = options || {};
    Store.call(self,options);

    self.prefix = null == options.prefix ? _default_prefix : options.prefix;
    self.ns = null == options.ns ? _default_ns : options.ns;
    self.st = null == options.st ? _default_set : options.st;
    self.ttl = null == options.ttl ? _default_ttl : options.ttl;

    if(!options.hosts || options.hosts.length<=0){
      options.hosts = [_default_host];
    }

    if(options.hosts){
      var hosts = options.hosts.map(function(host){
        var _val = host.split(':');
        var _host = _val[0];
        var _port = ~~_val[1] || _default_port;
        return { addr:_host,port:_port};
      });
      var timeout = (typeof options.timeout === 'number' ? options.timeout : _default_timeout);
      aerospike.client({
        hosts:hosts,
        log:{
          level: _default_log_level
        },
        policies:{
          timeout: timeout
        }
      }).connect(function(err,client){
        if(err.code != aerospike.status.AEROSPIKE_OK){
          console.error('Aerospike server connection Error : %j',err);
        }else{
          self.client = client;
        }
      });
    }
  };

  /**
   * Inherit from Store
   */
  AerospikeStore.prototype.__proto__ = Store.prototype;
  /**
   * create session key
   * @param {String} sid
   * @api public
   */
  AerospikeStore.prototype.getKey = function(sid){
    return this.prefix + sid;
  };
  /**
   * Attempt to fetch session by the given sid
   *
   * @param {String} sid
   * @param {Function} fn
   * @api public
   */
  AerospikeStore.prototype.get = function(sid,fn){
    sid = this.getKey(sid);
    var key = aerospike.key(this.ns,this.st,sid);
    this.client.get(key,function(err,res,meta){
      if(err.code === aerospike.status.AEROSPIKE_OK) {
          var cookie;
          if(typeof res.cookieString === 'undefined') {
              cookie = res;
          } else {
              var cookieString = res.cookieString || "{}";
              cookie = JSON.parse(cookieString);
          }
        return fn(null,cookie);
      } else if(err.code === aerospike.status.AEROSPIKE_ERR_RECORD_NOT_FOUND) {
        return fn();
      } else {
        return fn(err);
      }
    });
  };
  /**
   * Commit the given sess object associated with the given sid.
   * @param {String} sid
   * @param {Session} sess
   * @param {Function} fn
   *
   * @api public
   */
  AerospikeStore.prototype.set = function(sid,sess,fn){
    sid = this.getKey(sid);
    var maxAge = sess.cookie.maxAge;
    var ttl = (typeof maxAge === 'number' ? maxAge/1000 : this.ttl);
    var key = aerospike.key(this.ns,this.st,sid);
    var meta = {gen:0,ttl:ttl};
    var cookieString = JSON.stringify(sess);
    this.client.put(key,{cookieString: cookieString},meta,function(err,key){
      if(err.code != aerospike.status.AEROSPIKE_OK){
        fn(err);
      }else{
        fn(null,key);
      }
    });
  };
  /**
   * Destroy the session associated with the given sid
   *
   * @param {String} sid
   * @param {Function} fn
   *
   * @api public
   */
  AerospikeStore.prototype.destroy= function(sid,fn){
    sid = this.getKey(sid);
    var key = aerospike.key(this.ns,this.st,sid);
    this.client.remove(key,function(err,key){
      if(err.code != aerospike.status.AEROSPIKE_OK){
        console.log('error %s',err.message);
        fn(err);
      }else{
        fn(null,key);
      }
    });
  };
  return AerospikeStore;
};
