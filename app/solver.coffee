_ = require 'lodash'

class Solver
	constructor: (@cycle,@delta,@d,@red,@vf,@w,@q0)->
		@kj = @q0*(-1/@w + 1/@vf)
		@red_time = @red*@cycle

	solve:->
		res = []
		[x,g,l] = [0,1000,0]
		while g>0
			t = @red_time + x/@vf
			g = @green_left t,l
			time_stopped = Math.max(0,g)
			res.push 
				x:x
				t: t
				g: g
				l: l
				c: @q0*time_stopped
			x+=@d
			l+=1
		[x,g,l] = [@d/@.w, 1000,-1]
		while g>0
			t = @red_time + x/@w
			g = @green_left t,l
			res.push
				x:x
				t: t
				g: g
				l: l
				c: @kj*t
			x-=@d
			l-=1
		res

	green_left: (t,l)->
		leftover = (t+Math.abs(l)*@delta)%@cycle
		if leftover<(@red_time)
			leftover - @red_time
		else
			@cycle-leftover

	find_min: (k)->
		table = @solve()
		flow = Infinity
		res
		for e in table
			flow_l = (e.c + k*e.x)/e.t
			if flow_l<flow
				flow = flow_l
				res = e
		res.k = k
		return res

	find_mfd:->
		(@find_min k for k in _.range 0,@kj,@kj/10)

q = new Solver 10,1,3,.5,3,-1,3
console.log q.find_mfd()
