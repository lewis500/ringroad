S = require './settings'
_ = require 'lodash'

class Signal
	constructor: (@loc)->
		@green = true
		@id = _.uniqueId 'signal-'
		@reset()

	reset: ->
		[@count, @green] = [0, true]

	update: ->
		@count++
		if @count >= S.phase
			@reset()
			return
		if @count >= S.green*S.phase
			@green = false

class Traffic
	constructor: ->
		@signals = _.range 0,360, 360/S.num_signals
				.map (f)-> new Signal Math.floor f

	reset:(waiting)->
		_.assign this,
			traveling: []
			cum: []
			memory: []
			cumEn: 0
			cumEx: 0
			waiting: _.clone( waiting)

		@signals.forEach (s)->
			s.reset()

	done: ->
		(@waiting.length+@traveling.length)==0

	remember: ->
		mem = 
			n: @traveling.length
			v: 0
			f: 0
		@traveling.forEach (d)->
			if !d.stopped
				mem.f++
				mem.v+=(1/mem.n)
		@memory.push mem
		# if @memory.length > 30
		# 	@memory.shift()

	log: ->
		@cum.push
			time: S.time
			cumEn: @cumEn
			cumEx: @cumEx

	receive: (car)->
		_.remove @waiting, car
		@cumEn++
		loc = _.random 0,359
		g0 = 0
		_.forEach @traveling, (c)->
			g = c.get_gap()
			if _.gte(g, S.space) and _.gt(g,g0)
				loc = Math.floor(c.loc + g/2)%360
				g0 = g
		car.enter loc
		@traveling.push car
		@order_cars()

	remove: (car)->
		@cumEx++
		_.remove @traveling, car

	update: ->
		reds = []
		@signals.forEach (s)->
			s.update()
			if !s.green
				reds.push s.loc

		@waiting.forEach (car)=>
			if _.lt car.t_en,S.time then @receive car
		@traveling.forEach (car)=>
			car.move reds
			if car.exited then @remove car

		@log()
		if (S.time%S.frequency==0) then @remember()

		@order_cars()

	order_cars: ->
		if (l = @traveling.length) > 1
			@traveling.sort (a,b)-> a.loc - b.loc
			@traveling.forEach (car,i,k)->
				car.set_next k[(i+1)%l]
		if l == 1
			@traveling[0].set_next null

class Car
	constructor:(@distance)->
		_.assign this,
			id: _.uniqueId()
			cost0: Infinity 
			target: _.random 4,(S.rush_length - S.distance - 10)
			exited: false

	assign_error:-> 
		@t_en = Math.max 0,(@target + _.random -2,2)

	# setters
	set_next: (@next)->

	get_gap:->
		if !@next then return 180
		gap = @next.loc - @loc
		if _.lte gap,0 then _.add gap,360 else gap

	exit: ->
		[@next, @t_ex, @exited] = [undefined, S.time, true]

	eval_cost: ->
		@sd = @t_ex - S.wish
		@sp = Math.max( -S.beta * @sd, S.gamma * @sd)
		@tt = @t_ex - @t_en
		@cost =  @tt+@sp 

	choose: ->
		if _.lte @cost,@cost0 then [@cost0,@target] = [@cost, @t_en]

	enter:(@loc)->
		@destination = Math.floor (@loc + @distance)%360
		# @destination = Math.floor @destination
		[@cost0, @exited, @stopped, @color] = [@cost,false,0, S.colors(@destination)]

	move: (reds)->
		if @stopped > 0 then @stopped--
		else
			if @loc == @destination
				@exit()
			else 
				next_loc = (@loc + 1)%360
				if (@get_gap() >= S.space) and (next_loc not in reds)
					@loc = next_loc
				else
					@stopped = S.stopping_time

module.exports = 
	Car: Car
	Traffic: Traffic
	Signal: Signal
