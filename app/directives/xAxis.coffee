d3 = require 'd3'
angular = require 'angular'

der = ($window)->
	directive = 
		controller: angular.noop
		controllerAs: 'vm'
		bindToController: true
		restrict: 'A'
		templateNamespace: 'svg'
		template: '<g class="label" shifter="[vm.width/2,vm.height]"><text>{{vm.label}}</text></g>'
		scope: 
			height: '='
			fun: '='
			width: '='
			label: '@'
		link: (scope, el, attr, vm)->
			scale = vm.fun.scale()

			sel = d3.select el[0]
				.classed 'x axis', true

			# gLabel = sel.select '.label'

			# # if vm.label

			# # # if vm.label
			# # # 	text = sel.append 'g'
			# # # 		.attr 'class','g-label'
			# # # 		.append 'text'
			# # # 		.attr 'class','label'
			# # # 		.text vm.label

			update = =>
				vm.fun.tickSize -vm.height
				sel.call vm.fun
				# if vm.label
				# 	text.attr
				# 		'transform',"translate(#{vm.height/2},#{})"
				
			scope.$watch ->
				[scale.domain(), scale.range() ,vm.height]
			, update
			, true


module.exports = der