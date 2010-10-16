MAP_WIDTH = 50;
MAP_HEIGHT = 50;

var sys = require('sys');

exports.TileManager = function() {  
  var EntityFactory = require('./EntityFactory');
  
  var ret = {
    terrain: [],
    entities: {},
    entityFactory: EntityFactory.EntityFactory(),
    spawnPoints: [],
    
    generateMap: function() {
      /*var map = Array(MAP_HEIGHT);
      for (var c = 0;c < MAP_HEIGHT;c++) {
        map[c] = Array(MAP_WIDTH);
        for (var i = 0;i < MAP_WIDTH;i++) {
          map[c][i] = Math.floor(Math.random() * 10);
        }
      }*/
      
      var mapdata = require('./data/testmap');
      var constants = require('./Constants');
      
      mapdata = mapdata.mapdata;
      for (var c = 0;c < mapdata.length;c++) {
        for (var i = 0;i < mapdata[c].length;i++) {
          if (mapdata[c][i] == 2) {
            this.spawnEntity(constants.ENTITY_TYPES.ENEMY, {x: i, y: c});
            mapdata[c][i] = 0;
          }
          if (mapdata[c][i] == 3) {
            spawnPoints.push({x: i, y: c});
          }
        }
      }
      
      this.terrain = mapdata;
    },

    terrainPassable: function(x,y) {
      var constants = require('./Constants');
    	return 0 <= x && x < this.terrain[0].length 
        && 0 <= y && y < this.terrain.length && this.terrain[y][x] != constants.TERRAIN_TYPES.WALL;
    },
    
    damageEntity: function (entityId, damageAmt) {
      sys.log(entityId);
      if (this.entities[entityId]) {
        this.entities[entityId].health.current -= damageAmt;
        if (this.entities[entityId].health.current <= 0) {
          delete this.entities[entityId];
          return -1;
        }
        return this.entities[entityId].health.current;
      }
      
      return -2;
    },
    
    spawnEntity: function (ENTITY_TYPE, location) {
      var constants = require('./Constants');
      var EntityFactory = require('./EntityFactory');
      
      var newEntity = null;
      
      switch (ENTITY_TYPE) {
        case constants.ENTITY_TYPES.PLAYER:
          newEntity = this.entityFactory.player();
          if (this.spawnPoints.length != 0) {
            var spawnId = (Math.floor(Math.random() * 1000) % this.spawnPoints.length);
            newEntity.location = this.spawnPoints[spawnId];
          }
          break;
        case constants.ENTITY_TYPES.ENEMY:
          sys.log('Generating enemy');
          newEntity = this.entityFactory.enemy(location);
          this.entities[newEntity.id] = newEntity;
          return newEntity;
          break;
        default:
      }
      
      var end = true;
      do {
        end = true;
        for (var i in this.entities) {
          sys.log(i);
          var entity = this.entities[i];
          if (newEntity.location.x == entity.location.x && newEntity.location.y == entity.location.y) {
            newEntity.location.x++;
            end = false;
          }
        }
      }
      while (!end) 

      this.entities[newEntity.id] = newEntity;      
      return newEntity;
    },
    
    updateEntityLocation: function(entityId, locationDelta) {
      var sys = require('sys');
      if (this.entities[entityId]) {
        var entity = this.entities[entityId]
        entity.location.x += locationDelta.x;
        entity.location.y += locationDelta.y;
        
        this.entities[entityId] = entity;
        sys.log('efefe');
        return true;
      }
      
      return false;
    },
    
    dump: function() {
      var ret = {};
      ret.terrain = JSON.stringify(this.terrain);
      ret.entities = JSON.stringify(this.entities);
      return ret;
    }
  };
  
  return ret;
}
