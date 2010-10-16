var PORT = 1337;
var HOST = null;

var fu = require('./includes/fu');
var session = require('./SessionManager');

var sessionManager = session.SessionManager();

fu.listen(PORT, HOST);

fu.get("/session", function(req, res){
  var userId = sessionManager.registerUser(req.params['name']);
  res.simpleJSON(200, {user_id: userId} );
});
