S = require './settings'
_ = require 'lodash'

class Traffic
	constructor: ->

	reset:(waiting)->
		[@traveling, @cum, @cumEn, @cumEx,@waiting] = [[],[], 0, 0, _.clone(waiting)]

	done: ->
		(@waiting.length+@traveling.length)==0

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
				loc = (c.loc + g/2)%360
				g0 = g
		loc = (loc + _.random -1,1) %360
		car.enter loc
		@traveling.push car
		@order_cars()

	remove: (car)->
		@cumEx++
		_.remove @traveling, car

	update: ->
		@waiting.forEach (car)=>
			if _.lt car.t_en,S.time then @receive car
		@traveling.forEach (car)=>
			car.move()
			if car.exited then @remove car

		@log()

		@order_cars()

	order_cars: ->
		if (l = @traveling.length) > 1
			@traveling.sort (a,b)-> a.loc - b.loc
			@traveling.forEach (car,i,k)->
				car.set_next k[(i+1)%l]

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
	set_destination: (@destination)->

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
		@set_destination (@loc + @distance)%360
		[@cost0, @exited, @stopped, @color] = [@cost,false,0, S.colors(@destination)]

	move: ->
		if @stopped > 0 then @stopped--
		else
			if _.gte @get_gap(),S.space
				if (@loc = _.add(@loc,1)%360) == @destination
					@exit()
			else
				@stopped = S.stopping_time

module.exports = 
	Car: Car
	Traffic: Traffic
