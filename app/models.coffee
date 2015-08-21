S = require './settings'
_ = require 'lodash'

class Traffic
	constructor: ->

	reset:(waiting)->
		@waiting = _.clone waiting
		@traveling = []
		@cum = []
		@cumEn = 0
		@cumEx = 0

	done: ->
		(@waiting.length+@traveling.length)==0

	log: ->
		@cum.push
			time: S.time
			cumEn: @cumEn
			cumEx: @cumEx

	receive: (car)->
		@cumEn++
		# @log()
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
		# @log()

	update: ->
		@waiting.forEach (car)=>
			if car.entering S.time
				_.remove @waiting, car
				@receive car
		@traveling.forEach (car)=>
			car.move()
			if car.exited then @remove car

		@log()

		@order_cars()

	order_cars: ->
		l = @traveling.length
		if l > 1
			@traveling.sort (a,b)-> a.loc - b.loc
			@traveling.forEach (car,i,k)->
				car.set_next k[(i+1)%l]

class Car
	constructor:(@distance)->
		_.assign this,
			id: _.uniqueId()
			cost0: Infinity 
			target: _.random 2, S.rush_length - S.distance - 10
			exited: false

	assign_error:-> 
		d = Math.random()
		e = switch
			when d <= 1/3 then -2
			when 2/3 < d then 2
			else 0
		@set_t_en @target + e

	entering: (t)-> @t_en < t

	# setters
	set_next: (@next)->
	set_t_en: (@t_en)->
	set_t_ex: (@t_ex)->
	set_destination: (@destination)->
	set_color: (@color)->
	set_target: (@target)->
	set_cost0: (@cost0)->

	get_gap:->
		if !@next then return 180
		gap = @next.loc - @loc
		if _.lte gap,0 then _.add gap,360 else gap

	exit: ->
		@next = undefined
		@t_ex = S.time
		@exited = true

	eval_cost: ->
		@sd = @t_ex - S.wish
		@sp = Math.max( -S.beta * @sd, S.gamma * @sd)
		@tt = @t_ex - @t_en
		@cost =  @tt+@sp 

	choose: ->
		if _.lte @cost,@cost0
			#make cost the cost0 and @t_en the target
			@cost0 = @cost
			@target = @t_en

	enter:(@loc)->
		@cost0 = @cost
		@exited = false
		# @set_exited fal/se
		@set_destination (@loc + @distance)%360
		@set_color S.colors @destination
		@stopped = 0

	move: ->
		if @stopped > 0
			@stopped--
		else
			if _.gte @get_gap(),S.space
				@loc = _.add(@loc,1)%360
				if @loc == @destination then @exit()
			else
				@stopped = S.stopping_time

module.exports = 
	Car: Car
	Traffic: Traffic
