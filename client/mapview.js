
/*$(document).ready(function() {
    
    map = new MapView($('#mini-map'),mapdata, 21, 21);

    map.createTable();
    map.repositionTable(-1,-1);
    
    entities = {1:{id:1,s:"m",x:0,y:1}, 0:{id:0,s:"m",x:1,y:2},
        1337 :{id:user.entity_id,s:"p",x:5,y:4}};
    map.entities = entities;
    map.updateTable();
    
    bindEvents(map,user);
})*/
BLANK = "#";

MapView = function(container, terrain, height, width) {
    this.entities = null;
    this.container = container;
    this.terrain = terrain;
    this.width = width;
    this.height = height;
    this.xpos = 0;
    this.ypos = 0;
    //2d array of $('td')s
    this.table = null;
    
    this.selfMove = new Event();
}

MapView.prototype.validMove = function(x,y,terrain) {

	var validTerrain = 0 <= x && x < terrain[0].length && 0 <= y && y < terrain.length && terrain[y][x] != TERRAIN_TYPES.WALL;

  //console.log('d....');	
  for (var i in this.entities) {
    var entity = this.entities[i];
    //console.log(entity);
    if (entity.location.x == x && entity.location.y == y) {
      if (entity.type == ENTITY_TYPES.ENEMY)
        return entity.id;
      else
        return -1;
    }
  }
  
  if (!validTerrain) return null;
  else return -1;
}

MapView.prototype.bindEvents = function() {
  var self = this;
  $(document).keypress(function(e){
	  if (e.keyCode) keycode=e.keyCode;
	  else keycode=e.which;
	  ch=String.fromCharCode(keycode);
	  var entity = game.mapview.entities[game.eid];
	  var targetEntityId = null;
	
	  if(ch=='w') {
	  if((targetEntityId = self.validMove(entity.location.x,entity.location.y - 1,self.terrain)) >= 0 && targetEntityId != null) {
	    var targetEntity = self.entities[targetEntityId];
	    $.get('/user/act?action='+ACTION_TYPES.ATTACK+'&sid='+game.sid+'&entity='+targetEntityId);
      $(tiles[entity.location.x][entity.location.y - 1]).css('backgroundColor', '#ff0000');
	    return;
	  }
		if(self.validMove(entity.location.x,entity.location.y - 1,self.terrain)) {
			self.message(game.eid,{x:0,y:-1});
			self.selfMove.fire({direction: DIRECTIONS.NORTH});
		}
	  }
	  else if(ch=='s') {
	  if((targetEntityId = self.validMove(entity.location.x,entity.location.y + 1,self.terrain)) >= 0 && targetEntityId != null) {
  	  var targetEntity = self.entities[targetEntityId];
  	  $.get('/user/act?action='+ACTION_TYPES.ATTACK+'&sid='+game.sid+'&entity='+targetEntityId);
  	  $(tiles[entity.location.x][entity.location.y + 1]).css('backgroundColor', '#ff0000');
  	  return;
	  }
		if(self.validMove(entity.location.x,entity.location.y + 1,self.terrain)) {
			self.message(game.eid,{x:0,y:1});
			self.selfMove.fire({direction: DIRECTIONS.SOUTH});
		}
	  }
	  else if(ch=='a') {
	  if((targetEntityId = self.validMove(entity.location.x - 1,entity.location.y,self.terrain)) >= 0 && targetEntityId != null) {
	    var targetEntity = self.entities[targetEntityId];
	    $.get('/user/act?action='+ACTION_TYPES.ATTACK+'&sid='+game.sid+'&entity='+targetEntityId);
	    $(tiles[entity.location.x - 1][entity.location.y]).css('backgroundColor', '#ff0000');
	    return;
	  }
		if(self.validMove(entity.location.x - 1,entity.location.y,self.terrain)) {
			self.message(game.eid,{x:-1,y:0});
			self.selfMove.fire({direction: DIRECTIONS.WEST});
		}
    }
	  else if(ch=='d') {
	  if((targetEntityId = self.validMove(entity.location.x + 1,entity.location.y,self.terrain)) >= 0 && targetEntityId != null) {
	    var targetEntity = self.entities[targetEntityId];
	    $.get('/user/act?action='+ACTION_TYPES.ATTACK+'&sid='+game.sid+'&entity='+targetEntityId);
	    $(tiles[entity.location.x + 1][entity.location.y]).css('backgroundColor', '#ff0000');
	    return;
	  }
		if(self.validMove(entity.location.x + 1,entity.location.y,self.terrain)) {
			self.message(game.eid,{x:1,y:0});
			self.selfMove.fire({direction: DIRECTIONS.EAST});
		}
	  }
  });
}

MapView.prototype.createTable = function() {
    var jtable = $(document.createElement('table'))
    this.table = [];
    
	for (var y = 0;y < this.height;y++) {
        var jrow = $(document.createElement('tr')).addClass('maprow');
        var row = [];
        
		for (var x = 0;x < this.width;x++) {
            var jcell = $(document.createElement('td')).addClass('mapcell')
            //jcell.html(this.terrain[y][x]);
            
			if (y == this.height-1) jcell.addClass('mapcell-bottom');
			if (x == 0) jcell.addClass('mapcell-left');
            
            jrow.append(jcell);
            row.push(jcell);
		}
        jtable.append(jrow);
        this.table.push(row);
	}
	this.container.empty().append(jtable)
}

MapView.prototype.scrollTable = function(newx,newy) {
    newx += this.xpos;
    newy += this.ypos;
    this.repositionTable(newx,newy);
}

MapView.prototype.message = function(entity_id, locationDelta) {
    if (this.entities[entity_id]) {
      this.entities[entity_id].location.x += locationDelta.x;
      this.entities[entity_id].location.y += locationDelta.y;
      
      this.updateTable();
      return true;
    }
    return false;

    /*
    if(message.type == "scrollx") {
        var e = this.entities[message.id];
        e.location.x += message.data;
        this.updateTable();
    }
    if(message.type == "scrolly") {
        var e = this.entities[message.id];
        e.location.y += message.data;
        this.updateTable();
    }
    */
}

MapView.prototype.updateTable = function() {
    this.centerOnEntity(this.entities[game.eid]);
    this.drawEntities(this.entities);
}

MapView.prototype.centerOnEntity = function(e) {
    var newx = Math.round(e.location.x - this.width/2);
    var newy = Math.round(e.location.y - this.height/2);
    this.repositionTable(newx,newy);
}

MapView.prototype.drawEntities = function(entities) {
    if(entities) {
        this.entities = entities;
        for(var key in entities) {
            var e = entities[key];
            var ypos = e.location.y - this.ypos;
            var xpos = e.location.x - this.xpos;
            if(ypos < 0 || ypos >= this.height
                || xpos < 0 || xpos >= this.width) {
                // do nothing?
            }
            else {
                var type;
				if(game.eid == e.id) {
					type = "@";
				}
				else if(e.type == ENTITY_TYPES.PLAYER) {
					type = "%";
				}
				else if(e.type == ENTITY_TYPES.ENEMY) {
					type = "&";
				}
				else {
					type = "u";
				}
				
				//console.log('one entity drawn');

				this.table[ypos][xpos].text(type);
				
				if(this.table[ypos][xpos].text() == "&") {
					this.table[ypos][xpos].addClass('mapcell-enemy');
				}
				if(this.table[ypos][xpos].text() == "@") {
					//this.table[ypos][xpos].css("background-color", "blue");
					this.table[ypos][xpos].addClass('mapcell-player');
			  }
				if(this.table[ypos][xpos].text() == "%") {
					this.table[ypos][xpos].css("background-color", "green");
				}
            }
        }
    }
}

MapView.prototype.repositionTable = function(xpos, ypos) {
    this.xpos = xpos;
    this.ypos = ypos;
    for(var y = 0; y < this.height; y++) {
    
        for(var x = 0; x < this.width; x++) {
            var terrainY = y + ypos;
            var terrainX = x + xpos;
            this.table[y][x].text('');
            if(terrainY < 0 || terrainY >= this.terrain.length
                || terrainX < 0 || terrainX >= this.terrain[0].length) {
                
                //this.table[y][x].text(BLANK);
				this.table[y][x].css("background-color", "black");
                
            }
            else {
                //this.table[y][x].text(this.terrain[terrainY][terrainX]);
				        if(this.terrain[terrainY][terrainX] == 0)
					        this.table[y][x].css("background-color", "gray");
				        if(this.terrain[terrainY][terrainX] == 1)
					        this.table[y][x].css("background-color", "white");
                    }
        }
    }
}

MapView.prototype.addEntity = function(entity) {
  this.entities[entity.id] = entity;
  this.updateTable();
}

MapView.prototype.removeEntity = function(entity_id) {
  console.log(entity_id);
  delete this.entities[entity_id];
  this.updateTable();
}

MapView.prototype.init = function() {



}
