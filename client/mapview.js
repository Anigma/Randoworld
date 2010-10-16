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
    
    map = new MapView($('#mini-map'),e, 21, 21);

    map.createTable();
    map.repositionTable(3,2);
    
    bindEvents(map);
})

bindEvents = function(map) {
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
                
            }
            else {
                this.table[y][x].html(this.terrain[terrainY][terrainX]);
            }
        }
    }
    
}

MapView.prototype.init = function() {



}