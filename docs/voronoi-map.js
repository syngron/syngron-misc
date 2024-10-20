
showHide = function(selector) {
	d3.select(selector).select('.hide').on('click', function(){
		d3.select(selector)
			.classed('visible', false)
			.classed('hidden', true);
	});

	d3.select(selector).select('.show').on('click', function(){
		d3.select(selector)
			.classed('visible', true)
			.classed('hidden', false);
	});
}

showHide('#explanation');
showHide('#maplegend');
showHide('#selections');

labels = d3.select('#toggles').selectAll('input')
	.data(pointTypes.values())
	//.data([{type: "MAX", color: "ff0000"}, {type: "MIN", color: "00ff00"}])
	.enter().append("label");

labels.append("input")
	.attr('type', 'radio')
	.attr('name', 'valueRadio')
	.property('checked', function(d) {
		return d.type == curtype;//initialSelections === undefined || initialSelections.has(d.type);
	})
.attr("value", function(d) { return d.type; })
	.on("change", function(d) {
		var oldtype = curtype;
		curtype = d.type;
		var keepstations = false;
		if (oldtype == "MAX" || oldtype == "MIN" || oldtype == "PRCP") {
			if (curtype == "MAX" || curtype == "MIN" || curtype == "PRCP") {
				keepstations = true;
			}
		}
		if (!keepstations) {
			var text = textinitial;
			d3.select('#selected h1')
				.html('')
				.append('a')
				.text(text);
			if (curtype == "SUN") {
				firstchoice = initialDWD1[0];
				firstchoicename = initialDWD1[1];
				firstval = "";
				secondchoice = initialDWD2[0];
				secondchoicename = initialDWD2[1];
				secondval = "";
			} else if (curtype == "SUN-MONTHLY") {
				firstchoice = initialWMO1[0];
				firstchoicename = initialWMO1[1];
				firstval = "";
				secondchoice = initialWMO2[0];
				secondchoicename = initialWMO2[1];
				secondval = "";
			} else {
				firstchoice = initialISD1[0];
				firstchoicename = initialISD1[1];
				firstval = "";
				secondchoice = initialISD2[0];
				secondchoicename = initialISD2[1];
				secondval = "";
			}
		}
		loadcsv(true);
	});

labels.append("span")
	.attr('class', 'key')
	.style('background-color', function(d) { return '#' + d.color; });

labels.append("span")
	.text(function(d) { return d.name; });

//function urlExists(url)	{
//	alert(url);
//    var http = new XMLHttpRequest();
//    http.open('HEAD', url, false);
//    http.send();
//    return http.status!=404;
//}
//
//function componentToHex(c) {
//	var hex = c.toString(16);
//	return hex.length == 1 ? "0" + hex : hex;
//}

var voronoi = d3.geom.voronoi()
	.x(function(d) { return d.x; })
	.y(function(d) { return d.y; });

function selectPoint() {
	if (debug) { console.log('selectPoint'); }

	if (d3.event.defaultPrevented) {
		// drag instead of click
		return;
	}

	d3.selectAll('.selected').classed('selected', false);

	var cell = d3.select(this),
	point = cell.datum();

	lastSelectedPoint = point;
	cell.classed('selected', true);

	if(firstchoice == "" && secondchoice == "") {
		firstchoice = point.id;
		firstchoicename = point.name + " ("+point.elev+"m)";
		firstval = point["MEDIAN"].toFixed(1);
	}
	else if(firstchoice != "" && secondchoice == "") {
		secondchoice = point.id;
		secondchoicename = point.name + " ("+point.elev+"m)";
		secondval = point["MEDIAN"].toFixed(1);
		csv1 = stationsplitdir + curtype + "-" + firstchoice + ".csv";
		csv2 = stationsplitdir + curtype + "-" + secondchoice + ".csv";
		//if (urlExists(csv1) && urlExists(csv2)) {
		drawSVG();	
		//}
	}
	else if(firstchoice != "" && secondchoice != "") {
		firstchoice = point.id;
		firstchoicename = point.name + " ("+point.elev+"m)";
		firstval = point["MEDIAN"].toFixed(1);
		secondchoice = "";
		secondval = "";
	}

	var unit = "°C";
	if (curtype == "PRCP") {
		unit = "mm";
	}

	var text = textinitial;
	if (firstchoice != "") {
		text = firstchoicename + " " + firstval + " " + unit;
		if (secondchoice != "") {
			text += ", " + secondchoicename + " " + secondval + " " + unit;
		} else {
			text += text2initial;
		}
	}

	d3.select('#selected h1')
		.html('')
		.append('a')
		.text(text)
		//.attr('href', point.id)
		//.attr('target', '_blank')
		;
} // end selectpoint

function loadcsv(alsodraw) {
	if (debug) { console.log('loadcsv', daysplitdir + curtype + "-" + wfilename); }
	d3.select('#loading').classed('visible', true);

	d3.csv(daysplitdir + curtype + "-" + wfilename, type2, function(error, csv) {
		if (debug) { console.log('done'); }
		
		if (error != null) { alert("Could not find data for request."); return; }

		points = csv;

		// check for each point on a coarse grid if a station is close enough
		for (lat=-90; lat<90; lat+=15) {
			//for (lat=40; lat<50; lat++) {
			fak = Math.cos(lat * 3.14159265359 / 180.0);
			for (lon=-180; lon<180; lon+=15) {
				//for (lon=5; lon<15; lon++) {
				var closeStationExists = false;
				for (i=0; i<csv.length; i++) {
					//dx = (lon - csv[i].longitude) * 111.1 * fak;
					//dy = (lat - csv[i].latitude) * 111.1;
					//dist = dx*dx + dy*dy;// + dz*dz);
					//if (dist < maxdistkm2) {
					if (csv[i].longitude == lon && csv[i].latitude == lat) {
						closeStationExists = true;
						break;
					}
				}
				if (!closeStationExists) {
					//console.log(lat + " " + lon);
					var latlng = new L.LatLng(lat, lon);
					var point = map.latLngToLayerPoint(latlng);
					points.push({"id": "EMPTYID", "name": "EMPTYNAME", "latitude": lat, "longitude": lon, "elev": 0, "MEDIAN": 0, "x": point.x, "y": point.y});
				}
			}
		}

		drawWithLoading();
		
		if (alsodraw) {
			csv1 = stationsplitdir + curtype + "-" + firstchoice + ".csv";
			csv2 = stationsplitdir + curtype + "-" + secondchoice + ".csv";
			drawSVG();	
		}

	});
} // end loadcsv

function type2(d, i) {
	dd = [];
	for(year=startyear; year<=endyear; year++) {
		if (!isNaN(d[year])) {
			dd.push(parseFloat(d[year]));
		}
	}
	//console.log(d);
	d["MEDIAN"] = d3.median(dd);
	return d;
}

function drawWithLoading(e){
	if (debug) { console.log('drawWithLoading'); }
	d3.select('#loading').classed('visible', true);
	if (e && e.type == 'viewreset') {
		d3.select('#overlay').remove();
	}
	setTimeout(function(){
		draw();
		d3.select('#loading').classed('visible', false);
	}, 0);
}

function draw() {
	if (debug) { console.log('draw'); }

	d3.select('#overlay').remove();

	var bounds = map.getBounds(),
	topLeft = map.latLngToLayerPoint(bounds.getNorthWest()),
	bottomRight = map.latLngToLayerPoint(bounds.getSouthEast()),
	existing = d3.set(),
	drawLimit = bounds.pad(0.4);

	var zoom = map.getZoom(); // 4 ~ Europe
	var xyelev = [];

	//filteredPoints = pointsFilteredToSelectedTypes().filter(function(d) {
	filteredPoints = points.filter(function(d) {
		if (isNaN(d.latitude)) { return false };
		if (isNaN(d.longitude)) { return false };
		if (isNaN(d.elev)) { return false };

		var latlng = new L.LatLng(d.latitude, d.longitude);

		if (!drawLimit.contains(latlng)) { return false };

		var point = map.latLngToLayerPoint(latlng);

		key = point.toString();
		if (existing.has(key)) { return false };

		var value = d["MEDIAN"];
		if (isNaN(value)) { return false };

		// filter points which are too close to previous ones
		if (curtype != "SUN" && zoom < 5) {
			for(i=0; i<xyelev.length; i++) {
				// z in m instead of px to weight stronger because of large weather changes with elevation
				dx = point.x - xyelev[i][0];
				dy = point.y - xyelev[i][1];
				dz = (d.elev - xyelev[i][2]) / 10 / zoom;
				dist = dx*dx + dy*dy + dz*dz;
				if (dist < mindistpx2) {
					return false;
				}
			}
		}

		existing.add(key);
		xyelev.push([ point.x, point.y, d.elev ]);

		d.x = point.x;
		d.y = point.y;
		return true;
	});

	var minlat = parseInt(drawLimit['_southWest']['lat']);
	var minlon = parseInt(drawLimit['_southWest']['lng']);
	var maxlat = parseInt(drawLimit['_northEast']['lat']);
	var maxlon = parseInt(drawLimit['_northEast']['lng']);

	voronoi(filteredPoints).forEach(function(d) { d.point.cell = d; });

	var svg = d3.select(map.getPanes().overlayPane).append("svg")
		.attr('id', 'overlay')
		.attr("class", "leaflet-zoom-hide")
		.style("width", map.getSize().x + 'px')
		.style("height", map.getSize().y + 'px')
		.style("margin-left", topLeft.x + "px")
		.style("margin-top", topLeft.y + "px");

	var g = svg.append("g")
		.attr("transform", "translate(" + (-topLeft.x) + "," + (-topLeft.y) + ")");

	var svgPoints = g.attr("class", "points")
		.selectAll("g")
		.data(filteredPoints)
		.enter().append("g")
		.filter(function(d) { if(d["id"] != "EMPTYID") { return true; } else {return false; } })
		.attr("class", "point");

	var buildPathFromPoint = function(point) {
		return "M" + point.cell.join("L") + "Z";
	}

	dragBehaviour = d3.behavior.drag()

	svgPoints.append("path")
		//.attr("class", "point-cell")
		.style("fill", function(d, i) {	return scales.get(curtype)(d["MEDIAN"]); })
		.style("fill-opacity", 0.6) 
		.attr("d", buildPathFromPoint)
		.call(dragBehaviour)
		.on('click', selectPoint)
		.classed("selected", function(d) { return lastSelectedPoint == d} );

	svgPoints.append("circle")
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		.style('fill', function(d) { return '#666666'} )// + d.color } )
		.attr("r", 2);
} // end draw

function voronoiMap(updatebottom) {
	if (debug) { console.log('voronoiMap'); }
	loadcsv(updatebottom);
} // end voronoi

