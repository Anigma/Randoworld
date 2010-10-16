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
        name: username,
        timestamp: (new Date()).getTime()
      }
      
      for (var id in this.users) {
        if (this.users[id].name == username)
          return -1;
      }
      
      this.users[this.nextUserId] = newUser;
      
      return this.nextUserId++;
    },
    
    beginPoll: function(user_id, res) {
      this.callbacks.push(res);
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
