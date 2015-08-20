angular = require 'angular'
d3 = require 'd3'
_ = require 'lodash'

S = 
	num_cars: 50
	time: 0
	space: 10
	vel: 20


class Traffic
	constructor: ->
		@reset()

	reset:->
		@list = []

	enter_car: (car)->
		# if @list.length > 1
		# 	gaps = []
		# 	@list.forEach (car)->
		# 		g = car.get_gap car.next.loc
		# 		# if g >2*S.space
		# 		gaps.push 
		# 			gap: g
		# 			loc: car.loc
		# 	which = _.sample gaps
		# 	loc = which.loc + which.gap*.5
		# else 
		loc  = _.random 0, 360, true
		car.enter loc
		@list.push car
		@order_cars()

	exit_car:(car) ->
		i = @list.indexOf car
		@list.splice i , 1

	update: (dt)->
		@list.forEach (car)=>
			car.move dt
			if car.exited then @exit_car car
		@order_cars()

	order_cars: ->
		@list
			.sort (a,b)->
					a.loc - b.loc
		if @list.length > 1
			@list.forEach (car,i,k)->
				car.set_next k[(i+1)%k.length]
				car.set_prev k[(if (i==0) then (k.length-1) else (i-1))]

class Car
	constructor:(@distance)->
		@id = _.uniqueId()
		@time_entry = _.random 1, 30, true
		@exited = false
		@next = 
			loc: 361

	# setters
	set_next: (@next)->
	set_prev: (@prev)->
	exit: ->
		console.log 'exiting'
		@time_exit = S.time
		@exited = true

	enter:(@loc)->
		@time_queue = @time_exit - @time_enter
		@destination =( @loc + @distance )%360

	get_gap:(loc)->
		gap = loc - @loc
		if gap < 0 then (gap + 360) else gap

	move: (dt)->
		if @get_gap(@next.loc) >= S.space
			@loc+=(S.vel*dt/1000)%360
			if @get_gap( @destination) <= 0 then @exit()

class Ctrl
	constructor:(@scope,el)->
		@paused = true
		@cars = _.range 0, S.num_cars
			.map (n)->
				new Car 50

		@to_enter = @cars.slice 0

		@traffic = new Traffic

	click: -> if @paused then @play() else @pause()
	pause:-> @paused = true
	play: ->
		@pause()
		d3.timer.flush()
		@paused = false
		last = 0
		d3.timer (elapsed)=>
			dt = elapsed - last
			S.time+= dt/1000
			@to_enter.forEach (car)=>
				if car.time_entry < S.time
					@to_enter.splice @to_enter.indexOf(car),1
					@traffic.enter_car car
			@traffic.update dt
			@scope.$evalAsync()
			last = elapsed
			@paused
	# make a evalasync that only fires every third time

visDer = ->
	directive = 
		scope: {}
		controllerAs: 'vm'
		templateUrl: './dist/vis.html'
		controller: ['$scope', '$element', Ctrl]

angular.module 'mainApp' , [require 'angular-material']
	.directive 'visDer', visDer
	.directive 'datum', require './directives/datum'
