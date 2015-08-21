angular = require 'angular'
d3 = require 'd3'
_ = require 'lodash'

S = 
	num_cars: 200
	time: 0
	space: 5
	pace: .1
	stopping_time: 4
	distance: 45
	beta: .5
	gamma: 2
	day: 0
	advance: ->
		@time++
	reset_time: ->
		@time = 0

class Traffic
	constructor: ->

	reset:(waiting)->
		@waiting = waiting.splice 0
		@traveling = []
		@memory = []
		@short_memory = []

	done: ->
		@waiting.length == 0 and @traveling.length == 0

	choice_stage: ->

	receive: (car)->
		loc = _.random 0,360
		g0 = 0
		_.forEach @traveling, (c)->
			g = c.get_gap()
			if g >= S.space and g > g0
				loc = (c.loc + g/2)%360
				g0 = g
		car.enter loc
		@traveling.push car
		@order_cars()

	update: ->
		@waiting.forEach (car)=>
			if car.entering S.time
				_.remove @waiting, car
				@receive car
		@traveling.forEach (car)=>
			car.move()
			if car.exited then _.remove @traveling, car
		@order_cars()

	remember: (d)->
		@short_memory.push d
		if @short_memory.length >= 3
			res = 
				f: 0
				v: 0
				a: 0
			@short_memory.forEach (d)->
				res.f += d.f/3
				res.v += d.v/3
				res.a += d.a/3
			@short_memory = []

			@memory.push res
			if @memory.length > 80 then @memory.shift()

	order_cars: ->
		@traveling.sort (a,b)-> a.loc - b.loc
		v = 0
		l = @traveling.length
		if l > 1
			@traveling.forEach (car,i,k)->
				if !car.stopped then v++
				car.set_next k[(i+1)%l]
				car.set_prev k[(if (i==0) then (l-1) else (i-1))]

class Car
	constructor:(@distance)->
		@id = _.uniqueId()
		@t_en = _.random 1, 225
		@exited = false
		@next = 
			loc: 361

	entering: (t)-> @t_en < t

	# setters
	set_next: (@next)->
	set_prev: (@prev)->
	# set_color: (@color)->
	exit: ->
		@t_ex = S.time
		@exited = true

	enter:(@loc)->
		@stopped = 0
		@destination = ( @loc + @distance )%360
		@color = colors @destination

	get_gap:->
		gap = @next.loc - @loc
		if gap < 0 then (gap + 360) else gap

	eval_costs: ->
		sd = S.wish_time
		@cost = (@t_ex - @t_en) + Math.max 

	move: ->
		if @stopped > 0
			@stopped--
		else
			if @get_gap() >= S.space
				@loc = (@loc + 1)%360
				if (@loc == @destination) then @exit()
			else
				@stopped = S.stopping_time

colors = d3.scale.linear()
		.domain [0, 60, 120, 180, 240]
		.range [
			'#F44336', #red
			'#E91E63', #pink
			'#2196F3', #blue
			'#00BCD4', #cyan
			'#4CAF50', #green
			]

class Ctrl
	constructor:(@scope,el)->
		_.assign this,
			paused: true
			physics: true
			colors: colors
			traffic: new Traffic
			pal: _.range 0,360,20
		@cars = _.range S.num_cars
			.map (n)->	new Car S.distance
		@day_start()

	rotator: (car)-> "rotate(#{car.loc})"
	tran: (tran)-> tran.transition().duration S.pace

	day_start: ->
		S.day++
		S.reset_time()
		@physics = true #physics stage happening
		@traffic.reset @cars
		@tick()

	day_end: ->
		@physics = false #physics stage not happening
		@traffic.choice_stage()

	click: -> if @paused then @play() else @pause()
	pause: -> @paused = true
	tick: ->
		if !@physics then return
		d3.timer =>
				if @traffic.done()
					@day_end()
					true
				S.advance()
				@traffic.update()
				@scope.$evalAsync()
				if !@paused then @tick()
				true
			, S.pace*1000

	play: ->
		@pause()
		d3.timer.flush()
		@paused = false
		@tick()

visDer = ->
	directive = 
		scope: {}
		controllerAs: 'vm'
		templateUrl: './dist/vis.html'
		controller: ['$scope', '$element', Ctrl]

angular.module 'mainApp' , [require 'angular-material']
	.directive 'visDer', visDer
	.directive 'datum', require './directives/datum'
	.directive 'd3Der', require './directives/d3Der'
