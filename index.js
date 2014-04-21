var types = [
  'Command',
  'Special',
  'System',
  'Oplog',
  'Normal'
];

function NS(ns){
  if(!(this instanceof NS)) return new NS(ns);

  this.ns = ns;
  this.dotIndex = ns.indexOf('.');
  if(this.dotIndex === -1){
    this.database = ns;
    this.collection = '';
  }
  else{
    this.database = ns.slice(0, this.dotIndex);
    this.collection = ns.slice(this.dotIndex + 1);
  }

  if(/\.(count|time)$/.test(this.collection)){
    var matches = /\.([a-z]+)\.(count|time)$/.exec(this.collection);
    this.collection = this.collection.slice(0, matches.index);
    this.metric = matches[1];
    this.metricType = matches[2];
  }

  this.system = /^system\./.test(this.collection);
  this.oplog = /local\.oplog\.(\$main|rs)/.test(ns);

  this.command = this.collection === '$cmd' ||
    this.collection.indexOf('$cmd.sys') === 0;
  this.special = this.oplog || this.command || this.system;
  this.normal = this.oplog || this.ns.indexOf('$') === -1 ;

  this.validDatabaseName = new RegExp('^[^\\\\\/\'".*<>:|? ]*$').test(this.database) &&
    this.database.length <= NS.MAX_DATABASE_NAME_LENGTH;
  this.validCollectionName = this.collection.length > 0 &&
    (this.oplog || /^[^\0\$]*$/.test(this.collection));

  this.databaseHash = 7;
  this.ns.split('').every(function(c, i){
    if(c === '.') return false;
    this.databaseHash += 11 * this.ns.charCodeAt(i);
    this.databaseHash *= 3;
    return true;
  }.bind(this));
}

NS.prototype.metric = null;
NS.prototype.metricType = null;

NS.prototype.database = '';
NS.prototype.databaseHash = 0;
NS.prototype.collection = '';

NS.prototype.command = false;
NS.prototype.special = false;
NS.prototype.system = false;
NS.prototype.oplog = false;
NS.prototype.normal = false;

for(var i=0; i< types.length; i++){
  NS.prototype['is' + types[i]] = function(){
    return this[types[i].toLowerCase()];
  };
}

NS.prototype.toString = function(){
  return this.ns;
};

NS.MAX_DATABASE_NAME_LENGTH = 128;

module.exports = NS;
