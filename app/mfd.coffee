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
				r: 18
				b: 35

		@hor = d3.scale.linear()
				.domain [0,1]
				.range [0,@width]

		@ver = d3.scale.linear()
			.domain [0, .25]
			.range [@height, 0]

		@line = d3.svg.line()
			.x (d)=>@hor d.k
			.y (d)=>@ver d.q

		@horAxis = d3.svg.axis()
			.scale @hor
			.orient 'bottom'
			.ticks 8

		@verAxis = d3.svg.axis()
			.scale @ver
			.orient 'left'

	d: -> @line @memory
	
der = ->
	directive = 
		bindToController: true
		controllerAs: 'vm'
		scope: 
			memory: '='
		templateUrl: './dist/mfdChart.html'
		controller: ['$scope', '$element', Ctrl]

module.exports = der