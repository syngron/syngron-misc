
mapLink = '<a href="http://openstreetmap.org", target="_blank">OpenStreetMap</a>';
dataLink = '<a href="http://www.ncdc.noaa.gov/oa/climate/ghcn-daily/", target="_blank">NOAA GHCN</a>';
dataLink2 = '<a href="http://www.dwd.de/DE/leistungen/cdcftp/cdcftp.html", target="_blank">Deutscher Wetterdienst</a>';

L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; ' + mapLink + ' Contributors, data from ' + dataLink + ' and ' + dataLink2,
    maxZoom: 12,
    minZoom: 1,
}).addTo(map);

var mapLayer = {
	onAdd: function(map) {
		if (debug) { console.log("onadd"); }
		map.on('viewreset moveend', drawWithLoading);
		//drawWithLoading();
	}
};
map.addLayer(mapLayer);

var wday = parseInt(document.getElementById("day").value);
var wmonth = parseInt(document.getElementById("month").selectedIndex);
function increase() {
	var mydate = new Date(2015, wmonth, wday); // initialize a date in `year-01-01`
	mydate.setDate(mydate.getDate() + 1);
	document.getElementById("month").selectedIndex = mydate.getMonth();
	document.getElementById("day").value = mydate.getDate();
	update();
}
function decrease() {
	var mydate = new Date(2015, wmonth, wday); // initialize a date in `year-01-01`
	mydate.setDate(mydate.getDate() - 1);
	document.getElementById("month").selectedIndex = mydate.getMonth();
	document.getElementById("day").value = mydate.getDate();
	update();
}
function checkchange() {
	daysplitdir = daysplitdir_orig;
	//if (document.getElementById("sevenday").checked) {
	//	daysplitdir += daysplitdir_sevenday;
	//}
	if (document.getElementById("nonan").checked) {
		daysplitdir += daysplitdir_nonan;
	}
	daysplitdir += "/";
	update();
}
function update() {
	if (debug) { console.log("update"); }
	wday = parseInt(document.getElementById("day").value);
	wmonth = parseInt(document.getElementById("month").selectedIndex);
	var yearchanged = false;
	if (startyear != parseInt(document.getElementById("startyear").value) || endyear != parseInt(document.getElementById("endyear").value)) {
		yearchanged = true;
	}
	startyear = parseInt(document.getElementById("startyear").value);
	endyear = parseInt(document.getElementById("endyear").value);
	if (startyear > endyear) {
		startyear = endyear;
		document.getElementById("startyear").value = startyear;
	}
	var daystr = ""+wday;
	if (wday < 10) {
		daystr = "0"+wday;
	}
	var monthstr = ""+(wmonth+1);
	if (wmonth+1 < 10) {
		monthstr = "0"+(wmonth+1);
	}
	wfilename = monthstr+""+daystr+".csv";
	// plot bottom view if year changed
	voronoiMap(yearchanged);
}

document.getElementById("increase").onclick = increase;
document.getElementById("decrease").onclick = decrease;
//document.getElementById("sevenday").onclick = checkchange;
document.getElementById("nonan").onclick = checkchange;
document.getElementById("month").onchange = update;
document.getElementById("day").onchange = update;
document.getElementById("startyear").onchange = update;
document.getElementById("endyear").onchange = update;
		
voronoiMap(true);


