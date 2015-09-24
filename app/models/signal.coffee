S = require '../settings'
_ = require 'lodash'
require '../helpers'
class Signal
	constructor: ->
		@count = 0
		@green = true
		@id = _.uniqueId 'signal-'
		@offset = 0

	set_offset: (@offset)->

	tick: ->
		@count++
		if @count >= (S.phase*(1+@offset))
			@count = (S.phase*@offset)
			@green = true
			return
		if @count >= (S.green*S.phase*(1+@offset))
			@green = false

module.exports = Signal