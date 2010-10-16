
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

bindEvents = function(map) {
  $(document).keypress(function(e){
	  if (e.keyCode) keycode=e.keyCode;
	  else keycode=e.which;
	  ch=String.fromCharCode(keycode);
	
	  if(ch=='w') {
	    map.message({type:"scrolly",id:game.eid,data:-1});
	    this.
	  }
	  else if(ch=='s') {
	    map.message({type:"scrolly",id:game.eid,data:1});
	  }
	  else if(ch=='a') {
	    map.message({type:"scrollx",id:game.eid,data:-1});
    }
	  else if(ch=='d') {
	    map.message({type:"scrollx",id:game.eid,data:1});
	  }
  });
    
}

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

MapView.prototype.createTable = function() {
    var jtable = $(document.createElement('table'))
    this.table = [];
    
	for (var y = 0;y < this.height;y++) {
        var jrow = $(document.createElement('tr')).addClass('maprow');
        var row = [];
        
		for (var x = 0;x < this.width;x++) {
            var jcell = $(document.createElement('td')).addClass('mapcell')
            jcell.html(this.terrain[y][x]);
            
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

MapView.prototype.message = function(message) {
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
}

MapView.prototype.updateTable = function() {
	console.log(this.entities);
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
					type = "h";
				}
				else if(e.type == ENTITY_TYPES.PLAYER) {
					type = "p";
				}
				else if(e.type == ENTITY_TYPES.ENEMY) {
					type = "m";
				}
				else {
					type = "u";
				}

				this.table[ypos][xpos].html(type);
		
				if(this.table[ypos][xpos].html() == "m")
					this.table[ypos][xpos].css("background-color", "red");
				if(this.table[ypos][xpos].html() == "h")
					this.table[ypos][xpos].css("background-color", "blue");
				if(this.table[ypos][xpos].html() == "p")
					this.table[ypos][xpos].css("background-color", "green");
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
            if(terrainY < 0 || terrainY >= this.terrain.length
                || terrainX < 0 || terrainX >= this.terrain[0].length) {
                
                this.table[y][x].html(BLANK);
		this.table[y][x].css("background-color", "black");
                
            }
            else {
                this.table[y][x].html(this.terrain[terrainY][terrainX]);
		if(this.table[y][x].html() == 0)
		    this.table[y][x].css("background-color", "gray");
		if(this.table[y][x].html() == 1)
		    this.table[y][x].css("background-color", "white");
            }
        }
    }
}

MapView.prototype.setTerrain = function(terrain) {
  this.terrain = terrain;
}

MapView.prototype.init = function() {



}
