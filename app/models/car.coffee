S = require '../settings'
_ = require 'lodash'
class Car
	constructor:->
		_.assign this,
			id: _.uniqueId 'car-'
			cost0: Infinity 
			target: _.random 2,S.rush_length
			exited: false
			entered: false
			distance: 60

	assign_error:-> 
		@t_en = Math.max 0,(@target + _.random -3,3)

	reset:->
		[@cost0, @entered, @exited] = [@cost,false,false]

	exit:->
		[@t_ex, @exited] = [S.time, true]

	eval_cost: ->
		@sd = @t_ex - S.wish
		@sp = Math.max( -S.beta * @sd, S.gamma * @sd)
		@tt = @t_ex - @t_en
		@cost =  @tt+@sp 

	choose: ->
		if @cost>@cost0
			[@cost0,@target] = [@cost, @t_en]

	set_loc: (@loc)->

	enter:(@loc)->
		@entered = true
		@destination = Math.floor (@loc + @distance)%S.num_cells
		@color = S.colors _.random S.num_cells

module.exports = Car