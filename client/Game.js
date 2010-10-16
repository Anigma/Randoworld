Game = function() {
  this.sid = null;
  this.eid = null;
  this.name = null;
  this.healthWidth = 340;
  this.health = 40;
  this.damage = 0;
  
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

Game.prototype.logout = function() {
  var self = this;
  $.get('/user/leave?eid=' + game.eid, function(data) {
    // say goodbye!
  });
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

Game.prototype.addChat = function(name, message) {
  var d = $(document.createElement('div')).text(name + ": " + message);
  $('#chat_box').append(d);
}

Game.prototype.takeHit = function(damageAmount) {
  this.damage += damageAmount;
  $('#hpbar').width(1.0 * this.healthWidth * (this.health - this.damage) / this.health);
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
        if (data.entity_id == this.eid) document.location.href = document.location.href;
        this.mapview.removeEntity(data.entity_id);
        break;
      case 'chat_message':
        this.addChat(data.name, data.msg);
        break;
      case 'batch_update':
        this.batchUpdate(data.updates);
        break;
      case 'attack':
        if(data.defender_id == game.eid) {
          this.takeHit(data.damage_amount);
        }
        break;
    }
  }
  else {
    this.handleError(data.error);
  }
  
  this.beginPolling();
}

Game.prototype.batchUpdate = function(updates) {
  for(var i = 0; i < updates.length; i++) {
    var data = updates[i];

    switch (data.action) {
      case 'entity_moved':
        if (data.entity_id == this.eid) {
          continue;
        }
        this.mapview.message(data.entity_id, data.locationDelta);
        break;
      case 'attack':
        if(data.defender_id == game.eid) {
          this.takeHit(data.damage_amount);
        }
        break;
    }
    
  }
}

Game.prototype.commitMove = function(direction) {
  direction = direction.direction;

  $.get('/user/act?sid='+this.sid+'&action='+ACTION_TYPES.MOVE+'&direction='+direction);  
}
