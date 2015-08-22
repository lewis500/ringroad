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
				l: 30
				r: 10
				b: 35

		@hor = d3.scale.linear()
				.domain [0,S.rush_length]
				.range [0,@width]

		@ver = d3.scale.linear()
			.domain [0, S.num_cars]
			.range [@height, 0]

		@lineEn = d3.svg.line()
			.x (d)=>@hor d.time
			.y (d)=>@ver d.cumEn

		@lineEx = d3.svg.line()
			.x (d)=>@hor d.time
			.y (d)=>@ver d.cumEx

		@horAxis = d3.svg.axis()
			.scale @hor
			.orient 'bottom'

		@verAxis = d3.svg.axis()
			.scale @ver
			.orient 'left'


	ex: ->
		@lineEx @cum
	en: ->
		@lineEn @cum
	
der = ->
	directive = 
		bindToController: true
		controllerAs: 'vm'
		scope: 
			cum: '='
		templateUrl: './dist/chart.html'
		controller: ['$scope', '$element', Ctrl]

module.exports = der