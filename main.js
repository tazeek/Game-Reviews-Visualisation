function plot_data(data){

	//Populate Dropdown with Platform List
	var uniquePlatforms = _.sortBy(_.uniq(_.pluck(data, "Platform")), function(name){ return name.toLowerCase(); });
	uniquePlatforms.unshift("All");

	var platform_drop = d3.select("#myPlatformSelect");
	
	var options = platform_drop.selectAll("option").data(uniquePlatforms).enter().append("option");

	options.text(function(d) { return d; })
			.attr("value", function(d) { return d; });


	//Populate Dropdown with Genre List
	var uniqueGenres = _.sortBy(_.uniq(_.pluck(data, "Genre")), function(name){ return name.toLowerCase(); });
	uniqueGenres.unshift("All");

	var genre_drop = d3.select("#myGenreSelect");

	options = genre_drop.selectAll("option").data(uniqueGenres).enter().append("option");

	options.text(function(d) { return d; })
			.attr("value", function(d) { return d; });

	//Set SVG Size
	var margin = {top: 50, right: 30, bottom: 50, left: 50};
	var width = 960 - margin.left - margin.right;
	var height = 540 - margin.top - margin.bottom;

	//A formatter for counts. 
	var formatCount = d3.format(",.0f");

	//Set X-axis range
	var x = d3.scale.linear()
			.domain([0,10])
			.range([0, width]);

	//Set X-axis on Histogram
	var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom");

	//Set Y-Axis ramge
	var y = d3.scale.linear()
				.range([height, 0]);

	//Set Y-Axis on Histogram
	var yAxis = d3.svg.axis()
					.scale(y)
					.orient("left");

	//Set SVG size
	var svg = d3.select(".graph").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	//Add X-axis to SVG
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)

	svg.append("text")
		.attr("text-anchor", "middle")
		.attr("transform", "translate(" + (width/2) + "," + (height + 50) + ")")
		.text("RATING");

	//Add Tooltip
	var tooltip = d3.tip()
					.attr('class', 'd3-tip')
					.offset([-10, 0])
					.html(function(d) {
						return "<strong>Number of Games:</strong>&nbsp;<span>" + d.length + "</span>";
					});
		
	svg.call(tooltip);

	function draw_histogram(data_points){

		var histogram_data = d3.layout.histogram()
								.bins(x.ticks(10))
								.value(function(d) {return d["Score"];})
								(data_points);

		y.domain([0, d3.max(histogram_data, function(d) { return d.y;})]);

		//Add Y Axis 
		svg.append("g")
			.attr("class", "y axis")
			.attr("id", "yAxis")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 10)
			.attr("dy", ".71em")
			.attr("text-anchor", "end")
			.text("COUNT");

		var max_frequency = _.max(histogram_data, function(d) { return d.y;});
		var max_frequency_index = _.indexOf(histogram_data, max_frequency);

		var bars = svg.selectAll(".bar")
					.data(histogram_data);

		bars.enter().append("g")
			.attr("class", "bar")
			.attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });


		//Draw the bars
		bars.append("rect")
			.attr("x", 0.5)
			.attr("width", x(histogram_data[0].dx) - 1)
			.attr("height", 0)
			.transition()
			.duration(2000)
			.attr("height", function(d) { return height - y(d.y);})
			.style("fill", function(d,i) { return i != max_frequency_index ? "steelblue" : "#FFDF00";});

		bars.on("mouseover", tooltip.show)
			.on("mouseout", tooltip.hide);
	}

	draw_histogram(data);


	function update(){
		var platform_input = d3.select("#myPlatformSelect").property("value");
		var genre_input = d3.select("#myGenreSelect").property("value");

		var required_data = data;

		var title = platform_input + " Game Ratings Frequency With " + genre_input.replace(',', ' &') + " Genre";
		if(platform_input.toLowerCase() != "all"){
			required_data = _.filter(required_data, function(d) { 
				var game_platform = d["Platform"].toLowerCase();

				return game_platform == platform_input.toLowerCase(); 
			});
		}

		if(genre_input.toLowerCase() != "all") {
			required_data = _.filter(required_data, function(d) { 
				var game_genre = d["Genre"].toLowerCase();

				return game_genre == genre_input.toLowerCase();
			});
		}

		d3.selectAll(".bar").remove();
		d3.select("#yAxis").remove();

		d3.select(".header").text(title);

		draw_histogram(required_data);

	}

	d3.select("#myGenreSelect").on("change", update);
	d3.select("#myPlatformSelect").on("change", update);
}

d3.tsv('data.tsv', function(d){
	d.Score = +d.Score;
	return d;
}, plot_data);