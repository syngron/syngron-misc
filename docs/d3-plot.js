
var yminprcp = 0;
var ymaxprcp = 100;
var ymin = -10;
var ymax = 40;

var parseDate = d3.time.format("%Y%m%d").parse;
var formatTime = d3.time.format("%e %B");
//var formatDate = d3.time.format('%a %b %d %Y');
var formatDate = d3.time.format('%b %d');
var formatDateMonth = d3.time.format('%b');
var bisectDate = d3.bisector(function(d) { return d.date; }).left;

var hhh;
var margin, margin2, width, height, height2;
var svg;

function updateWindow() {
    var x = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
    var y = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;

	hhh = y;
	margin = {top: y/2+10, right: 10, bottom: 100, left: 40};
    margin2 = {top: y-80, right: 10, bottom: 40, left: 40};
    width = x - margin.left - margin.right - 15;
    height =  y - margin.top - margin.bottom;
    height2 = y - margin2.top - margin2.bottom;

	if (typeof svg == 'undefined') {
		svg = d3.select("body").append("svg")
    	.attr("width", width + margin.left + margin.right)
    	.attr("height", height + margin.top + margin.bottom);
	}

    svg.attr("width", width + margin.left + margin.right);
    svg.attr("height", height + margin.top + margin.bottom);
	drawSVG();
}
window.onresize = updateWindow;

updateWindow();

function clearSVG() {
	svg.selectAll("*").remove();
}

function drawSVG() {

	svg.selectAll("*").remove();

	unit = "°C";
	ylabel = "Temperature (°C)";
	if (curtype == "PRCP") {
		//ylabel = "log Precipitation (mm)";
		ylabel = "Precipitation (mm)";
		unit = "mm";
	} else if (curtype == "WDSP") {
		ylabel = "Average wind (kph)";
		unit = "kph";
	} else if (curtype == "MXSPD") {
		ylabel = "Maximum wind (kph)";
		unit = "kph";
	} else if (curtype == "SUN") {
		ylabel = "Sunshine (daily hours)";
		unit = "h";
	} else if (curtype == "SUN-MONTHLY") {
		//ylabel = "Sunshine (monthly hours)";
		ylabel = "Sunshine (daily hours)";
		unit = "h";
	}

	svg.append("defs").append("clipPath")
	    .attr("id", "clip")
	    .append("rect")
	    .attr("width", width)
	    .attr("height", height);

	d3.csv(csv1, type, function(error1, data1) {
	//if (error1 != null) { alert(1); return; }
	d3.csv(csv2, type, function(error2, data2) {
	//if (error2 != null) { alert(2); return; }

	var x = d3.time.scale().range([0, width]),
	    x2 = d3.time.scale().range([0, width]),
	    y = d3.scale.linear().range([height, 0]),
	    y2 = d3.scale.linear().range([height2, 0]);
	//if (curtype == "PRCP") {
	//    y = d3.scale.log().range([height, 0]),
	//    y2 = d3.scale.log().range([height2, 0]);
	//}
	
	var xAxis = d3.svg.axis().scale(x).orient("bottom"),
	    xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
	    yAxis = d3.svg.axis().scale(y).orient("left").ticks(0, ".1s");

	function make_y_axis() {        
		//if (curtype != "PRCP") {
	    //	return d3.svg.axis()
	    //	    .scale(y)
	    //	    .orient("left")
	    //	    .ticks(10)
		//} else {
	    	return d3.svg.axis()
	    	    .scale(y)
	    	    .orient("left")
	    	    .ticks(0, ".1s")
		//}
	}

	//var yearstart = 2005;
	//var yearend = 2014;

	x.domain(d3.extent(data1.map(function(d) { return d.date; })));

	var maxFromName = "MAX";
	if (curtype == "PRCP") { // || curtype == "WDSP") {
		maxFromName = "MEDIAN";
	}
	var max1 = d3.max(data1.map(function(d) { return isNaN(d[curtype+maxFromName])?0:d[curtype+maxFromName]; }));
	var max2 = d3.max(data2.map(function(d) { return isNaN(d[curtype+maxFromName])?0:d[curtype+maxFromName]; }));
	if (curtype == "PRCP") { // || curtype == "WDSP") {
		var max1tmp = d3.quantile(data1.map(function(d) { return isNaN(d[curtype+maxFromName])?0:d[curtype+maxFromName]; }), 0.75);
		var max2tmp = d3.quantile(data2.map(function(d) { return isNaN(d[curtype+maxFromName])?0:d[curtype+maxFromName]; }), 0.75);
		if (max1tmp > max1) {
			max1 = max1tmp;
		}
		if (max2tmp > max2) {
			max2 = max2tmp;
		}
	}

	var min1 = 0; //1;
	var min2 = 0; //1;
	if (curtype != "PRCP") { // && curtype != "WDSP") {
		//max1 += 5;
		//max2 += 5;
		min1 = d3.min(data1.map(function(d) { return isNaN(d[curtype+"MIN"])?0:d[curtype+"MIN"]; }));// + 5;
		min2 = d3.min(data2.map(function(d) { return isNaN(d[curtype+"MIN"])?0:d[curtype+"MIN"]; }));// + 5;
		if(min1>0 && min2>0) {
			min1 = 0;
		}
	}
	
	//console.log(min1,max1,min2,max2);
	
	var allmin = min1<min2?Math.round(min1):Math.round(min2);
	var allmax = max1>max2?Math.round(max1):Math.round(max2);

	allmin = Math.floor(allmin / 10) * 10;
	allmax = Math.ceil(allmax / 10) * 10;

	y.domain([allmin, allmax]);

	//if (curtype == "PRCP") {
	//	yAxis.tickValues(d3.range(0.1, allmax, 5));
	//} else 
	//if (curtype == "SUN-MONTHLY") {
	//	yAxis.tickValues(d3.range(allmin, allmax, 50));
	//} else {
		yAxis.tickValues(d3.range(allmin, allmax, 5));
	//}


	//if (curtype == "PRCP") {
	//	y.domain([yminprcp, ymaxprcp]);
	//} else {
	//	y.domain([ymin, ymax]);
	//}
	
	x2.domain(x.domain());
	y2.domain(y.domain());

	var focus = svg.append("g")
    	.attr("class", "focus")
    	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

	var context = svg.append("g")
    	.attr("class", "context")
    	.attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

	var brush = d3.svg.brush()
	    .x(x2)
	    .on("brush", 
			function brushed() {
			  x.domain(brush.empty() ? x2.domain() : brush.extent());
			  focus.select(".area").attr("d", area1);
			  focus.select(".line").attr("d", line1);
			  focus.select(".area12").attr("d", area12);
			  focus.select(".line12").attr("d", line12);
			  focus.select(".x.axis").call(xAxis);
			}
				);

	var line1 = d3.svg.line()
	    .interpolate("basis")
	    .x(function(d) { return x(d.date); })
	    .y(function(d) { return y(d[curtype+"MEDIAN"]); })
		.defined(function(d) { return !isNaN(d[curtype+"MEDIAN"]); });
		
	var line12 = d3.svg.line()
	    .interpolate("basis")
	    .x(function(d) { return x(d.date); })
	    .y(function(d) { return y(d[curtype+"MEDIAN"]); })
		.defined(function(d) { return !isNaN(d[curtype+"MEDIAN"]); });
		
	var line2 = d3.svg.line()
	    .interpolate("basis")
	    .x(function(d) { return x2(d.date); })
	    .y(function(d) { return y2(d[curtype+"MEDIAN"]); })
		.defined(function(d) { return !isNaN(d[curtype+"MEDIAN"]); });
		
	var area1 = d3.svg.area()
	    .interpolate("basis")
	    .x(function(d) { return x(d.date); })
	    .y0(function(d) { return y(d[curtype+"MIN"]); })
	    .y1(function(d) { return y(d[curtype+"MAX"]); })
		.defined(function(d) { return !isNaN(d[curtype+"MIN"]) && !isNaN(d[curtype+"MAX"]); });
	
	var area12 = d3.svg.area()
	    .interpolate("basis")
	    .x(function(d) { return x(d.date); })
	    .y0(function(d) { return y(d[curtype+"MIN"]); })
	    .y1(function(d) { return y(d[curtype+"MAX"]); })
		.defined(function(d) { return !isNaN(d[curtype+"MIN"]) && !isNaN(d[curtype+"MAX"]); });
	
	var area2 = d3.svg.area()
	    .interpolate("basis")
	    .x(function(d) { return x2(d.date); })
	    .y0(function(d) { return y2(d[curtype+"MIN"]); })
	    .y1(function(d) { return y2(d[curtype+"MAX"]); })
		.defined(function(d) { return !isNaN(d[curtype+"MIN"]) && !isNaN(d[curtype+"MAX"]); });

    focus.append("g")         
        .attr("class", "grid")
        .call(make_y_axis()
            .tickSize(-width, 0, 0)
            .tickFormat("")
        );
	
	focus.append("path")
	    .datum(data1)
	    .attr("class", "area")
	    .attr("d", area1);
	focus.append("path")
	    .datum(data2)
	    .attr("class", "area12")
	    .attr("d", area12);
	focus.append("path")
	    .datum(data1)
	    .attr("class", "line")
	    .attr("d", line1)
	    //.on("mouseover", function(d) {      
	    //      div.transition()        
	    //          .duration(200)      
	    //          .style("opacity", .9);      
	    //      div .html(d.date + "<br/>"  + d[curtype+"MEDIAN"])  
	    //          .style("left", (d3.event.pageX) + "px")     
	    //          .style("top", (d3.event.pageY - 28) + "px");    
	    //      })                  
	    //.on("mouseout", function(d) {       
	    //      div.transition()        
	    //          .duration(500)      
	    //          .style("opacity", 0);   
	    //  });
	focus.append("path")
	    .datum(data2)
	    .attr("class", "line12")
		//.style("stroke-dasharray", ("3, 3"))
	    .attr("d", line12)
	    //.on("mouseover", function(d) {      
	    //      div.transition()        
	    //          .duration(200)      
	    //          .style("opacity", .9);      
	    //      div .html(d.date + "<br/>"  + d[curtype+"MEDIAN"])  
	    //          .style("left", (d3.event.pageX) + "px")     
	    //          .style("top", (d3.event.pageY - 28) + "px");    
	    //      })                  
	    //.on("mouseout", function(d) {       
	    //      div.transition()        
	    //          .duration(500)      
	    //          .style("opacity", 0);   
	    //  });

	context.append("path")
	    .datum(data1)
	    .attr("class", "area")
		.attr("data-legend",function(d) { return d.date})
	    .attr("d", area2);
	context.append("path")
	    .datum(data2)
	    .attr("class", "area12")
		.attr("data-legend",function(d) { return d.date})
	    .attr("d", area2);
	context.append("path")
	    .datum(data1)
	    .attr("class", "line")
		.attr("data-legend",function(d) { return d.date})
	    .attr("d", line2);
	context.append("path")
	    .datum(data2)
	    .attr("class", "line")
		.attr("data-legend",function(d) { return d.date})
	    .attr("d", line2);
	
	focus.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis);
	
	focus.append("g")
	    .attr("class", "y axis")
	    .call(yAxis)
	      .append("text")
	        .attr("transform", "rotate(-90)")
	        .attr("y", 6)
	        .attr("dy", ".71em")
	        .style("text-anchor", "end")
	        //.style("fill", "#ffffff")
	        //.style("stroke", "#000000")
	        .text(ylabel);
	
	context.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height2 + ")")
	    .call(xAxis2);
	
	context.append("g")
	    .attr("class", "x brush")
	    .call(brush)
	  .selectAll("rect")
	    .attr("y", -6)
	    .attr("height", height2 + 7);


	var legendRectSize = 18;
	var legendSpacing = 4;

    var legend = svg.selectAll('.legend-d3')                     
      .data([firstchoicename, secondchoicename])
      .enter()                                                
      .append('g')                                            
      .attr('class', 'legend')                                
      .attr('transform', function(d, i) {                     
        var height = legendRectSize + legendSpacing;          
        var horz = 80;
        var vert = i * height  + hhh/2 + 10;
        return 'translate(' + horz + ',' + vert + ')';        
      });                                                     

    legend.append('rect')                                     
      .attr('width', legendRectSize)                          
      .attr('height', legendRectSize)
      .style('fill', function(d) { if(d == firstchoicename){ return "#1f77b4"; } else if(d == secondchoicename){ return "#aec7e8"; }});
      //.style('fill', function(d) { if(d == firstchoicename){ return "#32a251"; } else if(d == secondchoicename){ return "#acd98d"; }});
	  //.style('stroke', color);
      
    legend.append('text')                                     
      .attr('x', legendRectSize + legendSpacing)              
      .attr('y', legendRectSize - legendSpacing)              
      .style('fill', function(d) { if(d == firstchoicename){ return "#000000"; } else if(d == secondchoicename){ return "#ff0000"; }})
      .text(function(d) { return d; });           
	

	// title
	svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", hhh/2 + 16)// (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .text(curtype);

	//var focus2 = svg.append("g")
    //  .attr("class", "focus2")
    //  .style("display", "none");

	//focus2.append("circle")
    //  .attr("r", 4.5);

  	//focus2.append("text")
    //  .attr("x", 9)
    //  .attr("dy", ".35em");

	//svg.append("rect")
    //  .attr("class", "overlay")
    //  .attr("width", width)
    //  .attr("height", height)
    //  .on("mouseover", function() { focus2.style("display", null); })
    //  .on("mouseout", function() { focus2.style("display", "none"); })
    //  .on("mousemove", mousemove);

  	//function mousemove() {
  	//  var x0 = x.invert(d3.mouse(this)[0]),
  	//      i = bisectDate(data1, x0, 1),
  	//      d0 = data1[i - 1],
  	//      d1 = data1[i],
  	//      d = x0 - d0.date > d1.date - x0 ? d1 : d0;
  	//  focus2.attr("transform", "translate(" + x(d.date) + "," + y(d[curtype+"MEDIAN"]) + ")");
  	//  focus2.select("text").text(d[curtype+"MEDIAN"]);
  	//}
	


		//focus.selectAll("dot")
        //        .data(data1)
        //    .enter().append("circle")
        //        .attr("class", "dot")
        //        .attr("r", 1)
        //        .attr("cx", function (d) { return x(d.date); })
        //        .attr("cy", function (d) { return y(d[curtype+"MEDIAN"]); })
        //            .on("mouseover", function(d) {
        //                div.transition()
        //                    .duration(50)
        //                    .style("opacity", .9);
        //                div.html(formatTime(d.date) + "<br/>" + (d[curtype+"MEDIAN"]).toFixed(1) + unit)
        //                    .style("left", (d3.event.pageX) + "px")
        //                    .style("top", (d3.event.pageY - 28) + "px");

        //        }).on("mouseout", function(d) {
        //            div.transition()
        //                .duration(200)
        //                .style("opacity", 0);
        //        });
        //        /*
        //focus.on('mouseover', function(){
        //    brush_elm = focus.select("circle").node();
        //    console.log(brush_elm);
        //    console.log(this);
        //    new_click_event = new Event('mouseover');
        //    new_click_event.pageX = d3.event.pageX;
        //    new_click_event.clientX = d3.event.clientX;
        //    new_click_event.pageY = d3.event.pageY;
        //    new_click_event.clientY = d3.event.clientY;
        //    brush_elm.dispatchEvent(new_click_event);
        //});*/

 		var hoverLineGroup = focus.append("g") //svg.append("g")
    	    .attr("class", "hover-line");

		var hoverLine = hoverLineGroup
    	    .append("line")
    	        .attr("x1", 10).attr("x2", 10) 
    	        .attr("y1", 0).attr("y2", height + 10);

    	var hoverDate = hoverLineGroup.append('text')
    	    .attr("class", "hover-text")
    	    .attr('y', height - (height-10));

    	// Hide hover line by default.
    	hoverLine.style("opacity", 1e-6);


        // Add mouseover events for hover line.
        d3.select("body").on("mouseover", function() {
            }).on("mousemove", function() {
                    //console.log('mousemove', d3.mouse(this));
                    var mouse_x = d3.mouse(this)[0] - margin.left;
                    var mouse_y = d3.mouse(this)[1];
                    var graph_y = y.invert(mouse_y);
                    var graph_x = x.invert(mouse_x);

  					var i = bisectDate(data1, graph_x, 1);
  					var i2 = bisectDate(data2, graph_x, 1);

					if(typeof firstchoicename != 'undefined' && typeof secondchoicename != 'undefined' && i >= 0 && i < data1.length && i2 >= 0 && i2 < data2.length) {
  						    var d0 = data1[i - 1],
  						    d1 = data1[i],
  						    d = graph_x - d0.date > d1.date - graph_x ? d1 : d0,
  						    d02 = data2[i2 - 1],
  						    d12 = data2[i2],
  						    d2 = graph_x - d02.date > d12.date - graph_x ? d12 : d02;

                    	//console.log(graph_x);
						if (typeof d[curtype+"MEDIAN"] != 'undefined' && typeof d2[curtype+"MEDIAN"] != 'undefined') {
							date1 = formatDate(graph_x);
							if (curtype == "SUN-MONTHLY") {
								date1 = formatDateMonth(graph_x);
							}
							var value1 = d[curtype+"MEDIAN"].toFixed(1);
							var value2 = d2[curtype+"MEDIAN"].toFixed(1);
							//if (curtype == "PRCP") {
							//	value1 = (value1 - 1).toFixed(1);
							//	value2 = (value2 - 1).toFixed(1);
							//}
		                    hoverDate.text(date1 + " " + firstchoicename.substring(0,3) + " " + value1 + unit + ", " + secondchoicename.substring(0,3) + " " + value2 + unit);
						}
                    	hoverDate.attr('x', mouse_x);
						if (curtype == "PRCP") { // || curtype == "WDSP") {
                    		hoverDate.attr('y', 10);
						} else {
                    		hoverDate.attr('y', height - 10);
						}
                    	//console.log(x.invert(mouse_x));
                    	hoverLine.attr("x1", mouse_x).attr("x2", mouse_x)
                    	hoverLine.style("opacity", 1);
					} else {
                    	hoverLine.style("opacity", 1e-6);
					}
                }).on("mouseout", function() {
                    //hoverLine.style("opacity", 1e-6);
                });
	
	});
	});

}

function type(d, i) {
	//filtervals = d3.values(d).filter(function(dd) { return !isNaN(dd) }).map(parseFloat);
	filtervals = [];
	for(year=startyear; year<=endyear; year++) {
		if (!isNaN(d[year])) {
			filtervals.push(parseFloat(d[year]));
		}
	}
	//if (curtype != "PRCP") {
		d[curtype+"MEDIAN"] = d3.median(filtervals);
		d[curtype+"MIN"] = d3.min(filtervals);
		d[curtype+"MAX"] = d3.max(filtervals);
	if (curtype == "SUN-MONTHLY") {
		// TODO actual days of month
		d[curtype+"MEDIAN"] /= 30
		d[curtype+"MIN"] /= 30;
		d[curtype+"MAX"] /= 30;
	}
	//} else { 
	//	// PRCP in logarithmic scale because of large rainfall peaks
	//	d[curtype+"MEDIAN"] = d3.median(filtervals)+1;
	//	d[curtype+"MIN"] = d3.min(filtervals)+1;
	//	d[curtype+"MAX"] = d3.max(filtervals)+1;
	//}
	//console.log(filtervals + " " + d[curtype+"MEDIAN"] + " " + d[curtype+"MIN"] + " " + d[curtype+"MAX"]);
	var date = new Date(2015, 0);
	d.date = new Date(date.setDate(i+1));
	return d;
}


