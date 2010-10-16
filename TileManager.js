MAP_WIDTH = 50;
MAP_HEIGHT = 50;

var sys = require('sys');

exports.TileManager = function() {  
  var EntityFactory = require('./EntityFactory');
  
  var ret = {
    terrain: [],
    entities: {},
    entityFactory: EntityFactory.EntityFactory(),
    
    generateMap: function() {
      /*var map = Array(MAP_HEIGHT);
      for (var c = 0;c < MAP_HEIGHT;c++) {
        map[c] = Array(MAP_WIDTH);
        for (var i = 0;i < MAP_WIDTH;i++) {
          map[c][i] = Math.floor(Math.random() * 10);
        }
      }*/
      
      var mapdata = require('./data/testmap');
      this.terrain = mapdata.mapdata;
    },
    
    spawnEntity: function (ENTITY_TYPE) {
      var constants = require('./Constants');
      var EntityFactory = require('./EntityFactory');
      
      var newEntity = null;
      
      switch (ENTITY_TYPE) {
        case constants.ENTITY_TYPES.PLAYER:
          newEntity = this.entityFactory.player();
          this.entities[newEntity.id] = newEntity;
          return newEntity;
          break;
        default:
      }
      
      return newEntity;
    },
    
    updateEntityLocation: function(entityId, locationDelta) {
      if (this.entities[entityId]) {
        var entity = this.entities[entityId]
        entity.location.x += locationDelta.x;
        entity.location.y += locationDelta.y;
        
        this.entities[entityId] = entity;
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
