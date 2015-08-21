d3 = require 'd3'
colors = d3.scale.linear()
		.domain [0, 60, 120, 180, 240]
		.range [
			'#F44336', #red
			'#E91E63', #pink
			'#2196F3', #blue
			'#00BCD4', #cyan
			'#4CAF50', #green
			]

S = 
	num_cars: 60
	time: 0
	space: 5
	pace: .025
	stopping_time: 6
	distance: 28
	beta: .5
	gamma: 2
	rush_length: 100
	wish: 50
	day: 0
	advance: ->
		@time++
	reset_time: ->
		@time = 0
	colors: colors

module.exports = S