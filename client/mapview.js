$(document).ready(function() {
    var c=0;
    var e = [];
    for(var i = 0;i < 40; i++) {
        var t = [];
        for(var j = 0; j < 40; j++) {
            t.push(c++ % 40);
        }
        e.push(t);
    }
    
    map = new MapView($('#mini-map'),mapdata, 21, 21);

    map.createTable();
    map.repositionTable(-1,-1);
    
    mapdata = [{s:"p",x:0,y:1},{s:"m",x:1,y:2}];
    map.drawEntities(mapdata);
    
    bindEvents(map);
})

bindEvents = function(map) {
    $(document).keypress(function(e){
	if (e.keyCode) keycode=e.keyCode;
	else keycode=e.which;
	ch=String.fromCharCode(keycode);
	
	if(ch=='w') 		map.scrollTable(0,-1) //up
	else if(ch=='s') 	map.scrollTable(0,1) //down
	else if(ch=='a') 	map.scrollTable(-1,0) //left
	else if(ch=='d') 	map.scrollTable(1,0) //right
    });
    
    $('#up').click(function(){
        map.scrollTable(0,-1)
	});
	
	$('#down').click(function(){
        map.scrollTable(0,1)
	});
	
	$('#left').click(function(){
        map.scrollTable(-1,0)
	});
	
	$('#right').click(function(){
        map.scrollTable(1,0)
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

MapView.prototype.drawEntities = function(entities) {
    if(entities) {
        this.entities = entities;
        for(var i = 0; i < entities.length; i++) {
            var e = entities[i];
            var ypos = e.y - this.ypos;
            var xpos = e.x - this.xpos;
            if(ypos < 0 || ypos >= this.height
                || xpos < 0 || xpos >= this.width) {
                // do nothing?
            }
            else {
                this.table[ypos][xpos].html(e.s);
		
		if(this.table[ypos][xpos].html() == "m")
		    this.table[ypos][xpos].css("background-color", "red");
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
    this.drawEntities(this.entities);
    
}

MapView.prototype.init = function() {



}