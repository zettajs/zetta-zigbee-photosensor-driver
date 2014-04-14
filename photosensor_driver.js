var PhotosensorDriver = module.exports = function(info,xbeeAPI) {
  this.type = 'photosensor';
  this.name = 'Photosensor-'+info.remote16;
  this.data = {
    remote16 : info.remote16,
    remote64 : info.remote64
  };
  this.value = NaN;
  this._xbeeAPI = xbeeAPI;

  this.state = 'ready';
};

PhotosensorDriver.prototype.init = function(config) {
  config
    .stream(this.name+'/value', this.onValue);
};

PhotosensorDriver.prototype.onValue = function(emitter) {
  var self = this;
  this._xbeeAPI.on('frame_object',function(frame){
    
    if(frame.remote64 !== self.data.remote64)
      return;
    
    if(frame.type !== 146)
      return;
    
    self.value = frame.analogSamples.AD0;
    self.emit('update',self.value);

//    emitter.emit('data', {value : self.value,units : 'mV'}  );
    emitter.emit('data', self.value  );
  });
};
