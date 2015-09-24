S = require '../settings'
_ = require 'lodash'

class Traffic
	constructor: ->
		@cells = (new Cell n for n in [0...S.num_cells])
		# @change_signals

	change_signals: (n)->
		@signals = []
		cell.clear_signal() for cell in @cells
		for i in [0...n]
			signal = new Signal
			@signals.push signal
			q = Math.floor(  i/n*S.num_cells)
			@cells[q].set_signal signal

	day_start:(cars)->
		_.assign this,
			traveling: []
			cum: []
			rate: []
			memory: []
			cumEn: 0
			cumEx: 0
			waiting: _.clone cars
			cars: _.clone cars

		for cell in @cells
			cell.car = cell.temp_car = false
			cell.last = -Infinity

		car.assign_error() for car in @waiting

	day_end:(cars)->
		car.eval_cost() for car in cars
		car.choose() for car in _.sample(cars,S.sample)
		car.reset() for car in cars

	done: ->
		(@waiting.length+@traveling.length)==0

	tick:->
		k = @cells
		for car in @waiting
			if (car.t_en<=S.time)
				cell = _.sample _.filter( @cells,(c)->c.is_free())
				if cell
					car.enter cell.loc
					cell.receive car
					@traveling.push car

		for cell,i in k
			if cell.car
				if cell.car.destination==cell.loc
					cell.car.exit()
					cell.remove()
				if k[(i+1)%k.length].is_free()
					k[(i+1)%k.length].receive cell.car
					cell.remove()
					
		cell.finalize() for cell in @cells

		@waiting = _.filter @waiting, (c)-> !c.entered
		@traveling = _.filter @traveling, (c)-> !c.exited

module.exports = Traffic
