Game = function() {
  this.sid = null;
  this.eid = null;
  this.name = null;
  
  this.mapview = null;
  
  this.loginSuccess = new Event();
}

Game.prototype.login = function(username) {
  var self = this;
  $.get('/user/join?name='+username, function(data) {
    data = eval('['+data+']')[0];
    if (data.error) {
      $('#login-console').append('User name in use<br>');
      return;
    }
    self.loginSuccess.fire();
    self.sid = data.session_id;
    self.eid = data.entity_id;
    
    $.get('/map/dump?sid='+self.sid, function(data) {
      self.mapview = new MapView($('#mini-map'), null, 21, 21);
      self.stateSync(data);
      self.beginPolling();
    });
  }, 'json');
}

Game.prototype.stateSync = function(data) {
  data = '['+data+']';
  data = eval(data)[0];

  var terrain = eval(data.terrain);
  var entities = eval('['+data.entities+']')[0];
  
  this.mapview.terrain = terrain;
  this.mapview.entities = entities;
  this.mapview.createTable();
	this.mapview.updateTable();
	bindEvents(this.mapview);
}

Game.prototype.beginPolling = function() {
  var self = this;
  if (this.sid) {
    $.get('/poll?sid='+this.sid, function(data) {self.handlePollResponse(data);}, 'json');
  }
}

Game.prototype.handlePollResponse = function(data) {
  if (!data.error) {
    switch (data.action) {
      case 'entity_moved':
        break;
      case 'state_sync':
        break;
    }
  }
  else {
    this.handleError(data.error);
  }
  
  self.beginPolling();
}
