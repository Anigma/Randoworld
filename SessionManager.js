exports.SessionManager = function () {

  /*
   * User: user_id:{name:, lastTimestamp:, userId}
   *
   * Responses: user_id: httprequest
   */
   
  var ret = {
    users: {},
    callbacks: [],
    nextUserId: 0,
    
    registerUser: function(username) {
      var newUser = {
        id: this.nextUserId,
        name: username,
        timestamp: (new Date()).getTime(),
        sessionId: Math.floor(Math.random() * 1000000000),
        entity: null
      }
      
      for (var id in this.users) {
        if (this.users[id].name == username)
          return -1;
      }
      
      this.users[this.nextUserId++] = newUser;
      
      return newUser;
    },
    
    validateSID: function(sid) {
      for (var id in this.users) {
        if (this.users[id].sessionId == sid)
          return this.users[id];
      }
      
      return false;
    },
    
    setUserEntity: function(userId, entity) {
      var userExists = false;
      for (var id in this.users) {
        if (id == userId)
          userExists = true;
      }
      if (!userExists) return false;
      
      this.users[userId].entity = entity;
      return true;
    },
    
    beginPoll: function(userId, res) {
      var userExists = false;
      for (var id in this.users) {
        if (id == userId)
          userExists = true;
      }
      if (userExists)
        this.callbacks.push(res);
      else
        return -1;
    },
    
    // msg better be a valid json object lol
    broadcast: function(msg) {
      for (var i in this.callbacks)
        this.callbacks[i].simpleJson(200, msg);
      this.callbacks = [];
    }
  }
  return ret;
}
