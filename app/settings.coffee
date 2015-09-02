d3 = require 'd3'
_ = require 'lodash'
colors = d3.scale.linear()
		.domain _.range 0,360,60
		.range [
			'#F44336', #red
			'#2196F3', #blue
			'#E91E63', #pink
			'#00BCD4', #cyan
			'#FFC107', #amber
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
	frequency: 3
	phase: 50
	green: .5
	wish: 50
	num_signals: 10
	day: 0
	advance: ->
		@time++
	reset_time: ->
		@time = 0
	colors: colors

module.exports = S