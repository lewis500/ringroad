d3 = require 'd3'
_ = require 'lodash'

S = 
	num_cars: 250
	time: 0
	space: 5
	pace: 20
	stopping_time: 6
	distance: 60
	beta: .5
	gamma: 2
	rush_length: 250
	frequency: 8
	rl: 1000
	phase: 50
	green: .5
	wish: 150
	num_signals: 10
	day: 0
	advance: ->
		@time++
	reset_time: ->
		@time = 0

S.colors = d3.scale.linear()
		.domain _.range 0,S.rl, S.rl/6
		.range [
			'#F44336', #red
			'#2196F3', #blue
			'#E91E63', #pink
			'#00BCD4', #cyan
			'#FFC107', #amber
			'#4CAF50', #green
			]

S.scale = d3.scale.linear()
	.domain [0,S.rl]
	.range [0,360]

module.exports = S