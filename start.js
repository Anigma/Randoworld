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

setInterval(function() {
  var updates = []
  for(key in tileManager.entities) {
    var e = tileManager.entities[key];
    if(constants.ENTITY_TYPES.ENEMY == e.type) {
      var update = nextMove(e,tileManager);
      if(update) {
        updates.push(update);
      }
    }
  }
  sessionManager.broadcast({action: 'batch_update', "updates": updates});
}, 1000);

nextMove = function(enemy,tileManager) {
  var min = 1000000000;
  var minPlayer;
  for(var id in tileManager.entities) {
    var player = tileManager.entities[id];
    if(player.type == constants.ENTITY_TYPES.PLAYER) {
      var temp = Math.sqrt(Math.pow(enemy.location.x - player.location.x,2) + Math.pow(enemy.location.y - player.location.y,2));
      if(!minPlayer) {
        minPlayer = player;
        min = temp;
      }
      else if(temp < min) {
        minPlayer = player;
        min = temp;
      }
    }
  }
  if(!minPlayer) return null;
  if(min > 8) return null;
  var res = {action: "entity_moved", entity_id: enemy.id};
  if(enemy.location.x < minPlayer.location.x - 1) {
    res.locationDelta = {x:1,y:0}
  }
  else if(enemy.location.x > minPlayer.location.x + 1) {
    res.locationDelta = {x:-1,y:0}
  }
  else if(enemy.location.y < minPlayer.location.y - 1) {
    res.locationDelta = {x:0,y:1}
  }
  else if(enemy.location.y > minPlayer.location.y + 1) {
    res.locationDelta = {x:0,y:-1}
  }
  else if(Math.abs(enemy.location.y - minPlayer.location.y) == 1 
    && Math.abs(enemy.location.x - minPlayer.location.x) == 1) {
    if(enemy.location.x > minPlayer.location.x) {
      res.locationDelta = {x:-1,y:0}
    }
    else {
      res.locationDelta = {x:1,y:0}
    }
  }
  else {
    res = {action: "attack", damage_amount: 5, defender_id: minPlayer.id};
  }
  if(res.locationDelta) {
    if(tileManager.terrainPassable(
      enemy.location.x + res.locationDelta.x,
      enemy.location.y + res.locationDelta.y)) {

      enemy.location.x += res.locationDelta.x;
      enemy.location.y += res.locationDelta.y;
    }
    else {
      res = null;
    }
  }
  return res;
}

server.get('/', fu.staticHandler('client/index.htm'));
server.get('/default.css', fu.staticHandler('client/default.css'));
server.get('/constants.js', fu.staticHandler('client/constants.js'));
server.get('/actions.js', fu.staticHandler('client/actions.js'));
server.get('/mapview.js', fu.staticHandler('client/mapview.js'));
server.get('/Event.js', fu.staticHandler('client/Event.js'));
server.get('/Game.js', fu.staticHandler('client/Game.js'));
server.get('/jquery.js', fu.staticHandler('client/jquery.js'));

server.get('/user/leave', function(req, res) {
  var params = url.parse(req.url, true).query;
  if(params.eid) {
    sessionManager.unregisterUser(params.eid);
  }
});

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
          default:
            sessionManager.broadcast({action: 'attack', damage_amount: 5, defender_id: retCode});
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

server.get('/chat',function(req, res) {//eid,msg
  var params = url.parse(req.url, true).query;
  var u;
  for(var id in sessionManager.users) {
    u = sessionManager.users[id];
    if(u.entity.id == params.eid) {
      break;
    }
  }
  sessionManager.broadcast({action: 'chat_message', name: u.name, msg: params.msg});
  res.simpleText(200, '');
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
