var util = require('util')
  , EventEmitter = require('events').EventEmitter
  , hue = require("node-hue-api")
  , HueApi = require("node-hue-api").HueApi
  , HueHubDriver = require('./hue_hub')
  , HueBulbDriver = require('./hue_bulb');

var HueScout = module.exports = function() {
  this.interval = 15000;
  EventEmitter.call(this);
  this.drivers = ['huehub','huebulb'];
};
util.inherits(HueScout, EventEmitter);

HueScout.prototype.init = function(next) {
  // start search logic
  this.search();
  setInterval(this.search.bind(this),this.interval);
  next();
};

HueScout.prototype.provision = function(device) {
  if(device.type === 'huehub'){
    return [HueHubDriver,device.data,this.newLight.bind(this)];
  } else if(device.type === 'huebulb'){
    var hueapi = new HueApi(device.data.hue.host, device.data.hue.username);
    return [HueBulbDriver,device.data,hueapi]
  }
};

HueScout.prototype.search = function() {
  var self = this;
  hue.locateBridges(function(err, hubs) {
    if(err)
      return;

    hubs.forEach(function(hueHub){
      self.emit('discover', HueHubDriver,hueHub,self.newLight.bind(this));
    });

  });
};

HueScout.prototype.newLight = function(light,hueapi){
  this.emit('discover', HueBulbDriver,light,hueapi);
};

HueScout.prototype.compare = function(a,b) {
  return (a.data.id === b.data.id);
};
