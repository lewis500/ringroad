d3 = require 'd3'
_ = require 'lodash'
require './helpers'

class Settings
	constructor:->
		_.assign this,
			num_cars: 600
			time: 0
			space: 3
			pace: 1
			stopping_time: 6
			distance: 60
			beta: .5
			gamma: 2
			rush_length: 550
			frequency: 8
			rl: 1000
			phase: 25
			green: .5
			wish: 325
			num_signals: 50
			day: 0
			offset: .3

		@colors = d3.scale.linear()
			.domain _.range 0,@rl,@rl/6
			.range [
				'#F44336', #red
				'#2196F3', #blue
				'#E91E63', #pink
				'#00BCD4', #cyan
				'#FFC107', #amber
				'#4CAF50', #green
				]

		@scale = d3.scale.linear()
			.domain [0,@rl]
			.range [0,360]

	advance: ->
		@time++
	reset_time: ->
		@day++
		@time = 0

module.exports = new Settings()