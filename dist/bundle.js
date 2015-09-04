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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2FwcC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2N1bUNoYXJ0LmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9yaW5ncm9hZC9hcHAvZGlyZWN0aXZlcy9kM0Rlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2RpcmVjdGl2ZXMvZGF0dW0uY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3Jpbmdyb2FkL2FwcC9kaXJlY3RpdmVzL3NsaWRlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2RpcmVjdGl2ZXMveEF4aXMuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3Jpbmdyb2FkL2FwcC9kaXJlY3RpdmVzL3lBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9yaW5ncm9hZC9hcHAvaGVscGVycy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL21mZC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL21vZGVscy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL3NldHRpbmdzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUE7O0FBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7QUFDTCxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0FBQ0osQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSOztBQUNKLE1BQXVCLE9BQUEsQ0FBUSxVQUFSLENBQXZCLEVBQUMsVUFBQSxHQUFELEVBQUssY0FBQSxPQUFMLEVBQWEsYUFBQTs7QUFFUDtFQUNPLGNBQUMsS0FBRCxFQUFRLEVBQVI7SUFBQyxJQUFDLENBQUEsUUFBRDtJQUNaLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxFQUNDO01BQUEsTUFBQSxFQUFRLElBQVI7TUFDQSxPQUFBLEVBQVMsSUFBSSxPQURiO01BRUEsR0FBQSxFQUFLLENBQUMsQ0FBQyxLQUFGLENBQVEsQ0FBUixFQUFVLENBQUMsQ0FBQyxFQUFaLEVBQWUsQ0FBQyxDQUFDLEVBQUYsR0FBSyxFQUFwQixDQUZMO01BR0EsSUFBQSxFQUFNLENBQUMsQ0FBQyxLQUFGLENBQVEsQ0FBQyxDQUFDLFFBQVYsQ0FDSixDQUFDLEdBREcsQ0FDQyxTQUFDLENBQUQ7ZUFBVyxJQUFBLEdBQUEsQ0FBSyxDQUFDLENBQUMsUUFBRixHQUFhLENBQUMsQ0FBQyxNQUFGLENBQVUsQ0FBQyxDQUFYLEVBQWEsQ0FBYixDQUFsQjtNQUFYLENBREQsQ0FITjtLQUREO0lBTUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxDQUFQLEdBQVc7SUFDWCxJQUFDLENBQUEsU0FBRCxDQUFBO0lBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsZUFBZCxFQUE4QixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtRQUM3QixDQUFDLENBQUMsTUFBRixHQUFXLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQyxDQUFDLE1BQUYsR0FBUyxDQUFwQixDQUFBLEdBQXVCO2VBQ2xDLEtBQUMsQ0FBQSxPQUFPLENBQUMsY0FBVCxDQUF3QixDQUF4QjtNQUY2QjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUI7RUFUVzs7aUJBYVosT0FBQSxHQUFTLFNBQUMsQ0FBRDtXQUNSLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQWpCLENBQXlCLFNBQUMsQ0FBRDthQUN4QixDQUFDLENBQUMsWUFBRixDQUFBO0lBRHdCLENBQXpCO0VBRFE7O2lCQU1ULE9BQUEsR0FBUyxTQUFDLEdBQUQ7V0FBUSxTQUFBLEdBQVMsQ0FBQyxDQUFDLENBQUMsS0FBRixDQUFRLEdBQUcsQ0FBQyxHQUFaLENBQUQsQ0FBVCxHQUEyQjtFQUFuQzs7aUJBRVQsU0FBQSxHQUFXLFNBQUE7SUFDVixDQUFDLENBQUMsVUFBRixDQUFBO0lBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVztJQUNYLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBVCxDQUFlLElBQUMsQ0FBQSxJQUFoQjtJQUNBLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBQyxDQUFBLElBQVYsRUFBZ0IsY0FBaEI7V0FDQSxJQUFDLENBQUEsSUFBRCxDQUFBO0VBTFU7O2lCQU9YLE9BQUEsR0FBUyxTQUFBO0lBQ1IsSUFBQyxDQUFBLE9BQUQsR0FBVztJQUNYLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBQyxDQUFBLElBQVYsRUFBZ0IsV0FBaEI7SUFDQSxDQUFDLENBQUMsTUFBRixDQUFTLElBQUMsQ0FBQSxJQUFWLEVBQWdCLEVBQWhCLENBQ0MsQ0FBQyxPQURGLENBQ1UsU0FBQyxDQUFEO2FBQU0sQ0FBQyxDQUFDLE1BQUYsQ0FBQTtJQUFOLENBRFY7V0FHQSxVQUFBLENBQVcsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFBO2VBQUcsS0FBQyxDQUFBLFNBQUQsQ0FBQTtNQUFIO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYO0VBTlE7O2lCQVFULEtBQUEsR0FBTyxTQUFDLEdBQUQ7SUFBUyxJQUFHLENBQUMsR0FBSjthQUFhLElBQUMsQ0FBQSxJQUFELENBQUEsRUFBYjs7RUFBVDs7aUJBQ1AsS0FBQSxHQUFPLFNBQUE7V0FBRyxJQUFDLENBQUEsTUFBRCxHQUFVO0VBQWI7O2lCQUNQLElBQUEsR0FBTSxTQUFBO0lBQ0wsSUFBRyxJQUFDLENBQUEsT0FBSjthQUNDLEVBQUUsQ0FBQyxLQUFILENBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ1AsSUFBRyxLQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBQSxDQUFIO1lBQ0MsS0FBQyxDQUFBLE9BQUQsQ0FBQTtZQUNBLEtBRkQ7O1VBR0EsQ0FBQyxDQUFDLE9BQUYsQ0FBQTtVQUNBLEtBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFBO1VBQ0EsS0FBQyxDQUFBLEtBQUssQ0FBQyxVQUFQLENBQUE7VUFDQSxJQUFHLENBQUMsS0FBQyxDQUFBLE1BQUw7WUFBaUIsS0FBQyxDQUFBLElBQUQsQ0FBQSxFQUFqQjs7aUJBQ0E7UUFSTztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVCxFQVNHLENBQUMsQ0FBQyxJQVRMLEVBREQ7O0VBREs7O2lCQWFOLE9BQUEsR0FBUSxTQUFDLEtBQUQ7SUFBVyxJQUFHLEtBQUg7YUFBYyxVQUFkO0tBQUEsTUFBQTthQUE2QixVQUE3Qjs7RUFBWDs7aUJBRVIsSUFBQSxHQUFNLFNBQUE7SUFDTCxJQUFDLENBQUEsS0FBRCxDQUFBO0lBQ0EsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFULENBQUE7SUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVO1dBQ1YsSUFBQyxDQUFBLElBQUQsQ0FBQTtFQUpLOzs7Ozs7QUFNUCxNQUFBLEdBQVMsU0FBQTtBQUNSLE1BQUE7U0FBQSxTQUFBLEdBQ0M7SUFBQSxLQUFBLEVBQU8sRUFBUDtJQUNBLFlBQUEsRUFBYyxJQURkO0lBRUEsV0FBQSxFQUFhLGlCQUZiO0lBR0EsVUFBQSxFQUFZLENBQUMsUUFBRCxFQUFXLFVBQVgsRUFBdUIsSUFBdkIsQ0FIWjs7QUFGTzs7QUFPVCxNQUFBLEdBQVMsU0FBQTtBQUNQLE1BQUE7U0FBQSxPQUFBLEdBQ0M7SUFBQSxLQUFBLEVBQU8sU0FBQyxFQUFEO2FBQ04sRUFBRSxDQUFDLE1BQUgsQ0FBVSxFQUFHLENBQUEsQ0FBQSxDQUFiLENBQ0MsQ0FBQyxNQURGLENBQ1MsTUFEVCxDQUVDLENBQUMsVUFGRixDQUFBLENBR0MsQ0FBQyxRQUhGLENBR1csRUFIWCxDQUlDLENBQUMsSUFKRixDQUlPLE9BSlAsQ0FLQyxDQUFDLElBTEYsQ0FLTyxXQUxQLEVBS21CLGNBTG5CLENBTUMsQ0FBQyxJQU5GLENBTU8sTUFOUCxFQU1jLE1BTmQsQ0FPQyxDQUFDLFVBUEYsQ0FBQSxDQVFDLENBQUMsUUFSRixDQVFXLEdBUlgsQ0FTQyxDQUFDLElBVEYsQ0FTTyxPQVRQLENBVUMsQ0FBQyxJQVZGLENBVU8sV0FWUCxFQVVtQixZQVZuQjtJQURNLENBQVA7SUFZQSxLQUFBLEVBQU8sU0FBQyxFQUFEO2FBQ04sRUFBRSxDQUFDLE1BQUgsQ0FBVSxFQUFHLENBQUEsQ0FBQSxDQUFiLENBQ0MsQ0FBQyxNQURGLENBQ1MsTUFEVCxDQUVDLENBQUMsSUFGRixDQUVPLFdBRlAsRUFFbUIsYUFGbkIsQ0FHQyxDQUFDLFVBSEYsQ0FBQSxDQUlDLENBQUMsUUFKRixDQUlXLEVBSlgsQ0FLQyxDQUFDLElBTEYsQ0FLTyxPQUxQLENBTUMsQ0FBQyxJQU5GLENBTU8sV0FOUCxFQU1tQixjQU5uQixDQU9DLENBQUMsVUFQRixDQUFBLENBUUMsQ0FBQyxRQVJGLENBUVcsR0FSWCxDQVNDLENBQUMsSUFURixDQVNPLE9BVFAsQ0FVQyxDQUFDLElBVkYsQ0FVTyxXQVZQLEVBVW1CLFVBVm5CO0lBRE0sQ0FaUDs7QUFGTTs7QUEyQlQsT0FBTyxDQUFDLE1BQVIsQ0FBZSxTQUFmLEVBQTJCLENBQUMsT0FBQSxDQUFRLGtCQUFSLEVBQTZCLE9BQUEsQ0FBUSxpQkFBUixDQUE3QixDQUFELENBQTNCLENBQ0MsQ0FBQyxTQURGLENBQ1ksUUFEWixFQUNzQixNQUR0QixDQUVDLENBQUMsU0FGRixDQUVZLE9BRlosRUFFcUIsT0FBQSxDQUFRLG9CQUFSLENBRnJCLENBR0MsQ0FBQyxTQUhGLENBR1ksT0FIWixFQUdxQixPQUFBLENBQVEsb0JBQVIsQ0FIckIsQ0FJQyxDQUFDLFNBSkYsQ0FJWSxVQUpaLEVBSXdCLE9BQUEsQ0FBUSxZQUFSLENBSnhCLENBS0MsQ0FBQyxTQUxGLENBS1ksVUFMWixFQUt3QixPQUFBLENBQVEsT0FBUixDQUx4QixDQU1DLENBQUMsU0FORixDQU1ZLFNBTlosRUFNdUIsT0FBQSxDQUFRLG9CQUFSLENBTnZCLENBT0MsQ0FBQyxTQVBGLENBT1ksU0FQWixFQU91QixPQUFBLENBQVEsb0JBQVIsQ0FQdkIsQ0FTQyxDQUFDLFNBVEYsQ0FTWSxXQVRaLEVBU3lCLE9BQUEsQ0FBUSxxQkFBUixDQVR6Qjs7Ozs7QUNwR0EsSUFBQTs7QUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBQ0wsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztBQUNKLENBQUEsR0FBSSxPQUFBLENBQVEsWUFBUjs7QUFFRTtFQUNPLGNBQUMsS0FBRCxFQUFRLEVBQVI7SUFBQyxJQUFDLENBQUEsUUFBRDtJQUNaLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxFQUNDO01BQUEsS0FBQSxFQUFPLEdBQVA7TUFDQSxNQUFBLEVBQVEsR0FEUjtNQUVBLENBQUEsRUFDQztRQUFBLENBQUEsRUFBRyxFQUFIO1FBQ0EsQ0FBQSxFQUFHLEVBREg7UUFFQSxDQUFBLEVBQUcsRUFGSDtRQUdBLENBQUEsRUFBRyxFQUhIO09BSEQ7S0FERDtJQVNBLElBQUMsQ0FBQSxHQUFELEdBQU8sRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFULENBQUEsQ0FDTCxDQUFDLE1BREksQ0FDRyxDQUFDLENBQUQsRUFBRyxDQUFDLENBQUMsV0FBTCxDQURILENBRUwsQ0FBQyxLQUZJLENBRUUsQ0FBQyxDQUFELEVBQUcsSUFBQyxDQUFBLEtBQUosQ0FGRjtJQUlQLElBQUMsQ0FBQSxHQUFELEdBQU8sRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFULENBQUEsQ0FDTixDQUFDLE1BREssQ0FDRSxDQUFDLENBQUQsRUFBSSxDQUFDLENBQUMsUUFBTixDQURGLENBRU4sQ0FBQyxLQUZLLENBRUMsQ0FBQyxJQUFDLENBQUEsTUFBRixFQUFVLENBQVYsQ0FGRDtJQUlQLElBQUMsQ0FBQSxNQUFELEdBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFQLENBQUEsQ0FDVCxDQUFDLENBRFEsQ0FDTixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsQ0FBRDtlQUFLLEtBQUMsQ0FBQSxHQUFELENBQUssQ0FBQyxDQUFDLElBQVA7TUFBTDtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FETSxDQUVULENBQUMsQ0FGUSxDQUVOLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxDQUFEO2VBQUssS0FBQyxDQUFBLEdBQUQsQ0FBSyxDQUFDLENBQUMsS0FBUDtNQUFMO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUZNO0lBSVYsSUFBQyxDQUFBLE1BQUQsR0FBVSxFQUFFLENBQUMsR0FBRyxDQUFDLElBQVAsQ0FBQSxDQUNULENBQUMsQ0FEUSxDQUNOLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxDQUFEO2VBQUssS0FBQyxDQUFBLEdBQUQsQ0FBSyxDQUFDLENBQUMsSUFBUDtNQUFMO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURNLENBRVQsQ0FBQyxDQUZRLENBRU4sQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLENBQUQ7ZUFBSyxLQUFDLENBQUEsR0FBRCxDQUFLLENBQUMsQ0FBQyxLQUFQO01BQUw7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRk07SUFJVixJQUFDLENBQUEsT0FBRCxHQUFXLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBUCxDQUFBLENBQ1YsQ0FBQyxLQURTLENBQ0gsSUFBQyxDQUFBLEdBREUsQ0FFVixDQUFDLE1BRlMsQ0FFRixRQUZFLENBR1YsQ0FBQyxLQUhTLENBR0gsQ0FIRztJQU1YLElBQUMsQ0FBQSxPQUFELEdBQVcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFQLENBQUEsQ0FDVixDQUFDLEtBRFMsQ0FDSCxJQUFDLENBQUEsR0FERSxDQUVWLENBQUMsTUFGUyxDQUVGLE1BRkU7RUFoQ0E7O2lCQXFDWixFQUFBLEdBQUksU0FBQTtXQUNILElBQUMsQ0FBQSxNQUFELENBQVEsSUFBQyxDQUFBLEdBQVQ7RUFERzs7aUJBRUosRUFBQSxHQUFJLFNBQUE7V0FDSCxJQUFDLENBQUEsTUFBRCxDQUFRLElBQUMsQ0FBQSxHQUFUO0VBREc7Ozs7OztBQUdMLEdBQUEsR0FBTSxTQUFBO0FBQ0wsTUFBQTtTQUFBLFNBQUEsR0FDQztJQUFBLGdCQUFBLEVBQWtCLElBQWxCO0lBQ0EsWUFBQSxFQUFjLElBRGQ7SUFFQSxLQUFBLEVBQ0M7TUFBQSxHQUFBLEVBQUssR0FBTDtLQUhEO0lBSUEsV0FBQSxFQUFhLG1CQUpiO0lBS0EsVUFBQSxFQUFZLENBQUMsUUFBRCxFQUFXLFVBQVgsRUFBdUIsSUFBdkIsQ0FMWjs7QUFGSTs7QUFTTixNQUFNLENBQUMsT0FBUCxHQUFpQjs7Ozs7QUN4RGpCLElBQUE7O0FBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztBQUNMLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7QUFFVixHQUFBLEdBQU0sU0FBQyxNQUFEO0FBQ0wsTUFBQTtTQUFBLFNBQUEsR0FDQztJQUFBLFFBQUEsRUFBVSxHQUFWO0lBQ0EsS0FBQSxFQUNDO01BQUEsS0FBQSxFQUFPLEdBQVA7TUFDQSxJQUFBLEVBQU0sR0FETjtLQUZEO0lBSUEsSUFBQSxFQUFNLFNBQUMsS0FBRCxFQUFRLEVBQVIsRUFBWSxJQUFaO0FBQ0wsVUFBQTtNQUFBLEdBQUEsR0FBTSxFQUFFLENBQUMsTUFBSCxDQUFVLEVBQUcsQ0FBQSxDQUFBLENBQWI7TUFDTixDQUFBLEdBQUksSUFBQSxHQUFPLElBQUksQ0FBQyxNQUFMLENBQUE7TUFDWCxlQUFBLEdBQWtCO2FBQ2xCLEtBQUssQ0FBQyxNQUFOLENBQWEsT0FBYixFQUNHLFNBQUMsQ0FBRDtRQUNELElBQUcsS0FBSyxDQUFDLElBQU4sSUFBZSxlQUFsQjtVQUNDLGVBQUEsR0FBa0I7aUJBQ2xCLEdBQUcsQ0FBQyxVQUFKLENBQWUsQ0FBZixDQUNDLENBQUMsSUFERixDQUNPLENBRFAsQ0FFQyxDQUFDLElBRkYsQ0FFTyxLQUFLLENBQUMsSUFGYixFQUZEO1NBQUEsTUFBQTtVQU1DLGVBQUEsR0FBa0I7aUJBQ2xCLEdBQUcsQ0FBQyxJQUFKLENBQVMsQ0FBVCxFQVBEOztNQURDLENBREgsRUFVRyxJQVZIO0lBSkssQ0FKTjs7QUFGSTs7QUFxQk4sTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7O0FDeEJqQixNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLE1BQUQ7U0FDaEIsU0FBQyxLQUFELEVBQVEsRUFBUixFQUFZLElBQVo7V0FDQyxFQUFFLENBQUMsTUFBSCxDQUFVLEVBQUcsQ0FBQSxDQUFBLENBQWIsQ0FBZ0IsQ0FBQyxLQUFqQixDQUF1QixNQUFBLENBQU8sSUFBSSxDQUFDLEtBQVosQ0FBQSxDQUFtQixLQUFuQixDQUF2QjtFQUREO0FBRGdCOzs7OztBQ0FqQixJQUFBOztBQUFBLEdBQUEsR0FBTSxTQUFBO0FBQ0wsTUFBQTtTQUFBLEdBQUEsR0FDQztJQUFBLEtBQUEsRUFDQztNQUFBLEtBQUEsRUFBTyxHQUFQO01BQ0EsTUFBQSxFQUFRLEdBRFI7TUFFQSxHQUFBLEVBQUssR0FGTDtNQUdBLEdBQUEsRUFBSyxHQUhMO01BSUEsSUFBQSxFQUFNLEdBSk47S0FERDtJQU1BLFlBQUEsRUFBYyxJQU5kO0lBT0EsT0FBQSxFQUFTLElBUFQ7SUFRQSxVQUFBLEVBQVksU0FBQSxHQUFBLENBUlo7SUFTQSxnQkFBQSxFQUFrQixJQVRsQjtJQVVBLFdBQUEsRUFBYSxvQkFWYjs7QUFGSTs7QUFjTixNQUFNLENBQUMsT0FBUCxHQUFpQjs7Ozs7QUNkakIsSUFBQTs7QUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBRUwsR0FBQSxHQUFNLFNBQUE7QUFDTCxNQUFBO1NBQUEsU0FBQSxHQUNDO0lBQUEsUUFBQSxFQUFVLEdBQVY7SUFDQSxLQUFBLEVBQ0M7TUFBQSxHQUFBLEVBQUssR0FBTDtLQUZEO0lBR0EsSUFBQSxFQUFNLFNBQUMsS0FBRCxFQUFRLEVBQVIsRUFBWSxJQUFaO0FBQ0wsVUFBQTtNQUFBLEtBQUEsR0FBUSxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQVYsQ0FBQTtNQUVSLEdBQUEsR0FBTSxFQUFFLENBQUMsTUFBSCxDQUFVLEVBQUcsQ0FBQSxDQUFBLENBQWIsQ0FDTCxDQUFDLE9BREksQ0FDSSxVQURKLEVBQ2dCLElBRGhCO2FBR04sR0FBRyxDQUFDLElBQUosQ0FBUyxLQUFLLENBQUMsR0FBZjtJQU5LLENBSE47O0FBRkk7O0FBYU4sTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7O0FDZmpCLElBQUE7O0FBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztBQUVMLEdBQUEsR0FBTSxTQUFBO0FBQ0wsTUFBQTtTQUFBLFNBQUEsR0FDQztJQUFBLFFBQUEsRUFBVSxHQUFWO0lBQ0EsS0FBQSxFQUNDO01BQUEsR0FBQSxFQUFLLEdBQUw7S0FGRDtJQUdBLElBQUEsRUFBTSxTQUFDLEtBQUQsRUFBUSxFQUFSLEVBQVksSUFBWjtBQUNMLFVBQUE7TUFBQSxLQUFBLEdBQVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFWLENBQUE7TUFFUixHQUFBLEdBQU0sRUFBRSxDQUFDLE1BQUgsQ0FBVSxFQUFHLENBQUEsQ0FBQSxDQUFiLENBQ0wsQ0FBQyxPQURJLENBQ0ksVUFESixFQUNnQixJQURoQjthQUdOLEdBQUcsQ0FBQyxJQUFKLENBQVMsS0FBSyxDQUFDLEdBQWY7SUFOSyxDQUhOOztBQUZJOztBQWFOLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7OztBQ2ZqQjtBQUVBLFFBQVEsQ0FBQSxTQUFFLENBQUEsUUFBVixHQUFxQixTQUFDLElBQUQsRUFBTyxJQUFQO1NBQ25CLE1BQU0sQ0FBQyxjQUFQLENBQXNCLElBQUMsQ0FBQSxTQUF2QixFQUFrQyxJQUFsQyxFQUF3QyxJQUF4QztBQURtQjs7Ozs7QUNGckIsSUFBQTs7QUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBQ0wsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztBQUNKLENBQUEsR0FBSSxPQUFBLENBQVEsWUFBUjs7QUFFRTtFQUNPLGNBQUMsS0FBRCxFQUFRLEVBQVI7SUFBQyxJQUFDLENBQUEsUUFBRDtJQUNaLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxFQUNDO01BQUEsS0FBQSxFQUFPLEdBQVA7TUFDQSxNQUFBLEVBQVEsR0FEUjtNQUVBLENBQUEsRUFDQztRQUFBLENBQUEsRUFBRyxFQUFIO1FBQ0EsQ0FBQSxFQUFHLEVBREg7UUFFQSxDQUFBLEVBQUcsRUFGSDtRQUdBLENBQUEsRUFBRyxFQUhIO09BSEQ7S0FERDtJQVNBLElBQUMsQ0FBQSxHQUFELEdBQU8sRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFULENBQUEsQ0FDTCxDQUFDLE1BREksQ0FDRyxDQUFDLENBQUQsRUFBRyxDQUFDLENBQUMsUUFBRixHQUFXLEVBQWQsQ0FESCxDQUVMLENBQUMsS0FGSSxDQUVFLENBQUMsQ0FBRCxFQUFHLElBQUMsQ0FBQSxLQUFKLENBRkY7SUFJUCxJQUFDLENBQUEsR0FBRCxHQUFPLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBVCxDQUFBLENBQ04sQ0FBQyxNQURLLENBQ0UsQ0FBQyxDQUFELEVBQUksQ0FBQyxDQUFDLFFBQUYsR0FBVyxHQUFmLENBREYsQ0FFTixDQUFDLEtBRkssQ0FFQyxDQUFDLElBQUMsQ0FBQSxNQUFGLEVBQVUsQ0FBVixDQUZEO0lBSVAsSUFBQyxDQUFBLElBQUQsR0FBUSxFQUFFLENBQUMsR0FBRyxDQUFDLElBQVAsQ0FBQSxDQUNQLENBQUMsQ0FETSxDQUNKLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxDQUFEO2VBQUssS0FBQyxDQUFBLEdBQUQsQ0FBSyxDQUFDLENBQUMsQ0FBUDtNQUFMO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURJLENBRVAsQ0FBQyxDQUZNLENBRUosQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLENBQUQ7ZUFBSyxLQUFDLENBQUEsR0FBRCxDQUFLLENBQUMsQ0FBQyxDQUFQO01BQUw7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRkk7SUFJUixJQUFDLENBQUEsT0FBRCxHQUFXLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBUCxDQUFBLENBQ1YsQ0FBQyxLQURTLENBQ0gsSUFBQyxDQUFBLEdBREUsQ0FFVixDQUFDLE1BRlMsQ0FFRixRQUZFLENBR1YsQ0FBQyxLQUhTLENBR0gsQ0FIRztJQUtYLElBQUMsQ0FBQSxPQUFELEdBQVcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFQLENBQUEsQ0FDVixDQUFDLEtBRFMsQ0FDSCxJQUFDLENBQUEsR0FERSxDQUVWLENBQUMsTUFGUyxDQUVGLE1BRkU7RUEzQkE7O2lCQStCWixDQUFBLEdBQUcsU0FBQTtXQUFHLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBQyxDQUFBLE1BQVA7RUFBSDs7Ozs7O0FBR0osR0FBQSxHQUFNLFNBQUE7QUFDTCxNQUFBO1NBQUEsU0FBQSxHQUNDO0lBQUEsZ0JBQUEsRUFBa0IsSUFBbEI7SUFDQSxZQUFBLEVBQWMsSUFEZDtJQUVBLEtBQUEsRUFDQztNQUFBLE1BQUEsRUFBUSxHQUFSO0tBSEQ7SUFJQSxXQUFBLEVBQWEsc0JBSmI7SUFLQSxVQUFBLEVBQVksQ0FBQyxRQUFELEVBQVcsVUFBWCxFQUF1QixJQUF2QixDQUxaOztBQUZJOztBQVNOLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7OztBQ2hEakIsSUFBQSwwQkFBQTtFQUFBOztBQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsWUFBUjs7QUFDSixDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0FBQ0osT0FBQSxDQUFRLFdBQVI7O0FBRU07RUFDUSxnQkFBQyxFQUFELEVBQUksSUFBSjtJQUFDLElBQUMsQ0FBQSxJQUFEO0lBQUcsSUFBQyxDQUFBLE1BQUQ7SUFDaEIsSUFBQyxDQUFBLEtBQUQsR0FBUztJQUNULElBQUMsQ0FBQSxFQUFELEdBQU0sQ0FBQyxDQUFDLFFBQUYsQ0FBVyxTQUFYO0lBQ04sSUFBQyxDQUFBLFlBQUQsQ0FBQTtFQUhZOztFQUtiLE1BQUMsQ0FBQSxRQUFELENBQVUsUUFBVixFQUNDO0lBQUEsR0FBQSxFQUFLLFNBQUE7YUFDSixDQUFDLENBQUMsS0FBRixHQUFRLENBQUMsQ0FBQyxJQUFDLENBQUEsQ0FBRCxHQUFHLENBQUMsQ0FBQyxNQUFOLENBQUEsR0FBYyxDQUFmO0lBREosQ0FBTDtHQUREOzttQkFJQSxZQUFBLEdBQWMsU0FBQTtBQUNiLFFBQUE7V0FBQSxNQUFtQixDQUFDLElBQUMsQ0FBQSxNQUFGLEVBQVUsSUFBVixDQUFuQixFQUFDLElBQUMsQ0FBQSxjQUFGLEVBQVMsSUFBQyxDQUFBLGNBQVYsRUFBQTtFQURhOzttQkFHZCxNQUFBLEdBQVEsU0FBQTtBQUNQLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBRDtJQUNBLElBQUksSUFBQyxDQUFBLEtBQUYsSUFBYSxDQUFDLENBQUMsS0FBbEI7TUFDQyxNQUFtQixDQUFDLENBQUQsRUFBSSxJQUFKLENBQW5CLEVBQUMsSUFBQyxDQUFBLGNBQUYsRUFBUyxJQUFDLENBQUE7QUFDVixhQUZEOztJQUdBLElBQUksSUFBQyxDQUFBLEtBQUYsSUFBVyxDQUFDLENBQUMsQ0FBQyxLQUFGLEdBQVEsQ0FBQyxDQUFDLEtBQVgsQ0FBZDthQUNDLElBQUMsQ0FBQSxLQUFELEdBQVMsTUFEVjs7RUFMTzs7Ozs7O0FBUUg7RUFDUSxpQkFBQTtJQUNaLElBQUMsQ0FBQSxjQUFELENBQWdCLENBQUMsQ0FBQyxXQUFsQjtFQURZOztvQkFHYixLQUFBLEdBQU0sU0FBQyxPQUFEO0lBQ0wsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQ0M7TUFBQSxTQUFBLEVBQVcsRUFBWDtNQUNBLEdBQUEsRUFBSyxFQURMO01BRUEsTUFBQSxFQUFRLEVBRlI7TUFHQSxLQUFBLEVBQU8sQ0FIUDtNQUlBLEtBQUEsRUFBTyxDQUpQO01BS0EsT0FBQSxFQUFTLENBQUMsQ0FBQyxLQUFGLENBQVMsT0FBVCxDQUxUO0tBREQ7V0FRQSxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsQ0FBaUIsU0FBQyxDQUFEO2FBQ2hCLENBQUMsQ0FBQyxZQUFGLENBQUE7SUFEZ0IsQ0FBakI7RUFUSzs7b0JBWU4sY0FBQSxHQUFnQixTQUFDLENBQUQ7V0FDZixJQUFDLENBQUEsT0FBRCxHQUFXLENBQUMsQ0FBQyxLQUFGLENBQVEsQ0FBUixFQUFVLENBQUMsQ0FBQyxFQUFaLEVBQWdCLENBQUMsQ0FBQyxFQUFGLEdBQUssQ0FBckIsQ0FDVCxDQUFDLEdBRFEsQ0FDSixTQUFDLENBQUQsRUFBRyxDQUFIO2FBQVksSUFBQSxNQUFBLENBQU8sQ0FBUCxFQUFTLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBWCxDQUFUO0lBQVosQ0FESTtFQURJOztvQkFJaEIsSUFBQSxHQUFNLFNBQUE7V0FDTCxDQUFDLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxHQUFnQixJQUFDLENBQUEsU0FBUyxDQUFDLE1BQTVCLENBQUEsS0FBcUM7RUFEaEM7O29CQUdOLFFBQUEsR0FBVSxTQUFBO0FBQ1QsUUFBQTtJQUFBLEdBQUEsR0FDQztNQUFBLENBQUEsRUFBRyxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQWQ7TUFDQSxDQUFBLEVBQUcsQ0FESDtNQUVBLENBQUEsRUFBRyxDQUZIOztJQUdELElBQUMsQ0FBQSxTQUFTLENBQUMsT0FBWCxDQUFtQixTQUFDLENBQUQ7TUFDbEIsSUFBRyxDQUFDLENBQUMsT0FBRixLQUFhLENBQWhCO1FBQ0MsR0FBRyxDQUFDLENBQUo7ZUFDQSxHQUFHLENBQUMsQ0FBSixJQUFRLENBQUEsR0FBRSxHQUFHLENBQUMsRUFGZjs7SUFEa0IsQ0FBbkI7V0FJQSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxHQUFiO0VBVFM7O29CQVlWLEdBQUEsR0FBSyxTQUFBO1dBQ0osSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQ0M7TUFBQSxJQUFBLEVBQU0sQ0FBQyxDQUFDLElBQVI7TUFDQSxLQUFBLEVBQU8sSUFBQyxDQUFBLEtBRFI7TUFFQSxLQUFBLEVBQU8sSUFBQyxDQUFBLEtBRlI7S0FERDtFQURJOztvQkFNTCxPQUFBLEdBQVMsU0FBQyxHQUFEO0FBQ1IsUUFBQTtJQUFBLElBQUMsQ0FBQSxLQUFEO0lBQ0EsR0FBQSxHQUFNLENBQUMsQ0FBQyxNQUFGLENBQVMsQ0FBVCxFQUFXLENBQUMsQ0FBQyxFQUFiO0lBQ04sRUFBQSxHQUFLO0lBQ0wsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxJQUFDLENBQUEsU0FBWCxFQUFzQixTQUFDLENBQUQ7QUFDckIsVUFBQTtNQUFBLENBQUEsR0FBSSxDQUFDLENBQUMsT0FBRixDQUFBO01BQ0osSUFBRyxDQUFBLElBQUssRUFBUjtRQUNDLEdBQUEsR0FBTSxJQUFJLENBQUMsS0FBTCxDQUFXLENBQUMsQ0FBQyxHQUFGLEdBQVEsQ0FBQSxHQUFFLENBQXJCLENBQUEsR0FBd0IsQ0FBQyxDQUFDO2VBQ2hDLEVBQUEsR0FBSyxFQUZOOztJQUZxQixDQUF0QjtJQU1BLElBQUcsQ0FBQyxFQUFBLEdBQUssQ0FBTCxJQUFXLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxHQUFrQixDQUE5QixDQUFBLElBQW9DLENBQUMsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLEtBQW1CLENBQXBCLENBQXZDO01BQ0MsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsT0FBVixFQUFtQixHQUFuQjtNQUNBLEdBQUcsQ0FBQyxLQUFKLENBQVUsR0FBVjtNQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixHQUFoQjthQUNBLElBQUMsQ0FBQSxVQUFELENBQUEsRUFKRDs7RUFWUTs7b0JBZ0JULE1BQUEsR0FBUSxTQUFDLEdBQUQ7SUFDUCxJQUFDLENBQUEsS0FBRDtXQUNBLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBQyxDQUFBLFNBQVYsRUFBcUIsR0FBckI7RUFGTzs7b0JBSVIsTUFBQSxHQUFRLFNBQUE7QUFDUCxRQUFBO0lBQUEsSUFBQSxHQUFPO0lBQ1AsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQWlCLFNBQUMsQ0FBRDtNQUNoQixDQUFDLENBQUMsTUFBRixDQUFBO01BQ0EsSUFBRyxDQUFDLENBQUMsQ0FBQyxLQUFOO2VBQ0MsSUFBSSxDQUFDLElBQUwsQ0FBVSxDQUFDLENBQUMsR0FBWixFQUREOztJQUZnQixDQUFqQjtJQUtBLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBVCxDQUFpQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsR0FBRDtRQUNoQixJQUFHLENBQUMsQ0FBQyxFQUFGLENBQUssR0FBRyxDQUFDLElBQVQsRUFBYyxDQUFDLENBQUMsSUFBaEIsQ0FBSDtpQkFBNkIsS0FBQyxDQUFBLE9BQUQsQ0FBUyxHQUFULEVBQTdCOztNQURnQjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakI7SUFFQSxJQUFDLENBQUEsU0FBUyxDQUFDLE9BQVgsQ0FBbUIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLEdBQUQ7UUFDbEIsR0FBRyxDQUFDLElBQUosQ0FBUyxJQUFUO1FBQ0EsSUFBRyxHQUFHLENBQUMsTUFBUDtpQkFBbUIsS0FBQyxDQUFBLE1BQUQsQ0FBUSxHQUFSLEVBQW5COztNQUZrQjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkI7SUFJQSxJQUFDLENBQUEsR0FBRCxDQUFBO0lBQ0EsSUFBSSxDQUFDLENBQUMsSUFBRixHQUFPLENBQUMsQ0FBQyxTQUFULEtBQW9CLENBQXhCO01BQWdDLElBQUMsQ0FBQSxRQUFELENBQUEsRUFBaEM7O1dBRUEsSUFBQyxDQUFBLFVBQUQsQ0FBQTtFQWhCTzs7b0JBa0JSLFVBQUEsR0FBWSxTQUFBO0FBQ1gsUUFBQTtJQUFBLElBQUcsQ0FBQyxDQUFBLEdBQUksSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFoQixDQUFBLEdBQTBCLENBQTdCO01BQ0MsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLFNBQUMsQ0FBRCxFQUFHLENBQUg7ZUFBUSxDQUFDLENBQUMsR0FBRixHQUFRLENBQUMsQ0FBQztNQUFsQixDQUFoQjtNQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsT0FBWCxDQUFtQixTQUFDLEdBQUQsRUFBSyxDQUFMLEVBQU8sQ0FBUDtlQUNsQixHQUFHLENBQUMsUUFBSixDQUFhLENBQUUsQ0FBQSxDQUFDLENBQUEsR0FBRSxDQUFILENBQUEsR0FBTSxDQUFOLENBQWY7TUFEa0IsQ0FBbkIsRUFGRDs7SUFJQSxJQUFHLENBQUEsS0FBSyxDQUFSO2FBQ0MsSUFBQyxDQUFBLFNBQVUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxRQUFkLENBQXVCLElBQXZCLEVBREQ7O0VBTFc7Ozs7OztBQVFQO0VBQ08sYUFBQyxRQUFEO0lBQUMsSUFBQyxDQUFBLFdBQUQ7SUFDWixDQUFDLENBQUMsTUFBRixDQUFTLElBQVQsRUFDQztNQUFBLEVBQUEsRUFBSSxDQUFDLENBQUMsUUFBRixDQUFBLENBQUo7TUFDQSxLQUFBLEVBQU8sUUFEUDtNQUVBLE1BQUEsRUFBUSxDQUFDLENBQUMsTUFBRixDQUFTLENBQVQsRUFBWSxDQUFDLENBQUMsV0FBRixHQUFnQixDQUFDLENBQUMsUUFBbEIsR0FBMkIsRUFBdkMsQ0FGUjtNQUdBLE1BQUEsRUFBUSxLQUhSO0tBREQ7RUFEVzs7Z0JBT1osWUFBQSxHQUFhLFNBQUE7V0FDWixJQUFDLENBQUEsSUFBRCxHQUFRLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBVCxFQUFZLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxDQUFDLENBQVYsRUFBWSxDQUFaLENBQXRCO0VBREk7O2dCQUliLFFBQUEsR0FBVSxTQUFDLElBQUQ7SUFBQyxJQUFDLENBQUEsT0FBRDtFQUFEOztnQkFFVixPQUFBLEdBQVEsU0FBQTtBQUNQLFFBQUE7SUFBQSxJQUFHLENBQUMsSUFBQyxDQUFBLElBQUw7QUFBZSxhQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQyxDQUFDLEVBQUYsR0FBSyxDQUFoQixFQUF0Qjs7SUFDQSxHQUFBLEdBQU0sSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLEdBQVksSUFBQyxDQUFBO0lBQ25CLElBQUcsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxHQUFOLEVBQVUsQ0FBVixDQUFIO2FBQXFCLEdBQUEsR0FBSSxDQUFDLENBQUMsR0FBM0I7S0FBQSxNQUFBO2FBQW9DLElBQXBDOztFQUhPOztnQkFLUixJQUFBLEdBQU0sU0FBQTtBQUNMLFFBQUE7V0FBQSxNQUEwQixDQUFDLE1BQUQsRUFBWSxDQUFDLENBQUMsSUFBZCxFQUFvQixJQUFwQixDQUExQixFQUFDLElBQUMsQ0FBQSxhQUFGLEVBQVEsSUFBQyxDQUFBLGFBQVQsRUFBZSxJQUFDLENBQUEsZUFBaEIsRUFBQTtFQURLOztnQkFHTixTQUFBLEdBQVcsU0FBQTtJQUNWLElBQUMsQ0FBQSxFQUFELEdBQU0sSUFBQyxDQUFBLElBQUQsR0FBUSxDQUFDLENBQUM7SUFDaEIsSUFBQyxDQUFBLEVBQUQsR0FBTSxJQUFJLENBQUMsR0FBTCxDQUFVLENBQUMsQ0FBQyxDQUFDLElBQUgsR0FBVSxJQUFDLENBQUEsRUFBckIsRUFBeUIsQ0FBQyxDQUFDLEtBQUYsR0FBVSxJQUFDLENBQUEsRUFBcEM7SUFDTixJQUFDLENBQUEsRUFBRCxHQUFNLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBO1dBQ2YsSUFBQyxDQUFBLElBQUQsR0FBUyxJQUFDLENBQUEsRUFBRCxHQUFJLElBQUMsQ0FBQTtFQUpKOztnQkFNWCxNQUFBLEdBQVEsU0FBQTtBQUNQLFFBQUE7SUFBQSxJQUFHLENBQUMsQ0FBQyxHQUFGLENBQU0sSUFBQyxDQUFBLElBQVAsRUFBWSxJQUFDLENBQUEsS0FBYixDQUFIO2FBQTJCLE1BQW1CLENBQUMsSUFBQyxDQUFBLElBQUYsRUFBUSxJQUFDLENBQUEsSUFBVCxDQUFuQixFQUFDLElBQUMsQ0FBQSxjQUFGLEVBQVEsSUFBQyxDQUFBLGVBQVQsRUFBQSxJQUEzQjs7RUFETzs7Z0JBR1IsS0FBQSxHQUFNLFNBQUMsSUFBRDtBQUNMLFFBQUE7SUFETSxJQUFDLENBQUEsTUFBRDtJQUNOLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFDLElBQUMsQ0FBQSxHQUFELEdBQU8sSUFBQyxDQUFBLFFBQVQsQ0FBQSxHQUFtQixDQUFDLENBQUMsRUFBaEM7V0FFZixNQUFzQyxDQUFDLElBQUMsQ0FBQSxJQUFGLEVBQU8sS0FBUCxFQUFhLENBQWIsRUFBZ0IsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsV0FBVixDQUFoQixDQUF0QyxFQUFDLElBQUMsQ0FBQSxjQUFGLEVBQVMsSUFBQyxDQUFBLGVBQVYsRUFBa0IsSUFBQyxDQUFBLGdCQUFuQixFQUE0QixJQUFDLENBQUEsY0FBN0IsRUFBQTtFQUhLOztnQkFLTixJQUFBLEdBQU0sU0FBQyxJQUFEO0FBQ0wsUUFBQTtJQUFBLElBQUcsSUFBQyxDQUFBLE9BQUQsR0FBVyxDQUFkO2FBQXFCLElBQUMsQ0FBQSxPQUFELEdBQXJCO0tBQUEsTUFBQTtNQUVDLElBQUcsSUFBQyxDQUFBLEdBQUQsS0FBUSxJQUFDLENBQUEsV0FBWjtlQUNDLElBQUMsQ0FBQSxJQUFELENBQUEsRUFERDtPQUFBLE1BQUE7UUFHQyxRQUFBLEdBQVcsQ0FBQyxJQUFDLENBQUEsR0FBRCxHQUFPLENBQVIsQ0FBQSxHQUFXLENBQUMsQ0FBQztRQUN4QixJQUFHLENBQUMsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFBLElBQWMsQ0FBQyxDQUFDLEtBQWpCLENBQUEsSUFBNEIsQ0FBQyxhQUFnQixJQUFoQixFQUFBLFFBQUEsS0FBRCxDQUEvQjtpQkFDQyxJQUFDLENBQUEsR0FBRCxHQUFPLFNBRFI7U0FBQSxNQUFBO2lCQUdDLElBQUMsQ0FBQSxPQUFELEdBQVcsQ0FBQyxDQUFDLGNBSGQ7U0FKRDtPQUZEOztFQURLOzs7Ozs7QUFZUCxNQUFNLENBQUMsT0FBUCxHQUNDO0VBQUEsR0FBQSxFQUFLLEdBQUw7RUFDQSxPQUFBLEVBQVMsT0FEVDtFQUVBLE1BQUEsRUFBUSxNQUZSOzs7Ozs7QUNqS0QsSUFBQTs7QUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0FBQ0wsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztBQUNKLE9BQUEsQ0FBUSxXQUFSOztBQUVNO0VBQ08sa0JBQUE7SUFDWCxDQUFDLENBQUMsTUFBRixDQUFTLElBQVQsRUFDQztNQUFBLFFBQUEsRUFBVSxHQUFWO01BQ0EsSUFBQSxFQUFNLENBRE47TUFFQSxLQUFBLEVBQU8sQ0FGUDtNQUdBLElBQUEsRUFBTSxFQUhOO01BSUEsYUFBQSxFQUFlLENBSmY7TUFLQSxRQUFBLEVBQVUsRUFMVjtNQU1BLElBQUEsRUFBTSxFQU5OO01BT0EsS0FBQSxFQUFPLENBUFA7TUFRQSxXQUFBLEVBQWEsR0FSYjtNQVNBLFNBQUEsRUFBVyxDQVRYO01BVUEsRUFBQSxFQUFJLElBVko7TUFXQSxLQUFBLEVBQU8sRUFYUDtNQVlBLEtBQUEsRUFBTyxFQVpQO01BYUEsSUFBQSxFQUFNLEdBYk47TUFjQSxXQUFBLEVBQWEsRUFkYjtNQWVBLEdBQUEsRUFBSyxDQWZMO01BZ0JBLE1BQUEsRUFBUSxDQWhCUjtLQUREO0lBbUJBLElBQUMsQ0FBQSxNQUFELEdBQVUsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFULENBQUEsQ0FDVCxDQUFDLE1BRFEsQ0FDRCxDQUFDLENBQUMsS0FBRixDQUFRLENBQVIsRUFBVSxJQUFDLENBQUEsRUFBWCxFQUFjLElBQUMsQ0FBQSxFQUFELEdBQUksQ0FBbEIsQ0FEQyxDQUVULENBQUMsS0FGUSxDQUVGLENBQ04sU0FETSxFQUVOLFNBRk0sRUFHTixTQUhNLEVBSU4sU0FKTSxFQUtOLFNBTE0sRUFNTixTQU5NLENBRkU7SUFXVixJQUFDLENBQUEsS0FBRCxHQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBVCxDQUFBLENBQ1IsQ0FBQyxNQURPLENBQ0EsQ0FBQyxDQUFELEVBQUcsSUFBQyxDQUFBLEVBQUosQ0FEQSxDQUVSLENBQUMsS0FGTyxDQUVELENBQUMsQ0FBRCxFQUFHLEdBQUgsQ0FGQztFQS9CRTs7cUJBbUNaLE9BQUEsR0FBUyxTQUFBO1dBQ1IsSUFBQyxDQUFBLElBQUQ7RUFEUTs7cUJBRVQsVUFBQSxHQUFZLFNBQUE7SUFDWCxJQUFDLENBQUEsR0FBRDtXQUNBLElBQUMsQ0FBQSxJQUFELEdBQVE7RUFGRzs7Ozs7O0FBSWIsTUFBTSxDQUFDLE9BQVAsR0FBcUIsSUFBQSxRQUFBLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiYW5ndWxhciA9IHJlcXVpcmUgJ2FuZ3VsYXInXG5kMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xue0NhcixUcmFmZmljLFNpZ25hbH0gPSByZXF1aXJlICcuL21vZGVscydcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLGVsKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHBhdXNlZDogdHJ1ZVxuXHRcdFx0dHJhZmZpYzogbmV3IFRyYWZmaWNcblx0XHRcdHBhbDogXy5yYW5nZSAwLFMucmwsUy5ybC8yNVxuXHRcdFx0Y2FyczogXy5yYW5nZSBTLm51bV9jYXJzXG5cdFx0XHRcdFx0Lm1hcCAobiktPiBcdG5ldyBDYXIoIFMuZGlzdGFuY2UgKyBfLnJhbmRvbSggLTgsNSkgKVxuXHRcdEBzY29wZS5TID0gU1xuXHRcdEBkYXlfc3RhcnQoKVxuXHRcdEBzY29wZS4kd2F0Y2ggJ1MubnVtX3NpZ25hbHMnLChuKT0+XG5cdFx0XHRTLm9mZnNldCA9IE1hdGgucm91bmQoUy5vZmZzZXQqbikvblxuXHRcdFx0QHRyYWZmaWMuY2hhbmdlX3NpZ25hbHMgblxuXG5cdGNoYW5nZXI6ICh2KS0+XG5cdFx0QHRyYWZmaWMuc2lnbmFscy5mb3JFYWNoIChzKS0+XG5cdFx0XHRzLnJlc2V0X29mZnNldCgpXG5cblx0XHQjIEB0cmFmZmljLmNoYW5nZV9zaWduYWxzIFMubnVtX3NpZ25hbHNcblxuXHRyb3RhdG9yOiAoY2FyKS0+IFwicm90YXRlKCN7Uy5zY2FsZShjYXIubG9jKX0pIHRyYW5zbGF0ZSgwLDUwKVwiXG5cblx0ZGF5X3N0YXJ0OiAtPlxuXHRcdFMucmVzZXRfdGltZSgpXG5cdFx0QHBoeXNpY3MgPSB0cnVlICNwaHlzaWNzIHN0YWdlIGhhcHBlbmluZ1xuXHRcdEB0cmFmZmljLnJlc2V0IEBjYXJzXG5cdFx0Xy5pbnZva2UgQGNhcnMsICdhc3NpZ25fZXJyb3InXG5cdFx0QHRpY2soKVxuXG5cdGRheV9lbmQ6IC0+XG5cdFx0QHBoeXNpY3MgPSBmYWxzZSAjcGh5c2ljcyBzdGFnZSBub3QgaGFwcGVuaW5nXG5cdFx0Xy5pbnZva2UgQGNhcnMsICdldmFsX2Nvc3QnXG5cdFx0Xy5zYW1wbGUgQGNhcnMsIDI1XG5cdFx0XHQuZm9yRWFjaCAoZCktPiBkLmNob29zZSgpXG5cblx0XHRzZXRUaW1lb3V0ID0+IEBkYXlfc3RhcnQoKVxuXG5cdGNsaWNrOiAodmFsKSAtPiBpZiAhdmFsIHRoZW4gQHBsYXkoKVxuXHRwYXVzZTogLT4gQHBhdXNlZCA9IHRydWVcblx0dGljazogLT5cblx0XHRpZiBAcGh5c2ljc1xuXHRcdFx0ZDMudGltZXIgPT5cblx0XHRcdFx0XHRpZiBAdHJhZmZpYy5kb25lKClcblx0XHRcdFx0XHRcdEBkYXlfZW5kKClcblx0XHRcdFx0XHRcdHRydWVcblx0XHRcdFx0XHRTLmFkdmFuY2UoKVxuXHRcdFx0XHRcdEB0cmFmZmljLnVwZGF0ZSgpXG5cdFx0XHRcdFx0QHNjb3BlLiRldmFsQXN5bmMoKVxuXHRcdFx0XHRcdGlmICFAcGF1c2VkIHRoZW4gQHRpY2soKVxuXHRcdFx0XHRcdHRydWVcblx0XHRcdFx0LCBTLnBhY2VcblxuXHRzaWdfY29sOihncmVlbikgLT4gaWYgZ3JlZW4gdGhlbiAnIzRDQUY1MCcgZWxzZSAnI0Y0NDMzNidcblxuXHRwbGF5OiAtPlxuXHRcdEBwYXVzZSgpXG5cdFx0ZDMudGltZXIuZmx1c2goKVxuXHRcdEBwYXVzZWQgPSBmYWxzZVxuXHRcdEB0aWNrKClcblxudmlzRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IHt9XG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvdmlzLmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5sZWF2ZXIgPSAtPlxuXHRcdGFuaW1hdGUgPSBcblx0XHRcdGxlYXZlOiAoZWwpLT5cblx0XHRcdFx0ZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdFx0LnNlbGVjdCAncmVjdCdcblx0XHRcdFx0XHQudHJhbnNpdGlvbigpXG5cdFx0XHRcdFx0LmR1cmF0aW9uIDUwXG5cdFx0XHRcdFx0LmVhc2UgJ2N1YmljJ1xuXHRcdFx0XHRcdC5hdHRyICd0cmFuc2Zvcm0nLCdzY2FsZSgxLjIsMSknXG5cdFx0XHRcdFx0LmF0dHIgJ2ZpbGwnLCcjZWVlJ1xuXHRcdFx0XHRcdC50cmFuc2l0aW9uKClcblx0XHRcdFx0XHQuZHVyYXRpb24gMTUwXG5cdFx0XHRcdFx0LmVhc2UgJ2N1YmljJ1xuXHRcdFx0XHRcdC5hdHRyICd0cmFuc2Zvcm0nLCdzY2FsZSgwLDEpJ1xuXHRcdFx0ZW50ZXI6IChlbCktPlxuXHRcdFx0XHRkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0XHQuc2VsZWN0ICdyZWN0J1xuXHRcdFx0XHRcdC5hdHRyICd0cmFuc2Zvcm0nLCdzY2FsZSgwLC41KSdcblx0XHRcdFx0XHQudHJhbnNpdGlvbigpXG5cdFx0XHRcdFx0LmR1cmF0aW9uIDYwXG5cdFx0XHRcdFx0LmVhc2UgJ2N1YmljJ1xuXHRcdFx0XHRcdC5hdHRyICd0cmFuc2Zvcm0nLCdzY2FsZSgxLjIsMSknXG5cdFx0XHRcdFx0LnRyYW5zaXRpb24oKVxuXHRcdFx0XHRcdC5kdXJhdGlvbiAxNTBcblx0XHRcdFx0XHQuZWFzZSAnY3ViaWMnXG5cdFx0XHRcdFx0LmF0dHIgJ3RyYW5zZm9ybScsJ3NjYWxlKDEpJ1xuXG5hbmd1bGFyLm1vZHVsZSAnbWFpbkFwcCcgLCBbcmVxdWlyZSAnYW5ndWxhci1tYXRlcmlhbCcgLCByZXF1aXJlICdhbmd1bGFyLWFuaW1hdGUnXVxuXHQuZGlyZWN0aXZlICd2aXNEZXInLCB2aXNEZXJcblx0LmRpcmVjdGl2ZSAnZGF0dW0nLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvZGF0dW0nXG5cdC5kaXJlY3RpdmUgJ2QzRGVyJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL2QzRGVyJ1xuXHQuZGlyZWN0aXZlICdjdW1DaGFydCcsIHJlcXVpcmUgJy4vY3VtQ2hhcnQnXG5cdC5kaXJlY3RpdmUgJ21mZENoYXJ0JywgcmVxdWlyZSAnLi9tZmQnXG5cdC5kaXJlY3RpdmUgJ2hvckF4aXMnLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMveEF4aXMnXG5cdC5kaXJlY3RpdmUgJ3ZlckF4aXMnLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMveUF4aXMnXG5cdCMgLmFuaW1hdGlvbiAnLmctY2FyJywgbGVhdmVyXG5cdC5kaXJlY3RpdmUgJ3NsaWRlckRlcicsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9zbGlkZXInXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsZWwpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0d2lkdGg6IDMwMFxuXHRcdFx0aGVpZ2h0OiAzMDBcblx0XHRcdG06IFxuXHRcdFx0XHR0OiAxMFxuXHRcdFx0XHRsOiA0MFxuXHRcdFx0XHRyOiAxNVxuXHRcdFx0XHRiOiAzNVxuXG5cdFx0QGhvciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHRcdC5kb21haW4gWzAsUy5ydXNoX2xlbmd0aF1cblx0XHRcdFx0LnJhbmdlIFswLEB3aWR0aF1cblxuXHRcdEB2ZXIgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCwgUy5udW1fY2Fyc11cblx0XHRcdC5yYW5nZSBbQGhlaWdodCwgMF1cblxuXHRcdEBsaW5lRW4gPSBkMy5zdmcubGluZSgpXG5cdFx0XHQueCAoZCk9PkBob3IgZC50aW1lXG5cdFx0XHQueSAoZCk9PkB2ZXIgZC5jdW1FblxuXG5cdFx0QGxpbmVFeCA9IGQzLnN2Zy5saW5lKClcblx0XHRcdC54IChkKT0+QGhvciBkLnRpbWVcblx0XHRcdC55IChkKT0+QHZlciBkLmN1bUV4XG5cblx0XHRAaG9yQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAaG9yXG5cdFx0XHQub3JpZW50ICdib3R0b20nXG5cdFx0XHQudGlja3MgOFxuXG5cblx0XHRAdmVyQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAdmVyXG5cdFx0XHQub3JpZW50ICdsZWZ0J1xuXG5cblx0ZXg6IC0+XG5cdFx0QGxpbmVFeCBAY3VtXG5cdGVuOiAtPlxuXHRcdEBsaW5lRW4gQGN1bVxuXHRcbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWVcblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHRzY29wZTogXG5cdFx0XHRjdW06ICc9J1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L2NoYXJ0Lmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5hbmd1bGFyID0gcmVxdWlyZSAnYW5ndWxhcidcblxuZGVyID0gKCRwYXJzZSktPiAjZ29lcyBvbiBhIHN2ZyBlbGVtZW50XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHJlc3RyaWN0OiAnQSdcblx0XHRzY29wZTogXG5cdFx0XHRkM0RlcjogJz0nXG5cdFx0XHR0cmFuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdHUgPSAndC0nICsgTWF0aC5yYW5kb20oKVxuXHRcdFx0aGFzVHJhbnNpdGlvbmVkID0gZmFsc2Vcblx0XHRcdHNjb3BlLiR3YXRjaCAnZDNEZXInXG5cdFx0XHRcdCwgKHYpLT5cblx0XHRcdFx0XHRpZiBzY29wZS50cmFuIGFuZCBoYXNUcmFuc2l0aW9uZWRcblx0XHRcdFx0XHRcdGhhc1RyYW5zaXRpb25lZCA9IHRydWVcblx0XHRcdFx0XHRcdHNlbC50cmFuc2l0aW9uIHVcblx0XHRcdFx0XHRcdFx0LmF0dHIgdlxuXHRcdFx0XHRcdFx0XHQuY2FsbCBzY29wZS50cmFuXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0aGFzVHJhbnNpdGlvbmVkID0gdHJ1ZVxuXHRcdFx0XHRcdFx0c2VsLmF0dHIgdlxuXHRcdFx0XHQsIHRydWVcbm1vZHVsZS5leHBvcnRzID0gZGVyIiwibW9kdWxlLmV4cG9ydHMgPSAoJHBhcnNlKS0+XG5cdChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRkMy5zZWxlY3QoZWxbMF0pLmRhdHVtICRwYXJzZShhdHRyLmRhdHVtKShzY29wZSkiLCJkZXIgPSAtPlxuXHRyZXMgPSBcblx0XHRzY29wZTogXG5cdFx0XHRsYWJlbDogJ0AnXG5cdFx0XHRteURhdGE6ICc9J1xuXHRcdFx0bWluOiAnPSdcblx0XHRcdG1heDogJz0nXG5cdFx0XHRzdGVwOiAnPSdcblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHRyZXBsYWNlOiB0cnVlXG5cdFx0Y29udHJvbGxlcjogLT5cblx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3Qvc2xpZGVyLmh0bWwnXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcblxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGZ1bjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2NhbGUgPSBzY29wZS5mdW4uc2NhbGUoKVxuXG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LmNsYXNzZWQgJ2hvciBheGlzJywgdHJ1ZVxuXG5cdFx0XHRzZWwuY2FsbCBzY29wZS5mdW5cblx0XHRcdFxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZnVuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzY2FsZSA9IHNjb3BlLmZ1bi5zY2FsZSgpXG5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuY2xhc3NlZCAndmVyIGF4aXMnLCB0cnVlXG5cblx0XHRcdHNlbC5jYWxsIHNjb3BlLmZ1blxuXHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsIid1c2Ugc3RyaWN0J1xuXG5GdW5jdGlvbjo6cHJvcGVydHkgPSAocHJvcCwgZGVzYykgLT5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsIHByb3AsIGRlc2MiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsZWwpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0d2lkdGg6IDMwMFxuXHRcdFx0aGVpZ2h0OiAzMDBcblx0XHRcdG06IFxuXHRcdFx0XHR0OiAxMFxuXHRcdFx0XHRsOiA0MFxuXHRcdFx0XHRyOiAxOFxuXHRcdFx0XHRiOiAzNVxuXG5cdFx0QGhvciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHRcdC5kb21haW4gWzAsUy5udW1fY2FycyouOF1cblx0XHRcdFx0LnJhbmdlIFswLEB3aWR0aF1cblxuXHRcdEB2ZXIgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCwgUy5udW1fY2FycyouNTVdXG5cdFx0XHQucmFuZ2UgW0BoZWlnaHQsIDBdXG5cblx0XHRAbGluZSA9IGQzLnN2Zy5saW5lKClcblx0XHRcdC54IChkKT0+QGhvciBkLm5cblx0XHRcdC55IChkKT0+QHZlciBkLmZcblxuXHRcdEBob3JBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEBob3Jcblx0XHRcdC5vcmllbnQgJ2JvdHRvbSdcblx0XHRcdC50aWNrcyA4XG5cblx0XHRAdmVyQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAdmVyXG5cdFx0XHQub3JpZW50ICdsZWZ0J1xuXG5cdGQ6IC0+IEBsaW5lIEBtZW1vcnlcblxuXHRcbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWVcblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHRzY29wZTogXG5cdFx0XHRtZW1vcnk6ICc9J1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L21mZENoYXJ0Lmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsIlMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbnJlcXVpcmUgJy4vaGVscGVycydcblxuY2xhc3MgU2lnbmFsXG5cdGNvbnN0cnVjdG9yOiAoQGksQGxvYyktPlxuXHRcdEBncmVlbiA9IHRydWVcblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdzaWduYWwtJ1xuXHRcdEByZXNldF9vZmZzZXQoKVxuXG5cdEBwcm9wZXJ0eSAnb2Zmc2V0JywgXG5cdFx0Z2V0OiAtPiBcblx0XHRcdFMucGhhc2UqKChAaSpTLm9mZnNldCklMSlcblxuXHRyZXNldF9vZmZzZXQ6IC0+XG5cdFx0W0Bjb3VudCwgQGdyZWVuXSA9IFtAb2Zmc2V0LCB0cnVlXVxuXG5cdHVwZGF0ZTogLT5cblx0XHRAY291bnQrK1xuXHRcdGlmIChAY291bnQpID49IChTLnBoYXNlKVxuXHRcdFx0W0Bjb3VudCwgQGdyZWVuXSA9IFswLCB0cnVlXVxuXHRcdFx0cmV0dXJuXG5cdFx0aWYgKEBjb3VudCk+PSAoUy5ncmVlbipTLnBoYXNlKVxuXHRcdFx0QGdyZWVuID0gZmFsc2VcblxuY2xhc3MgVHJhZmZpY1xuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAY2hhbmdlX3NpZ25hbHMgUy5udW1fc2lnbmFsc1xuXG5cdHJlc2V0Oih3YWl0aW5nKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHRyYXZlbGluZzogW11cblx0XHRcdGN1bTogW11cblx0XHRcdG1lbW9yeTogW11cblx0XHRcdGN1bUVuOiAwXG5cdFx0XHRjdW1FeDogMFxuXHRcdFx0d2FpdGluZzogXy5jbG9uZSggd2FpdGluZylcblxuXHRcdEBzaWduYWxzLmZvckVhY2ggKHMpLT5cblx0XHRcdHMucmVzZXRfb2Zmc2V0KClcblxuXHRjaGFuZ2Vfc2lnbmFsczogKG4pLT5cblx0XHRAc2lnbmFscyA9IF8ucmFuZ2UgMCxTLnJsLCBTLnJsL25cblx0XHRcdFx0Lm1hcCAoZixpKS0+IG5ldyBTaWduYWwoaSxNYXRoLmZsb29yKGYpKVxuXG5cdGRvbmU6IC0+XG5cdFx0KEB3YWl0aW5nLmxlbmd0aCtAdHJhdmVsaW5nLmxlbmd0aCk9PTBcblxuXHRyZW1lbWJlcjogLT5cblx0XHRtZW0gPSBcblx0XHRcdG46IEB0cmF2ZWxpbmcubGVuZ3RoXG5cdFx0XHR2OiAwXG5cdFx0XHRmOiAwXG5cdFx0QHRyYXZlbGluZy5mb3JFYWNoIChkKS0+XG5cdFx0XHRpZiBkLnN0b3BwZWQgPT0gMFxuXHRcdFx0XHRtZW0uZisrXG5cdFx0XHRcdG1lbS52Kz0oMS9tZW0ubilcblx0XHRAbWVtb3J5LnB1c2ggbWVtXG5cblxuXHRsb2c6IC0+XG5cdFx0QGN1bS5wdXNoXG5cdFx0XHR0aW1lOiBTLnRpbWVcblx0XHRcdGN1bUVuOiBAY3VtRW5cblx0XHRcdGN1bUV4OiBAY3VtRXhcblxuXHRyZWNlaXZlOiAoY2FyKS0+XG5cdFx0QGN1bUVuKytcblx0XHRsb2MgPSBfLnJhbmRvbSAwLFMucmxcblx0XHRnMCA9IDBcblx0XHRfLmZvckVhY2ggQHRyYXZlbGluZywgKGMpLT5cblx0XHRcdGcgPSBjLmdldF9nYXAoKVxuXHRcdFx0aWYgZyA+PSBnMFxuXHRcdFx0XHRsb2MgPSBNYXRoLmZsb29yKGMubG9jICsgZy8yKSVTLnJsXG5cdFx0XHRcdGcwID0gZ1xuXG5cdFx0aWYgKGcwID4gMCBhbmQgQHRyYXZlbGluZy5sZW5ndGg+MCkgb3IgKEB0cmF2ZWxpbmcubGVuZ3RoPT0wKVxuXHRcdFx0Xy5yZW1vdmUgQHdhaXRpbmcsIGNhclxuXHRcdFx0Y2FyLmVudGVyIGxvY1xuXHRcdFx0QHRyYXZlbGluZy5wdXNoIGNhclxuXHRcdFx0QG9yZGVyX2NhcnMoKVxuXG5cdHJlbW92ZTogKGNhciktPlxuXHRcdEBjdW1FeCsrXG5cdFx0Xy5yZW1vdmUgQHRyYXZlbGluZywgY2FyXG5cblx0dXBkYXRlOiAtPlxuXHRcdHJlZHMgPSBbXVxuXHRcdEBzaWduYWxzLmZvckVhY2ggKHMpLT5cblx0XHRcdHMudXBkYXRlKClcblx0XHRcdGlmICFzLmdyZWVuXG5cdFx0XHRcdHJlZHMucHVzaCBzLmxvY1xuXG5cdFx0QHdhaXRpbmcuZm9yRWFjaCAoY2FyKT0+XG5cdFx0XHRpZiBfLmx0IGNhci50X2VuLFMudGltZSB0aGVuIEByZWNlaXZlIGNhclxuXHRcdEB0cmF2ZWxpbmcuZm9yRWFjaCAoY2FyKT0+XG5cdFx0XHRjYXIubW92ZSByZWRzXG5cdFx0XHRpZiBjYXIuZXhpdGVkIHRoZW4gQHJlbW92ZSBjYXJcblxuXHRcdEBsb2coKVxuXHRcdGlmIChTLnRpbWUlUy5mcmVxdWVuY3k9PTApIHRoZW4gQHJlbWVtYmVyKClcblxuXHRcdEBvcmRlcl9jYXJzKClcblxuXHRvcmRlcl9jYXJzOiAtPlxuXHRcdGlmIChsID0gQHRyYXZlbGluZy5sZW5ndGgpID4gMVxuXHRcdFx0QHRyYXZlbGluZy5zb3J0IChhLGIpLT4gYS5sb2MgLSBiLmxvY1xuXHRcdFx0QHRyYXZlbGluZy5mb3JFYWNoIChjYXIsaSxrKS0+XG5cdFx0XHRcdGNhci5zZXRfbmV4dCBrWyhpKzEpJWxdXG5cdFx0aWYgbCA9PSAxXG5cdFx0XHRAdHJhdmVsaW5nWzBdLnNldF9uZXh0IG51bGxcblxuY2xhc3MgQ2FyXG5cdGNvbnN0cnVjdG9yOihAZGlzdGFuY2UpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0aWQ6IF8udW5pcXVlSWQoKVxuXHRcdFx0Y29zdDA6IEluZmluaXR5IFxuXHRcdFx0dGFyZ2V0OiBfLnJhbmRvbSA0LChTLnJ1c2hfbGVuZ3RoIC0gUy5kaXN0YW5jZS0zNSlcblx0XHRcdGV4aXRlZDogZmFsc2VcblxuXHRhc3NpZ25fZXJyb3I6LT4gXG5cdFx0QHRfZW4gPSBNYXRoLm1heCAwLChAdGFyZ2V0ICsgXy5yYW5kb20gLTIsMilcblxuXHQjIHNldHRlcnNcblx0c2V0X25leHQ6IChAbmV4dCktPlxuXG5cdGdldF9nYXA6LT5cblx0XHRpZiAhQG5leHQgdGhlbiByZXR1cm4gTWF0aC5mbG9vciBTLnJsLzJcblx0XHRnYXAgPSBAbmV4dC5sb2MgLSBAbG9jXG5cdFx0aWYgXy5sdGUgZ2FwLDAgdGhlbiAoZ2FwK1MucmwpIGVsc2UgZ2FwXG5cblx0ZXhpdDogLT5cblx0XHRbQG5leHQsIEB0X2V4LCBAZXhpdGVkXSA9IFt1bmRlZmluZWQsIFMudGltZSwgdHJ1ZV1cblxuXHRldmFsX2Nvc3Q6IC0+XG5cdFx0QHNkID0gQHRfZXggLSBTLndpc2hcblx0XHRAc3AgPSBNYXRoLm1heCggLVMuYmV0YSAqIEBzZCwgUy5nYW1tYSAqIEBzZClcblx0XHRAdHQgPSBAdF9leCAtIEB0X2VuXG5cdFx0QGNvc3QgPSAgQHR0K0BzcCBcblxuXHRjaG9vc2U6IC0+XG5cdFx0aWYgXy5sdGUgQGNvc3QsQGNvc3QwIHRoZW4gW0Bjb3N0MCxAdGFyZ2V0XSA9IFtAY29zdCwgQHRfZW5dXG5cblx0ZW50ZXI6KEBsb2MpLT5cblx0XHRAZGVzdGluYXRpb24gPSBNYXRoLmZsb29yIChAbG9jICsgQGRpc3RhbmNlKSVTLnJsXG5cdFx0IyBAZGVzdGluYXRpb24gPSBNYXRoLmZsb29yIEBkZXN0aW5hdGlvblxuXHRcdFtAY29zdDAsIEBleGl0ZWQsIEBzdG9wcGVkLCBAY29sb3JdID0gW0Bjb3N0LGZhbHNlLDAsIFMuY29sb3JzKEBkZXN0aW5hdGlvbildXG5cblx0bW92ZTogKHJlZHMpLT5cblx0XHRpZiBAc3RvcHBlZCA+IDAgdGhlbiBAc3RvcHBlZC0tXG5cdFx0ZWxzZVxuXHRcdFx0aWYgQGxvYyA9PSBAZGVzdGluYXRpb25cblx0XHRcdFx0QGV4aXQoKVxuXHRcdFx0ZWxzZSBcblx0XHRcdFx0bmV4dF9sb2MgPSAoQGxvYyArIDEpJVMucmxcblx0XHRcdFx0aWYgKEBnZXRfZ2FwKCkgPj0gUy5zcGFjZSkgYW5kIChuZXh0X2xvYyBub3QgaW4gcmVkcylcblx0XHRcdFx0XHRAbG9jID0gbmV4dF9sb2Ncblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdEBzdG9wcGVkID0gUy5zdG9wcGluZ190aW1lXG5cbm1vZHVsZS5leHBvcnRzID0gXG5cdENhcjogQ2FyXG5cdFRyYWZmaWM6IFRyYWZmaWNcblx0U2lnbmFsOiBTaWduYWxcbiIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xucmVxdWlyZSAnLi9oZWxwZXJzJ1xuXG5jbGFzcyBTZXR0aW5nc1xuXHRjb25zdHJ1Y3RvcjotPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRudW1fY2FyczogMjUwXG5cdFx0XHR0aW1lOiAwXG5cdFx0XHRzcGFjZTogNVxuXHRcdFx0cGFjZTogMTVcblx0XHRcdHN0b3BwaW5nX3RpbWU6IDZcblx0XHRcdGRpc3RhbmNlOiA2MFxuXHRcdFx0YmV0YTogLjVcblx0XHRcdGdhbW1hOiAyXG5cdFx0XHRydXNoX2xlbmd0aDogMjUwXG5cdFx0XHRmcmVxdWVuY3k6IDhcblx0XHRcdHJsOiAxMDAwXG5cdFx0XHRwaGFzZTogNTBcblx0XHRcdGdyZWVuOiAuNVxuXHRcdFx0d2lzaDogMTUwXG5cdFx0XHRudW1fc2lnbmFsczogMTBcblx0XHRcdGRheTogMFxuXHRcdFx0b2Zmc2V0OiAwXG5cblx0XHRAY29sb3JzID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gXy5yYW5nZSAwLEBybCxAcmwvNlxuXHRcdFx0LnJhbmdlIFtcblx0XHRcdFx0JyNGNDQzMzYnLCAjcmVkXG5cdFx0XHRcdCcjMjE5NkYzJywgI2JsdWVcblx0XHRcdFx0JyNFOTFFNjMnLCAjcGlua1xuXHRcdFx0XHQnIzAwQkNENCcsICNjeWFuXG5cdFx0XHRcdCcjRkZDMTA3JywgI2FtYmVyXG5cdFx0XHRcdCcjNENBRjUwJywgI2dyZWVuXG5cdFx0XHRcdF1cblxuXHRcdEBzY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLEBybF1cblx0XHRcdC5yYW5nZSBbMCwzNjBdXG5cblx0YWR2YW5jZTogLT5cblx0XHRAdGltZSsrXG5cdHJlc2V0X3RpbWU6IC0+XG5cdFx0QGRheSsrXG5cdFx0QHRpbWUgPSAwXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFNldHRpbmdzKCkiXX0=
