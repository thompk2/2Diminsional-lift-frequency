//****************************
//       Lift globals
//****************************

// Set the dimensions of the canvas / graph
var	liftMargin = {top: 30, right: 00, bottom: 30, left: 50},	                        // sets the width of the margins around the actual graph area
	liftWidth = 545 - liftMargin.left - liftMargin.right,		                		// sets the width of the graph area
	liftHeight = 270 - liftMargin.top - liftMargin.bottom;		                		// sets the height of the graph area

// Set the ranges
var	liftY = d3.scale.linear().range([liftHeight, 0]);			                    	// scales the range of values on the y axis to fit between 'height' and 0

// Define the Y axes
var	liftYAxis = d3.svg.axis().scale(liftY)							                    // defines the y axis function and applies the scale for the y dimension
	.orient("left").ticks(5);								                            // tells what side the ticks are on and how many to put on the axis

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
	var liftXAxis;
	
	// Remove all the checkboxes from the dom
	var form = document.getElementsByClassName("select-container")[0];
	while (form.hasChildNodes()) {
		form.removeChild(form.firstChild);
	}
	
	if(toGraph[0].IsCategorical) {
		//add checkboxes for filtering the categorical chart
		for(var index =0; index<toGraph.length; index++) {
			var option = toGraph[index].LowerInclusive;
			var column = toGraph[index].ColumnName;
			var inputString = '<div class="checkbox"><label><input type="checkbox" class="discrete-option" checked value="'+option+'"></label>'+option+'</div>'
			form.insertAdjacentHTML('beforeend', inputString);
			form.lastChild.getElementsByTagName("input")[0]
						  .addEventListener ("change", function(event) {onChangeCheckbox(event, column)}, false);
		}
		
		liftSvg.selectAll(".line").remove();
		var	liftX = d3.scale.ordinal().rangeRoundBands([0, liftWidth]);
		graphDiscreteLift(toGraph, nullData, liftX);
		
		liftXAxis = d3.svg.axis().scale(liftX)
						  .orient("bottom").ticks(5);	
	} else {
		liftSvg.selectAll(".bar").remove();
		var	liftX = d3.scale.linear().range([0, liftWidth]);
		graphContinuousLift(toGraph, nullData, liftX);
		liftXAxis = d3.svg.axis().scale(liftX)
						  .orient("bottom").ticks(5);	
	}

	scaleLiftAxes(liftXAxis);
}

function graphDiscreteLift(toGraph, nullData, liftX) {
    var absoluteMax = [];
    absoluteMax.push(d3.max(toGraph, function(d) {return d.Lift;}));
    absoluteMax.push(d3.max(nullData, function(d) {return d.Lift;}));
	
	liftY.domain([0.0, d3.max(absoluteMax)]);
	liftX.domain(toGraph.map(function(d) { return d.LowerInclusive; }));
	
	var barWidth = liftWidth / toGraph.length;
	
	var bar = liftSvg.selectAll(".bar")
					 .data(toGraph);
	bar.enter().append("rect")
			   .attr("class", "bar");
	bar.transition().attr("y", function(d) {return liftY(d.Lift); })
					.attr("x", function(d) {return liftX(d.LowerInclusive); })
					.attr("height", function(d) {return liftHeight - liftY(d.Lift); })
					.attr("width", barWidth - 1);
    bar.exit().remove();
}

function updateDiscreteLift(values, column) {
	var attribute = discreteAttributeData[column];
	var nullData = discreteAttributeNullData[column];
	var filteredData = [];
	var	liftX = d3.scale.ordinal().rangeRoundBands([0, liftWidth]);
	var liftXAxis = d3.svg.axis().scale(liftX)
				      .orient("bottom").ticks(5);
	for(var i=0; i<attribute.length; i++){
		if( values.indexOf(attribute[i].LowerInclusive) > -1) {
			filteredData.push(attribute[i]);
		}
	}
	
	graphDiscreteLift(filteredData, nullData, liftX);
	scaleLiftAxes(liftXAxis);
}

function scaleLiftAxes(liftXAxis) {
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
}

function graphContinuousLift(toGraph, nullData, liftX) {
    var absoluteMax = [];
    absoluteMax.push(d3.max(toGraph, function(d) {return d.Lift;}));
    absoluteMax.push(d3.max(nullData, function(d) {return d.Lift;}));

	// Define the line
	var	liftValueline = d3.svg.line()								                        // set 'valueline' to be a line
		.interpolate("basis")								                            	// XXX Jake: change the interpolation for the line	
		.x(function(d) { return liftX(d.Range); })				                        	// set the x coordinates for valueline to be the d.date values
		.y(function(d) { return liftY(d.Lift); });					                        // set the y coordinates for valueline to be the d.close values

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
		
}

function onChangeCheckbox(event, column) {
	var checkBoxes = document.getElementsByClassName("discrete-option");
	var checkedValues = [];
	for(var i=0; i<checkBoxes.length; i++) {
		if(checkBoxes[i].checked) {
			checkedValues.push(checkBoxes[i].value);
		}
	}
	updateDiscreteLift(checkedValues, column);
    updateDiscreteFreq(checkedValues, column);
}

//****************************
//    Frequency globals
//****************************
		
// Set the dimensions of the canvas / graph
var	freqMargin = {top: 30, right: 20, bottom: 30, left: 50},	// sets the width of the margins around the actual graph area
	freqWidth = 545 - freqMargin.left - freqMargin.right,				// sets the width of the graph area
	freqHeight = 200 - freqMargin.top - freqMargin.bottom;				// sets the height of the graph area

// Set the ranges
var	freqY = d3.scale.linear().range([freqHeight, 0]);				// scales the range of values on the y axis to fit between 'height' and 0

var	freqYAxis = d3.svg.axis().scale(freqY)							// defines the y axis function and applies the scale for the y dimension
	.orient("left").ticks(5);								// tells what side the ticks are on and how many to put on the axis

// Adds the svg canvas
var	freqSvg = d3.select(".frequency-container")									// Explicitly state where the svg element will go on the web page (the 'body')
	.append("svg")											// Append 'svg' to the html 'body' of the web page
		.attr("width", freqWidth + freqMargin.left + freqMargin.right)	// Set the 'width' of the svg element
		.attr("height", freqHeight + freqMargin.top + freqMargin.bottom)// Set the 'height' of the svg element
	.append("g")											// Append 'g' to the html 'body' of the web page
		.attr("transform", "translate(" + freqMargin.left + "," + freqMargin.top + ")"); // in a place that is the actual area for the graph		

function graphFreq(toGraph, nullData) {
    var	freqXAxis;
    
    if(toGraph[0].IsCategorical) {
		freqSvg.selectAll(".line").remove();
		var	freqX = d3.scale.ordinal().rangeRoundBands([0, freqWidth]);
		graphDiscreteFreq(toGraph, nullData, freqX);
		freqXAxis = d3.svg.axis().scale(freqX)
						  .orient("bottom").ticks(5);	
	} else {
		freqSvg.selectAll(".bar").remove();
		var	freqX = d3.scale.linear().range([0, freqWidth]);
		graphContinuousFreq(toGraph, nullData, freqX);
		freqXAxis = d3.svg.axis().scale(freqX)
						  .orient("bottom").ticks(5);	
	}
    
    scaleFreqAxes(freqXAxis);
};

function graphDiscreteFreq(toGraph, nullData, freqX) {
    var absoluteMax = [];
    absoluteMax.push(d3.max(toGraph, function(d) {return d.Frequency;}));
    absoluteMax.push(d3.max(nullData, function(d) {return d.Frequency;}));
	
	freqY.domain([0.0, d3.max(absoluteMax)]);
	freqX.domain(toGraph.map(function(d) { return d.LowerInclusive; }));
	
	var barWidth = freqWidth / toGraph.length;
	
	var bar = freqSvg.selectAll(".bar")
					 .data(toGraph);
	bar.enter().append("rect")
			   .attr("class", "bar");
	bar.transition().attr("y", function(d) {return freqY(d.Frequency); })
					.attr("x", function(d) {return freqX(d.LowerInclusive); })
					.attr("height", function(d) {return freqHeight - freqY(d.Frequency); })
					.attr("width", barWidth - 1);
    bar.exit().remove();
};

function updateDiscreteFreq(values, column) {
	var attribute = discreteAttributeData[column];
	var nullData = discreteAttributeNullData[column];
	var filteredData = [];
	var	freqX = d3.scale.ordinal().rangeRoundBands([0, freqWidth]);
	var freqXAxis = d3.svg.axis().scale(freqX)
				      .orient("bottom").ticks(5);
	for(var i=0; i<attribute.length; i++){
		if( values.indexOf(attribute[i].LowerInclusive) > -1) {
			filteredData.push(attribute[i]);
		}
	}
	
	graphDiscreteFreq(filteredData, nullData, freqX);
	scaleFreqAxes(freqXAxis);
}

function graphContinuousFreq(toGraph, nullData, freqX) {
    var absoluteMax = [];
    absoluteMax.push(d3.max(toGraph, function(d) {return d.Frequency;}));
    absoluteMax.push(d3.max(nullData, function(d) {return d.Frequency;}));
    
    // Define the line
    var	freqValueline = d3.svg.line()
                          .interpolate("basis")
                          .x(function(d) { return freqX(d.Range); })
                          .y(function(d) { return freqY(d.Frequency); });
    
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
};

function scaleFreqAxes(freqXAxis) {
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
}
		
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

function graphNulls(nonNullData, toGraph) {
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

function organizeData(d, array, nullArray) {
	var attributeSelection = document.getElementsByClassName("attribute-selection")[0];
	if(d.ColumnName in array && d.Range !== null) {
		array[d.ColumnName].push(d);
	}
	else if(d.Range !== null){
		array[d.ColumnName] = [d];
		
		var option = document.createElement("option");
		option.textContent = d.ColumnName;
		option.value = d.ColumnName;
		attributeSelection.appendChild(option);
	}
	else {
		nullArray[d.ColumnName] = [d];
	}
}

function calculateFrequencySums(array, nullArray){
	for(var column in array) {
		var frequencySum = 0;
		if(array.hasOwnProperty(column)) {
			array[column].forEach(function(d) {
				frequencySum+= d.BinSize;
			});
			if(nullArray[column] != null) {
				frequencySum += nullArray[column][0]["BinSize"];
				nullArray[column][0]["Frequency"] = nullArray[column][0]["BinSize"] / frequencySum
			}
			array[column].forEach(function(d) {
				d["Frequency"] = d.BinSize / frequencySum;
			});
			
		}
	}
}

function graphSelectedData(selected) {
	var array = null;
	var nullArray = null;
	
	if(discreteAttributeData[selected] && discreteAttributeData[selected] != null){
		array = discreteAttributeData[selected];
		nullArray = discreteAttributeNullData[selected]
	}
	if(continuousAttributeData[selected] && continuousAttributeData[selected] != null){
		array = continuousAttributeData[selected];
		nullArray = continuousAttributeNullData[selected]
	}

	if(nullArray != null) {
		graphLift(array, nullArray);
		graphFreq(array, nullArray);
		graphNulls(array, nullArray);
	} else {
		graphLift(array, [{Frequency: 0}]);
		graphFreq(array, [{Frequency: 0}]);
        graphNulls(array, []);
	}
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
		if(d.IsCategorical === "False") {
			d.IsCategorical = false;
		}
		if(d.IsCategorical === "True") {
			d.IsCategorical = true;
		}
		return d;
	},
	function(error, data) {
		data.forEach(function(d) {
			if(d.IsCategorical) {
				organizeData(d, discreteAttributeData, discreteAttributeNullData);
			} else {
				organizeData(d, continuousAttributeData, continuousAttributeNullData);
			}
		});
		
		calculateFrequencySums(discreteAttributeData, discreteAttributeNullData);
		calculateFrequencySums(continuousAttributeData, continuousAttributeNullData);
		
		var selected = document.getElementsByClassName("attribute-selection")[0].value;
		graphSelectedData(selected);
	});
}

function init() {
	document.getElementsByClassName("attribute-selection")[0].onchange = function() {
		graphSelectedData(event.target.value);
	}
	document.getElementsByClassName("csv-selection")[0].onchange = function() {
		getData();
	}
	getData();
}

init();