d3 = require 'd3'
_ = require 'lodash'
S = require './settings'

class Ctrl
	constructor:(@scope,el)->
		_.assign this,
			width: 300
			height: 300
			m: 
				t: 10
				l: 40
				r: 15
				b: 35

		@hor = d3.scale.linear()
				.domain [0,S.rush_length+120]
				.range [0,@width]

		@ver = d3.scale.linear()
			# .domain [0, S.num_cars]
			.domain [0,2]
			.range [@height, 0]

		@lineEn = d3.svg.line()
			.x (d)=>@hor d.time
			.y (d)=>@ver d.en

		@lineEx = d3.svg.line()
			.x (d)=>@hor d.time
			.y (d)=>@ver d.ex

		@horAxis = d3.svg.axis()
			.scale @hor
			.orient 'bottom'
			.ticks 8

		@verAxis = d3.svg.axis()
			.scale @ver
			.orient 'left'


	ex: ->
		@lineEx @rate
	en: ->
		@lineEn @rate
	
der = ->
	directive = 
		bindToController: true
		controllerAs: 'vm'
		scope: 
			rate: '='
		templateUrl: './dist/chart.html'
		controller: ['$scope', '$element', Ctrl]

module.exports = der