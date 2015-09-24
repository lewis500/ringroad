angular = require 'angular'
d3 = require 'd3'
_ = require 'lodash'
S = require './settings'
# {Car,Traffic,Signal} = require './models'
Traffic = require './models/traffic'
Car = require './models/car'

class Ctrl
	constructor:(@scope,el)->
		_.assign this,
			paused: true
			traffic: new Traffic
			pal: _.range 0,S.rl,S.rl/25
		@cars = [0...S.num_cars].map -> new Car( S.distance + _.random( -8,5) )
		@scope.S = S
		@traffic.day_start @cars
		@scope.$watch 'S.num_signals',=>
			 @traffic.change_signals S.num_signals

	rotator: (car)-> "rotate(#{S.scale(car.loc)}) translate(0,50)"

	day_start: ->
		S.reset_time()
		@traffic.day_start @cars
		@tick()

	day_end: ->
		@traffic.day_end @cars
		setTimeout => @day_start @cars

	click: (val) -> if !val then @play()
	pause: -> @paused = true
	tick: ->
		d3.timer =>
				if @traffic.done()
					@day_end @cars
					return true
				S.advance()
				@traffic.tick()
				@traffic.tick()
				@traffic.tick()
				@scope.$evalAsync()
				@paused

	play: ->
		@pause()
		@paused = false
		@tick()

visDer = ->
	directive = 
		scope: {}
		controllerAs: 'vm'
		templateUrl: './dist/vis.html'
		controller: ['$scope', '$element', Ctrl]

leaver = ->
	animate = 
		leave: (el)->
			d3.select el[0]
				.select 'rect'
				.transition()
				.duration 50
				.ease 'cubic'
				.attr 'transform','scale(1.2,1)'
				.attr 'fill','#eee'
				.transition()
				.duration 150
				.ease 'cubic'
				.attr 'transform','scale(0,1)'
		enter: (el)->
			d3.select el[0]
				.select 'rect'
				.attr 'transform','scale(0,.5)'
				.transition()
				.duration 60
				.ease 'cubic'
				.attr 'transform','scale(1.2,1)'
				.transition()
				.duration 150
				.ease 'cubic'
				.attr 'transform','scale(1)'

angular.module 'mainApp' , [require 'angular-material' , require 'angular-animate']
	.directive 'visDer', visDer
	.directive 'datum', require './directives/datum'
	.directive 'd3Der', require './directives/d3Der'
	.directive 'cumChart', require './cumChart'
	.directive 'mfdChart', require './mfd'
	.directive 'horAxis', require './directives/xAxis'
	.directive 'verAxis', require './directives/yAxis'
	# .animation '.signal', signalAn
	# .animation '.g-car', leaver
	.directive 'sliderDer', require './directives/slider'
