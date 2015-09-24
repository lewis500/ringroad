S = require '../settings'
_ = require 'lodash'
require '../helpers'
class Signal
	constructor: (@i) ->
		@count = 0
		@green = true
		@id = _.uniqueId 'signal-'
		@reset_offset()

	@property 'offset', 
		get: -> 
			S.phase*((@i*S.offset)%1)

	reset_offset: ->
		[@count, @green] = [@offset, true]

	tick: ->
		@count++
		if (@count) >= (S.phase)
			[@count, @green] = [0, true]
			return
		if (@count)>= (S.green*S.phase)
			@green = false

module.exports = Signal