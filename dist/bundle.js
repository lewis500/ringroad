(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Car, Ctrl, S, Signal, Traffic, _, angular, d3, leaver, ref, visDer;

angular = require('angular');

d3 = require('d3');

_ = require('lodash');

S = require('./settings');

ref = require('./models'), Car = ref.Car, Traffic = ref.Traffic, Signal = ref.Signal;

Ctrl = (function() {
  function Ctrl(scope, el) {
    this.scope = scope;
    _.assign(this, {
      paused: true,
      traffic: new Traffic,
      pal: _.range(0, S.rl, S.rl / 25),
      cars: _.range(S.num_cars).map(function(n) {
        return new Car(S.distance + _.random(-8, 5));
      })
    });
    this.scope.S = S;
    this.day_start();
    this.scope.$watch('S.num_signals', (function(_this) {
      return function(n) {
        return _this.traffic.change_signals(n);
      };
    })(this));
  }

  Ctrl.prototype.rotator = function(car) {
    return "rotate(" + (S.scale(car.loc)) + ") translate(0,50)";
  };

  Ctrl.prototype.day_start = function() {
    S.reset_time();
    this.physics = true;
    this.traffic.reset(this.cars);
    _.invoke(this.cars, 'assign_error');
    return this.tick();
  };

  Ctrl.prototype.day_end = function() {
    this.physics = false;
    _.invoke(this.cars, 'eval_cost');
    _.sample(this.cars, 25).forEach(function(d) {
      return d.choose();
    });
    return setTimeout((function(_this) {
      return function() {
        return _this.day_start();
      };
    })(this));
  };

  Ctrl.prototype.click = function(val) {
    if (!val) {
      return this.play();
    }
  };

  Ctrl.prototype.pause = function() {
    return this.paused = true;
  };

  Ctrl.prototype.tick = function() {
    if (this.physics) {
      return d3.timer((function(_this) {
        return function() {
          if (_this.traffic.done()) {
            _this.day_end();
            true;
          }
          S.advance();
          _this.traffic.update();
          _this.scope.$evalAsync();
          if (!_this.paused) {
            _this.tick();
          }
          return true;
        };
      })(this), S.pace);
    }
  };

  Ctrl.prototype.sig_col = function(green) {
    if (green) {
      return '#4CAF50';
    } else {
      return '#F44336';
    }
  };

  Ctrl.prototype.play = function() {
    this.pause();
    d3.timer.flush();
    this.paused = false;
    return this.tick();
  };

  return Ctrl;

})();

visDer = function() {
  var directive;
  return directive = {
    scope: {},
    controllerAs: 'vm',
    templateUrl: './dist/vis.html',
    controller: ['$scope', '$element', Ctrl]
  };
};

leaver = function() {
  var animate;
  return animate = {
    leave: function(el) {
      return d3.select(el[0]).select('rect').transition().duration(50).ease('cubic').attr('transform', 'scale(1.2,1)').attr('fill', '#eee').transition().duration(150).ease('cubic').attr('transform', 'scale(0,1)');
    },
    enter: function(el) {
      return d3.select(el[0]).select('rect').attr('transform', 'scale(0,.5)').transition().duration(60).ease('cubic').attr('transform', 'scale(1.2,1)').transition().duration(150).ease('cubic').attr('transform', 'scale(1)');
    }
  };
};

angular.module('mainApp', [require('angular-material', require('angular-animate'))]).directive('visDer', visDer).directive('datum', require('./directives/datum')).directive('d3Der', require('./directives/d3Der')).directive('cumChart', require('./cumChart')).directive('mfdChart', require('./mfd')).directive('horAxis', require('./directives/xAxis')).directive('verAxis', require('./directives/yAxis')).animation('.g-car', leaver).directive('sliderDer', require('./directives/slider'));



},{"./cumChart":2,"./directives/d3Der":3,"./directives/datum":4,"./directives/slider":5,"./directives/xAxis":6,"./directives/yAxis":7,"./mfd":9,"./models":10,"./settings":11,"angular":undefined,"angular-animate":undefined,"angular-material":undefined,"d3":undefined,"lodash":undefined}],2:[function(require,module,exports){
var Ctrl, S, _, d3, der;

d3 = require('d3');

_ = require('lodash');

S = require('./settings');

Ctrl = (function() {
  function Ctrl(scope, el) {
    this.scope = scope;
    _.assign(this, {
      width: 300,
      height: 300,
      m: {
        t: 10,
        l: 40,
        r: 15,
        b: 35
      }
    });
    this.hor = d3.scale.linear().domain([0, S.rush_length]).range([0, this.width]);
    this.ver = d3.scale.linear().domain([0, S.num_cars]).range([this.height, 0]);
    this.lineEn = d3.svg.line().x((function(_this) {
      return function(d) {
        return _this.hor(d.time);
      };
    })(this)).y((function(_this) {
      return function(d) {
        return _this.ver(d.cumEn);
      };
    })(this));
    this.lineEx = d3.svg.line().x((function(_this) {
      return function(d) {
        return _this.hor(d.time);
      };
    })(this)).y((function(_this) {
      return function(d) {
        return _this.ver(d.cumEx);
      };
    })(this));
    this.horAxis = d3.svg.axis().scale(this.hor).orient('bottom').ticks(8);
    this.verAxis = d3.svg.axis().scale(this.ver).orient('left');
  }

  Ctrl.prototype.ex = function() {
    return this.lineEx(this.cum);
  };

  Ctrl.prototype.en = function() {
    return this.lineEn(this.cum);
  };

  return Ctrl;

})();

der = function() {
  var directive;
  return directive = {
    bindToController: true,
    controllerAs: 'vm',
    scope: {
      cum: '='
    },
    templateUrl: './dist/chart.html',
    controller: ['$scope', '$element', Ctrl]
  };
};

module.exports = der;



},{"./settings":11,"d3":undefined,"lodash":undefined}],3:[function(require,module,exports){
var angular, d3, der;

d3 = require('d3');

angular = require('angular');

der = function($parse) {
  var directive;
  return directive = {
    restrict: 'A',
    scope: {
      d3Der: '=',
      tran: '='
    },
    link: function(scope, el, attr) {
      var hasTransitioned, sel, u;
      sel = d3.select(el[0]);
      u = 't-' + Math.random();
      hasTransitioned = false;
      return scope.$watch('d3Der', function(v) {
        if (scope.tran && hasTransitioned) {
          hasTransitioned = true;
          return sel.transition(u).attr(v).call(scope.tran);
        } else {
          hasTransitioned = true;
          return sel.attr(v);
        }
      }, true);
    }
  };
};

module.exports = der;



},{"angular":undefined,"d3":undefined}],4:[function(require,module,exports){
module.exports = function($parse) {
  return function(scope, el, attr) {
    return d3.select(el[0]).datum($parse(attr.datum)(scope));
  };
};



},{}],5:[function(require,module,exports){
var der;

der = function() {
  var res;
  return res = {
    scope: {
      label: '@',
      myData: '=',
      min: '=',
      max: '=',
      step: '='
    },
    controllerAs: 'vm',
    replace: true,
    controller: function() {},
    bindToController: true,
    templateUrl: './dist/slider.html'
  };
};

module.exports = der;



},{}],6:[function(require,module,exports){
var d3, der;

d3 = require('d3');

der = function() {
  var directive;
  return directive = {
    restrict: 'A',
    scope: {
      fun: '='
    },
    link: function(scope, el, attr) {
      var scale, sel;
      scale = scope.fun.scale();
      sel = d3.select(el[0]).classed('hor axis', true);
      return sel.call(scope.fun);
    }
  };
};

module.exports = der;



},{"d3":undefined}],7:[function(require,module,exports){
var d3, der;

d3 = require('d3');

der = function() {
  var directive;
  return directive = {
    restrict: 'A',
    scope: {
      fun: '='
    },
    link: function(scope, el, attr) {
      var scale, sel;
      scale = scope.fun.scale();
      sel = d3.select(el[0]).classed('ver axis', true);
      return sel.call(scope.fun);
    }
  };
};

module.exports = der;



},{"d3":undefined}],8:[function(require,module,exports){
'use strict';
Function.prototype.property = function(prop, desc) {
  return Object.defineProperty(this.prototype, prop, desc);
};



},{}],9:[function(require,module,exports){
var Ctrl, S, _, d3, der;

d3 = require('d3');

_ = require('lodash');

S = require('./settings');

Ctrl = (function() {
  function Ctrl(scope, el) {
    this.scope = scope;
    _.assign(this, {
      width: 300,
      height: 300,
      m: {
        t: 10,
        l: 40,
        r: 18,
        b: 35
      }
    });
    this.hor = d3.scale.linear().domain([0, S.num_cars * .8]).range([0, this.width]);
    this.ver = d3.scale.linear().domain([0, S.num_cars * .55]).range([this.height, 0]);
    this.line = d3.svg.line().x((function(_this) {
      return function(d) {
        return _this.hor(d.n);
      };
    })(this)).y((function(_this) {
      return function(d) {
        return _this.ver(d.f);
      };
    })(this));
    this.horAxis = d3.svg.axis().scale(this.hor).orient('bottom').ticks(8);
    this.verAxis = d3.svg.axis().scale(this.ver).orient('left');
  }

  Ctrl.prototype.d = function() {
    return this.line(this.memory);
  };

  return Ctrl;

})();

der = function() {
  var directive;
  return directive = {
    bindToController: true,
    controllerAs: 'vm',
    scope: {
      memory: '='
    },
    templateUrl: './dist/mfdChart.html',
    controller: ['$scope', '$element', Ctrl]
  };
};

module.exports = der;



},{"./settings":11,"d3":undefined,"lodash":undefined}],10:[function(require,module,exports){
var Car, S, Signal, Traffic, _,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

S = require('./settings');

_ = require('lodash');

Signal = (function() {
  function Signal(loc1) {
    this.loc = loc1;
    this.green = true;
    this.id = _.uniqueId('signal-');
    this.reset();
  }

  Signal.prototype.reset = function() {
    var ref;
    return ref = [0, true], this.count = ref[0], this.green = ref[1], ref;
  };

  Signal.prototype.update = function() {
    this.count++;
    if (this.count >= S.phase) {
      this.reset();
      return;
    }
    if (this.count >= S.green * S.phase) {
      return this.green = false;
    }
  };

  return Signal;

})();

Traffic = (function() {
  function Traffic() {
    this.change_signals(S.num_signals);
  }

  Traffic.prototype.reset = function(waiting) {
    _.assign(this, {
      traveling: [],
      cum: [],
      memory: [],
      cumEn: 0,
      cumEx: 0,
      waiting: _.clone(waiting)
    });
    return this.signals.forEach(function(s) {
      return s.reset();
    });
  };

  Traffic.prototype.change_signals = function(n) {
    return this.signals = _.range(0, S.rl, S.rl / n).map(function(f) {
      return new Signal(Math.floor(f));
    });
  };

  Traffic.prototype.done = function() {
    return (this.waiting.length + this.traveling.length) === 0;
  };

  Traffic.prototype.remember = function() {
    var mem;
    mem = {
      n: this.traveling.length,
      v: 0,
      f: 0
    };
    this.traveling.forEach(function(d) {
      if (d.stopped === 0) {
        mem.f++;
        return mem.v += 1 / mem.n;
      }
    });
    return this.memory.push(mem);
  };

  Traffic.prototype.log = function() {
    return this.cum.push({
      time: S.time,
      cumEn: this.cumEn,
      cumEx: this.cumEx
    });
  };

  Traffic.prototype.receive = function(car) {
    var g0, loc;
    this.cumEn++;
    loc = _.random(0, S.rl);
    g0 = 0;
    _.forEach(this.traveling, function(c) {
      var g;
      g = c.get_gap();
      if (g >= g0) {
        loc = Math.floor(c.loc + g / 2) % S.rl;
        return g0 = g;
      }
    });
    if ((g0 > 0 && this.traveling.length > 0) || (this.traveling.length === 0)) {
      _.remove(this.waiting, car);
      car.enter(loc);
      this.traveling.push(car);
      return this.order_cars();
    }
  };

  Traffic.prototype.remove = function(car) {
    this.cumEx++;
    return _.remove(this.traveling, car);
  };

  Traffic.prototype.update = function() {
    var reds;
    reds = [];
    this.signals.forEach(function(s) {
      s.update();
      if (!s.green) {
        return reds.push(s.loc);
      }
    });
    this.waiting.forEach((function(_this) {
      return function(car) {
        if (_.lt(car.t_en, S.time)) {
          return _this.receive(car);
        }
      };
    })(this));
    this.traveling.forEach((function(_this) {
      return function(car) {
        car.move(reds);
        if (car.exited) {
          return _this.remove(car);
        }
      };
    })(this));
    this.log();
    if (S.time % S.frequency === 0) {
      this.remember();
    }
    return this.order_cars();
  };

  Traffic.prototype.order_cars = function() {
    var l;
    if ((l = this.traveling.length) > 1) {
      this.traveling.sort(function(a, b) {
        return a.loc - b.loc;
      });
      this.traveling.forEach(function(car, i, k) {
        return car.set_next(k[(i + 1) % l]);
      });
    }
    if (l === 1) {
      return this.traveling[0].set_next(null);
    }
  };

  return Traffic;

})();

Car = (function() {
  function Car(distance) {
    this.distance = distance;
    _.assign(this, {
      id: _.uniqueId(),
      cost0: Infinity,
      target: _.random(4, S.rush_length - S.distance - 35),
      exited: false
    });
  }

  Car.prototype.assign_error = function() {
    return this.t_en = Math.max(0, this.target + _.random(-2, 2));
  };

  Car.prototype.set_next = function(next) {
    this.next = next;
  };

  Car.prototype.get_gap = function() {
    var gap;
    if (!this.next) {
      return Math.floor(S.rl / 2);
    }
    gap = this.next.loc - this.loc;
    if (_.lte(gap, 0)) {
      return gap + S.rl;
    } else {
      return gap;
    }
  };

  Car.prototype.exit = function() {
    var ref;
    return ref = [void 0, S.time, true], this.next = ref[0], this.t_ex = ref[1], this.exited = ref[2], ref;
  };

  Car.prototype.eval_cost = function() {
    this.sd = this.t_ex - S.wish;
    this.sp = Math.max(-S.beta * this.sd, S.gamma * this.sd);
    this.tt = this.t_ex - this.t_en;
    return this.cost = this.tt + this.sp;
  };

  Car.prototype.choose = function() {
    var ref;
    if (_.lte(this.cost, this.cost0)) {
      return ref = [this.cost, this.t_en], this.cost0 = ref[0], this.target = ref[1], ref;
    }
  };

  Car.prototype.enter = function(loc1) {
    var ref;
    this.loc = loc1;
    this.destination = Math.floor((this.loc + this.distance) % S.rl);
    return ref = [this.cost, false, 0, S.colors(this.destination)], this.cost0 = ref[0], this.exited = ref[1], this.stopped = ref[2], this.color = ref[3], ref;
  };

  Car.prototype.move = function(reds) {
    var next_loc;
    if (this.stopped > 0) {
      return this.stopped--;
    } else {
      if (this.loc === this.destination) {
        return this.exit();
      } else {
        next_loc = (this.loc + 1) % S.rl;
        if ((this.get_gap() >= S.space) && (indexOf.call(reds, next_loc) < 0)) {
          return this.loc = next_loc;
        } else {
          return this.stopped = S.stopping_time;
        }
      }
    }
  };

  return Car;

})();

module.exports = {
  Car: Car,
  Traffic: Traffic,
  Signal: Signal
};



},{"./settings":11,"lodash":undefined}],11:[function(require,module,exports){
var Settings, _, d3;

d3 = require('d3');

_ = require('lodash');

require('./helpers');

Settings = (function() {
  function Settings() {
    _.assign(this, {
      num_cars: 250,
      time: 0,
      space: 5,
      pace: 20,
      stopping_time: 6,
      distance: 60,
      beta: .5,
      gamma: 2,
      rush_length: 250,
      frequency: 8,
      rl: 1000,
      phase: 50,
      green: .5,
      wish: 150,
      num_signals: 10,
      day: 0,
      offset: 0
    });
    this.colors = d3.scale.linear().domain(_.range(0, this.rl, this.rl / 6)).range(['#F44336', '#2196F3', '#E91E63', '#00BCD4', '#FFC107', '#4CAF50']);
    this.scale = d3.scale.linear().domain([0, this.rl]).range([0, 360]);
  }

  Settings.property('offset', {
    set: function(v) {
      return this._offset = _.round(v, 1 / this.num_signals);
    },
    get: function() {
      return this._offset;
    }
  });

  Settings.prototype.advance = function() {
    return this.time++;
  };

  Settings.prototype.reset_time = function() {
    return this.time = 0;
  };

  return Settings;

})();

module.exports = new Settings();



},{"./helpers":8,"d3":undefined,"lodash":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2FwcC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2N1bUNoYXJ0LmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9yaW5ncm9hZC9hcHAvZGlyZWN0aXZlcy9kM0Rlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2RpcmVjdGl2ZXMvZGF0dW0uY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3Jpbmdyb2FkL2FwcC9kaXJlY3RpdmVzL3NsaWRlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2RpcmVjdGl2ZXMveEF4aXMuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3Jpbmdyb2FkL2FwcC9kaXJlY3RpdmVzL3lBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9yaW5ncm9hZC9hcHAvaGVscGVycy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL21mZC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL21vZGVscy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL3NldHRpbmdzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUE7O0FBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7QUFDTCxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0FBQ0osQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSOztBQUNKLE1BQXVCLE9BQUEsQ0FBUSxVQUFSLENBQXZCLEVBQUMs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UixDQUFDLE1BRE8sQ0FDQSxDQUFDLENBQUQsRUFBRyxJQUFDLENBQUEsRUFBSixDQURBLENBRVIsQ0FBQyxLQUZPLENBRUQsQ0FBQyxDQUFELEVBQUcsR0FBSCxDQUZDO0VBL0JFOztFQW1DWixRQUFDLENBQUEsUUFBRCxDQUFVLFFBQVYsRUFDQztJQUFBLEdBQUEsRUFBSyxTQUFDLENBQUQ7YUFDSixJQUFDLENBQUEsT0FBRCxHQUFXLENBQUMsQ0FBQyxLQUFGLENBQVEsQ0FBUixFQUFVLENBQUEsR0FBRSxJQUFDLENBQUEsV0FBYjtJQURQLENBQUw7SUFFQSxHQUFBLEVBQUssU0FBQTthQUNKLElBQUMsQ0FBQTtJQURHLENBRkw7R0FERDs7cUJBTUEsT0FBQSxHQUFTLFNBQUE7V0FDUixJQUFDLENBQUEsSUFBRDtFQURROztxQkFFVCxVQUFBLEdBQVksU0FBQTtXQUNYLElBQUMsQ0FBQSxJQUFELEdBQVE7RUFERzs7Ozs7O0FBR2IsTUFBTSxDQUFDLE9BQVAsR0FBcUIsSUFBQSxRQUFBLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiYW5ndWxhciA9IHJlcXVpcmUgJ2FuZ3VsYXInXG5kMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xue0NhcixUcmFmZmljLFNpZ25hbH0gPSByZXF1aXJlICcuL21vZGVscydcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLGVsKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHBhdXNlZDogdHJ1ZVxuXHRcdFx0dHJhZmZpYzogbmV3IFRyYWZmaWNcblx0XHRcdHBhbDogXy5yYW5nZSAwLFMucmwsUy5ybC8yNVxuXHRcdFx0Y2FyczogXy5yYW5nZSBTLm51bV9jYXJzXG5cdFx0XHRcdFx0Lm1hcCAobiktPiBcdG5ldyBDYXIoIFMuZGlzdGFuY2UgKyBfLnJhbmRvbSggLTgsNSkgKVxuXHRcdEBzY29wZS5TID0gU1xuXHRcdEBkYXlfc3RhcnQoKVxuXHRcdEBzY29wZS4kd2F0Y2ggJ1MubnVtX3NpZ25hbHMnLChuKT0+XG5cdFx0XHRAdHJhZmZpYy5jaGFuZ2Vfc2lnbmFscyBuXG5cblxuXHRyb3RhdG9yOiAoY2FyKS0+IFwicm90YXRlKCN7Uy5zY2FsZShjYXIubG9jKX0pIHRyYW5zbGF0ZSgwLDUwKVwiXG5cblx0ZGF5X3N0YXJ0OiAtPlxuXHRcdFMucmVzZXRfdGltZSgpXG5cdFx0QHBoeXNpY3MgPSB0cnVlICNwaHlzaWNzIHN0YWdlIGhhcHBlbmluZ1xuXHRcdEB0cmFmZmljLnJlc2V0IEBjYXJzXG5cdFx0Xy5pbnZva2UgQGNhcnMsICdhc3NpZ25fZXJyb3InXG5cdFx0QHRpY2soKVxuXG5cdGRheV9lbmQ6IC0+XG5cdFx0QHBoeXNpY3MgPSBmYWxzZSAjcGh5c2ljcyBzdGFnZSBub3QgaGFwcGVuaW5nXG5cdFx0Xy5pbnZva2UgQGNhcnMsICdldmFsX2Nvc3QnXG5cdFx0Xy5zYW1wbGUgQGNhcnMsIDI1XG5cdFx0XHQuZm9yRWFjaCAoZCktPiBkLmNob29zZSgpXG5cblx0XHRzZXRUaW1lb3V0ID0+IEBkYXlfc3RhcnQoKVxuXG5cdGNsaWNrOiAodmFsKSAtPiBpZiAhdmFsIHRoZW4gQHBsYXkoKVxuXHRwYXVzZTogLT4gQHBhdXNlZCA9IHRydWVcblx0dGljazogLT5cblx0XHRpZiBAcGh5c2ljc1xuXHRcdFx0ZDMudGltZXIgPT5cblx0XHRcdFx0XHRpZiBAdHJhZmZpYy5kb25lKClcblx0XHRcdFx0XHRcdEBkYXlfZW5kKClcblx0XHRcdFx0XHRcdHRydWVcblx0XHRcdFx0XHRTLmFkdmFuY2UoKVxuXHRcdFx0XHRcdEB0cmFmZmljLnVwZGF0ZSgpXG5cdFx0XHRcdFx0QHNjb3BlLiRldmFsQXN5bmMoKVxuXHRcdFx0XHRcdGlmICFAcGF1c2VkIHRoZW4gQHRpY2soKVxuXHRcdFx0XHRcdHRydWVcblx0XHRcdFx0LCBTLnBhY2VcblxuXHRzaWdfY29sOihncmVlbikgLT4gaWYgZ3JlZW4gdGhlbiAnIzRDQUY1MCcgZWxzZSAnI0Y0NDMzNidcblxuXHRwbGF5OiAtPlxuXHRcdEBwYXVzZSgpXG5cdFx0ZDMudGltZXIuZmx1c2goKVxuXHRcdEBwYXVzZWQgPSBmYWxzZVxuXHRcdEB0aWNrKClcblxudmlzRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IHt9XG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvdmlzLmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5sZWF2ZXIgPSAtPlxuXHRcdGFuaW1hdGUgPSBcblx0XHRcdGxlYXZlOiAoZWwpLT5cblx0XHRcdFx0ZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdFx0LnNlbGVjdCAncmVjdCdcblx0XHRcdFx0XHQudHJhbnNpdGlvbigpXG5cdFx0XHRcdFx0LmR1cmF0aW9uIDUwXG5cdFx0XHRcdFx0LmVhc2UgJ2N1YmljJ1xuXHRcdFx0XHRcdC5hdHRyICd0cmFuc2Zvcm0nLCdzY2FsZSgxLjIsMSknXG5cdFx0XHRcdFx0LmF0dHIgJ2ZpbGwnLCcjZWVlJ1xuXHRcdFx0XHRcdC50cmFuc2l0aW9uKClcblx0XHRcdFx0XHQuZHVyYXRpb24gMTUwXG5cdFx0XHRcdFx0LmVhc2UgJ2N1YmljJ1xuXHRcdFx0XHRcdC5hdHRyICd0cmFuc2Zvcm0nLCdzY2FsZSgwLDEpJ1xuXHRcdFx0ZW50ZXI6IChlbCktPlxuXHRcdFx0XHRkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0XHQuc2VsZWN0ICdyZWN0J1xuXHRcdFx0XHRcdC5hdHRyICd0cmFuc2Zvcm0nLCdzY2FsZSgwLC41KSdcblx0XHRcdFx0XHQudHJhbnNpdGlvbigpXG5cdFx0XHRcdFx0LmR1cmF0aW9uIDYwXG5cdFx0XHRcdFx0LmVhc2UgJ2N1YmljJ1xuXHRcdFx0XHRcdC5hdHRyICd0cmFuc2Zvcm0nLCdzY2FsZSgxLjIsMSknXG5cdFx0XHRcdFx0LnRyYW5zaXRpb24oKVxuXHRcdFx0XHRcdC5kdXJhdGlvbiAxNTBcblx0XHRcdFx0XHQuZWFzZSAnY3ViaWMnXG5cdFx0XHRcdFx0LmF0dHIgJ3RyYW5zZm9ybScsJ3NjYWxlKDEpJ1xuXG5hbmd1bGFyLm1vZHVsZSAnbWFpbkFwcCcgLCBbcmVxdWlyZSAnYW5ndWxhci1tYXRlcmlhbCcgLCByZXF1aXJlICdhbmd1bGFyLWFuaW1hdGUnXVxuXHQuZGlyZWN0aXZlICd2aXNEZXInLCB2aXNEZXJcblx0LmRpcmVjdGl2ZSAnZGF0dW0nLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvZGF0dW0nXG5cdC5kaXJlY3RpdmUgJ2QzRGVyJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL2QzRGVyJ1xuXHQuZGlyZWN0aXZlICdjdW1DaGFydCcsIHJlcXVpcmUgJy4vY3VtQ2hhcnQnXG5cdC5kaXJlY3RpdmUgJ21mZENoYXJ0JywgcmVxdWlyZSAnLi9tZmQnXG5cdC5kaXJlY3RpdmUgJ2hvckF4aXMnLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMveEF4aXMnXG5cdC5kaXJlY3RpdmUgJ3ZlckF4aXMnLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMveUF4aXMnXG5cdC5hbmltYXRpb24gJy5nLWNhcicsIGxlYXZlclxuXHQuZGlyZWN0aXZlICdzbGlkZXJEZXInLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvc2xpZGVyJ1xuIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLGVsKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHdpZHRoOiAzMDBcblx0XHRcdGhlaWdodDogMzAwXG5cdFx0XHRtOiBcblx0XHRcdFx0dDogMTBcblx0XHRcdFx0bDogNDBcblx0XHRcdFx0cjogMTVcblx0XHRcdFx0YjogMzVcblxuXHRcdEBob3IgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0XHQuZG9tYWluIFswLFMucnVzaF9sZW5ndGhdXG5cdFx0XHRcdC5yYW5nZSBbMCxAd2lkdGhdXG5cblx0XHRAdmVyID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsIFMubnVtX2NhcnNdXG5cdFx0XHQucmFuZ2UgW0BoZWlnaHQsIDBdXG5cblx0XHRAbGluZUVuID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQudGltZVxuXHRcdFx0LnkgKGQpPT5AdmVyIGQuY3VtRW5cblxuXHRcdEBsaW5lRXggPSBkMy5zdmcubGluZSgpXG5cdFx0XHQueCAoZCk9PkBob3IgZC50aW1lXG5cdFx0XHQueSAoZCk9PkB2ZXIgZC5jdW1FeFxuXG5cdFx0QGhvckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQGhvclxuXHRcdFx0Lm9yaWVudCAnYm90dG9tJ1xuXHRcdFx0LnRpY2tzIDhcblxuXG5cdFx0QHZlckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQHZlclxuXHRcdFx0Lm9yaWVudCAnbGVmdCdcblxuXG5cdGV4OiAtPlxuXHRcdEBsaW5lRXggQGN1bVxuXHRlbjogLT5cblx0XHRAbGluZUVuIEBjdW1cblx0XG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0c2NvcGU6IFxuXHRcdFx0Y3VtOiAnPSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC9jaGFydC5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuYW5ndWxhciA9IHJlcXVpcmUgJ2FuZ3VsYXInXG5cbmRlciA9ICgkcGFyc2UpLT4gI2dvZXMgb24gYSBzdmcgZWxlbWVudFxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZDNEZXI6ICc9J1xuXHRcdFx0dHJhbjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHR1ID0gJ3QtJyArIE1hdGgucmFuZG9tKClcblx0XHRcdGhhc1RyYW5zaXRpb25lZCA9IGZhbHNlXG5cdFx0XHRzY29wZS4kd2F0Y2ggJ2QzRGVyJ1xuXHRcdFx0XHQsICh2KS0+XG5cdFx0XHRcdFx0aWYgc2NvcGUudHJhbiBhbmQgaGFzVHJhbnNpdGlvbmVkXG5cdFx0XHRcdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSB0cnVlXG5cdFx0XHRcdFx0XHRzZWwudHJhbnNpdGlvbiB1XG5cdFx0XHRcdFx0XHRcdC5hdHRyIHZcblx0XHRcdFx0XHRcdFx0LmNhbGwgc2NvcGUudHJhblxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGhhc1RyYW5zaXRpb25lZCA9IHRydWVcblx0XHRcdFx0XHRcdHNlbC5hdHRyIHZcblx0XHRcdFx0LCB0cnVlXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsIm1vZHVsZS5leHBvcnRzID0gKCRwYXJzZSktPlxuXHQoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0ZDMuc2VsZWN0KGVsWzBdKS5kYXR1bSAkcGFyc2UoYXR0ci5kYXR1bSkoc2NvcGUpIiwiZGVyID0gLT5cblx0cmVzID0gXG5cdFx0c2NvcGU6IFxuXHRcdFx0bGFiZWw6ICdAJ1xuXHRcdFx0bXlEYXRhOiAnPSdcblx0XHRcdG1pbjogJz0nXG5cdFx0XHRtYXg6ICc9J1xuXHRcdFx0c3RlcDogJz0nXG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0cmVwbGFjZTogdHJ1ZVxuXHRcdGNvbnRyb2xsZXI6IC0+XG5cdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L3NsaWRlci5odG1sJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5cbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHJlc3RyaWN0OiAnQSdcblx0XHRzY29wZTogXG5cdFx0XHRmdW46ICc9J1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNjYWxlID0gc2NvcGUuZnVuLnNjYWxlKClcblxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5jbGFzc2VkICdob3IgYXhpcycsIHRydWVcblxuXHRcdFx0c2VsLmNhbGwgc2NvcGUuZnVuXG5cdFx0XHRcbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcblxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGZ1bjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2NhbGUgPSBzY29wZS5mdW4uc2NhbGUoKVxuXG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LmNsYXNzZWQgJ3ZlciBheGlzJywgdHJ1ZVxuXG5cdFx0XHRzZWwuY2FsbCBzY29wZS5mdW5cblx0XHRcdFxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCIndXNlIHN0cmljdCdcblxuRnVuY3Rpb246OnByb3BlcnR5ID0gKHByb3AsIGRlc2MpIC0+XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCBwcm9wLCBkZXNjIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLGVsKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHdpZHRoOiAzMDBcblx0XHRcdGhlaWdodDogMzAwXG5cdFx0XHRtOiBcblx0XHRcdFx0dDogMTBcblx0XHRcdFx0bDogNDBcblx0XHRcdFx0cjogMThcblx0XHRcdFx0YjogMzVcblxuXHRcdEBob3IgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0XHQuZG9tYWluIFswLFMubnVtX2NhcnMqLjhdXG5cdFx0XHRcdC5yYW5nZSBbMCxAd2lkdGhdXG5cblx0XHRAdmVyID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsIFMubnVtX2NhcnMqLjU1XVxuXHRcdFx0LnJhbmdlIFtAaGVpZ2h0LCAwXVxuXG5cdFx0QGxpbmUgPSBkMy5zdmcubGluZSgpXG5cdFx0XHQueCAoZCk9PkBob3IgZC5uXG5cdFx0XHQueSAoZCk9PkB2ZXIgZC5mXG5cblx0XHRAaG9yQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAaG9yXG5cdFx0XHQub3JpZW50ICdib3R0b20nXG5cdFx0XHQudGlja3MgOFxuXG5cdFx0QHZlckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQHZlclxuXHRcdFx0Lm9yaWVudCAnbGVmdCdcblxuXHRkOiAtPiBAbGluZSBAbWVtb3J5XG5cblx0XG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0c2NvcGU6IFxuXHRcdFx0bWVtb3J5OiAnPSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC9tZmRDaGFydC5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJTID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5cbmNsYXNzIFNpZ25hbFxuXHRjb25zdHJ1Y3RvcjogKEBsb2MpLT5cblx0XHRAZ3JlZW4gPSB0cnVlXG5cdFx0QGlkID0gXy51bmlxdWVJZCAnc2lnbmFsLSdcblx0XHRAcmVzZXQoKVxuXG5cdHJlc2V0OiAtPlxuXHRcdFtAY291bnQsIEBncmVlbl0gPSBbMCwgdHJ1ZV1cblxuXHR1cGRhdGU6IC0+XG5cdFx0QGNvdW50Kytcblx0XHRpZiBAY291bnQgPj0gUy5waGFzZVxuXHRcdFx0QHJlc2V0KClcblx0XHRcdHJldHVyblxuXHRcdGlmIEBjb3VudCA+PSBTLmdyZWVuKlMucGhhc2Vcblx0XHRcdEBncmVlbiA9IGZhbHNlXG5cblxuY2xhc3MgVHJhZmZpY1xuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAY2hhbmdlX3NpZ25hbHMgUy5udW1fc2lnbmFsc1xuXG5cdHJlc2V0Oih3YWl0aW5nKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHRyYXZlbGluZzogW11cblx0XHRcdGN1bTogW11cblx0XHRcdG1lbW9yeTogW11cblx0XHRcdGN1bUVuOiAwXG5cdFx0XHRjdW1FeDogMFxuXHRcdFx0d2FpdGluZzogXy5jbG9uZSggd2FpdGluZylcblxuXHRcdEBzaWduYWxzLmZvckVhY2ggKHMpLT5cblx0XHRcdHMucmVzZXQoKVxuXG5cdGNoYW5nZV9zaWduYWxzOiAobiktPlxuXHRcdEBzaWduYWxzID0gXy5yYW5nZSAwLFMucmwsIFMucmwvblxuXHRcdFx0XHQubWFwIChmKS0+IG5ldyBTaWduYWwgTWF0aC5mbG9vciBmXG5cblx0ZG9uZTogLT5cblx0XHQoQHdhaXRpbmcubGVuZ3RoK0B0cmF2ZWxpbmcubGVuZ3RoKT09MFxuXG5cdHJlbWVtYmVyOiAtPlxuXHRcdG1lbSA9IFxuXHRcdFx0bjogQHRyYXZlbGluZy5sZW5ndGhcblx0XHRcdHY6IDBcblx0XHRcdGY6IDBcblx0XHRAdHJhdmVsaW5nLmZvckVhY2ggKGQpLT5cblx0XHRcdGlmIGQuc3RvcHBlZCA9PSAwXG5cdFx0XHRcdG1lbS5mKytcblx0XHRcdFx0bWVtLnYrPSgxL21lbS5uKVxuXHRcdEBtZW1vcnkucHVzaCBtZW1cblxuXG5cdGxvZzogLT5cblx0XHRAY3VtLnB1c2hcblx0XHRcdHRpbWU6IFMudGltZVxuXHRcdFx0Y3VtRW46IEBjdW1FblxuXHRcdFx0Y3VtRXg6IEBjdW1FeFxuXG5cdHJlY2VpdmU6IChjYXIpLT5cblx0XHRAY3VtRW4rK1xuXHRcdGxvYyA9IF8ucmFuZG9tIDAsUy5ybFxuXHRcdGcwID0gMFxuXHRcdF8uZm9yRWFjaCBAdHJhdmVsaW5nLCAoYyktPlxuXHRcdFx0ZyA9IGMuZ2V0X2dhcCgpXG5cdFx0XHRpZiBnID49IGcwXG5cdFx0XHRcdGxvYyA9IE1hdGguZmxvb3IoYy5sb2MgKyBnLzIpJVMucmxcblx0XHRcdFx0ZzAgPSBnXG5cblx0XHRpZiAoZzAgPiAwIGFuZCBAdHJhdmVsaW5nLmxlbmd0aD4wKSBvciAoQHRyYXZlbGluZy5sZW5ndGg9PTApXG5cdFx0XHRfLnJlbW92ZSBAd2FpdGluZywgY2FyXG5cdFx0XHRjYXIuZW50ZXIgbG9jXG5cdFx0XHRAdHJhdmVsaW5nLnB1c2ggY2FyXG5cdFx0XHRAb3JkZXJfY2FycygpXG5cblx0cmVtb3ZlOiAoY2FyKS0+XG5cdFx0QGN1bUV4Kytcblx0XHRfLnJlbW92ZSBAdHJhdmVsaW5nLCBjYXJcblxuXHR1cGRhdGU6IC0+XG5cdFx0cmVkcyA9IFtdXG5cdFx0QHNpZ25hbHMuZm9yRWFjaCAocyktPlxuXHRcdFx0cy51cGRhdGUoKVxuXHRcdFx0aWYgIXMuZ3JlZW5cblx0XHRcdFx0cmVkcy5wdXNoIHMubG9jXG5cblx0XHRAd2FpdGluZy5mb3JFYWNoIChjYXIpPT5cblx0XHRcdGlmIF8ubHQgY2FyLnRfZW4sUy50aW1lIHRoZW4gQHJlY2VpdmUgY2FyXG5cdFx0QHRyYXZlbGluZy5mb3JFYWNoIChjYXIpPT5cblx0XHRcdGNhci5tb3ZlIHJlZHNcblx0XHRcdGlmIGNhci5leGl0ZWQgdGhlbiBAcmVtb3ZlIGNhclxuXG5cdFx0QGxvZygpXG5cdFx0aWYgKFMudGltZSVTLmZyZXF1ZW5jeT09MCkgdGhlbiBAcmVtZW1iZXIoKVxuXG5cdFx0QG9yZGVyX2NhcnMoKVxuXG5cdG9yZGVyX2NhcnM6IC0+XG5cdFx0aWYgKGwgPSBAdHJhdmVsaW5nLmxlbmd0aCkgPiAxXG5cdFx0XHRAdHJhdmVsaW5nLnNvcnQgKGEsYiktPiBhLmxvYyAtIGIubG9jXG5cdFx0XHRAdHJhdmVsaW5nLmZvckVhY2ggKGNhcixpLGspLT5cblx0XHRcdFx0Y2FyLnNldF9uZXh0IGtbKGkrMSklbF1cblx0XHRpZiBsID09IDFcblx0XHRcdEB0cmF2ZWxpbmdbMF0uc2V0X25leHQgbnVsbFxuXG5jbGFzcyBDYXJcblx0Y29uc3RydWN0b3I6KEBkaXN0YW5jZSktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRpZDogXy51bmlxdWVJZCgpXG5cdFx0XHRjb3N0MDogSW5maW5pdHkgXG5cdFx0XHR0YXJnZXQ6IF8ucmFuZG9tIDQsKFMucnVzaF9sZW5ndGggLSBTLmRpc3RhbmNlLTM1KVxuXHRcdFx0ZXhpdGVkOiBmYWxzZVxuXG5cdGFzc2lnbl9lcnJvcjotPiBcblx0XHRAdF9lbiA9IE1hdGgubWF4IDAsKEB0YXJnZXQgKyBfLnJhbmRvbSAtMiwyKVxuXG5cdCMgc2V0dGVyc1xuXHRzZXRfbmV4dDogKEBuZXh0KS0+XG5cblx0Z2V0X2dhcDotPlxuXHRcdGlmICFAbmV4dCB0aGVuIHJldHVybiBNYXRoLmZsb29yIFMucmwvMlxuXHRcdGdhcCA9IEBuZXh0LmxvYyAtIEBsb2Ncblx0XHRpZiBfLmx0ZSBnYXAsMCB0aGVuIChnYXArUy5ybCkgZWxzZSBnYXBcblxuXHRleGl0OiAtPlxuXHRcdFtAbmV4dCwgQHRfZXgsIEBleGl0ZWRdID0gW3VuZGVmaW5lZCwgUy50aW1lLCB0cnVlXVxuXG5cdGV2YWxfY29zdDogLT5cblx0XHRAc2QgPSBAdF9leCAtIFMud2lzaFxuXHRcdEBzcCA9IE1hdGgubWF4KCAtUy5iZXRhICogQHNkLCBTLmdhbW1hICogQHNkKVxuXHRcdEB0dCA9IEB0X2V4IC0gQHRfZW5cblx0XHRAY29zdCA9ICBAdHQrQHNwIFxuXG5cdGNob29zZTogLT5cblx0XHRpZiBfLmx0ZSBAY29zdCxAY29zdDAgdGhlbiBbQGNvc3QwLEB0YXJnZXRdID0gW0Bjb3N0LCBAdF9lbl1cblxuXHRlbnRlcjooQGxvYyktPlxuXHRcdEBkZXN0aW5hdGlvbiA9IE1hdGguZmxvb3IgKEBsb2MgKyBAZGlzdGFuY2UpJVMucmxcblx0XHQjIEBkZXN0aW5hdGlvbiA9IE1hdGguZmxvb3IgQGRlc3RpbmF0aW9uXG5cdFx0W0Bjb3N0MCwgQGV4aXRlZCwgQHN0b3BwZWQsIEBjb2xvcl0gPSBbQGNvc3QsZmFsc2UsMCwgUy5jb2xvcnMoQGRlc3RpbmF0aW9uKV1cblxuXHRtb3ZlOiAocmVkcyktPlxuXHRcdGlmIEBzdG9wcGVkID4gMCB0aGVuIEBzdG9wcGVkLS1cblx0XHRlbHNlXG5cdFx0XHRpZiBAbG9jID09IEBkZXN0aW5hdGlvblxuXHRcdFx0XHRAZXhpdCgpXG5cdFx0XHRlbHNlIFxuXHRcdFx0XHRuZXh0X2xvYyA9IChAbG9jICsgMSklUy5ybFxuXHRcdFx0XHRpZiAoQGdldF9nYXAoKSA+PSBTLnNwYWNlKSBhbmQgKG5leHRfbG9jIG5vdCBpbiByZWRzKVxuXHRcdFx0XHRcdEBsb2MgPSBuZXh0X2xvY1xuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0QHN0b3BwZWQgPSBTLnN0b3BwaW5nX3RpbWVcblxubW9kdWxlLmV4cG9ydHMgPSBcblx0Q2FyOiBDYXJcblx0VHJhZmZpYzogVHJhZmZpY1xuXHRTaWduYWw6IFNpZ25hbFxuIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5yZXF1aXJlICcuL2hlbHBlcnMnXG5cbmNsYXNzIFNldHRpbmdzXG5cdGNvbnN0cnVjdG9yOi0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdG51bV9jYXJzOiAyNTBcblx0XHRcdHRpbWU6IDBcblx0XHRcdHNwYWNlOiA1XG5cdFx0XHRwYWNlOiAyMFxuXHRcdFx0c3RvcHBpbmdfdGltZTogNlxuXHRcdFx0ZGlzdGFuY2U6IDYwXG5cdFx0XHRiZXRhOiAuNVxuXHRcdFx0Z2FtbWE6IDJcblx0XHRcdHJ1c2hfbGVuZ3RoOiAyNTBcblx0XHRcdGZyZXF1ZW5jeTogOFxuXHRcdFx0cmw6IDEwMDBcblx0XHRcdHBoYXNlOiA1MFxuXHRcdFx0Z3JlZW46IC41XG5cdFx0XHR3aXNoOiAxNTBcblx0XHRcdG51bV9zaWduYWxzOiAxMFxuXHRcdFx0ZGF5OiAwXG5cdFx0XHRvZmZzZXQ6IDBcblxuXHRcdEBjb2xvcnMgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBfLnJhbmdlIDAsQHJsLEBybC82XG5cdFx0XHQucmFuZ2UgW1xuXHRcdFx0XHQnI0Y0NDMzNicsICNyZWRcblx0XHRcdFx0JyMyMTk2RjMnLCAjYmx1ZVxuXHRcdFx0XHQnI0U5MUU2MycsICNwaW5rXG5cdFx0XHRcdCcjMDBCQ0Q0JywgI2N5YW5cblx0XHRcdFx0JyNGRkMxMDcnLCAjYW1iZXJcblx0XHRcdFx0JyM0Q0FGNTAnLCAjZ3JlZW5cblx0XHRcdFx0XVxuXG5cdFx0QHNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsQHJsXVxuXHRcdFx0LnJhbmdlIFswLDM2MF1cblxuXHRAcHJvcGVydHkgJ29mZnNldCcsXG5cdFx0c2V0OiAodiktPlxuXHRcdFx0QF9vZmZzZXQgPSBfLnJvdW5kIHYsMS9AbnVtX3NpZ25hbHNcblx0XHRnZXQ6IC0+XG5cdFx0XHRAX29mZnNldFxuXG5cdGFkdmFuY2U6IC0+XG5cdFx0QHRpbWUrK1xuXHRyZXNldF90aW1lOiAtPlxuXHRcdEB0aW1lID0gMFxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBTZXR0aW5ncygpIl19
