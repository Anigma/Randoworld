Game = function() {
  this.sid = null;
  this.eid = null;
  this.name = null;
  
  this.mapview = new MapView($('#mini-map'), null, 21, 21);
  
  this.loginSuccess = new Event();
}

Game.prototype.bindEvents = function() {
  var self = this;
  this.mapview.bindEvents();
  this.mapview.selfMove.subscribe(function(direction) {self.commitMove(direction);});
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
      
      self.bindEvents()
      
      data = '['+data+']';
      data = eval(data)[0];
      self.stateSync(data);
      self.beginPolling();
    });
  }, 'json');
}

Game.prototype.stateSync = function(data) {
  var terrain = eval(data.terrain);
  var entities = eval('['+data.entities+']')[0];


  this.mapview.terrain = terrain;
  this.mapview.entities = entities;/*
	var t = [];
	var c = 0;
	for(var i = 0; i < 80; i++) {
		var d = [];
		for(var j = 0; j < 80; j++) {
			d.push(c);
		  c++;
		}
		t.push(d);
	}

	
	this.mapview.terrain = t;*/
  this.mapview.createTable();
	this.mapview.updateTable();
}

Game.prototype.beginPolling = function() {
  var self = this;
  if (this.sid) {
    $.get('/poll?sid='+this.sid, function(data) {
      data = eval('['+data+']')[0];
      self.handlePollResponse(data);
    }, 'json');
  }
}

Game.prototype.handlePollResponse = function(data) {
  if (!data.error) {
    switch (data.action) {
      case 'entity_moved':
        if (data.entity_id == this.eid) {
          this.beginPolling();
          return;
        }
        this.mapview.message(data.entity_id, data.locationDelta);
        break;
      case 'state_sync':
        this.stateSync(data.dump);
        break;
      case 'user_joined':
        this.mapview.addEntity(data.entity);
        break;
      case 'death':
        this.mapview.removeEntity(data.entity_id);
    }
  }
  else {
    this.handleError(data.error);
  }
  
  this.beginPolling();
}

Game.prototype.commitMove = function(direction) {
  direction = direction.direction;

  $.get('/user/act?sid='+this.sid+'&action='+ACTION_TYPES.MOVE+'&direction='+direction);  
}
