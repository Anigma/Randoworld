var PORT = 1337;
var HOST = null;

var sys = require('sys');
var fu = require('./lib/node-router');
var url = require('url');

var session = require('./SessionManager');
var querystring = require('querystring');

var server = fu.getServer();
var sessionManager = session.SessionManager();

server.get('/', fu.staticHandler('client/index.htm'));
server.get('/jquery.js', fu.staticHandler('client/jquery.js'));

server.get('/session', function(req, res) {
  var params = url.parse(req.url, true).query;
  
  var userId = sessionManager.registerUser(params.name);
  if (userId != -1)
    res.simpleJson( 200, {user_id: userId} );
  else
    res.simpleJson( 200, {error: 'USER_NAME_IN_USE'} );
});

server.get('/poll', function(req, res) {
  var params = url.parse(req.url, true).query;
  
  if (params.user_id) {
    sessionManager.beginPoll(params.user_id, res);
  }
  else {
    res.simpleJson(200, {error: 'USERID_REQUIRED'});
  }
});

server.get('/broadcast', function(req, res) {
  var params = url.parse(req.url, true).query;
  
  if (params.user_id && params.msg) {
    sessionManager.broadcast({msg:params.msg});
    res.simpleText(200, '');
  }
  else {
    res.simpleJson(200, {error: 'USERID_REQUIRED'});
  }
});

server.listen(PORT);
