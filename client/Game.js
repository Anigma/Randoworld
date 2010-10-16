Game = function() {
  sid = null;
  name = null;
  
  mapview = null;
}

Game.prototype.login = function(username) {
  $.get('/user/login?name='+username, function(data) {
  }, 'json');
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
}
