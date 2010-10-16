var PORT = 1337;
var HOST = null;

var url = require('url');
var sys = require('sys');
var querystring = require('querystring');
var fu = require('./lib/node-router');
var tileMgr = require('./TileManager');
var session = require('./SessionManager');
var constants = require('./Constants');


var server = fu.getServer();
var sessionManager = session.SessionManager();
var tileManager = tileMgr.TileManager();
tileManager.generateMap();

setInterval(function() {
  sessionManager.broadcast({action: 'state_sync', dump: tileManager.dump()});
}, 10000);

server.get('/', fu.staticHandler('client/index.htm'));
server.get('/default.css', fu.staticHandler('client/default.css'));
server.get('/constants.js', fu.staticHandler('client/constants.js'));
server.get('/actions.js', fu.staticHandler('client/actions.js'));
server.get('/mapview.js', fu.staticHandler('client/mapview.js'));
server.get('/Event.js', fu.staticHandler('client/Event.js'));
server.get('/Game.js', fu.staticHandler('client/Game.js'));
server.get('/jquery.js', fu.staticHandler('client/jquery.js'));

server.get('/user/join', function(req, res) {
  var params = url.parse(req.url, true).query;
  
  if (!params || !params.name) {
    res.simpleJson(200, {error: 'USERNAME_REQUIRED'});
    return;
  }
  
  var user = sessionManager.registerUser(params.name);
  if (user != -1) {
    var constants = require('./Constants');
    var playerEntity = tileManager.spawnEntity(constants.ENTITY_TYPES.PLAYER);
    if (!sessionManager.setUserEntity(user.id, playerEntity)) {
      sys.log('Unable to set player entity');
    }
  
    sessionManager.broadcast({action: 'user_joined', entity: playerEntity});
    res.simpleJson( 200, {session_id: user.sessionId, entity_id: playerEntity.id} );
  }
  else
    res.simpleJson( 200, {error: 'USER_NAME_IN_USE'} );
});

server.get('/user/act', function(req, res) {
  var params = url.parse(req.url, true).query;
  
  if (!params.sid) {
    res.simpleJson(200, {error: 'USERID_REQUIRED'});
  }
  var user = null;
  if (!(user = sessionManager.validateSID(params.sid))) {
    res.simpleJson(200, {error: 'INVALID_SESSION'});
  }
  
  if (params.action) {
    switch(parseInt(params.action)) {
      case constants.ACTION_TYPES.ATTACK:
        var retCode = tileManager.damageEntity(params.entity, 5);
        switch (retCode) {
          case -1:
            sessionManager.broadcast({action: 'death', entity_id: params.entity});
            break;
          case -2:
            break;
        }
        res.simpleJson(200, {result: 'success'});
        break;
      case constants.ACTION_TYPES.MOVE:
        switch(parseInt(params.direction)) {
          case constants.DIRECTIONS.NORTH:
            if (!tileManager.updateEntityLocation(user.entity.id, {x: 0, y: -1})) {
              res.simpleJson(200, {error: 'CANNOT_UPDATE_ENTITY'});
              return;
            }
            sessionManager.broadcast({action: 'entity_moved', entity_id: user.entity.id, locationDelta: {x: 0, y: -1} });
            res.simpleJson(200, {result: 'success'});
            break;
          case constants.DIRECTIONS.SOUTH:
            if (!tileManager.updateEntityLocation(user.entity.id, {x: 0, y: 1})) {
              res.simpleJson(200, {error: 'CANNOT_UPDATE_ENTITY'});
              return;
            }
            sessionManager.broadcast({action: 'entity_moved', entity_id: user.entity.id, locationDelta: {x: 0, y: 1} });
            res.simpleJson(200, {result: 'success'});
            break;
          case constants.DIRECTIONS.EAST:
            if (!tileManager.updateEntityLocation(user.entity.id, {x: 1, y: 0})) {
              res.simpleJson(200, {error: 'CANNOT_UPDATE_ENTITY'});
              return;
            }
            sessionManager.broadcast({action: 'entity_moved', entity_id: user.entity.id, locationDelta: {x: 1, y: 0} });
            res.simpleJson(200, {result: 'success'});
            break;
          case constants.DIRECTIONS.WEST:
            if (!tileManager.updateEntityLocation(user.entity.id, {x: -1, y: 0})) {
              res.simpleJson(200, {error: 'CANNOT_UPDATE_ENTITY'});
              return;
            }
            sessionManager.broadcast({action: 'entity_moved', entity_id: user.entity.id, locationDelta: {x: -1, y: 0} });
            res.simpleJson(200, {result: 'success'});
            break;
          default:
            res.simpleJson(200, {error: 'INVALID_DIRECTION'});
        }
        break;
      default:
        res.simpleJson(200, {error: 'INVALID_ACTION'});
    }
  }
});



server.get('/poll', function(req, res) {
  var params = url.parse(req.url, true).query;
  var user = null;
  
  if (!params.sid) {
    res.simpleJson(200, {error: 'USERID_REQUIRED'});
  }
  if (!(user = sessionManager.validateSID(params.sid))) {
    res.simpleJson(200, {error: 'INVALID_SESSION'});
  }
  
  if (sessionManager.beginPoll(user.id, res) == -1) {
    res.simpleJson(200, {error: 'USER_DOES_NOT_EXIST'});
  }
  else {
    sessionManager.beginPoll(user.id, res);
  }
});

server.get('/broadcast', function(req, res) {
  var params = url.parse(req.url, true).query;
  
  if (!params.sid) {
    res.simpleJson(200, {error: 'SID_REQUIRED'});
    return;
  }
  if (!sessionManager.validateSID(params.sid)) {
    res.simpleJson(200, {error: 'INVALID_SESSION'});
  }
  
  if (params.msg) {
    sessionManager.broadcast({msg:params.msg});
    res.simpleText(200, '');
  }
});

server.get('/map/dump', function(req, res) {
  var params = url.parse(req.url, true).query;
  
  res.simpleJson(200, tileManager.dump());
});

server.listen(PORT);
