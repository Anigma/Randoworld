var nextEntityId = 0;

exports.EntityFactory = function () {
  var ret = {
    nextEntityId: 0,
  
    player: function() {
      var constants = require('./Constants');
      var entity = {
        id: this.nextEntityId++,
        type: constants.ENTITY_TYPES.PLAYER,
        location: {x: 0, y: 0}
      };
      
      return entity;
    }
    
  };
  
  return ret;
}
