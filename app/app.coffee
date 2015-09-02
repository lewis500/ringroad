angular = require 'angular'
d3 = require 'd3'
_ = require 'lodash'
S = require './settings'
{Car,Traffic,Signal} = require './models'

class Ctrl
	constructor:(@scope,el)->
		_.assign this,
			paused: true
			traffic: new Traffic
			pal: _.range 0,S.rl,S.rl/25
			cars: _.range S.num_cars
					.map (n)-> 	new Car( S.distance + _.random( -8,5) )
		@scope.S = S
		@day_start()

	rotator: (car)-> "rotate(#{S.scale(car.loc)}) translate(0,50)"

	change_signals: (n)->
		@traffic.change_signals()

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

	click: (val) -> if !val then @play()
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
				, S.pace

	sig_col:(green) -> if green then '#4CAF50' else '#F44336'

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
	.animation '.g-car', leaver
