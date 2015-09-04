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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2FwcC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2N1bUNoYXJ0LmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9yaW5ncm9hZC9hcHAvZGlyZWN0aXZlcy9kM0Rlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2RpcmVjdGl2ZXMvZGF0dW0uY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3Jpbmdyb2FkL2FwcC9kaXJlY3RpdmVzL3NsaWRlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2RpcmVjdGl2ZXMveEF4aXMuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3Jpbmdyb2FkL2FwcC9kaXJlY3RpdmVzL3lBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9yaW5ncm9hZC9hcHAvaGVscGVycy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL21mZC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL21vZGVscy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL3NldHRpbmdzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUE7O0FBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7QUFDTCxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0FBQ0osQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSOztBQUNKLE1BQXVCLE9BQUEsQ0FBUSxVQUFSLENBQXZCLEVBQUMs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QU0sRUFOTjtNQU9BLEtBQUEsRUFBTyxDQVBQO01BUUEsV0FBQSxFQUFhLEdBUmI7TUFTQSxTQUFBLEVBQVcsQ0FUWDtNQVVBLEVBQUEsRUFBSSxJQVZKO01BV0EsS0FBQSxFQUFPLEVBWFA7TUFZQSxLQUFBLEVBQU8sRUFaUDtNQWFBLElBQUEsRUFBTSxHQWJOO01BY0EsV0FBQSxFQUFhLEVBZGI7TUFlQSxHQUFBLEVBQUssQ0FmTDtNQWdCQSxNQUFBLEVBQVEsQ0FoQlI7S0FERDtJQW1CQSxJQUFDLENBQUEsTUFBRCxHQUFVLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBVCxDQUFBLENBQ1QsQ0FBQyxNQURRLENBQ0QsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxDQUFSLEVBQVUsSUFBQyxDQUFBLEVBQVgsRUFBYyxJQUFDLENBQUEsRUFBRCxHQUFJLENBQWxCLENBREMsQ0FFVCxDQUFDLEtBRlEsQ0FFRixDQUNOLFNBRE0sRUFFTixTQUZNLEVBR04sU0FITSxFQUlOLFNBSk0sRUFLTixTQUxNLEVBTU4sU0FOTSxDQUZFO0lBV1YsSUFBQyxDQUFBLEtBQUQsR0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQVQsQ0FBQSxDQUNSLENBQUMsTUFETyxDQUNBLENBQUMsQ0FBRCxFQUFHLElBQUMsQ0FBQSxFQUFKLENBREEsQ0FFUixDQUFDLEtBRk8sQ0FFRCxDQUFDLENBQUQsRUFBRyxHQUFILENBRkM7RUEvQkU7O3FCQTBDWixPQUFBLEdBQVMsU0FBQTtXQUNSLElBQUMsQ0FBQSxJQUFEO0VBRFE7O3FCQUVULFVBQUEsR0FBWSxTQUFBO1dBQ1gsSUFBQyxDQUFBLElBQUQsR0FBUTtFQURHOzs7Ozs7QUFHYixNQUFNLENBQUMsT0FBUCxHQUFxQixJQUFBLFFBQUEsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJhbmd1bGFyID0gcmVxdWlyZSAnYW5ndWxhcidcbmQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG57Q2FyLFRyYWZmaWMsU2lnbmFsfSA9IHJlcXVpcmUgJy4vbW9kZWxzJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsZWwpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0cGF1c2VkOiB0cnVlXG5cdFx0XHR0cmFmZmljOiBuZXcgVHJhZmZpY1xuXHRcdFx0cGFsOiBfLnJhbmdlIDAsUy5ybCxTLnJsLzI1XG5cdFx0XHRjYXJzOiBfLnJhbmdlIFMubnVtX2NhcnNcblx0XHRcdFx0XHQubWFwIChuKS0+IFx0bmV3IENhciggUy5kaXN0YW5jZSArIF8ucmFuZG9tKCAtOCw1KSApXG5cdFx0QHNjb3BlLlMgPSBTXG5cdFx0QGRheV9zdGFydCgpXG5cdFx0QHNjb3BlLiR3YXRjaCAnUy5udW1fc2lnbmFscycsKG4pPT5cblx0XHRcdFMub2Zmc2V0ID0gTWF0aC5yb3VuZChTLm9mZnNldCpuKS9uXG5cdFx0XHRAdHJhZmZpYy5jaGFuZ2Vfc2lnbmFscyBuXG5cblx0Y2hhbmdlcjogKHYpLT5cblx0XHRAdHJhZmZpYy5zaWduYWxzLmZvckVhY2ggKHMpLT5cblx0XHRcdHMucmVzZXRfb2Zmc2V0KClcblxuXHRcdCMgQHRyYWZmaWMuY2hhbmdlX3NpZ25hbHMgUy5udW1fc2lnbmFsc1xuXG5cdHJvdGF0b3I6IChjYXIpLT4gXCJyb3RhdGUoI3tTLnNjYWxlKGNhci5sb2MpfSkgdHJhbnNsYXRlKDAsNTApXCJcblxuXHRkYXlfc3RhcnQ6IC0+XG5cdFx0Uy5yZXNldF90aW1lKClcblx0XHRAcGh5c2ljcyA9IHRydWUgI3BoeXNpY3Mgc3RhZ2UgaGFwcGVuaW5nXG5cdFx0QHRyYWZmaWMucmVzZXQgQGNhcnNcblx0XHRfLmludm9rZSBAY2FycywgJ2Fzc2lnbl9lcnJvcidcblx0XHRAdGljaygpXG5cblx0ZGF5X2VuZDogLT5cblx0XHRAcGh5c2ljcyA9IGZhbHNlICNwaHlzaWNzIHN0YWdlIG5vdCBoYXBwZW5pbmdcblx0XHRfLmludm9rZSBAY2FycywgJ2V2YWxfY29zdCdcblx0XHRfLnNhbXBsZSBAY2FycywgMjVcblx0XHRcdC5mb3JFYWNoIChkKS0+IGQuY2hvb3NlKClcblxuXHRcdHNldFRpbWVvdXQgPT4gQGRheV9zdGFydCgpXG5cblx0Y2xpY2s6ICh2YWwpIC0+IGlmICF2YWwgdGhlbiBAcGxheSgpXG5cdHBhdXNlOiAtPiBAcGF1c2VkID0gdHJ1ZVxuXHR0aWNrOiAtPlxuXHRcdGlmIEBwaHlzaWNzXG5cdFx0XHRkMy50aW1lciA9PlxuXHRcdFx0XHRcdGlmIEB0cmFmZmljLmRvbmUoKVxuXHRcdFx0XHRcdFx0QGRheV9lbmQoKVxuXHRcdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHRcdFMuYWR2YW5jZSgpXG5cdFx0XHRcdFx0QHRyYWZmaWMudXBkYXRlKClcblx0XHRcdFx0XHRAc2NvcGUuJGV2YWxBc3luYygpXG5cdFx0XHRcdFx0aWYgIUBwYXVzZWQgdGhlbiBAdGljaygpXG5cdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHQsIFMucGFjZVxuXG5cdHNpZ19jb2w6KGdyZWVuKSAtPiBpZiBncmVlbiB0aGVuICcjNENBRjUwJyBlbHNlICcjRjQ0MzM2J1xuXG5cdHBsYXk6IC0+XG5cdFx0QHBhdXNlKClcblx0XHRkMy50aW1lci5mbHVzaCgpXG5cdFx0QHBhdXNlZCA9IGZhbHNlXG5cdFx0QHRpY2soKVxuXG52aXNEZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRzY29wZToge31cblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC92aXMuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbmxlYXZlciA9IC0+XG5cdFx0YW5pbWF0ZSA9IFxuXHRcdFx0bGVhdmU6IChlbCktPlxuXHRcdFx0XHRkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0XHQuc2VsZWN0ICdyZWN0J1xuXHRcdFx0XHRcdC50cmFuc2l0aW9uKClcblx0XHRcdFx0XHQuZHVyYXRpb24gNTBcblx0XHRcdFx0XHQuZWFzZSAnY3ViaWMnXG5cdFx0XHRcdFx0LmF0dHIgJ3RyYW5zZm9ybScsJ3NjYWxlKDEuMiwxKSdcblx0XHRcdFx0XHQuYXR0ciAnZmlsbCcsJyNlZWUnXG5cdFx0XHRcdFx0LnRyYW5zaXRpb24oKVxuXHRcdFx0XHRcdC5kdXJhdGlvbiAxNTBcblx0XHRcdFx0XHQuZWFzZSAnY3ViaWMnXG5cdFx0XHRcdFx0LmF0dHIgJ3RyYW5zZm9ybScsJ3NjYWxlKDAsMSknXG5cdFx0XHRlbnRlcjogKGVsKS0+XG5cdFx0XHRcdGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHRcdC5zZWxlY3QgJ3JlY3QnXG5cdFx0XHRcdFx0LmF0dHIgJ3RyYW5zZm9ybScsJ3NjYWxlKDAsLjUpJ1xuXHRcdFx0XHRcdC50cmFuc2l0aW9uKClcblx0XHRcdFx0XHQuZHVyYXRpb24gNjBcblx0XHRcdFx0XHQuZWFzZSAnY3ViaWMnXG5cdFx0XHRcdFx0LmF0dHIgJ3RyYW5zZm9ybScsJ3NjYWxlKDEuMiwxKSdcblx0XHRcdFx0XHQudHJhbnNpdGlvbigpXG5cdFx0XHRcdFx0LmR1cmF0aW9uIDE1MFxuXHRcdFx0XHRcdC5lYXNlICdjdWJpYydcblx0XHRcdFx0XHQuYXR0ciAndHJhbnNmb3JtJywnc2NhbGUoMSknXG5cbmFuZ3VsYXIubW9kdWxlICdtYWluQXBwJyAsIFtyZXF1aXJlICdhbmd1bGFyLW1hdGVyaWFsJyAsIHJlcXVpcmUgJ2FuZ3VsYXItYW5pbWF0ZSddXG5cdC5kaXJlY3RpdmUgJ3Zpc0RlcicsIHZpc0RlclxuXHQuZGlyZWN0aXZlICdkYXR1bScsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9kYXR1bSdcblx0LmRpcmVjdGl2ZSAnZDNEZXInLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvZDNEZXInXG5cdC5kaXJlY3RpdmUgJ2N1bUNoYXJ0JywgcmVxdWlyZSAnLi9jdW1DaGFydCdcblx0LmRpcmVjdGl2ZSAnbWZkQ2hhcnQnLCByZXF1aXJlICcuL21mZCdcblx0LmRpcmVjdGl2ZSAnaG9yQXhpcycsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy94QXhpcydcblx0LmRpcmVjdGl2ZSAndmVyQXhpcycsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy95QXhpcydcblx0LmFuaW1hdGlvbiAnLmctY2FyJywgbGVhdmVyXG5cdC5kaXJlY3RpdmUgJ3NsaWRlckRlcicsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9zbGlkZXInXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsZWwpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0d2lkdGg6IDMwMFxuXHRcdFx0aGVpZ2h0OiAzMDBcblx0XHRcdG06IFxuXHRcdFx0XHR0OiAxMFxuXHRcdFx0XHRsOiA0MFxuXHRcdFx0XHRyOiAxNVxuXHRcdFx0XHRiOiAzNVxuXG5cdFx0QGhvciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHRcdC5kb21haW4gWzAsUy5ydXNoX2xlbmd0aF1cblx0XHRcdFx0LnJhbmdlIFswLEB3aWR0aF1cblxuXHRcdEB2ZXIgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCwgUy5udW1fY2Fyc11cblx0XHRcdC5yYW5nZSBbQGhlaWdodCwgMF1cblxuXHRcdEBsaW5lRW4gPSBkMy5zdmcubGluZSgpXG5cdFx0XHQueCAoZCk9PkBob3IgZC50aW1lXG5cdFx0XHQueSAoZCk9PkB2ZXIgZC5jdW1FblxuXG5cdFx0QGxpbmVFeCA9IGQzLnN2Zy5saW5lKClcblx0XHRcdC54IChkKT0+QGhvciBkLnRpbWVcblx0XHRcdC55IChkKT0+QHZlciBkLmN1bUV4XG5cblx0XHRAaG9yQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAaG9yXG5cdFx0XHQub3JpZW50ICdib3R0b20nXG5cdFx0XHQudGlja3MgOFxuXG5cblx0XHRAdmVyQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAdmVyXG5cdFx0XHQub3JpZW50ICdsZWZ0J1xuXG5cblx0ZXg6IC0+XG5cdFx0QGxpbmVFeCBAY3VtXG5cdGVuOiAtPlxuXHRcdEBsaW5lRW4gQGN1bVxuXHRcbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWVcblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHRzY29wZTogXG5cdFx0XHRjdW06ICc9J1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L2NoYXJ0Lmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5hbmd1bGFyID0gcmVxdWlyZSAnYW5ndWxhcidcblxuZGVyID0gKCRwYXJzZSktPiAjZ29lcyBvbiBhIHN2ZyBlbGVtZW50XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHJlc3RyaWN0OiAnQSdcblx0XHRzY29wZTogXG5cdFx0XHRkM0RlcjogJz0nXG5cdFx0XHR0cmFuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdHUgPSAndC0nICsgTWF0aC5yYW5kb20oKVxuXHRcdFx0aGFzVHJhbnNpdGlvbmVkID0gZmFsc2Vcblx0XHRcdHNjb3BlLiR3YXRjaCAnZDNEZXInXG5cdFx0XHRcdCwgKHYpLT5cblx0XHRcdFx0XHRpZiBzY29wZS50cmFuIGFuZCBoYXNUcmFuc2l0aW9uZWRcblx0XHRcdFx0XHRcdGhhc1RyYW5zaXRpb25lZCA9IHRydWVcblx0XHRcdFx0XHRcdHNlbC50cmFuc2l0aW9uIHVcblx0XHRcdFx0XHRcdFx0LmF0dHIgdlxuXHRcdFx0XHRcdFx0XHQuY2FsbCBzY29wZS50cmFuXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0aGFzVHJhbnNpdGlvbmVkID0gdHJ1ZVxuXHRcdFx0XHRcdFx0c2VsLmF0dHIgdlxuXHRcdFx0XHQsIHRydWVcbm1vZHVsZS5leHBvcnRzID0gZGVyIiwibW9kdWxlLmV4cG9ydHMgPSAoJHBhcnNlKS0+XG5cdChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRkMy5zZWxlY3QoZWxbMF0pLmRhdHVtICRwYXJzZShhdHRyLmRhdHVtKShzY29wZSkiLCJkZXIgPSAtPlxuXHRyZXMgPSBcblx0XHRzY29wZTogXG5cdFx0XHRsYWJlbDogJ0AnXG5cdFx0XHRteURhdGE6ICc9J1xuXHRcdFx0bWluOiAnPSdcblx0XHRcdG1heDogJz0nXG5cdFx0XHRzdGVwOiAnPSdcblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHRyZXBsYWNlOiB0cnVlXG5cdFx0Y29udHJvbGxlcjogLT5cblx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3Qvc2xpZGVyLmh0bWwnXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcblxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGZ1bjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2NhbGUgPSBzY29wZS5mdW4uc2NhbGUoKVxuXG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LmNsYXNzZWQgJ2hvciBheGlzJywgdHJ1ZVxuXG5cdFx0XHRzZWwuY2FsbCBzY29wZS5mdW5cblx0XHRcdFxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZnVuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzY2FsZSA9IHNjb3BlLmZ1bi5zY2FsZSgpXG5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuY2xhc3NlZCAndmVyIGF4aXMnLCB0cnVlXG5cblx0XHRcdHNlbC5jYWxsIHNjb3BlLmZ1blxuXHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsIid1c2Ugc3RyaWN0J1xuXG5GdW5jdGlvbjo6cHJvcGVydHkgPSAocHJvcCwgZGVzYykgLT5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsIHByb3AsIGRlc2MiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsZWwpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0d2lkdGg6IDMwMFxuXHRcdFx0aGVpZ2h0OiAzMDBcblx0XHRcdG06IFxuXHRcdFx0XHR0OiAxMFxuXHRcdFx0XHRsOiA0MFxuXHRcdFx0XHRyOiAxOFxuXHRcdFx0XHRiOiAzNVxuXG5cdFx0QGhvciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHRcdC5kb21haW4gWzAsUy5udW1fY2FycyouOF1cblx0XHRcdFx0LnJhbmdlIFswLEB3aWR0aF1cblxuXHRcdEB2ZXIgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCwgUy5udW1fY2FycyouNTVdXG5cdFx0XHQucmFuZ2UgW0BoZWlnaHQsIDBdXG5cblx0XHRAbGluZSA9IGQzLnN2Zy5saW5lKClcblx0XHRcdC54IChkKT0+QGhvciBkLm5cblx0XHRcdC55IChkKT0+QHZlciBkLmZcblxuXHRcdEBob3JBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEBob3Jcblx0XHRcdC5vcmllbnQgJ2JvdHRvbSdcblx0XHRcdC50aWNrcyA4XG5cblx0XHRAdmVyQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAdmVyXG5cdFx0XHQub3JpZW50ICdsZWZ0J1xuXG5cdGQ6IC0+IEBsaW5lIEBtZW1vcnlcblxuXHRcbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWVcblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHRzY29wZTogXG5cdFx0XHRtZW1vcnk6ICc9J1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L21mZENoYXJ0Lmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsIlMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbnJlcXVpcmUgJy4vaGVscGVycydcblxuY2xhc3MgU2lnbmFsXG5cdGNvbnN0cnVjdG9yOiAoQGksQGxvYyktPlxuXHRcdEBncmVlbiA9IHRydWVcblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdzaWduYWwtJ1xuXHRcdEByZXNldF9vZmZzZXQoKVxuXG5cdEBwcm9wZXJ0eSAnb2Zmc2V0JywgXG5cdFx0Z2V0OiAtPiBcblx0XHRcdFMucGhhc2UqKChAaSpTLm9mZnNldCklMSlcblxuXHRyZXNldF9vZmZzZXQ6IC0+XG5cdFx0W0Bjb3VudCwgQGdyZWVuXSA9IFtAb2Zmc2V0LCB0cnVlXVxuXG5cdHVwZGF0ZTogLT5cblx0XHRAY291bnQrK1xuXHRcdGlmIChAY291bnQpID49IChTLnBoYXNlKVxuXHRcdFx0W0Bjb3VudCwgQGdyZWVuXSA9IFswLCB0cnVlXVxuXHRcdFx0cmV0dXJuXG5cdFx0aWYgKEBjb3VudCk+PSAoUy5ncmVlbipTLnBoYXNlKVxuXHRcdFx0QGdyZWVuID0gZmFsc2VcblxuY2xhc3MgVHJhZmZpY1xuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAY2hhbmdlX3NpZ25hbHMgUy5udW1fc2lnbmFsc1xuXG5cdHJlc2V0Oih3YWl0aW5nKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHRyYXZlbGluZzogW11cblx0XHRcdGN1bTogW11cblx0XHRcdG1lbW9yeTogW11cblx0XHRcdGN1bUVuOiAwXG5cdFx0XHRjdW1FeDogMFxuXHRcdFx0d2FpdGluZzogXy5jbG9uZSggd2FpdGluZylcblxuXHRcdEBzaWduYWxzLmZvckVhY2ggKHMpLT5cblx0XHRcdHMucmVzZXRfb2Zmc2V0KClcblxuXHRjaGFuZ2Vfc2lnbmFsczogKG4pLT5cblx0XHRAc2lnbmFscyA9IF8ucmFuZ2UgMCxTLnJsLCBTLnJsL25cblx0XHRcdFx0Lm1hcCAoZixpKS0+IG5ldyBTaWduYWwoaSxNYXRoLmZsb29yKGYpKVxuXG5cdGRvbmU6IC0+XG5cdFx0KEB3YWl0aW5nLmxlbmd0aCtAdHJhdmVsaW5nLmxlbmd0aCk9PTBcblxuXHRyZW1lbWJlcjogLT5cblx0XHRtZW0gPSBcblx0XHRcdG46IEB0cmF2ZWxpbmcubGVuZ3RoXG5cdFx0XHR2OiAwXG5cdFx0XHRmOiAwXG5cdFx0QHRyYXZlbGluZy5mb3JFYWNoIChkKS0+XG5cdFx0XHRpZiBkLnN0b3BwZWQgPT0gMFxuXHRcdFx0XHRtZW0uZisrXG5cdFx0XHRcdG1lbS52Kz0oMS9tZW0ubilcblx0XHRAbWVtb3J5LnB1c2ggbWVtXG5cblxuXHRsb2c6IC0+XG5cdFx0QGN1bS5wdXNoXG5cdFx0XHR0aW1lOiBTLnRpbWVcblx0XHRcdGN1bUVuOiBAY3VtRW5cblx0XHRcdGN1bUV4OiBAY3VtRXhcblxuXHRyZWNlaXZlOiAoY2FyKS0+XG5cdFx0QGN1bUVuKytcblx0XHRsb2MgPSBfLnJhbmRvbSAwLFMucmxcblx0XHRnMCA9IDBcblx0XHRfLmZvckVhY2ggQHRyYXZlbGluZywgKGMpLT5cblx0XHRcdGcgPSBjLmdldF9nYXAoKVxuXHRcdFx0aWYgZyA+PSBnMFxuXHRcdFx0XHRsb2MgPSBNYXRoLmZsb29yKGMubG9jICsgZy8yKSVTLnJsXG5cdFx0XHRcdGcwID0gZ1xuXG5cdFx0aWYgKGcwID4gMCBhbmQgQHRyYXZlbGluZy5sZW5ndGg+MCkgb3IgKEB0cmF2ZWxpbmcubGVuZ3RoPT0wKVxuXHRcdFx0Xy5yZW1vdmUgQHdhaXRpbmcsIGNhclxuXHRcdFx0Y2FyLmVudGVyIGxvY1xuXHRcdFx0QHRyYXZlbGluZy5wdXNoIGNhclxuXHRcdFx0QG9yZGVyX2NhcnMoKVxuXG5cdHJlbW92ZTogKGNhciktPlxuXHRcdEBjdW1FeCsrXG5cdFx0Xy5yZW1vdmUgQHRyYXZlbGluZywgY2FyXG5cblx0dXBkYXRlOiAtPlxuXHRcdHJlZHMgPSBbXVxuXHRcdEBzaWduYWxzLmZvckVhY2ggKHMpLT5cblx0XHRcdHMudXBkYXRlKClcblx0XHRcdGlmICFzLmdyZWVuXG5cdFx0XHRcdHJlZHMucHVzaCBzLmxvY1xuXG5cdFx0QHdhaXRpbmcuZm9yRWFjaCAoY2FyKT0+XG5cdFx0XHRpZiBfLmx0IGNhci50X2VuLFMudGltZSB0aGVuIEByZWNlaXZlIGNhclxuXHRcdEB0cmF2ZWxpbmcuZm9yRWFjaCAoY2FyKT0+XG5cdFx0XHRjYXIubW92ZSByZWRzXG5cdFx0XHRpZiBjYXIuZXhpdGVkIHRoZW4gQHJlbW92ZSBjYXJcblxuXHRcdEBsb2coKVxuXHRcdGlmIChTLnRpbWUlUy5mcmVxdWVuY3k9PTApIHRoZW4gQHJlbWVtYmVyKClcblxuXHRcdEBvcmRlcl9jYXJzKClcblxuXHRvcmRlcl9jYXJzOiAtPlxuXHRcdGlmIChsID0gQHRyYXZlbGluZy5sZW5ndGgpID4gMVxuXHRcdFx0QHRyYXZlbGluZy5zb3J0IChhLGIpLT4gYS5sb2MgLSBiLmxvY1xuXHRcdFx0QHRyYXZlbGluZy5mb3JFYWNoIChjYXIsaSxrKS0+XG5cdFx0XHRcdGNhci5zZXRfbmV4dCBrWyhpKzEpJWxdXG5cdFx0aWYgbCA9PSAxXG5cdFx0XHRAdHJhdmVsaW5nWzBdLnNldF9uZXh0IG51bGxcblxuY2xhc3MgQ2FyXG5cdGNvbnN0cnVjdG9yOihAZGlzdGFuY2UpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0aWQ6IF8udW5pcXVlSWQoKVxuXHRcdFx0Y29zdDA6IEluZmluaXR5IFxuXHRcdFx0dGFyZ2V0OiBfLnJhbmRvbSA0LChTLnJ1c2hfbGVuZ3RoIC0gUy5kaXN0YW5jZS0zNSlcblx0XHRcdGV4aXRlZDogZmFsc2VcblxuXHRhc3NpZ25fZXJyb3I6LT4gXG5cdFx0QHRfZW4gPSBNYXRoLm1heCAwLChAdGFyZ2V0ICsgXy5yYW5kb20gLTIsMilcblxuXHQjIHNldHRlcnNcblx0c2V0X25leHQ6IChAbmV4dCktPlxuXG5cdGdldF9nYXA6LT5cblx0XHRpZiAhQG5leHQgdGhlbiByZXR1cm4gTWF0aC5mbG9vciBTLnJsLzJcblx0XHRnYXAgPSBAbmV4dC5sb2MgLSBAbG9jXG5cdFx0aWYgXy5sdGUgZ2FwLDAgdGhlbiAoZ2FwK1MucmwpIGVsc2UgZ2FwXG5cblx0ZXhpdDogLT5cblx0XHRbQG5leHQsIEB0X2V4LCBAZXhpdGVkXSA9IFt1bmRlZmluZWQsIFMudGltZSwgdHJ1ZV1cblxuXHRldmFsX2Nvc3Q6IC0+XG5cdFx0QHNkID0gQHRfZXggLSBTLndpc2hcblx0XHRAc3AgPSBNYXRoLm1heCggLVMuYmV0YSAqIEBzZCwgUy5nYW1tYSAqIEBzZClcblx0XHRAdHQgPSBAdF9leCAtIEB0X2VuXG5cdFx0QGNvc3QgPSAgQHR0K0BzcCBcblxuXHRjaG9vc2U6IC0+XG5cdFx0aWYgXy5sdGUgQGNvc3QsQGNvc3QwIHRoZW4gW0Bjb3N0MCxAdGFyZ2V0XSA9IFtAY29zdCwgQHRfZW5dXG5cblx0ZW50ZXI6KEBsb2MpLT5cblx0XHRAZGVzdGluYXRpb24gPSBNYXRoLmZsb29yIChAbG9jICsgQGRpc3RhbmNlKSVTLnJsXG5cdFx0IyBAZGVzdGluYXRpb24gPSBNYXRoLmZsb29yIEBkZXN0aW5hdGlvblxuXHRcdFtAY29zdDAsIEBleGl0ZWQsIEBzdG9wcGVkLCBAY29sb3JdID0gW0Bjb3N0LGZhbHNlLDAsIFMuY29sb3JzKEBkZXN0aW5hdGlvbildXG5cblx0bW92ZTogKHJlZHMpLT5cblx0XHRpZiBAc3RvcHBlZCA+IDAgdGhlbiBAc3RvcHBlZC0tXG5cdFx0ZWxzZVxuXHRcdFx0aWYgQGxvYyA9PSBAZGVzdGluYXRpb25cblx0XHRcdFx0QGV4aXQoKVxuXHRcdFx0ZWxzZSBcblx0XHRcdFx0bmV4dF9sb2MgPSAoQGxvYyArIDEpJVMucmxcblx0XHRcdFx0aWYgKEBnZXRfZ2FwKCkgPj0gUy5zcGFjZSkgYW5kIChuZXh0X2xvYyBub3QgaW4gcmVkcylcblx0XHRcdFx0XHRAbG9jID0gbmV4dF9sb2Ncblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdEBzdG9wcGVkID0gUy5zdG9wcGluZ190aW1lXG5cbm1vZHVsZS5leHBvcnRzID0gXG5cdENhcjogQ2FyXG5cdFRyYWZmaWM6IFRyYWZmaWNcblx0U2lnbmFsOiBTaWduYWxcbiIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xucmVxdWlyZSAnLi9oZWxwZXJzJ1xuXG5jbGFzcyBTZXR0aW5nc1xuXHRjb25zdHJ1Y3RvcjotPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRudW1fY2FyczogMjUwXG5cdFx0XHR0aW1lOiAwXG5cdFx0XHRzcGFjZTogNVxuXHRcdFx0cGFjZTogMjBcblx0XHRcdHN0b3BwaW5nX3RpbWU6IDZcblx0XHRcdGRpc3RhbmNlOiA2MFxuXHRcdFx0YmV0YTogLjVcblx0XHRcdGdhbW1hOiAyXG5cdFx0XHRydXNoX2xlbmd0aDogMjUwXG5cdFx0XHRmcmVxdWVuY3k6IDhcblx0XHRcdHJsOiAxMDAwXG5cdFx0XHRwaGFzZTogNTBcblx0XHRcdGdyZWVuOiAuNVxuXHRcdFx0d2lzaDogMTUwXG5cdFx0XHRudW1fc2lnbmFsczogMTBcblx0XHRcdGRheTogMFxuXHRcdFx0b2Zmc2V0OiAwXG5cblx0XHRAY29sb3JzID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gXy5yYW5nZSAwLEBybCxAcmwvNlxuXHRcdFx0LnJhbmdlIFtcblx0XHRcdFx0JyNGNDQzMzYnLCAjcmVkXG5cdFx0XHRcdCcjMjE5NkYzJywgI2JsdWVcblx0XHRcdFx0JyNFOTFFNjMnLCAjcGlua1xuXHRcdFx0XHQnIzAwQkNENCcsICNjeWFuXG5cdFx0XHRcdCcjRkZDMTA3JywgI2FtYmVyXG5cdFx0XHRcdCcjNENBRjUwJywgI2dyZWVuXG5cdFx0XHRcdF1cblxuXHRcdEBzY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLEBybF1cblx0XHRcdC5yYW5nZSBbMCwzNjBdXG5cblx0IyBAcHJvcGVydHkgJ251bV9zaWduYWxzJyxcblx0IyBcdGdldDogLT5cblx0IyBcdFx0QF9udW1fc2lnbmFsc1xuXHQjIFx0c2V0OiAodiktPlxuXHQjIFx0XHRAb2Zmc2V0ID0gTWF0aC5yb3VuZChAb2Zmc2V0KnYpL3Zcblx0IyBcdFx0QF9udW1fc2lnbmFscyA9IHZcblxuXHRhZHZhbmNlOiAtPlxuXHRcdEB0aW1lKytcblx0cmVzZXRfdGltZTogLT5cblx0XHRAdGltZSA9IDBcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU2V0dGluZ3MoKSJdfQ==
