exports.SessionManager = function () {

  /*
   * User: user_id:{name:, lastTimestamp:, userId}
   *
   * Responses: user_id: httprequest
   */
   
  var ret = {
    users: {},
    responses: {},
    nextUserId: 0,
    
    registerUser: function(username) {
      var newUser = {
        name: username,
        timestamp: (new Date()).getTime()
      }
      
      this.users[this.nextUserId] = newUser;
      
      return this.nextUserId++;
    },
    
    beginPoll: function(user_id, req) {
      responses[user_id] = req;
    },
    
    // msg better be a valid json object lol
    broadcast: function(msg) {
      req.simpleJSON(200, msg);
    }
  }
  return ret;
}
