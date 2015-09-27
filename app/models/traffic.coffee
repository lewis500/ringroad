S = require '../settings'
_ = require 'lodash'
Car = require './car'
Signal = require './signal'
Cell = require './cell'

class Memory
	constructor: ->
		@day_start()
	reset:->
		[@q,@k,@i] = [0,0,0]

	span: 30

	day_start: ->
		@long_term = []
		@reset()

	remember:(q,k)->
		@i++
		@q+=q
		@k+=k
		if @i>=@span
			@long_term.push 
				q: @q/(@span*S.num_cells)
				k: @k/(@span*S.num_cells)
				id: _.uniqueId 'memory-'
			@reset()

class Traffic
	constructor: ->
		@cells = (new Cell n for n in [0...S.num_cells])
		for cell,i in @cells
			cell.next = @cells[(i+1)%@cells.length]

		@memory = new Memory()

	change_signals: (n)->
		@signals = []
		cell.clear_signal() for cell in @cells
		for i in [0...n]
			signal = new Signal i
			@signals.push signal
			q = Math.floor(i/n*S.num_cells)
			@cells[q].set_signal signal

	change_offsets: ->
		s.reset() for s in @signals

	day_start:(cars)->
		_.assign this,
			traveling: []
			cum: []
			rate: []
			# cumEn: 0
			# cumEx: 0
			waiting: _.clone cars
			cars: _.clone cars

		@memory.day_start()

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
		[flow,exits,entries] = [0,0,0]
		S.advance()
		k = @cells
		for car in @waiting
			if (car.t_en<=S.time)
				cell = _.sample _.filter( @cells,(c)->c.is_free())
				if cell
					car.enter cell.loc
					cell.receive car
					@traveling.push car
					entries++
					flow++

		for cell,i in k
			if cell.car
				if cell.car.destination==cell.loc
					cell.car.exit()
					cell.remove()
					exits++
					flow++
				else if cell.next.is_free()
					cell.next.receive cell.car
					cell.remove()
					flow++

		cell.finalize() for cell in @cells

		@waiting = _.filter @waiting, (c)-> !c.entered
		@traveling = _.filter @traveling, (c)-> !c.exited
		@memory.remember flow,@traveling.length

module.exports = Traffic
