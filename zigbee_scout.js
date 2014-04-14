var util = require('util');
var EventEmitter = require('events').EventEmitter;
var SerialPort = require('serialport').SerialPort;
var xbee_api = require('xbee-api');

var PhotoSensor = require('./photosensor_driver');

var ZigbeeScout = module.exports = function() {
  EventEmitter.call(this);
  
  this.drivers = [];

  this.portname = '/dev/tty.usbserial-A601EM9S';
  this.port = null;
  this.xbeeAPI = new xbee_api.XBeeAPI({
    api_mode: 1
  });

};
util.inherits(ZigbeeScout, EventEmitter);

ZigbeeScout.prototype.init = function(next) {
  var self = this;

  this.port = new SerialPort(this.portname, {
    baudrate: 9600,
    parser: this.xbeeAPI.rawParser()
  });

  this.port.on('open',function(){
    self.xbeeAPI.on("frame_object", self._onFrame.bind(self));
    next();
  });

  this.port.on('error',function(err){});
  this.xbeeAPI.on('error',function(err){});
};

ZigbeeScout.prototype._onFrame = function(frame) {
  if(frame.type === 146){
    this.emit('discover',PhotoSensor,frame,this.xbeeAPI);
  }
};



