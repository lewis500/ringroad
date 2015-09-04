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
        S.offset = Math.round(S.offset * n) / n;
        return _this.traffic.change_signals(n);
      };
    })(this));
  }

  Ctrl.prototype.changer = function(v) {
    return this.traffic.signals.forEach(function(s) {
      return s.reset_offset();
    });
  };

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

angular.module('mainApp', [require('angular-material', require('angular-animate'))]).directive('visDer', visDer).directive('datum', require('./directives/datum')).directive('d3Der', require('./directives/d3Der')).directive('cumChart', require('./cumChart')).directive('mfdChart', require('./mfd')).directive('horAxis', require('./directives/xAxis')).directive('verAxis', require('./directives/yAxis')).directive('sliderDer', require('./directives/slider'));



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

require('./helpers');

Signal = (function() {
  function Signal(i1, loc1) {
    this.i = i1;
    this.loc = loc1;
    this.green = true;
    this.id = _.uniqueId('signal-');
    this.reset_offset();
  }

  Signal.property('offset', {
    get: function() {
      return S.phase * ((this.i * S.offset) % 1);
    }
  });

  Signal.prototype.reset_offset = function() {
    var ref;
    return ref = [this.offset, true], this.count = ref[0], this.green = ref[1], ref;
  };

  Signal.prototype.update = function() {
    var ref;
    this.count++;
    if (this.count >= S.phase) {
      ref = [0, true], this.count = ref[0], this.green = ref[1];
      return;
    }
    if (this.count >= (S.green * S.phase)) {
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
      return s.reset_offset();
    });
  };

  Traffic.prototype.change_signals = function(n) {
    return this.signals = _.range(0, S.rl, S.rl / n).map(function(f, i) {
      return new Signal(i, Math.floor(f));
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



},{"./helpers":8,"./settings":11,"lodash":undefined}],11:[function(require,module,exports){
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
      pace: 15,
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

  Settings.prototype.advance = function() {
    return this.time++;
  };

  Settings.prototype.reset_time = function() {
    this.day++;
    return this.time = 0;
  };

  return Settings;

})();

module.exports = new Settings();



},{"./helpers":8,"d3":undefined,"lodash":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2FwcC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2N1bUNoYXJ0LmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9yaW5ncm9hZC9hcHAvZGlyZWN0aXZlcy9kM0Rlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2RpcmVjdGl2ZXMvZGF0dW0uY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3Jpbmdyb2FkL2FwcC9kaXJlY3RpdmVzL3NsaWRlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2RpcmVjdGl2ZXMveEF4aXMuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3Jpbmdyb2FkL2FwcC9kaXJlY3RpdmVzL3lBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9yaW5ncm9hZC9hcHAvaGVscGVycy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL21mZC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL21vZGVscy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL3NldHRpbmdzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUE7O0FBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7QUFDTCxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0FBQ0osQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSOztBQUNKLE1BQXVCLE9BQUEsQ0FBUSxVQUFSLENBQXZCLEVBQUMs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LEVBQU8sRUFaUDtNQWFBLElBQUEsRUFBTSxHQWJOO01BY0EsV0FBQSxFQUFhLEVBZGI7TUFlQSxHQUFBLEVBQUssQ0FmTDtNQWdCQSxNQUFBLEVBQVEsQ0FoQlI7S0FERDtJQW1CQSxJQUFDLENBQUEsTUFBRCxHQUFVLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBVCxDQUFBLENBQ1QsQ0FBQyxNQURRLENBQ0QsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxDQUFSLEVBQVUsSUFBQyxDQUFBLEVBQVgsRUFBYyxJQUFDLENBQUEsRUFBRCxHQUFJLENBQWxCLENBREMsQ0FFVCxDQUFDLEtBRlEsQ0FFRixDQUNOLFNBRE0sRUFFTixTQUZNLEVBR04sU0FITSxFQUlOLFNBSk0sRUFLTixTQUxNLEVBTU4sU0FOTSxDQUZFO0lBV1YsSUFBQyxDQUFBLEtBQUQsR0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQVQsQ0FBQSxDQUNSLENBQUMsTUFETyxDQUNBLENBQUMsQ0FBRCxFQUFHLElBQUMsQ0FBQSxFQUFKLENBREEsQ0FFUixDQUFDLEtBRk8sQ0FFRCxDQUFDLENBQUQsRUFBRyxHQUFILENBRkM7RUEvQkU7O3FCQW1DWixPQUFBLEdBQVMsU0FBQTtXQUNSLElBQUMsQ0FBQSxJQUFEO0VBRFE7O3FCQUVULFVBQUEsR0FBWSxTQUFBO0lBQ1gsSUFBQyxDQUFBLEdBQUQ7V0FDQSxJQUFDLENBQUEsSUFBRCxHQUFRO0VBRkc7Ozs7OztBQUliLE1BQU0sQ0FBQyxPQUFQLEdBQXFCLElBQUEsUUFBQSxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcbntDYXIsVHJhZmZpYyxTaWduYWx9ID0gcmVxdWlyZSAnLi9tb2RlbHMnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxlbCktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRwYXVzZWQ6IHRydWVcblx0XHRcdHRyYWZmaWM6IG5ldyBUcmFmZmljXG5cdFx0XHRwYWw6IF8ucmFuZ2UgMCxTLnJsLFMucmwvMjVcblx0XHRcdGNhcnM6IF8ucmFuZ2UgUy5udW1fY2Fyc1xuXHRcdFx0XHRcdC5tYXAgKG4pLT4gXHRuZXcgQ2FyKCBTLmRpc3RhbmNlICsgXy5yYW5kb20oIC04LDUpIClcblx0XHRAc2NvcGUuUyA9IFNcblx0XHRAZGF5X3N0YXJ0KClcblx0XHRAc2NvcGUuJHdhdGNoICdTLm51bV9zaWduYWxzJywobik9PlxuXHRcdFx0Uy5vZmZzZXQgPSBNYXRoLnJvdW5kKFMub2Zmc2V0Km4pL25cblx0XHRcdEB0cmFmZmljLmNoYW5nZV9zaWduYWxzIG5cblxuXHRjaGFuZ2VyOiAodiktPlxuXHRcdEB0cmFmZmljLnNpZ25hbHMuZm9yRWFjaCAocyktPlxuXHRcdFx0cy5yZXNldF9vZmZzZXQoKVxuXG5cdFx0IyBAdHJhZmZpYy5jaGFuZ2Vfc2lnbmFscyBTLm51bV9zaWduYWxzXG5cblx0cm90YXRvcjogKGNhciktPiBcInJvdGF0ZSgje1Muc2NhbGUoY2FyLmxvYyl9KSB0cmFuc2xhdGUoMCw1MClcIlxuXG5cdGRheV9zdGFydDogLT5cblx0XHRTLnJlc2V0X3RpbWUoKVxuXHRcdEBwaHlzaWNzID0gdHJ1ZSAjcGh5c2ljcyBzdGFnZSBoYXBwZW5pbmdcblx0XHRAdHJhZmZpYy5yZXNldCBAY2Fyc1xuXHRcdF8uaW52b2tlIEBjYXJzLCAnYXNzaWduX2Vycm9yJ1xuXHRcdEB0aWNrKClcblxuXHRkYXlfZW5kOiAtPlxuXHRcdEBwaHlzaWNzID0gZmFsc2UgI3BoeXNpY3Mgc3RhZ2Ugbm90IGhhcHBlbmluZ1xuXHRcdF8uaW52b2tlIEBjYXJzLCAnZXZhbF9jb3N0J1xuXHRcdF8uc2FtcGxlIEBjYXJzLCAyNVxuXHRcdFx0LmZvckVhY2ggKGQpLT4gZC5jaG9vc2UoKVxuXG5cdFx0c2V0VGltZW91dCA9PiBAZGF5X3N0YXJ0KClcblxuXHRjbGljazogKHZhbCkgLT4gaWYgIXZhbCB0aGVuIEBwbGF5KClcblx0cGF1c2U6IC0+IEBwYXVzZWQgPSB0cnVlXG5cdHRpY2s6IC0+XG5cdFx0aWYgQHBoeXNpY3Ncblx0XHRcdGQzLnRpbWVyID0+XG5cdFx0XHRcdFx0aWYgQHRyYWZmaWMuZG9uZSgpXG5cdFx0XHRcdFx0XHRAZGF5X2VuZCgpXG5cdFx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdFx0Uy5hZHZhbmNlKClcblx0XHRcdFx0XHRAdHJhZmZpYy51cGRhdGUoKVxuXHRcdFx0XHRcdEBzY29wZS4kZXZhbEFzeW5jKClcblx0XHRcdFx0XHRpZiAhQHBhdXNlZCB0aGVuIEB0aWNrKClcblx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdCwgUy5wYWNlXG5cblx0cGxheTogLT5cblx0XHRAcGF1c2UoKVxuXHRcdGQzLnRpbWVyLmZsdXNoKClcblx0XHRAcGF1c2VkID0gZmFsc2Vcblx0XHRAdGljaygpXG5cbnZpc0RlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHNjb3BlOiB7fVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L3Zpcy5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxubGVhdmVyID0gLT5cblx0YW5pbWF0ZSA9IFxuXHRcdGxlYXZlOiAoZWwpLT5cblx0XHRcdGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuc2VsZWN0ICdyZWN0J1xuXHRcdFx0XHQudHJhbnNpdGlvbigpXG5cdFx0XHRcdC5kdXJhdGlvbiA1MFxuXHRcdFx0XHQuZWFzZSAnY3ViaWMnXG5cdFx0XHRcdC5hdHRyICd0cmFuc2Zvcm0nLCdzY2FsZSgxLjIsMSknXG5cdFx0XHRcdC5hdHRyICdmaWxsJywnI2VlZSdcblx0XHRcdFx0LnRyYW5zaXRpb24oKVxuXHRcdFx0XHQuZHVyYXRpb24gMTUwXG5cdFx0XHRcdC5lYXNlICdjdWJpYydcblx0XHRcdFx0LmF0dHIgJ3RyYW5zZm9ybScsJ3NjYWxlKDAsMSknXG5cdFx0ZW50ZXI6IChlbCktPlxuXHRcdFx0ZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5zZWxlY3QgJ3JlY3QnXG5cdFx0XHRcdC5hdHRyICd0cmFuc2Zvcm0nLCdzY2FsZSgwLC41KSdcblx0XHRcdFx0LnRyYW5zaXRpb24oKVxuXHRcdFx0XHQuZHVyYXRpb24gNjBcblx0XHRcdFx0LmVhc2UgJ2N1YmljJ1xuXHRcdFx0XHQuYXR0ciAndHJhbnNmb3JtJywnc2NhbGUoMS4yLDEpJ1xuXHRcdFx0XHQudHJhbnNpdGlvbigpXG5cdFx0XHRcdC5kdXJhdGlvbiAxNTBcblx0XHRcdFx0LmVhc2UgJ2N1YmljJ1xuXHRcdFx0XHQuYXR0ciAndHJhbnNmb3JtJywnc2NhbGUoMSknXG5cbmFuZ3VsYXIubW9kdWxlICdtYWluQXBwJyAsIFtyZXF1aXJlICdhbmd1bGFyLW1hdGVyaWFsJyAsIHJlcXVpcmUgJ2FuZ3VsYXItYW5pbWF0ZSddXG5cdC5kaXJlY3RpdmUgJ3Zpc0RlcicsIHZpc0RlclxuXHQuZGlyZWN0aXZlICdkYXR1bScsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9kYXR1bSdcblx0LmRpcmVjdGl2ZSAnZDNEZXInLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvZDNEZXInXG5cdC5kaXJlY3RpdmUgJ2N1bUNoYXJ0JywgcmVxdWlyZSAnLi9jdW1DaGFydCdcblx0LmRpcmVjdGl2ZSAnbWZkQ2hhcnQnLCByZXF1aXJlICcuL21mZCdcblx0LmRpcmVjdGl2ZSAnaG9yQXhpcycsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy94QXhpcydcblx0LmRpcmVjdGl2ZSAndmVyQXhpcycsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy95QXhpcydcblx0IyAuYW5pbWF0aW9uICcuc2lnbmFsJywgc2lnbmFsQW5cblx0IyAuYW5pbWF0aW9uICcuZy1jYXInLCBsZWF2ZXJcblx0LmRpcmVjdGl2ZSAnc2xpZGVyRGVyJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3NsaWRlcidcbiIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxlbCktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHR3aWR0aDogMzAwXG5cdFx0XHRoZWlnaHQ6IDMwMFxuXHRcdFx0bTogXG5cdFx0XHRcdHQ6IDEwXG5cdFx0XHRcdGw6IDQwXG5cdFx0XHRcdHI6IDE1XG5cdFx0XHRcdGI6IDM1XG5cblx0XHRAaG9yID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdFx0LmRvbWFpbiBbMCxTLnJ1c2hfbGVuZ3RoXVxuXHRcdFx0XHQucmFuZ2UgWzAsQHdpZHRoXVxuXG5cdFx0QHZlciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLCBTLm51bV9jYXJzXVxuXHRcdFx0LnJhbmdlIFtAaGVpZ2h0LCAwXVxuXG5cdFx0QGxpbmVFbiA9IGQzLnN2Zy5saW5lKClcblx0XHRcdC54IChkKT0+QGhvciBkLnRpbWVcblx0XHRcdC55IChkKT0+QHZlciBkLmN1bUVuXG5cblx0XHRAbGluZUV4ID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQudGltZVxuXHRcdFx0LnkgKGQpPT5AdmVyIGQuY3VtRXhcblxuXHRcdEBob3JBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEBob3Jcblx0XHRcdC5vcmllbnQgJ2JvdHRvbSdcblx0XHRcdC50aWNrcyA4XG5cblxuXHRcdEB2ZXJBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEB2ZXJcblx0XHRcdC5vcmllbnQgJ2xlZnQnXG5cblxuXHRleDogLT5cblx0XHRAbGluZUV4IEBjdW1cblx0ZW46IC0+XG5cdFx0QGxpbmVFbiBAY3VtXG5cdFxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGN1bTogJz0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvY2hhcnQuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcbmFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuXG5kZXIgPSAoJHBhcnNlKS0+ICNnb2VzIG9uIGEgc3ZnIGVsZW1lbnRcblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGQzRGVyOiAnPSdcblx0XHRcdHRyYW46ICc9J1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0dSA9ICd0LScgKyBNYXRoLnJhbmRvbSgpXG5cdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSBmYWxzZVxuXHRcdFx0c2NvcGUuJHdhdGNoICdkM0Rlcidcblx0XHRcdFx0LCAodiktPlxuXHRcdFx0XHRcdGlmIHNjb3BlLnRyYW4gYW5kIGhhc1RyYW5zaXRpb25lZFxuXHRcdFx0XHRcdFx0aGFzVHJhbnNpdGlvbmVkID0gdHJ1ZVxuXHRcdFx0XHRcdFx0c2VsLnRyYW5zaXRpb24gdVxuXHRcdFx0XHRcdFx0XHQuYXR0ciB2XG5cdFx0XHRcdFx0XHRcdC5jYWxsIHNjb3BlLnRyYW5cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSB0cnVlXG5cdFx0XHRcdFx0XHRzZWwuYXR0ciB2XG5cdFx0XHRcdCwgdHJ1ZVxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJtb2R1bGUuZXhwb3J0cyA9ICgkcGFyc2UpLT5cblx0KHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdGQzLnNlbGVjdChlbFswXSkuZGF0dW0gJHBhcnNlKGF0dHIuZGF0dW0pKHNjb3BlKSIsImRlciA9IC0+XG5cdHJlcyA9IFxuXHRcdHNjb3BlOiBcblx0XHRcdGxhYmVsOiAnQCdcblx0XHRcdG15RGF0YTogJz0nXG5cdFx0XHRtaW46ICc9J1xuXHRcdFx0bWF4OiAnPSdcblx0XHRcdHN0ZXA6ICc9J1xuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHJlcGxhY2U6IHRydWVcblx0XHRjb250cm9sbGVyOiAtPlxuXHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWVcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC9zbGlkZXIuaHRtbCdcblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZnVuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzY2FsZSA9IHNjb3BlLmZ1bi5zY2FsZSgpXG5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuY2xhc3NlZCAnaG9yIGF4aXMnLCB0cnVlXG5cblx0XHRcdHNlbC5jYWxsIHNjb3BlLmZ1blxuXHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5cbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHJlc3RyaWN0OiAnQSdcblx0XHRzY29wZTogXG5cdFx0XHRmdW46ICc9J1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNjYWxlID0gc2NvcGUuZnVuLnNjYWxlKClcblxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5jbGFzc2VkICd2ZXIgYXhpcycsIHRydWVcblxuXHRcdFx0c2VsLmNhbGwgc2NvcGUuZnVuXG5cdFx0XHRcbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiJ3VzZSBzdHJpY3QnXG5cbkZ1bmN0aW9uOjpwcm9wZXJ0eSA9IChwcm9wLCBkZXNjKSAtPlxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgcHJvcCwgZGVzYyIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxlbCktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHR3aWR0aDogMzAwXG5cdFx0XHRoZWlnaHQ6IDMwMFxuXHRcdFx0bTogXG5cdFx0XHRcdHQ6IDEwXG5cdFx0XHRcdGw6IDQwXG5cdFx0XHRcdHI6IDE4XG5cdFx0XHRcdGI6IDM1XG5cblx0XHRAaG9yID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdFx0LmRvbWFpbiBbMCxTLm51bV9jYXJzKi44XVxuXHRcdFx0XHQucmFuZ2UgWzAsQHdpZHRoXVxuXG5cdFx0QHZlciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLCBTLm51bV9jYXJzKi41NV1cblx0XHRcdC5yYW5nZSBbQGhlaWdodCwgMF1cblxuXHRcdEBsaW5lID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQublxuXHRcdFx0LnkgKGQpPT5AdmVyIGQuZlxuXG5cdFx0QGhvckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQGhvclxuXHRcdFx0Lm9yaWVudCAnYm90dG9tJ1xuXHRcdFx0LnRpY2tzIDhcblxuXHRcdEB2ZXJBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEB2ZXJcblx0XHRcdC5vcmllbnQgJ2xlZnQnXG5cblx0ZDogLT4gQGxpbmUgQG1lbW9yeVxuXG5cdFxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHNjb3BlOiBcblx0XHRcdG1lbW9yeTogJz0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvbWZkQ2hhcnQuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xucmVxdWlyZSAnLi9oZWxwZXJzJ1xuXG5jbGFzcyBTaWduYWxcblx0Y29uc3RydWN0b3I6IChAaSxAbG9jKS0+XG5cdFx0QGdyZWVuID0gdHJ1ZVxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ3NpZ25hbC0nXG5cdFx0QHJlc2V0X29mZnNldCgpXG5cblx0QHByb3BlcnR5ICdvZmZzZXQnLCBcblx0XHRnZXQ6IC0+IFxuXHRcdFx0Uy5waGFzZSooKEBpKlMub2Zmc2V0KSUxKVxuXG5cdHJlc2V0X29mZnNldDogLT5cblx0XHRbQGNvdW50LCBAZ3JlZW5dID0gW0BvZmZzZXQsIHRydWVdXG5cblx0dXBkYXRlOiAtPlxuXHRcdEBjb3VudCsrXG5cdFx0aWYgKEBjb3VudCkgPj0gKFMucGhhc2UpXG5cdFx0XHRbQGNvdW50LCBAZ3JlZW5dID0gWzAsIHRydWVdXG5cdFx0XHRyZXR1cm5cblx0XHRpZiAoQGNvdW50KT49IChTLmdyZWVuKlMucGhhc2UpXG5cdFx0XHRAZ3JlZW4gPSBmYWxzZVxuXG5jbGFzcyBUcmFmZmljXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBjaGFuZ2Vfc2lnbmFscyBTLm51bV9zaWduYWxzXG5cblx0cmVzZXQ6KHdhaXRpbmcpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0dHJhdmVsaW5nOiBbXVxuXHRcdFx0Y3VtOiBbXVxuXHRcdFx0bWVtb3J5OiBbXVxuXHRcdFx0Y3VtRW46IDBcblx0XHRcdGN1bUV4OiAwXG5cdFx0XHR3YWl0aW5nOiBfLmNsb25lKCB3YWl0aW5nKVxuXG5cdFx0QHNpZ25hbHMuZm9yRWFjaCAocyktPlxuXHRcdFx0cy5yZXNldF9vZmZzZXQoKVxuXG5cdGNoYW5nZV9zaWduYWxzOiAobiktPlxuXHRcdEBzaWduYWxzID0gXy5yYW5nZSAwLFMucmwsIFMucmwvblxuXHRcdFx0XHQubWFwIChmLGkpLT4gbmV3IFNpZ25hbChpLE1hdGguZmxvb3IoZikpXG5cblx0ZG9uZTogLT5cblx0XHQoQHdhaXRpbmcubGVuZ3RoK0B0cmF2ZWxpbmcubGVuZ3RoKT09MFxuXG5cdHJlbWVtYmVyOiAtPlxuXHRcdG1lbSA9IFxuXHRcdFx0bjogQHRyYXZlbGluZy5sZW5ndGhcblx0XHRcdHY6IDBcblx0XHRcdGY6IDBcblx0XHRAdHJhdmVsaW5nLmZvckVhY2ggKGQpLT5cblx0XHRcdGlmIGQuc3RvcHBlZCA9PSAwXG5cdFx0XHRcdG1lbS5mKytcblx0XHRcdFx0bWVtLnYrPSgxL21lbS5uKVxuXHRcdEBtZW1vcnkucHVzaCBtZW1cblxuXG5cdGxvZzogLT5cblx0XHRAY3VtLnB1c2hcblx0XHRcdHRpbWU6IFMudGltZVxuXHRcdFx0Y3VtRW46IEBjdW1FblxuXHRcdFx0Y3VtRXg6IEBjdW1FeFxuXG5cdHJlY2VpdmU6IChjYXIpLT5cblx0XHRAY3VtRW4rK1xuXHRcdGxvYyA9IF8ucmFuZG9tIDAsUy5ybFxuXHRcdGcwID0gMFxuXHRcdF8uZm9yRWFjaCBAdHJhdmVsaW5nLCAoYyktPlxuXHRcdFx0ZyA9IGMuZ2V0X2dhcCgpXG5cdFx0XHRpZiBnID49IGcwXG5cdFx0XHRcdGxvYyA9IE1hdGguZmxvb3IoYy5sb2MgKyBnLzIpJVMucmxcblx0XHRcdFx0ZzAgPSBnXG5cblx0XHRpZiAoZzAgPiAwIGFuZCBAdHJhdmVsaW5nLmxlbmd0aD4wKSBvciAoQHRyYXZlbGluZy5sZW5ndGg9PTApXG5cdFx0XHRfLnJlbW92ZSBAd2FpdGluZywgY2FyXG5cdFx0XHRjYXIuZW50ZXIgbG9jXG5cdFx0XHRAdHJhdmVsaW5nLnB1c2ggY2FyXG5cdFx0XHRAb3JkZXJfY2FycygpXG5cblx0cmVtb3ZlOiAoY2FyKS0+XG5cdFx0QGN1bUV4Kytcblx0XHRfLnJlbW92ZSBAdHJhdmVsaW5nLCBjYXJcblxuXHR1cGRhdGU6IC0+XG5cdFx0cmVkcyA9IFtdXG5cdFx0QHNpZ25hbHMuZm9yRWFjaCAocyktPlxuXHRcdFx0cy51cGRhdGUoKVxuXHRcdFx0aWYgIXMuZ3JlZW5cblx0XHRcdFx0cmVkcy5wdXNoIHMubG9jXG5cblx0XHRAd2FpdGluZy5mb3JFYWNoIChjYXIpPT5cblx0XHRcdGlmIF8ubHQgY2FyLnRfZW4sUy50aW1lIHRoZW4gQHJlY2VpdmUgY2FyXG5cdFx0QHRyYXZlbGluZy5mb3JFYWNoIChjYXIpPT5cblx0XHRcdGNhci5tb3ZlIHJlZHNcblx0XHRcdGlmIGNhci5leGl0ZWQgdGhlbiBAcmVtb3ZlIGNhclxuXG5cdFx0QGxvZygpXG5cdFx0aWYgKFMudGltZSVTLmZyZXF1ZW5jeT09MCkgdGhlbiBAcmVtZW1iZXIoKVxuXG5cdFx0QG9yZGVyX2NhcnMoKVxuXG5cdG9yZGVyX2NhcnM6IC0+XG5cdFx0aWYgKGwgPSBAdHJhdmVsaW5nLmxlbmd0aCkgPiAxXG5cdFx0XHRAdHJhdmVsaW5nLnNvcnQgKGEsYiktPiBhLmxvYyAtIGIubG9jXG5cdFx0XHRAdHJhdmVsaW5nLmZvckVhY2ggKGNhcixpLGspLT5cblx0XHRcdFx0Y2FyLnNldF9uZXh0IGtbKGkrMSklbF1cblx0XHRpZiBsID09IDFcblx0XHRcdEB0cmF2ZWxpbmdbMF0uc2V0X25leHQgbnVsbFxuXG5jbGFzcyBDYXJcblx0Y29uc3RydWN0b3I6KEBkaXN0YW5jZSktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRpZDogXy51bmlxdWVJZCgpXG5cdFx0XHRjb3N0MDogSW5maW5pdHkgXG5cdFx0XHR0YXJnZXQ6IF8ucmFuZG9tIDQsKFMucnVzaF9sZW5ndGggLSBTLmRpc3RhbmNlLTM1KVxuXHRcdFx0ZXhpdGVkOiBmYWxzZVxuXG5cdGFzc2lnbl9lcnJvcjotPiBcblx0XHRAdF9lbiA9IE1hdGgubWF4IDAsKEB0YXJnZXQgKyBfLnJhbmRvbSAtMiwyKVxuXG5cdCMgc2V0dGVyc1xuXHRzZXRfbmV4dDogKEBuZXh0KS0+XG5cblx0Z2V0X2dhcDotPlxuXHRcdGlmICFAbmV4dCB0aGVuIHJldHVybiBNYXRoLmZsb29yIFMucmwvMlxuXHRcdGdhcCA9IEBuZXh0LmxvYyAtIEBsb2Ncblx0XHRpZiBfLmx0ZSBnYXAsMCB0aGVuIChnYXArUy5ybCkgZWxzZSBnYXBcblxuXHRleGl0OiAtPlxuXHRcdFtAbmV4dCwgQHRfZXgsIEBleGl0ZWRdID0gW3VuZGVmaW5lZCwgUy50aW1lLCB0cnVlXVxuXG5cdGV2YWxfY29zdDogLT5cblx0XHRAc2QgPSBAdF9leCAtIFMud2lzaFxuXHRcdEBzcCA9IE1hdGgubWF4KCAtUy5iZXRhICogQHNkLCBTLmdhbW1hICogQHNkKVxuXHRcdEB0dCA9IEB0X2V4IC0gQHRfZW5cblx0XHRAY29zdCA9ICBAdHQrQHNwIFxuXG5cdGNob29zZTogLT5cblx0XHRpZiBfLmx0ZSBAY29zdCxAY29zdDAgdGhlbiBbQGNvc3QwLEB0YXJnZXRdID0gW0Bjb3N0LCBAdF9lbl1cblxuXHRlbnRlcjooQGxvYyktPlxuXHRcdEBkZXN0aW5hdGlvbiA9IE1hdGguZmxvb3IgKEBsb2MgKyBAZGlzdGFuY2UpJVMucmxcblx0XHQjIEBkZXN0aW5hdGlvbiA9IE1hdGguZmxvb3IgQGRlc3RpbmF0aW9uXG5cdFx0W0Bjb3N0MCwgQGV4aXRlZCwgQHN0b3BwZWQsIEBjb2xvcl0gPSBbQGNvc3QsZmFsc2UsMCwgUy5jb2xvcnMoQGRlc3RpbmF0aW9uKV1cblxuXHRtb3ZlOiAocmVkcyktPlxuXHRcdGlmIEBzdG9wcGVkID4gMCB0aGVuIEBzdG9wcGVkLS1cblx0XHRlbHNlXG5cdFx0XHRpZiBAbG9jID09IEBkZXN0aW5hdGlvblxuXHRcdFx0XHRAZXhpdCgpXG5cdFx0XHRlbHNlIFxuXHRcdFx0XHRuZXh0X2xvYyA9IChAbG9jICsgMSklUy5ybFxuXHRcdFx0XHRpZiAoQGdldF9nYXAoKSA+PSBTLnNwYWNlKSBhbmQgKG5leHRfbG9jIG5vdCBpbiByZWRzKVxuXHRcdFx0XHRcdEBsb2MgPSBuZXh0X2xvY1xuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0QHN0b3BwZWQgPSBTLnN0b3BwaW5nX3RpbWVcblxubW9kdWxlLmV4cG9ydHMgPSBcblx0Q2FyOiBDYXJcblx0VHJhZmZpYzogVHJhZmZpY1xuXHRTaWduYWw6IFNpZ25hbFxuIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5yZXF1aXJlICcuL2hlbHBlcnMnXG5cbmNsYXNzIFNldHRpbmdzXG5cdGNvbnN0cnVjdG9yOi0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdG51bV9jYXJzOiAyNTBcblx0XHRcdHRpbWU6IDBcblx0XHRcdHNwYWNlOiA1XG5cdFx0XHRwYWNlOiAxNVxuXHRcdFx0c3RvcHBpbmdfdGltZTogNlxuXHRcdFx0ZGlzdGFuY2U6IDYwXG5cdFx0XHRiZXRhOiAuNVxuXHRcdFx0Z2FtbWE6IDJcblx0XHRcdHJ1c2hfbGVuZ3RoOiAyNTBcblx0XHRcdGZyZXF1ZW5jeTogOFxuXHRcdFx0cmw6IDEwMDBcblx0XHRcdHBoYXNlOiA1MFxuXHRcdFx0Z3JlZW46IC41XG5cdFx0XHR3aXNoOiAxNTBcblx0XHRcdG51bV9zaWduYWxzOiAxMFxuXHRcdFx0ZGF5OiAwXG5cdFx0XHRvZmZzZXQ6IDBcblxuXHRcdEBjb2xvcnMgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBfLnJhbmdlIDAsQHJsLEBybC82XG5cdFx0XHQucmFuZ2UgW1xuXHRcdFx0XHQnI0Y0NDMzNicsICNyZWRcblx0XHRcdFx0JyMyMTk2RjMnLCAjYmx1ZVxuXHRcdFx0XHQnI0U5MUU2MycsICNwaW5rXG5cdFx0XHRcdCcjMDBCQ0Q0JywgI2N5YW5cblx0XHRcdFx0JyNGRkMxMDcnLCAjYW1iZXJcblx0XHRcdFx0JyM0Q0FGNTAnLCAjZ3JlZW5cblx0XHRcdFx0XVxuXG5cdFx0QHNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsQHJsXVxuXHRcdFx0LnJhbmdlIFswLDM2MF1cblxuXHRhZHZhbmNlOiAtPlxuXHRcdEB0aW1lKytcblx0cmVzZXRfdGltZTogLT5cblx0XHRAZGF5Kytcblx0XHRAdGltZSA9IDBcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU2V0dGluZ3MoKSJdfQ==
