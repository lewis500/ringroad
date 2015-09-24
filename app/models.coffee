S = require './settings'
_ = require 'lodash'
require './helpers'

class Cell
	constructor: (@loc)->
		@last = -Infinity
		@temp_car = false
		@id = _.uniqueId 'cell'

	space: 4

	receive:(car)->
		car.set_loc @loc
		@last = S.time
		@temp_car = car
		car.cell = this

	remove: ->
		@temp_car = false

	finalize: ->
		if (@car=@temp_car)
			@last = S.time

	is_free: ->
		(S.time-@last)>@space

class Signal
	constructor: ->
		@id = _.uniqueId 'signal-'
		@reset()

	reset: ->
		[@count, @green] = [0, true]

	tick: ->
		@count++
		if (@count) >= (S.phase)
			[@count, @green] = [0, true]
			return
		if (@count)>= (S.green*S.phase)
			@green = false

class Traffic
	constructor: ->
		@cells = (new Cell n for n in [0...S.num_cells])

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
		free_cells = 
		k = @cells
		for car in @waiting
			if (car.t_en<=S.time)
				cell = _.sample _.filter( @cells,(c)->c.is_free())
				if cell
					car.enter cell.loc
					cell.receive car
					@traveling.push car

		cell.finalize() for cell in @cells
		
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


class Car
	constructor:->
		_.assign this,
			id: _.uniqueId 'car-'
			cost0: Infinity 
			target: _.random 2,S.rush_length
			exited: false
			entered: false
			distance: 60

	assign_error:-> 
		@t_en = Math.max 0,(@target + _.random -3,3)

	reset:->
		[@cost0, @entered, @exited] = [@cost,false,false]

	exit:->
		[@t_ex, @exited] = [S.time, true]

	eval_cost: ->
		@sd = @t_ex - S.wish
		@sp = Math.max( -S.beta * @sd, S.gamma * @sd)
		@tt = @t_ex - @t_en
		@cost =  @tt+@sp 

	choose: ->
		if @cost>@cost0
			[@cost0,@target] = [@cost, @t_en]

	set_loc: (@loc)->

	enter:(@loc)->
		@entered = true
		@destination = Math.floor (@loc + @distance)%S.num_cells
		@color = S.colors _.random S.num_cells

module.exports = 
	Car: Car
	Traffic: Traffic
	Signal: Signal
