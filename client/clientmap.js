var MAP_WIDTH = 48;
var MAP_HEIGHT = 48;

var MINI_MAP_WIDTH = 24;
var MINI_MAP_HEIGHT = 24;
  
$(document).ready(function() {
  initMap($('#map'), {height: MAP_HEIGHT, width: MAP_WIDTH});
	initMap($('#mini-map'), {height: MINI_MAP_HEIGHT, width: MINI_MAP_WIDTH});
	$('#mini-map').attr('xpos', '0');
	$('#mini-map').attr('ypos', '0');
	
	$('#mapdiv').css('width', MAP_WIDTH * 13);
	
	bindEvents();
});

function bindEvents() {
	$('.mapcell').click(function() {
		var position = {x:parseInt($(this).attr('xpos')), y:parseInt($(this).attr('ypos'))};
		unitUpdate($('#mini-map'), {
			action:  mapdata[position.y][position.x] == 0 ? 'unit_add' : 'unit_remove',
			x: position.x,
			y: position.y
		});
		mapdata[position.y][position.x] = mapdata[position.y][position.x] == 0 ? 1 : 0;
	
		$(this).toggleClass('mapcell-selected');
	});
	
	$('#up').click(function(){
		if (scrollUp($('#mini-map')) === false) return;
	});
	
	$('#down').click(function(){
		if (scrollDown($('#mini-map')) === false) return;
	});
	
	$('#left').click(function(){
		if (scrollLeft($('#mini-map')) === false) return;
	});
	
	$('#right').click(function(){
		if (scrollRight($('#mini-map')) === false) return;
	});
	
	$('#dump').click(function(){
		dumpMap();
	});
}

function initMap(out, size) {
	var map = '';

	for (var y = 0;y < size.height;y++) {
		map += '<tr class="maprow">';
		for (var x = 0;x < size.width;x++) {
			var classes = 'mapcell';
			if (y == size.height-1) classes += ' mapcell-bottom';
			if (x == 0) classes += ' mapcell-left';
			if (mapdata[y][x] == 1) classes += ' mapcell-selected';
			map += '<td class="'+classes+'" xpos="'+x+'" ypos="'+y+'">&nbsp;</td>';
		}
		map += '</tr>';
	}
	
	out.html(map);
	out.attr('mapheight', size.height);
	out.attr('mapwidth', size.width);
}

function spawnPlayer(map, location) {
  mapdata[location.y][location.x] = 2;
  $($(map.find('.maprow')[location.y]).find('.mapcell')[location.x]).addClass('mapcell-player');
}

function centerOnLocation(map, location) {
  var maplocation = {};
  maplocation.x = location.x - parseInt(map.attr('xpos'));
  maplocation.y = location.y - parseInt(map.attr('ypos'));
  
  maplocation.x = (maplocation.x < 0) ? 0 : maplocation.x;
  maplocation.y = (maplocation.y < 0) ? 0 : maplocation.y;
  
  console.log('New location: ['+maplocation.y+', '+maplocation.x+']');
  map.attr('xpos', maplocation.x);
  map.attr('ypos', maplocation.y);
}

function refreshMap(map) {
  var height = parseInt(map.attr('mapheight'));
  var width = parseInt(map.attr('mapwidth'));
  console.log('Map size: ['+height+','+width+']');
  
  var offX = parseInt(map.attr('xpos'));
  var offY = parseInt(map.attr('ypos'));
  console.log('Map offsets: ['+offY+', '+offX+']');
  
  var rows = map.find('.maprow');
  for (var y = 0;y < height;y++) {
    var row = $(rows[y]);
    for (var x = 0;x < width;x++) {
      var cell = $(row.find('.mapcell')[x]);
      
      cell.removeClass('mapcell-selected mapcell-player');
      switch (mapdata[y+offY][x+offX]) {
        case 1:
          cell.addClass('mapcell-selected');
          break;
        case 2:
          cell.addClass('mapcell-player');
          break;
      }
    }
  }
}

//TODO: These two can be combined into a single function
function scrollDown(map) {
	var rows = map.find('.maprow');
	var position = {x:parseInt(map.attr('xpos')), y:parseInt(map.attr('ypos')) + 1};
	
	if (position.y >= MINI_MAP_HEIGHT) return false;

	var newrow = '<tr class="maprow">';
	for (var c = 0;c < $(rows[0]).find('.mapcell').length;c++) {
		var classes = 'mapcell';
		if (c == 0) classes += ' mapcell-left';
		if (mapdata[position.y + MINI_MAP_HEIGHT - 1][c + position.x] == 1) classes += ' mapcell-selected';
		classes += ' mapcell-bottom';
		
		newrow += '<td class="'+classes+'">&nbsp;</td>';
		
		$(rows[rows.length-1]).find('.mapcell').eq(c).removeClass('mapcell-bottom');
	}
	newrow += '</tr>';
	
	$(rows[0]).remove();
	$(rows[rows.length-1]).after(newrow);
	
	$('#mini-map').attr('xpos', position.x.toString());
	$('#mini-map').attr('ypos', position.y.toString());
}

function scrollUp(map) {
	var rows = map.find('.maprow');
	var position = {x:parseInt(map.attr('xpos')), y:parseInt(map.attr('ypos')) - 1};
	
	if (position.y < 0) return false;

	var newrow = '<tr class="maprow">';
	for (var c = 0;c < $(rows[0]).find('.mapcell').length;c++) {
		var classes = 'mapcell';
		if (c == 0) classes += ' mapcell-left';
		if (mapdata[position.y][c + position.x] == 1) classes += ' mapcell-selected';
		
		newrow += '<td class="'+classes+'">&nbsp;</td>';
		
		$(rows[rows.length-2]).find('.mapcell').eq(c).addClass('mapcell-bottom');
	}
	newrow += '</tr>';
	
	$(rows[rows.length-1]).remove();
	$(rows[0]).before(newrow);
	
	$('#mini-map').attr('xpos', position.x.toString());
	$('#mini-map').attr('ypos', position.y.toString());
}

//TODO: These two can be combined into a single function
function scrollRight(map) {
	var rows = map.find('.maprow');
	var position = {x: parseInt(map.attr('xpos')) + 1, y:parseInt(map.attr('ypos'))};
	if (position.x >= MAP_WIDTH - MINI_MAP_WIDTH) return false;
	
	for (var r = 0;r < rows.length;r++) {
		var classes = 'mapcell';
		if (mapdata[r + position.y][position.x + MINI_MAP_WIDTH - 1] == 1) classes += ' mapcell-selected';
		if (r == MINI_MAP_HEIGHT-1) classes += ' mapcell-bottom';
		
		var newcell = '<td class="'+classes+'">&nbsp;</td>';
		
		$(rows[r]).find('.mapcell').eq(0).remove();
		$(rows[r]).find('.mapcell').eq(0).addClass('mapcell-left');
		$(rows[r]).append(newcell);
		
	}
	
	$('#mini-map').attr('xpos', position.x.toString());
	$('#mini-map').attr('ypos', position.y.toString());
}

function scrollLeft(map) {
	var rows = map.find('.maprow');
	var position = {x: parseInt(map.attr('xpos')) - 1, y:parseInt(map.attr('ypos'))};
	if (position.x < 0) return false;
	
	for (var r = 0;r < rows.length;r++) {
		var classes = 'mapcell mapcell-left';
		if (mapdata[r + position.y][position.x] == 1) classes += ' mapcell-selected';
		if (r == MINI_MAP_HEIGHT-1) classes += ' mapcell-bottom';
		
		var newcell = '<td class="'+classes+'">&nbsp;</td>';
		
		$(rows[r]).find('.mapcell').eq(MINI_MAP_WIDTH-1).remove();
		$(rows[r]).find('.mapcell').eq(0).removeClass('mapcell-left');
		$(rows[r]).find('.mapcell').eq(0).before(newcell);
		
	}
	
	$('#mini-map').attr('xpos', position.x.toString());
	$('#mini-map').attr('ypos', position.y.toString());
}

function buildMapCell(options) {
	var classes = 'mapcell';
	if (options.selected) classes += ' mapcell-selected';
	
	return '<td class="'+classes+'">&nbsp;</td>';
}

/* params:
 *		- action: [unit_add, unit_remove]
 *		- x: x-coordinate of update
 *		- y: y-coordinate of update
 *
 */
function unitUpdate(map, params) {
	var mapOffset = {x:parseInt(map.attr('xpos')), y:parseInt(map.attr('ypos'))};
	if (params.y > mapOffset.y + MINI_MAP_HEIGHT || params.y < mapOffset.y) return;
	if (params.x > mapOffset.x + MINI_MAP_WIDTH || params.x < mapOffset.x) return;

	var cell = map.find('.maprow').eq(params.y - mapOffset.y).find('.mapcell').eq(params.x - mapOffset.x);
	switch(params.action) {
		case 'unit_add':
			cell.addClass('mapcell-selected');
			break;
		case 'unit_remove':
			cell.removeClass('mapcell-selected');
			break;
	}
}

function dumpMap() {
	//var out = $('#map-output');
	var out = '';
	var map = $('#map');
	//out.empty();
	
	//out.append('[');
	for (var y = 0;y < MAP_HEIGHT;y++) {
		var row = map.find('.maprow').eq(y);
		//out.append('[');
		for (var x = 0;x < MAP_WIDTH;x++) {
			var cell = row.find('.mapcell').eq(x);
			//out.append( (cell.hasClass('mapcell-selected') ? '1' : '0') + (x == MAP_WIDTH-1 ? '' : '') );
      out += ( (cell.hasClass('mapcell-selected') ? '1' : '0') + (x == MAP_WIDTH-1 ? '' : '') );
		}
		//out.append('],<br>');
	}
	//out.append(']');
	
	$('#output').attr('value', out);
}
