S = require '../settings'
_ = require 'lodash'
class Signal
	constructor: ->
		@count = 0
		@green = true
		@id = _.uniqueId 'signal-'

	tick: ->
		@count++
		if @count >= S.phase
			@count = 0
			@green = true
			return
		if @count >= (S.green*S.phase)
			@green = false

module.exports = Signal