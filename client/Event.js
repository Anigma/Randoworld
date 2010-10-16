Event = function() {
  this.subscribers = [];
  this.single = [];
};

Event.prototype.subscribe = function(callback) {
  this.subscribers.push(callback);
};

Event.prototype.singleBind = function(callback) {
  this.single.push(callback);
};

Event.prototype.fire = function(data) {
  for (var i = 0;i < this.single.length;i++) {
    (this.single[i])(data);
  }
  this.single = [];
  
  for (var i = 0;i < this.subscribers.length;i++) {
    (this.subscribers[i])(data);
  }
};
