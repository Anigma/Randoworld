
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
      $(this.table[entity.location.x][entity.location.y - 1]).css('backgroundColor', '#ff0000');
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
  	  $(this.table[entity.location.x][entity.location.y + 1]).css('backgroundColor', '#ff0000');
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
	    $(this.table[entity.location.x - 1][entity.location.y]).css('backgroundColor', '#ff0000');
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
	    $(this.table[entity.location.x + 1][entity.location.y]).css('backgroundColor', '#ff0000');
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
    this.jtable = $(document.createElement('table'))
    this.table = [];
    
	for (var y = 0;y < this.height;y++) {
        var jrow = $(document.createElement('tr')).addClass('maprow');
        var row = [];
        
		for (var x = 0;x < this.width;x++) {
            var jcell = $(document.createElement('td')).addClass('mapcell')
            //jcell.html(this.terrain[y][x]);
            
//			if (y == this.height-1) jcell.addClass('mapcell-bottom');
	//		if (x == 0) jcell.addClass('mapcell-left');
            
            jrow.append(jcell);
            row.push(jcell);
		}
        this.jtable.append(jrow);
        this.table.push(row);
	}
	this.container.empty().append(this.jtable)
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

MapView.prototype.previousEntities = {};

MapView.prototype.drawEntities = function(entities) {
    if(entities) {
        this.entities = entities;
        for(var key in entities) {
            var e = entities[key];
            var y = e.location.y - this.ypos;
            var x = e.location.x - this.xpos;
            if(y < 0 || y >= this.height
                || x < 0 || x >= this.width) {
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

				var pair = this.previousEntities[e.id];
				if(pair) {
					
					this.fillCellByTerrainCoordinate(pair.x,pair.y);
				}
				this.previousEntities[e.id] = {"x":e.location.x,"y":e.location.y};
				// possible source of memory leak if they are never removed?
				this.table[y][x].text(type);
				
				if(this.table[y][x].text() == "&") {
					//this.table[y][x].addClass('mapcell-enemy');
					this.table[y][x].css("color", "red");
				}
				if(this.table[y][x].text() == "@") {
					//this.table[y][x].css("background-color", "blue");
					//this.table[y][x].addClass('mapcell-player');
					this.table[y][x].css("color", "white");
				}
				if(this.table[y][x].text() == "%") {
					this.table[y][x].css("background-color", "green");
				}
            }
        }
    }
}

MapView.prototype.rollViewUp = function() {
	this.ypos -= 1;
	
	var rows = this.jtable.find('tr');
	var last = rows[this.height - 1];
	this.jtable.prepend(last);

	last = this.table.pop();
	this.table.unshift(last);

	for(var i = 0; i < this.width; i++) {
        this.fillCellByViewCoordinate(i,0);
	}
}


MapView.prototype.rollViewDown = function() {
	this.ypos += 1;

	var first = this.jtable.find('tr')[0];
	this.jtable.append(first);

	first = this.table.shift();
	this.table.push(first);

	for(var i = 0; i < this.width; i++) {
		var y = this.height - 1;

        this.fillCellByViewCoordinate(i,y);
	}
}


MapView.prototype.rollViewLeft = function() {
	this.xpos -= 1;
	var jrows = this.jtable.find('tr');

	for(var i = 0; i < this.height; i++) {
		var last = $(jrows[i]).find('td')[this.width - 1];
		$(jrows[i]).prepend(last);

		last = this.table[i].pop();
		this.table[i].unshift(last);

		this.fillCellByViewCoordinate(0,i);
	}
}


MapView.prototype.rollViewRight = function() {
	this.xpos += 1;
	var jrows = this.jtable.find('tr');

	for(var i = 0; i < this.height; i++) {
		var first = $(jrows[i]).find('td')[0];
		$(jrows[i]).append(first);

		first = this.table[i].shift();
		this.table[i].push(first);

		this.fillCellByViewCoordinate(this.width - 1,i);
	}
}

MapView.prototype.scrollTable = function(newx,newy) {
    newx += this.xpos;
    newy += this.ypos;
    this.repositionTable(newx,newy);
}

MapView.prototype.repositionTable = function(xpos, ypos) {
	if(this.ypos - ypos == 1) {
		this.rollViewUp();
		return;
	}
	else if(this.ypos - ypos == -1) {
		this.rollViewDown();
		return;
	}
	else if(this.xpos - xpos == 1) {
		this.rollViewLeft();
		return;
	}
	else if(this.xpos - xpos == -1) {
		this.rollViewRight();
		return;
	}
    this.xpos = xpos;
    this.ypos = ypos;
    for(var y = 0; y < this.height; y++) {
    
        for(var x = 0; x < this.width; x++) {
            this.fillCellByViewCoordinate(x,y);
        }
    }
}

MapView.prototype.fillCellByViewCoordinate = function(x,y) {
  if(!(0 <= x && x < this.width && 0 <= y && y < this.height)) return;
    var terrainY = y + this.ypos;
    var terrainX = x + this.xpos;
	this.table[y][x].text("");
	if(terrainY < 0 || terrainY >= this.terrain.length
        || terrainX < 0 || terrainX >= this.terrain[0].length) {
        //this.table[y][x].text(BLANK);
		this.table[y][x].css("background-color", "black");
    }
    else {
        //this.table[y][x].text(this.terrain[terrainY][terrainX]);
		this.table[y][x].css("color", "white");
		if(this.terrain[terrainY][terrainX] == 0)
			this.table[y][x].css("background-color", "gray");
		if(this.terrain[terrainY][terrainX] == 1)
			this.table[y][x].css("background-color", "white");
    }
}

MapView.prototype.fillCellByTerrainCoordinate = function(x,y) {
    var viewY = y - this.ypos;
    var viewX = x - this.xpos;
	this.fillCellByViewCoordinate(viewX,viewY);
}

MapView.prototype.setTerrain = function(terrain) {
  this.terrain = terrain;
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
