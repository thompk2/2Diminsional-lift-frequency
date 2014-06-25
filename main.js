//****************************
//       Lift globals
//****************************

// Set the dimensions of the canvas / graph
var	liftMargin = {top: 30, right: 00, bottom: 30, left: 50},	                        // sets the width of the margins around the actual graph area
	liftWidth = 600 - liftMargin.left - liftMargin.right,		                		// sets the width of the graph area
	liftHeight = 270 - liftMargin.top - liftMargin.bottom;		                		// sets the height of the graph area

// Set the ranges
var	liftX = d3.scale.linear().range([0, liftWidth]);			                		// scales the range of values on the x axis to fit between 0 and 'width'
var	liftY = d3.scale.linear().range([liftHeight, 0]);			                    	// scales the range of values on the y axis to fit between 'height' and 0

// Define the axes
var	liftXAxis = d3.svg.axis().scale(liftX)						                    	// defines the x axis function and applies the scale for the x dimension
	.orient("bottom").ticks(5);								                            // tells what side the ticks are on and how many to put on the axis

var	liftYAxis = d3.svg.axis().scale(liftY)							                    // defines the y axis function and applies the scale for the y dimension
	.orient("left").ticks(5);								                            // tells what side the ticks are on and how many to put on the axis

// Define the line
var	liftValueline = d3.svg.line()								                        // set 'valueline' to be a line
	.interpolate("basis")								                            	// XXX Jake: change the interpolation for the line	
	.x(function(d) { return liftX(d.Range); })				                        	// set the x coordinates for valueline to be the d.date values
	.y(function(d) { return liftY(d.Lift); });					                        // set the y coordinates for valueline to be the d.close values

// Adds the svg canvas
var	liftSvg = d3.select(".lift-container")						                         // Explicitly state where the svg element will go (lift-container div)
	.append("svg")											                             // Append 'svg' to the html 'body' of the web page
		.attr("width", liftWidth + liftMargin.left + liftMargin.right)	                 // Set the 'width' of the svg element
		.attr("height", liftHeight + liftMargin.top + liftMargin.bottom)                 // Set the 'height' of the svg element
	.append("g")											                             // Append 'g' to the html 'body' of the web page
		.attr("transform", "translate(" + liftMargin.left + "," + liftMargin.top + ")"); // in a place that is the actual area for the graph
	
var continuousAttributeData = {};
var discreteAttributeData = {};
var continuousAttributeNullData = {};
var discreteAttributeNullData = {};

function graphLift(toGraph, nullData) {
    var absoluteMax = [];
    absoluteMax.push(d3.max(toGraph, function(d) {return d.Lift;}));
    absoluteMax.push(d3.max(nullData, function(d) {return d.Lift;}));

	// Scale the range of the data
	liftX.domain([d3.min(toGraph, function(d) { return d.Range; }), d3.max(toGraph, function(d) { return d.Range; })]);		// set the x domain so be as wide as the range of dates we have.
	liftY.domain([0.0, d3.max(absoluteMax)]);	// set the y domain to go from 0 to the maximum value of d.close

    var lineToGraph = [liftValueline(toGraph)];
    
	// Add the valueline path.
	var line = liftSvg.selectAll(".line")
				  .data(lineToGraph);
	line.exit().transition().remove();
	line.enter().append("path")
				.attr("class", "line")
	line.transition().attr("d", lineToGraph);	

	// Remove the old axes
	liftSvg.selectAll(".axis").remove();
	liftSvg.selectAll("text").remove();
	
	// Add the X Axis
	liftSvg.append("g")											// append the x axis to the 'g' (grouping) element
		.attr("class", "x axis")							// apply the 'axis' CSS styles to this path
		.attr("transform", "translate(0," + liftHeight + ")")	// move the drawing point to 0,height
		.call(liftXAxis);										// call the xAxis function to draw the axis

	// Add the Y Axis
	liftSvg.append("g")											// append the y axis to the 'g' (grouping) element
		.attr("class", "y axis")							// apply the 'axis' CSS styles to this path
		.call(liftYAxis);										// call the yAxis function to draw the axis

	liftSvg.append("text")
		.attr("x", (liftWidth/2))
		.attr("y", 0 - (liftMargin.top)/2)
		.attr("text-anchor", "middle")
		.style("font-size", "16px")
		.style("text-decoration", "bold")
		.text("Lift")
};

//****************************
//    Frequency globals
//****************************
		
// Set the dimensions of the canvas / graph
var	freqMargin = {top: 30, right: 20, bottom: 30, left: 50},	// sets the width of the margins around the actual graph area
	freqWidth = 600 - freqMargin.left - freqMargin.right,				// sets the width of the graph area
	freqHeight = 200 - freqMargin.top - freqMargin.bottom;				// sets the height of the graph area

// Set the ranges
var	freqX = d3.scale.linear().range([0, freqWidth]);				// scales the range of values on the x axis to fit between 0 and 'width'
var	freqY = d3.scale.linear().range([freqHeight, 0]);				// scales the range of values on the y axis to fit between 'height' and 0

// Define the axes
var	freqXAxis = d3.svg.axis().scale(freqX)							// defines the x axis function and applies the scale for the x dimension
	.orient("bottom").ticks(5);								// tells what side the ticks are on and how many to put on the axis

var	freqYAxis = d3.svg.axis().scale(freqY)							// defines the y axis function and applies the scale for the y dimension
	.orient("left").ticks(5);								// tells what side the ticks are on and how many to put on the axis

// Define the line
var	freqValueline = d3.svg.line()								// set 'valueline' to be a line
	.interpolate("basis")									// XXX Jake: change the interpolation for the line	
	.x(function(d) { return freqX(d.Range); })					// set the x coordinates for valueline to be the d.date values
	.y(function(d) { return freqY(d.Frequency); });					// set the y coordinates for valueline to be the d.close values

// Adds the svg canvas
var	freqSvg = d3.select(".frequency-container")									// Explicitly state where the svg element will go on the web page (the 'body')
	.append("svg")											// Append 'svg' to the html 'body' of the web page
		.attr("width", freqWidth + freqMargin.left + freqMargin.right)	// Set the 'width' of the svg element
		.attr("height", freqHeight + freqMargin.top + freqMargin.bottom)// Set the 'height' of the svg element
	.append("g")											// Append 'g' to the html 'body' of the web page
		.attr("transform", "translate(" + freqMargin.left + "," + freqMargin.top + ")"); // in a place that is the actual area for the graph		

function graphFreq(toGraph, nullData) {
    var absoluteMax = [];
    absoluteMax.push(d3.max(toGraph, function(d) {return d.Frequency;}));
    absoluteMax.push(d3.max(nullData, function(d) {return d.Frequency;}));

	// Scale the range of the data
	freqX.domain([d3.min(toGraph, function(d) { return d.Range; }), d3.max(toGraph, function(d) { return d.Range; })]);		// set the x domain so be as wide as the range of dates we have.
	freqY.domain([0.0, d3.max(absoluteMax)]);	// set the y domain to go from 0 to the maximum value of all the data

    var lineToGraph = [freqValueline(toGraph)]
    
	// Add the valueline path.
	var line = freqSvg.selectAll(".line")
				      .data(lineToGraph);
	line.exit().remove();
	line.enter().append("path")
				.attr("class", "line")
	line.transition().attr("d", lineToGraph);	

	// Remove the old axes
	freqSvg.selectAll(".axis").remove();
	freqSvg.selectAll("text").remove();
	
	// Add the X Axis
	freqSvg.append("g")											// append the x axis to the 'g' (grouping) element
		.attr("class", "x axis")							    // apply the 'axis' CSS styles to this path
		.attr("transform", "translate(0," + freqHeight + ")")	// move the drawing point to 0,height
		.call(freqXAxis);										// call the xAxis function to draw the axis

	// Add the Y Axis
	freqSvg.append("g")											// append the y axis to the 'g' (grouping) element
		.attr("class", "y axis")							    // apply the 'axis' CSS styles to this path
		.call(freqYAxis);										// call the yAxis function to draw the axis

	freqSvg.append("text")
		.attr("x", (freqWidth/2))
		.attr("y", 0 - (freqMargin.top)/2)
		.attr("text-anchor", "middle")
		.style("font-size", "16px")
		.style("text-decoration", "bold")
		.text("Frequency")
};


		
var nullLiftMargin = {top: 30, right: 00, bottom: 0, left: 00},
	nullLiftWidth = 60 - nullLiftMargin.left - nullLiftMargin.right,
	nullLiftHeight = 270 - nullLiftMargin.top - nullLiftMargin.bottom;
	
var nullLiftX = d3.scale.linear().range([0, nullLiftWidth]);
var	nullLiftY = d3.scale.linear().range([nullLiftHeight, 0]);				// scales the range of values on the y axis to fit between 'height' and 0

// Adds the svg canvas
var	nullLiftSvg = d3.select(".null-lift-container")						// Explicitly state where the svg element will go (lift-container div)
	.append("svg")											// Append 'svg' to the html 'body' of the web page
		.attr("width", nullLiftWidth + nullLiftMargin.left + nullLiftMargin.right)	// Set the 'width' of the svg element
		.attr("height", nullLiftHeight + nullLiftMargin.top + nullLiftMargin.bottom)// Set the 'height' of the svg element

function graphNulls(toGraph, nonNullData) {
	var circleRadius = 5;
	
	var dot = liftSvg.selectAll("circle")
				     .data(toGraph);
						 
	dot.enter().append("circle")
               .attr("class", "null-lift")
			   .attr("r", circleRadius)
               .attr("cx", 0);
			   
			 
	dot.exit().remove();
	dot.transition().attr("cy", function(d) { return liftY(d.Lift); });
    
    var freqDot = freqSvg.selectAll("circle")
				     .data(toGraph);
						 
	freqDot.enter().append("circle")
               .attr("class", "null-freq")
			   .attr("r", circleRadius)
               .attr("cx", 0);
			   
			 
	freqDot.exit().remove();
	freqDot.transition().attr("cy", function(d) { return freqY(d.Frequency); });
};

// Lousy way to get a single number from the upper and lower bound ranges
function parseRange(lower, upper) {
	if(lower === "NULL" && upper === "NULL") {
		return null;
	}
	if(isNaN(+lower) && isNaN(+upper)) {
		return 0;
	}
	if(isNaN(+lower)) {
		return +upper;
	}
	if(isNaN(+upper)) {
		return +lower;
	}
	return ( +lower + +upper ) / 2;
}

function getData() {
	continuousAttributeData = {};
	continuousAttributeNullData = {};

	// Get the data
	var csvSelection = document.getElementsByClassName("csv-selection")[0]
	var attributeSelection = document.getElementsByClassName("attribute-selection")[0];
	attributeSelection.options.length = 0;
	
	var csvData = csvSelection.options[csvSelection.selectedIndex].value;
	d3.csv(csvData, function(d) { // Go to the data folder (in the current directory) and read in the MainStreetHubAttributes.csv file
		d.Range = parseRange(d.LowerInclusive, d.UpperExclusive); 
		d.Lift = +d.Lift;
		d.MutualInformation = +d.MutualInformation;
		d.BinSize = +d.BinSize;
		d.EventCount = +d.EventCount;
		return d;
	},
	function(error, data) {
		data.forEach(function(d) {
			if(d.ColumnName in continuousAttributeData && d.Range !== null) {
				continuousAttributeData[d.ColumnName].push(d);
			}
			else if(d.Range !== null){
				continuousAttributeData[d.ColumnName] = [d];
				
				var option = document.createElement("option");
				option.textContent = d.ColumnName;
				option.value = d.ColumnName;
				attributeSelection.appendChild(option);
			}
			else {
				continuousAttributeNullData[d.ColumnName] = [d];
			}
		});
		
		for(var column in continuousAttributeData) {
			var frequencySum = 0;
			if(continuousAttributeData.hasOwnProperty(column)) {
				continuousAttributeData[column].forEach(function(d) {
					frequencySum+= d.BinSize;
				});
				if(continuousAttributeNullData[column] != null) {
					frequencySum += continuousAttributeNullData[column][0]["BinSize"];
                    continuousAttributeNullData[column][0]["Frequency"] = continuousAttributeNullData[column][0]["BinSize"] / frequencySum
				}
				continuousAttributeData[column].forEach(function(d) {
					d["Frequency"] = d.BinSize / frequencySum;
				});
                
			}
		}
		
		var selected = document.getElementsByClassName("attribute-selection")[0].value;
		var toGraph = continuousAttributeData[selected];
        if(continuousAttributeNullData[selected] != null) {
            graphLift(toGraph, continuousAttributeNullData[selected]);
            graphFreq(toGraph, continuousAttributeNullData[selected]);
			graphNulls(continuousAttributeNullData[selected], toGraph);
		} else {
            graphLift(toGraph, [{Frequency: 0}]);
            graphFreq(toGraph, [{Frequency: 0}]);
        }
	});
}

function init() {
	document.getElementsByClassName("attribute-selection")[0].onchange = function() {
		var toGraph = continuousAttributeData[event.target.value];
        if(continuousAttributeNullData[event.target.value] != null) {
            graphLift(toGraph, continuousAttributeNullData[event.target.value]);
            graphFreq(toGraph, continuousAttributeNullData[event.target.value]);
			graphNulls(continuousAttributeNullData[event.target.value], toGraph);
		} else {
            graphLift(toGraph, [{Frequency: 0}]);
            graphFreq(toGraph, [{Frequency: 0}]);
        }
	}
	document.getElementsByClassName("csv-selection")[0].onchange = function() {
		getData();
	}
	getData();
}

init();