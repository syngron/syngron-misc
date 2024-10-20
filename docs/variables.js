
var debug = false;

var initialGHCN1 = ["GME00115771", "STUTTGART-SCHNARRENBERG"];
var initialGHCN2 = ["IT000016239", "ROMA CIAMPINO"];
var initialISD1 = ["10738099999", "STUTTGART GM"];
var initialISD2 = ["16171099999", "FIRENZE IT"];
var initialWMO1 = ["WMO10738", "STUTTGART-ECHTERDINGEN"];
var initialWMO2 = ["WMO16224", "VIGNA DI VALLE"];
var initialDWD1 = ["DWD04931", "Stuttgart-Echterdingen"];
var initialDWD2 = ["DWD04704", "Sigmarszell-Zeisertsweiler"];

var textinitial = "Click on 2 dots or cells after each other to compare stations";	
var text2initial = ", now choose second station";

var daysplitdir_orig = "daysplit";
var daysplitdir_sevenday = "_7daymean";
var daysplitdir_nonan = "_nonan";
var daysplitdir = daysplitdir_orig + "/";
var stationsplitdir = "stationsplit/";
var wfilename = "0101.csv";
var curtype = "MAX";
var startyear = 2005;
var endyear = 2019;
var firstchoice = initialISD1[0];
var firstchoicename = initialISD1[1];
var firstval = "";
var secondchoice = initialISD2[0];
var secondchoicename = initialISD2[1];
var secondval = "";
var maxdistkm2 = 400*400;
var mindistpx2 = 30*30;
var points = [];
var lastSelectedPoint;
var csv1 = "";
var csv2 = "";

var map = L.map('map').setView([47, 9], 4);

var pointTypes = d3.map();
var scales = d3.map();

pointTypes.set("MAX", {type: "MAX", name: "Maximum temperature (°C)", color: "7f0000"});
pointTypes.set("MIN", {type: "MIN", name: "Minimum temperature (°C)", color: "ef3b2c"});
pointTypes.set("PRCP", {type: "PRCP", name: "Precipitation (mm)", color: "08306b"});
pointTypes.set("WDSP", {type: "WDSP", name: "Average wind (kph)", color: "add8e6"});
pointTypes.set("MXSPD", {type: "MXSPD", name: "Maximum wind (kph)", color: "add8e6"});
pointTypes.set("SUN", {type: "SUN", name: "Sunshine (h), only DE", color: "ffeda0"});
pointTypes.set("SUN-MONTHLY", {type: "SUN-MONTHLY", name: "Sunshine monthly (h)", color: "ffeda0"});

// Stuttgart has max ~90 mm/month
// monthly hours of sunshine max ~ 30*10
// daily hours of sunshine max ~ 10
// -10-40 degree Celcius
scales.set("SUN-MONTHLY", chroma.scale([
		'#ffffcc',
		'#ffeda0',
		'#fed976',
		'#feb24c',
		'#fd8d3c',
		'#fc4e2a',
		'#e31a1c',
		'#bd0026',
		'#800026'],
		[.1, .2, .3, .4, .5, .6, .7, .8, .9])
	.mode('rgb').domain([0, 300]));
scales.set("SUN", chroma.scale([
		'#ffffcc',
		'#ffeda0',
		'#fed976',
		'#feb24c',
		'#fd8d3c',
		'#fc4e2a',
		'#e31a1c',
		'#bd0026',
		'#800026'],
		[.1, .2, .3, .4, .5, .6, .7, .8, .9])
	.mode('rgb').domain([0, 15]));
scales.set("MIN", chroma.scale([
		'#ffffcc',
		'#ffeda0',
		'#fed976',
		'#feb24c',
		'#fd8d3c',
		'#fc4e2a',
		'#e31a1c',
		'#bd0026',
		'#800026'],
		[.1, .2, .3, .4, .5, .6, .7, .8, .9])
	.mode('rgb').domain([-10, 50]));
scales.set("MAX", chroma.scale([
		'#ffffcc',
		'#ffeda0',
		'#fed976',
		'#feb24c',
		'#fd8d3c',
		'#fc4e2a',
		'#e31a1c',
		'#bd0026',
		'#800026'],
		[.1, .2, .3, .4, .5, .6, .7, .8, .9])
	.mode('rgb').domain([-10, 50]));
scales.set("PRCP", chroma.scale([
		'#f7fbff',
		'#deebf7',
		'#c6dbef',
		'#9ecae1',
		'#6baed6',
		'#4292c6',
		'#2171b5',
		'#08519c',
		'#08306b'],
		[.1, .2, .3, .4, .5, .6, .7, .8, .9])
	.mode('rgb').domain([0, 5]));
scales.set("WDSP", chroma.scale([
		'#f7fbff',
		'#deebf7',
		'#c6dbef',
		'#9ecae1',
		'#6baed6',
		'#4292c6',
		'#2171b5',
		'#08519c',
		'#08306b'],
		[.1, .2, .3, .4, .5, .6, .7, .8, .9])
	.mode('rgb').domain([0, 15]));
scales.set("MXSPD", chroma.scale([
		'#f7fbff',
		'#deebf7',
		'#c6dbef',
		'#9ecae1',
		'#6baed6',
		'#4292c6',
		'#2171b5',
		'#08519c',
		'#08306b'],
		[.1, .2, .3, .4, .5, .6, .7, .8, .9])
	.mode('rgb').domain([0, 25]));

