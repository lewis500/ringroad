angular = require 'angular'
d3 = require 'd3'
_ = require 'lodash'
S = require './settings'
{Car,Traffic} = require './models'

class Ctrl
	constructor:(@scope,el)->
		_.assign this,
			paused: true
			colors: S.colors
			traffic: new Traffic
			pal: _.range 0,360,20
			cars: _.range S.num_cars
					.map (n)-> 	new Car( S.distance + _.random -8,5)
		@day_start()

	rotator: (car)-> "rotate(#{car.loc})"
	tran: (tran)-> tran.transition().duration S.pace

	day_start: ->
		S.reset_time()
		@physics = true #physics stage happening
		@traffic.reset @cars
		_.invoke @cars, 'assign_error'
		@tick()

	day_end: ->
		@physics = false #physics stage not happening
		_.invoke @cars, 'eval_cost'
		_.sample @cars, 25
			.forEach (d)-> d.choose()

		setTimeout => @day_start()

	click:(val) -> if !val then @play()
	pause: -> @paused = true
	tick: ->
		if @physics
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
	.directive 'cumChart', require './cumChart'
	.directive 'horAxis', require './directives/xAxis'
	.directive 'verAxis', require './directives/yAxis'
