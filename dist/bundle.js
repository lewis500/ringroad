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
    _.sample(this.cars, 200).forEach(function(d) {
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
      d3.timer((function(_this) {
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
      d3.timer((function(_this) {
        return function() {
          if (_this.traffic.done()) {
            true;
          }
          S.advance();
          _this.traffic.update();
          return true;
        };
      })(this), S.pace);
      d3.timer((function(_this) {
        return function() {
          if (_this.traffic.done()) {
            true;
          }
          S.advance();
          _this.traffic.update();
          return true;
        };
      })(this), S.pace);
      return d3.timer((function(_this) {
        return function() {
          if (_this.traffic.done()) {
            true;
          }
          S.advance();
          _this.traffic.update();
          return true;
        };
      })(this), S.pace);
    }
  };

  Ctrl.prototype.play = function() {
    this.pause();
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
    this.hor = d3.scale.linear().domain([0, S.rush_length + 120]).range([0, this.width]);
    this.ver = d3.scale.linear().domain([0, 2]).range([this.height, 0]);
    this.lineEn = d3.svg.line().x((function(_this) {
      return function(d) {
        return _this.hor(d.time);
      };
    })(this)).y((function(_this) {
      return function(d) {
        return _this.ver(d.en);
      };
    })(this));
    this.lineEx = d3.svg.line().x((function(_this) {
      return function(d) {
        return _this.hor(d.time);
      };
    })(this)).y((function(_this) {
      return function(d) {
        return _this.ver(d.ex);
      };
    })(this));
    this.horAxis = d3.svg.axis().scale(this.hor).orient('bottom').ticks(8);
    this.verAxis = d3.svg.axis().scale(this.ver).orient('left');
  }

  Ctrl.prototype.ex = function() {
    return this.lineEx(this.rate);
  };

  Ctrl.prototype.en = function() {
    return this.lineEn(this.rate);
  };

  return Ctrl;

})();

der = function() {
  var directive;
  return directive = {
    bindToController: true,
    controllerAs: 'vm',
    scope: {
      rate: '='
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
var Car, S, Signal, Traffic, _, n,
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
      rate: [],
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
    var c;
    c = {
      time: S.time,
      cumEn: this.cumEn,
      cumEx: this.cumEx
    };
    if (this.cum.length > 40) {
      this.rate.push({
        time: S.time - 20,
        en: (this.cumEn - this.cum[this.cum.length - 40].cumEn) / 40,
        ex: (this.cumEx - this.cum[this.cum.length - 40].cumEx) / 40
      });
    }
    return this.cum.push(c);
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

n = 0;

Car = (function() {
  function Car(distance) {
    this.distance = distance;
    _.assign(this, {
      id: _.uniqueId(),
      cost0: Infinity,
      target: _.random(2, S.rush_length),
      exited: false
    });
  }

  Car.prototype.assign_error = function() {
    return this.t_en = Math.max(0, this.target + _.random(-3, 3));
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
    if (_.lt(this.cost, this.cost0)) {
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
      num_cars: 600,
      time: 0,
      space: 3,
      pace: 1,
      stopping_time: 6,
      distance: 60,
      beta: .5,
      gamma: 2,
      rush_length: 550,
      frequency: 8,
      rl: 1000,
      phase: 25,
      green: .5,
      wish: 325,
      num_signals: 50,
      day: 0,
      offset: .3
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2FwcC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2N1bUNoYXJ0LmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9yaW5ncm9hZC9hcHAvZGlyZWN0aXZlcy9kM0Rlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2RpcmVjdGl2ZXMvZGF0dW0uY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3Jpbmdyb2FkL2FwcC9kaXJlY3RpdmVzL3NsaWRlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2RpcmVjdGl2ZXMveEF4aXMuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3Jpbmdyb2FkL2FwcC9kaXJlY3RpdmVzL3lBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9yaW5ncm9hZC9hcHAvaGVscGVycy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL21mZC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL21vZGVscy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL3NldHRpbmdzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUE7O0FBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7QUFDTCxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0FBQ0osQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSOztBQUNKLE1BQXVCLE9BQUEsQ0FBUSxVQUFSLENBQXZCLEVBQUMs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ZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcbntDYXIsVHJhZmZpYyxTaWduYWx9ID0gcmVxdWlyZSAnLi9tb2RlbHMnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxlbCktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRwYXVzZWQ6IHRydWVcblx0XHRcdHRyYWZmaWM6IG5ldyBUcmFmZmljXG5cdFx0XHRwYWw6IF8ucmFuZ2UgMCxTLnJsLFMucmwvMjVcblx0XHRcdGNhcnM6IF8ucmFuZ2UgUy5udW1fY2Fyc1xuXHRcdFx0XHRcdC5tYXAgKG4pLT4gXHRuZXcgQ2FyKCBTLmRpc3RhbmNlICsgXy5yYW5kb20oIC04LDUpIClcblx0XHRAc2NvcGUuUyA9IFNcblx0XHRAZGF5X3N0YXJ0KClcblx0XHRAc2NvcGUuJHdhdGNoICdTLm51bV9zaWduYWxzJywobik9PlxuXHRcdFx0Uy5vZmZzZXQgPSBNYXRoLnJvdW5kKFMub2Zmc2V0Km4pL25cblx0XHRcdEB0cmFmZmljLmNoYW5nZV9zaWduYWxzIG5cblxuXHRjaGFuZ2VyOiAodiktPlxuXHRcdEB0cmFmZmljLnNpZ25hbHMuZm9yRWFjaCAocyktPlxuXHRcdFx0cy5yZXNldF9vZmZzZXQoKVxuXG5cdFx0IyBAdHJhZmZpYy5jaGFuZ2Vfc2lnbmFscyBTLm51bV9zaWduYWxzXG5cblx0cm90YXRvcjogKGNhciktPiBcInJvdGF0ZSgje1Muc2NhbGUoY2FyLmxvYyl9KSB0cmFuc2xhdGUoMCw1MClcIlxuXG5cdGRheV9zdGFydDogLT5cblx0XHRTLnJlc2V0X3RpbWUoKVxuXHRcdEBwaHlzaWNzID0gdHJ1ZSAjcGh5c2ljcyBzdGFnZSBoYXBwZW5pbmdcblx0XHRAdHJhZmZpYy5yZXNldCBAY2Fyc1xuXHRcdF8uaW52b2tlIEBjYXJzLCAnYXNzaWduX2Vycm9yJ1xuXHRcdEB0aWNrKClcblxuXHRkYXlfZW5kOiAtPlxuXHRcdEBwaHlzaWNzID0gZmFsc2UgI3BoeXNpY3Mgc3RhZ2Ugbm90IGhhcHBlbmluZ1xuXHRcdF8uaW52b2tlIEBjYXJzLCAnZXZhbF9jb3N0J1xuXHRcdF8uc2FtcGxlIEBjYXJzLCAyMDBcblx0XHRcdC5mb3JFYWNoIChkKS0+IGQuY2hvb3NlKClcblxuXHRcdHNldFRpbWVvdXQgPT4gQGRheV9zdGFydCgpXG5cblx0Y2xpY2s6ICh2YWwpIC0+IGlmICF2YWwgdGhlbiBAcGxheSgpXG5cdHBhdXNlOiAtPiBAcGF1c2VkID0gdHJ1ZVxuXHR0aWNrOiAtPlxuXHRcdGlmIEBwaHlzaWNzXG5cdFx0XHRkMy50aW1lciA9PlxuXHRcdFx0XHRcdGlmIEB0cmFmZmljLmRvbmUoKVxuXHRcdFx0XHRcdFx0QGRheV9lbmQoKVxuXHRcdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHRcdFMuYWR2YW5jZSgpXG5cdFx0XHRcdFx0QHRyYWZmaWMudXBkYXRlKClcblx0XHRcdFx0XHRAc2NvcGUuJGV2YWxBc3luYygpXG5cdFx0XHRcdFx0aWYgIUBwYXVzZWQgdGhlbiBAdGljaygpXG5cdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHQsIFMucGFjZVxuXG5cdFx0XHRkMy50aW1lciA9PlxuXHRcdFx0XHRcdGlmIEB0cmFmZmljLmRvbmUoKVxuXHRcdFx0XHRcdFx0IyBAZGF5X2VuZCgpXG5cdFx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdFx0Uy5hZHZhbmNlKClcblx0XHRcdFx0XHRAdHJhZmZpYy51cGRhdGUoKVxuXHRcdFx0XHRcdCMgQHNjb3BlLiRldmFsQXN5bmMoKVxuXHRcdFx0XHRcdCMgaWYgIUBwYXVzZWQgdGhlbiBAdGljaygpXG5cdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHQsIFMucGFjZVxuXG5cdFx0XHRkMy50aW1lciA9PlxuXHRcdFx0XHRcdGlmIEB0cmFmZmljLmRvbmUoKVxuXHRcdFx0XHRcdFx0IyBAZGF5X2VuZCgpXG5cdFx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdFx0Uy5hZHZhbmNlKClcblx0XHRcdFx0XHRAdHJhZmZpYy51cGRhdGUoKVxuXHRcdFx0XHRcdCMgQHNjb3BlLiRldmFsQXN5bmMoKVxuXHRcdFx0XHRcdCMgaWYgIUBwYXVzZWQgdGhlbiBAdGljaygpXG5cdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHQsIFMucGFjZVxuXG5cdFx0XHRkMy50aW1lciA9PlxuXHRcdFx0XHRcdGlmIEB0cmFmZmljLmRvbmUoKVxuXHRcdFx0XHRcdFx0IyBAZGF5X2VuZCgpXG5cdFx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdFx0Uy5hZHZhbmNlKClcblx0XHRcdFx0XHRAdHJhZmZpYy51cGRhdGUoKVxuXHRcdFx0XHRcdCMgQHNjb3BlLiRldmFsQXN5bmMoKVxuXHRcdFx0XHRcdCMgaWYgIUBwYXVzZWQgdGhlbiBAdGljaygpXG5cdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHQsIFMucGFjZVxuXG5cblx0cGxheTogLT5cblx0XHRAcGF1c2UoKVxuXHRcdCMgZDMudGltZXIuZmx1c2goKVxuXHRcdEBwYXVzZWQgPSBmYWxzZVxuXHRcdEB0aWNrKClcblxudmlzRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IHt9XG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvdmlzLmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5sZWF2ZXIgPSAtPlxuXHRhbmltYXRlID0gXG5cdFx0bGVhdmU6IChlbCktPlxuXHRcdFx0ZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5zZWxlY3QgJ3JlY3QnXG5cdFx0XHRcdC50cmFuc2l0aW9uKClcblx0XHRcdFx0LmR1cmF0aW9uIDUwXG5cdFx0XHRcdC5lYXNlICdjdWJpYydcblx0XHRcdFx0LmF0dHIgJ3RyYW5zZm9ybScsJ3NjYWxlKDEuMiwxKSdcblx0XHRcdFx0LmF0dHIgJ2ZpbGwnLCcjZWVlJ1xuXHRcdFx0XHQudHJhbnNpdGlvbigpXG5cdFx0XHRcdC5kdXJhdGlvbiAxNTBcblx0XHRcdFx0LmVhc2UgJ2N1YmljJ1xuXHRcdFx0XHQuYXR0ciAndHJhbnNmb3JtJywnc2NhbGUoMCwxKSdcblx0XHRlbnRlcjogKGVsKS0+XG5cdFx0XHRkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LnNlbGVjdCAncmVjdCdcblx0XHRcdFx0LmF0dHIgJ3RyYW5zZm9ybScsJ3NjYWxlKDAsLjUpJ1xuXHRcdFx0XHQudHJhbnNpdGlvbigpXG5cdFx0XHRcdC5kdXJhdGlvbiA2MFxuXHRcdFx0XHQuZWFzZSAnY3ViaWMnXG5cdFx0XHRcdC5hdHRyICd0cmFuc2Zvcm0nLCdzY2FsZSgxLjIsMSknXG5cdFx0XHRcdC50cmFuc2l0aW9uKClcblx0XHRcdFx0LmR1cmF0aW9uIDE1MFxuXHRcdFx0XHQuZWFzZSAnY3ViaWMnXG5cdFx0XHRcdC5hdHRyICd0cmFuc2Zvcm0nLCdzY2FsZSgxKSdcblxuYW5ndWxhci5tb2R1bGUgJ21haW5BcHAnICwgW3JlcXVpcmUgJ2FuZ3VsYXItbWF0ZXJpYWwnICwgcmVxdWlyZSAnYW5ndWxhci1hbmltYXRlJ11cblx0LmRpcmVjdGl2ZSAndmlzRGVyJywgdmlzRGVyXG5cdC5kaXJlY3RpdmUgJ2RhdHVtJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL2RhdHVtJ1xuXHQuZGlyZWN0aXZlICdkM0RlcicsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9kM0Rlcidcblx0LmRpcmVjdGl2ZSAnY3VtQ2hhcnQnLCByZXF1aXJlICcuL2N1bUNoYXJ0J1xuXHQuZGlyZWN0aXZlICdtZmRDaGFydCcsIHJlcXVpcmUgJy4vbWZkJ1xuXHQuZGlyZWN0aXZlICdob3JBeGlzJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3hBeGlzJ1xuXHQuZGlyZWN0aXZlICd2ZXJBeGlzJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3lBeGlzJ1xuXHQjIC5hbmltYXRpb24gJy5zaWduYWwnLCBzaWduYWxBblxuXHQjIC5hbmltYXRpb24gJy5nLWNhcicsIGxlYXZlclxuXHQuZGlyZWN0aXZlICdzbGlkZXJEZXInLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvc2xpZGVyJ1xuIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLGVsKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHdpZHRoOiAzMDBcblx0XHRcdGhlaWdodDogMzAwXG5cdFx0XHRtOiBcblx0XHRcdFx0dDogMTBcblx0XHRcdFx0bDogNDBcblx0XHRcdFx0cjogMTVcblx0XHRcdFx0YjogMzVcblxuXHRcdEBob3IgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0XHQuZG9tYWluIFswLFMucnVzaF9sZW5ndGgrMTIwXVxuXHRcdFx0XHQucmFuZ2UgWzAsQHdpZHRoXVxuXG5cdFx0QHZlciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQjIC5kb21haW4gWzAsIFMubnVtX2NhcnNdXG5cdFx0XHQuZG9tYWluIFswLDJdXG5cdFx0XHQucmFuZ2UgW0BoZWlnaHQsIDBdXG5cblx0XHRAbGluZUVuID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQudGltZVxuXHRcdFx0LnkgKGQpPT5AdmVyIGQuZW5cblxuXHRcdEBsaW5lRXggPSBkMy5zdmcubGluZSgpXG5cdFx0XHQueCAoZCk9PkBob3IgZC50aW1lXG5cdFx0XHQueSAoZCk9PkB2ZXIgZC5leFxuXG5cdFx0QGhvckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQGhvclxuXHRcdFx0Lm9yaWVudCAnYm90dG9tJ1xuXHRcdFx0LnRpY2tzIDhcblxuXHRcdEB2ZXJBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEB2ZXJcblx0XHRcdC5vcmllbnQgJ2xlZnQnXG5cblxuXHRleDogLT5cblx0XHRAbGluZUV4IEByYXRlXG5cdGVuOiAtPlxuXHRcdEBsaW5lRW4gQHJhdGVcblx0XG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0c2NvcGU6IFxuXHRcdFx0cmF0ZTogJz0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvY2hhcnQuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcbmFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuXG5kZXIgPSAoJHBhcnNlKS0+ICNnb2VzIG9uIGEgc3ZnIGVsZW1lbnRcblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGQzRGVyOiAnPSdcblx0XHRcdHRyYW46ICc9J1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0dSA9ICd0LScgKyBNYXRoLnJhbmRvbSgpXG5cdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSBmYWxzZVxuXHRcdFx0c2NvcGUuJHdhdGNoICdkM0Rlcidcblx0XHRcdFx0LCAodiktPlxuXHRcdFx0XHRcdGlmIHNjb3BlLnRyYW4gYW5kIGhhc1RyYW5zaXRpb25lZFxuXHRcdFx0XHRcdFx0aGFzVHJhbnNpdGlvbmVkID0gdHJ1ZVxuXHRcdFx0XHRcdFx0c2VsLnRyYW5zaXRpb24gdVxuXHRcdFx0XHRcdFx0XHQuYXR0ciB2XG5cdFx0XHRcdFx0XHRcdC5jYWxsIHNjb3BlLnRyYW5cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSB0cnVlXG5cdFx0XHRcdFx0XHRzZWwuYXR0ciB2XG5cdFx0XHRcdCwgdHJ1ZVxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJtb2R1bGUuZXhwb3J0cyA9ICgkcGFyc2UpLT5cblx0KHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdGQzLnNlbGVjdChlbFswXSkuZGF0dW0gJHBhcnNlKGF0dHIuZGF0dW0pKHNjb3BlKSIsImRlciA9IC0+XG5cdHJlcyA9IFxuXHRcdHNjb3BlOiBcblx0XHRcdGxhYmVsOiAnQCdcblx0XHRcdG15RGF0YTogJz0nXG5cdFx0XHRtaW46ICc9J1xuXHRcdFx0bWF4OiAnPSdcblx0XHRcdHN0ZXA6ICc9J1xuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHJlcGxhY2U6IHRydWVcblx0XHRjb250cm9sbGVyOiAtPlxuXHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWVcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC9zbGlkZXIuaHRtbCdcblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZnVuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzY2FsZSA9IHNjb3BlLmZ1bi5zY2FsZSgpXG5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuY2xhc3NlZCAnaG9yIGF4aXMnLCB0cnVlXG5cblx0XHRcdHNlbC5jYWxsIHNjb3BlLmZ1blxuXHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5cbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHJlc3RyaWN0OiAnQSdcblx0XHRzY29wZTogXG5cdFx0XHRmdW46ICc9J1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNjYWxlID0gc2NvcGUuZnVuLnNjYWxlKClcblxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5jbGFzc2VkICd2ZXIgYXhpcycsIHRydWVcblxuXHRcdFx0c2VsLmNhbGwgc2NvcGUuZnVuXG5cdFx0XHRcbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiJ3VzZSBzdHJpY3QnXG5cbkZ1bmN0aW9uOjpwcm9wZXJ0eSA9IChwcm9wLCBkZXNjKSAtPlxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgcHJvcCwgZGVzYyIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxlbCktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHR3aWR0aDogMzAwXG5cdFx0XHRoZWlnaHQ6IDMwMFxuXHRcdFx0bTogXG5cdFx0XHRcdHQ6IDEwXG5cdFx0XHRcdGw6IDQwXG5cdFx0XHRcdHI6IDE4XG5cdFx0XHRcdGI6IDM1XG5cblx0XHRAaG9yID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdFx0LmRvbWFpbiBbMCxTLm51bV9jYXJzKi44XVxuXHRcdFx0XHQucmFuZ2UgWzAsQHdpZHRoXVxuXG5cdFx0QHZlciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLCBTLm51bV9jYXJzKi41NV1cblx0XHRcdC5yYW5nZSBbQGhlaWdodCwgMF1cblxuXHRcdEBsaW5lID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQublxuXHRcdFx0LnkgKGQpPT5AdmVyIGQuZlxuXG5cdFx0QGhvckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQGhvclxuXHRcdFx0Lm9yaWVudCAnYm90dG9tJ1xuXHRcdFx0LnRpY2tzIDhcblxuXHRcdEB2ZXJBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEB2ZXJcblx0XHRcdC5vcmllbnQgJ2xlZnQnXG5cblx0ZDogLT4gQGxpbmUgQG1lbW9yeVxuXG5cdFxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHNjb3BlOiBcblx0XHRcdG1lbW9yeTogJz0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvbWZkQ2hhcnQuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xucmVxdWlyZSAnLi9oZWxwZXJzJ1xuXG5jbGFzcyBTaWduYWxcblx0Y29uc3RydWN0b3I6IChAaSxAbG9jKS0+XG5cdFx0QGdyZWVuID0gdHJ1ZVxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ3NpZ25hbC0nXG5cdFx0QHJlc2V0X29mZnNldCgpXG5cblx0QHByb3BlcnR5ICdvZmZzZXQnLCBcblx0XHRnZXQ6IC0+IFxuXHRcdFx0Uy5waGFzZSooKEBpKlMub2Zmc2V0KSUxKVxuXG5cdHJlc2V0X29mZnNldDogLT5cblx0XHRbQGNvdW50LCBAZ3JlZW5dID0gW0BvZmZzZXQsIHRydWVdXG5cblx0dXBkYXRlOiAtPlxuXHRcdEBjb3VudCsrXG5cdFx0aWYgKEBjb3VudCkgPj0gKFMucGhhc2UpXG5cdFx0XHRbQGNvdW50LCBAZ3JlZW5dID0gWzAsIHRydWVdXG5cdFx0XHRyZXR1cm5cblx0XHRpZiAoQGNvdW50KT49IChTLmdyZWVuKlMucGhhc2UpXG5cdFx0XHRAZ3JlZW4gPSBmYWxzZVxuXG5jbGFzcyBUcmFmZmljXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBjaGFuZ2Vfc2lnbmFscyBTLm51bV9zaWduYWxzXG5cblx0cmVzZXQ6KHdhaXRpbmcpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0dHJhdmVsaW5nOiBbXVxuXHRcdFx0Y3VtOiBbXVxuXHRcdFx0cmF0ZTogW11cblx0XHRcdG1lbW9yeTogW11cblx0XHRcdGN1bUVuOiAwXG5cdFx0XHRjdW1FeDogMFxuXHRcdFx0d2FpdGluZzogXy5jbG9uZSggd2FpdGluZylcblxuXHRcdEBzaWduYWxzLmZvckVhY2ggKHMpLT5cblx0XHRcdHMucmVzZXRfb2Zmc2V0KClcblxuXHRjaGFuZ2Vfc2lnbmFsczogKG4pLT5cblx0XHRAc2lnbmFscyA9IF8ucmFuZ2UgMCxTLnJsLCBTLnJsL25cblx0XHRcdFx0Lm1hcCAoZixpKS0+IG5ldyBTaWduYWwoaSxNYXRoLmZsb29yKGYpKVxuXG5cdGRvbmU6IC0+XG5cdFx0KEB3YWl0aW5nLmxlbmd0aCtAdHJhdmVsaW5nLmxlbmd0aCk9PTBcblxuXHRyZW1lbWJlcjogLT5cblx0XHRtZW0gPSBcblx0XHRcdG46IEB0cmF2ZWxpbmcubGVuZ3RoXG5cdFx0XHR2OiAwXG5cdFx0XHRmOiAwXG5cdFx0QHRyYXZlbGluZy5mb3JFYWNoIChkKS0+XG5cdFx0XHRpZiBkLnN0b3BwZWQgPT0gMFxuXHRcdFx0XHRtZW0uZisrXG5cdFx0XHRcdG1lbS52Kz0oMS9tZW0ubilcblx0XHRAbWVtb3J5LnB1c2ggbWVtXG5cblxuXHRsb2c6IC0+XG5cdFx0YyA9IFxuXHRcdFx0dGltZTogUy50aW1lXG5cdFx0XHRjdW1FbjogQGN1bUVuXG5cdFx0XHRjdW1FeDogQGN1bUV4XG5cdFx0aWYgQGN1bS5sZW5ndGggPiA0MFxuXHRcdFx0QHJhdGUucHVzaFxuXHRcdFx0XHR0aW1lOiBTLnRpbWUtMjBcblx0XHRcdFx0ZW46IChAY3VtRW4gLSBAY3VtW0BjdW0ubGVuZ3RoLTQwXS5jdW1FbikvNDBcblx0XHRcdFx0ZXg6IChAY3VtRXggLSBAY3VtW0BjdW0ubGVuZ3RoLTQwXS5jdW1FeCkvNDBcblx0XHRAY3VtLnB1c2ggY1xuXG5cdHJlY2VpdmU6IChjYXIpLT5cblx0XHRAY3VtRW4rK1xuXHRcdGxvYyA9IF8ucmFuZG9tIDAsUy5ybFxuXHRcdGcwID0gMFxuXHRcdF8uZm9yRWFjaCBAdHJhdmVsaW5nLCAoYyktPlxuXHRcdFx0ZyA9IGMuZ2V0X2dhcCgpXG5cdFx0XHRpZiBnID49IGcwXG5cdFx0XHRcdGxvYyA9IE1hdGguZmxvb3IoYy5sb2MgKyBnLzIpJVMucmxcblx0XHRcdFx0ZzAgPSBnXG5cblx0XHRpZiAoZzAgPiAwIGFuZCBAdHJhdmVsaW5nLmxlbmd0aD4wKSBvciAoQHRyYXZlbGluZy5sZW5ndGg9PTApXG5cdFx0XHRfLnJlbW92ZSBAd2FpdGluZywgY2FyXG5cdFx0XHRjYXIuZW50ZXIgbG9jXG5cdFx0XHRAdHJhdmVsaW5nLnB1c2ggY2FyXG5cdFx0XHRAb3JkZXJfY2FycygpXG5cblx0cmVtb3ZlOiAoY2FyKS0+XG5cdFx0QGN1bUV4Kytcblx0XHRfLnJlbW92ZSBAdHJhdmVsaW5nLCBjYXJcblxuXHR1cGRhdGU6IC0+XG5cdFx0cmVkcyA9IFtdXG5cdFx0QHNpZ25hbHMuZm9yRWFjaCAocyktPlxuXHRcdFx0cy51cGRhdGUoKVxuXHRcdFx0aWYgIXMuZ3JlZW5cblx0XHRcdFx0cmVkcy5wdXNoIHMubG9jXG5cblx0XHRAd2FpdGluZy5mb3JFYWNoIChjYXIpPT5cblx0XHRcdGlmIF8ubHQgY2FyLnRfZW4sUy50aW1lIHRoZW4gQHJlY2VpdmUgY2FyXG5cdFx0QHRyYXZlbGluZy5mb3JFYWNoIChjYXIpPT5cblx0XHRcdGNhci5tb3ZlIHJlZHNcblx0XHRcdGlmIGNhci5leGl0ZWQgdGhlbiBAcmVtb3ZlIGNhclxuXG5cdFx0QGxvZygpXG5cdFx0aWYgKFMudGltZSVTLmZyZXF1ZW5jeT09MCkgdGhlbiBAcmVtZW1iZXIoKVxuXG5cdFx0QG9yZGVyX2NhcnMoKVxuXG5cdG9yZGVyX2NhcnM6IC0+XG5cdFx0aWYgKGwgPSBAdHJhdmVsaW5nLmxlbmd0aCkgPiAxXG5cdFx0XHRAdHJhdmVsaW5nLnNvcnQgKGEsYiktPiBhLmxvYyAtIGIubG9jXG5cdFx0XHRAdHJhdmVsaW5nLmZvckVhY2ggKGNhcixpLGspLT5cblx0XHRcdFx0Y2FyLnNldF9uZXh0IGtbKGkrMSklbF1cblx0XHRpZiBsID09IDFcblx0XHRcdEB0cmF2ZWxpbmdbMF0uc2V0X25leHQgbnVsbFxuXG5uID0gMFxuXG5jbGFzcyBDYXJcblx0Y29uc3RydWN0b3I6KEBkaXN0YW5jZSktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRpZDogXy51bmlxdWVJZCgpXG5cdFx0XHRjb3N0MDogSW5maW5pdHkgXG5cdFx0XHR0YXJnZXQ6IF8ucmFuZG9tIDIsUy5ydXNoX2xlbmd0aFxuXHRcdFx0ZXhpdGVkOiBmYWxzZVxuXG5cdGFzc2lnbl9lcnJvcjotPiBcblx0XHRAdF9lbiA9IE1hdGgubWF4IDAsKEB0YXJnZXQgKyBfLnJhbmRvbSAtMywzKVxuXG5cdCMgc2V0dGVyc1xuXHRzZXRfbmV4dDogKEBuZXh0KS0+XG5cblx0Z2V0X2dhcDotPlxuXHRcdGlmICFAbmV4dCB0aGVuIHJldHVybiBNYXRoLmZsb29yIFMucmwvMlxuXHRcdGdhcCA9IEBuZXh0LmxvYyAtIEBsb2Ncblx0XHRpZiBfLmx0ZSBnYXAsMCB0aGVuIChnYXArUy5ybCkgZWxzZSBnYXBcblxuXHRleGl0OiAtPlxuXHRcdFtAbmV4dCwgQHRfZXgsIEBleGl0ZWRdID0gW3VuZGVmaW5lZCwgUy50aW1lLCB0cnVlXVxuXG5cdGV2YWxfY29zdDogLT5cblx0XHRAc2QgPSBAdF9leCAtIFMud2lzaFxuXHRcdEBzcCA9IE1hdGgubWF4KCAtUy5iZXRhICogQHNkLCBTLmdhbW1hICogQHNkKVxuXHRcdEB0dCA9IEB0X2V4IC0gQHRfZW5cblx0XHRAY29zdCA9ICBAdHQrQHNwIFxuXG5cdGNob29zZTogLT5cblx0XHRpZiBfLmx0IEBjb3N0LEBjb3N0MCB0aGVuIFtAY29zdDAsQHRhcmdldF0gPSBbQGNvc3QsIEB0X2VuXVxuXG5cdGVudGVyOihAbG9jKS0+XG5cdFx0QGRlc3RpbmF0aW9uID0gTWF0aC5mbG9vciAoQGxvYyArIEBkaXN0YW5jZSklUy5ybFxuXHRcdCMgQGRlc3RpbmF0aW9uID0gTWF0aC5mbG9vciBAZGVzdGluYXRpb25cblx0XHRbQGNvc3QwLCBAZXhpdGVkLCBAc3RvcHBlZCwgQGNvbG9yXSA9IFtAY29zdCxmYWxzZSwwLCBTLmNvbG9ycyhAZGVzdGluYXRpb24pXVxuXG5cdG1vdmU6IChyZWRzKS0+XG5cdFx0aWYgQHN0b3BwZWQgPiAwIHRoZW4gQHN0b3BwZWQtLVxuXHRcdGVsc2Vcblx0XHRcdGlmIEBsb2MgPT0gQGRlc3RpbmF0aW9uXG5cdFx0XHRcdEBleGl0KClcblx0XHRcdGVsc2UgXG5cdFx0XHRcdG5leHRfbG9jID0gKEBsb2MgKyAxKSVTLnJsXG5cdFx0XHRcdGlmIChAZ2V0X2dhcCgpID49IFMuc3BhY2UpIGFuZCAobmV4dF9sb2Mgbm90IGluIHJlZHMpXG5cdFx0XHRcdFx0QGxvYyA9IG5leHRfbG9jXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRAc3RvcHBlZCA9IFMuc3RvcHBpbmdfdGltZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFxuXHRDYXI6IENhclxuXHRUcmFmZmljOiBUcmFmZmljXG5cdFNpZ25hbDogU2lnbmFsXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbnJlcXVpcmUgJy4vaGVscGVycydcblxuY2xhc3MgU2V0dGluZ3Ncblx0Y29uc3RydWN0b3I6LT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0bnVtX2NhcnM6IDYwMFxuXHRcdFx0dGltZTogMFxuXHRcdFx0c3BhY2U6IDNcblx0XHRcdHBhY2U6IDFcblx0XHRcdHN0b3BwaW5nX3RpbWU6IDZcblx0XHRcdGRpc3RhbmNlOiA2MFxuXHRcdFx0YmV0YTogLjVcblx0XHRcdGdhbW1hOiAyXG5cdFx0XHRydXNoX2xlbmd0aDogNTUwXG5cdFx0XHRmcmVxdWVuY3k6IDhcblx0XHRcdHJsOiAxMDAwXG5cdFx0XHRwaGFzZTogMjVcblx0XHRcdGdyZWVuOiAuNVxuXHRcdFx0d2lzaDogMzI1XG5cdFx0XHRudW1fc2lnbmFsczogNTBcblx0XHRcdGRheTogMFxuXHRcdFx0b2Zmc2V0OiAuM1xuXG5cdFx0QGNvbG9ycyA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIF8ucmFuZ2UgMCxAcmwsQHJsLzZcblx0XHRcdC5yYW5nZSBbXG5cdFx0XHRcdCcjRjQ0MzM2JywgI3JlZFxuXHRcdFx0XHQnIzIxOTZGMycsICNibHVlXG5cdFx0XHRcdCcjRTkxRTYzJywgI3Bpbmtcblx0XHRcdFx0JyMwMEJDRDQnLCAjY3lhblxuXHRcdFx0XHQnI0ZGQzEwNycsICNhbWJlclxuXHRcdFx0XHQnIzRDQUY1MCcsICNncmVlblxuXHRcdFx0XHRdXG5cblx0XHRAc2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCxAcmxdXG5cdFx0XHQucmFuZ2UgWzAsMzYwXVxuXG5cdGFkdmFuY2U6IC0+XG5cdFx0QHRpbWUrK1xuXHRyZXNldF90aW1lOiAtPlxuXHRcdEBkYXkrK1xuXHRcdEB0aW1lID0gMFxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBTZXR0aW5ncygpIl19
