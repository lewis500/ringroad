(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Car, Ctrl, S, Signal, Traffic, _, angular, d3, leaver, ref, visDer;

angular = require('angular');

d3 = require('d3');

_ = require('lodash');

S = require('./settings');

ref = require('./models'), Car = ref.Car, Traffic = ref.Traffic, Signal = ref.Signal;

Ctrl = (function() {
  function Ctrl(scope, el) {
    var i, ref1, results;
    this.scope = scope;
    _.assign(this, {
      paused: true,
      traffic: new Traffic,
      pal: _.range(0, S.rl, S.rl / 25)
    });
    this.cars = (function() {
      results = [];
      for (var i = 0, ref1 = S.num_cars; 0 <= ref1 ? i < ref1 : i > ref1; 0 <= ref1 ? i++ : i--){ results.push(i); }
      return results;
    }).apply(this).map(function() {
      return new Car(S.distance + _.random(-8, 5));
    });
    this.scope.S = S;
    this.traffic.day_start(this.cars);
  }

  Ctrl.prototype.rotator = function(car) {
    return "rotate(" + (S.scale(car.loc)) + ") translate(0,50)";
  };

  Ctrl.prototype.day_start = function() {
    S.reset_time();
    this.traffic.day_start(this.cars);
    return this.tick();
  };

  Ctrl.prototype.day_end = function() {
    this.traffic.day_end(this.cars);
    return setTimeout((function(_this) {
      return function() {
        return _this.day_start(_this.cars);
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
    return d3.timer((function(_this) {
      return function() {
        if (_this.traffic.done()) {
          _this.day_end(_this.cars);
          return true;
        }
        S.advance();
        _this.traffic.tick();
        _this.traffic.tick();
        _this.traffic.tick();
        _this.scope.$evalAsync();
        return _this.paused;
      };
    })(this));
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
var Car, Cell, S, Signal, Traffic, _;

S = require('./settings');

_ = require('lodash');

require('./helpers');

Signal = (function() {
  function Signal() {
    this.count = 0;
    this.green = true;
    this.id = _.uniqueId('signal-');
  }

  Signal.prototype.tick = function() {
    this.count++;
    if (this.count >= S.phase) {
      this.count = 0;
      this.green = true;
      return;
    }
    if (this.count >= (S.green * S.phase)) {
      return this.green = false;
    }
  };

  return Signal;

})();

Cell = (function() {
  function Cell(loc) {
    this.loc = loc;
    this.last = -Infinity;
    this.temp_car = false;
    this.id = _.uniqueId('cell');
  }

  Cell.prototype.set_signal = function(signal1) {
    this.signal = signal1;
    return this.signal.loc = this.loc;
  };

  Cell.prototype.space = 4;

  Cell.prototype.receive = function(car) {
    car.set_loc(this.loc);
    this.last = S.time;
    this.temp_car = car;
    return car.cell = this;
  };

  Cell.prototype.remove = function() {
    return this.temp_car = false;
  };

  Cell.prototype.finalize = function() {
    var ref;
    if ((ref = this.signal) != null) {
      ref.tick();
    }
    if ((this.car = this.temp_car)) {
      return this.last = S.time;
    }
  };

  Cell.prototype.is_free = function() {
    if (this.signal) {
      return this.signal.green && (S.time - this.last) > this.space;
    } else {
      return (S.time - this.last) > this.space;
    }
  };

  return Cell;

})();

Traffic = (function() {
  function Traffic() {
    var i, j, n, ref, signal;
    this.cells = (function() {
      var j, ref, results;
      results = [];
      for (n = j = 0, ref = S.num_cells; 0 <= ref ? j < ref : j > ref; n = 0 <= ref ? ++j : --j) {
        results.push(new Cell(n));
      }
      return results;
    })();
    this.signals = [];
    for (i = j = 0, ref = S.num_signals; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      signal = new Signal;
      this.signals.push(signal);
      n = Math.floor(i / S.num_signals * S.num_cells);
      this.cells[n].set_signal(signal);
    }
  }

  Traffic.prototype.day_start = function(cars) {
    var car, cell, j, l, len, len1, ref, ref1, results;
    _.assign(this, {
      traveling: [],
      cum: [],
      rate: [],
      memory: [],
      cumEn: 0,
      cumEx: 0,
      waiting: _.clone(cars),
      cars: _.clone(cars)
    });
    ref = this.cells;
    for (j = 0, len = ref.length; j < len; j++) {
      cell = ref[j];
      cell.car = cell.temp_car = false;
      cell.last = -Infinity;
    }
    ref1 = this.waiting;
    results = [];
    for (l = 0, len1 = ref1.length; l < len1; l++) {
      car = ref1[l];
      results.push(car.assign_error());
    }
    return results;
  };

  Traffic.prototype.day_end = function(cars) {
    var car, j, l, len, len1, len2, m, ref, results;
    for (j = 0, len = cars.length; j < len; j++) {
      car = cars[j];
      car.eval_cost();
    }
    ref = _.sample(cars, S.sample);
    for (l = 0, len1 = ref.length; l < len1; l++) {
      car = ref[l];
      car.choose();
    }
    results = [];
    for (m = 0, len2 = cars.length; m < len2; m++) {
      car = cars[m];
      results.push(car.reset());
    }
    return results;
  };

  Traffic.prototype.done = function() {
    return (this.waiting.length + this.traveling.length) === 0;
  };

  Traffic.prototype.tick = function() {
    var car, cell, i, j, k, l, len, len1, len2, m, ref, ref1;
    k = this.cells;
    ref = this.waiting;
    for (j = 0, len = ref.length; j < len; j++) {
      car = ref[j];
      if (car.t_en <= S.time) {
        cell = _.sample(_.filter(this.cells, function(c) {
          return c.is_free();
        }));
        if (cell) {
          car.enter(cell.loc);
          cell.receive(car);
          this.traveling.push(car);
        }
      }
    }
    for (i = l = 0, len1 = k.length; l < len1; i = ++l) {
      cell = k[i];
      if (cell.car) {
        if (cell.car.destination === cell.loc) {
          cell.car.exit();
          cell.remove();
        }
        if (k[(i + 1) % k.length].is_free()) {
          k[(i + 1) % k.length].receive(cell.car);
          cell.remove();
        }
      }
    }
    ref1 = this.cells;
    for (m = 0, len2 = ref1.length; m < len2; m++) {
      cell = ref1[m];
      cell.finalize();
    }
    this.waiting = _.filter(this.waiting, function(c) {
      return !c.entered;
    });
    return this.traveling = _.filter(this.traveling, function(c) {
      return !c.exited;
    });
  };

  return Traffic;

})();

Car = (function() {
  function Car() {
    _.assign(this, {
      id: _.uniqueId('car-'),
      cost0: Infinity,
      target: _.random(2, S.rush_length),
      exited: false,
      entered: false,
      distance: 60
    });
  }

  Car.prototype.assign_error = function() {
    return this.t_en = Math.max(0, this.target + _.random(-3, 3));
  };

  Car.prototype.reset = function() {
    var ref;
    return ref = [this.cost, false, false], this.cost0 = ref[0], this.entered = ref[1], this.exited = ref[2], ref;
  };

  Car.prototype.exit = function() {
    var ref;
    return ref = [S.time, true], this.t_ex = ref[0], this.exited = ref[1], ref;
  };

  Car.prototype.eval_cost = function() {
    this.sd = this.t_ex - S.wish;
    this.sp = Math.max(-S.beta * this.sd, S.gamma * this.sd);
    this.tt = this.t_ex - this.t_en;
    return this.cost = this.tt + this.sp;
  };

  Car.prototype.choose = function() {
    var ref;
    if (this.cost > this.cost0) {
      return ref = [this.cost, this.t_en], this.cost0 = ref[0], this.target = ref[1], ref;
    }
  };

  Car.prototype.set_loc = function(loc) {
    this.loc = loc;
  };

  Car.prototype.enter = function(loc) {
    this.loc = loc;
    this.entered = true;
    this.destination = Math.floor((this.loc + this.distance) % S.num_cells);
    return this.color = S.colors(_.random(S.num_cells));
  };

  return Car;

})();

module.exports = {
  Car: Car,
  Traffic: Traffic
};



},{"./helpers":8,"./settings":11,"lodash":undefined}],11:[function(require,module,exports){
var Settings, _, d3;

d3 = require('d3');

_ = require('lodash');

Settings = (function() {
  function Settings() {
    _.assign(this, {
      num_cars: 1000,
      time: 0,
      space: 3,
      pace: 1,
      distance: 90,
      sample: 30,
      beta: .5,
      gamma: 2,
      rush_length: 800,
      num_cells: 1000,
      phase: 50,
      green: .5,
      wish: 325,
      num_signals: 20,
      day: 0,
      offset: .3
    });
    this.colors = d3.scale.linear().domain(_.range(0, this.num_cells, this.num_cells / 6)).range(['#F44336', '#2196F3', '#E91E63', '#00BCD4', '#FFC107', '#4CAF50']);
    this.scale = d3.scale.linear().domain([0, this.num_cells]).range([0, 360]);
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



},{"d3":undefined,"lodash":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2FwcC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2N1bUNoYXJ0LmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9yaW5ncm9hZC9hcHAvZGlyZWN0aXZlcy9kM0Rlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2RpcmVjdGl2ZXMvZGF0dW0uY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3Jpbmdyb2FkL2FwcC9kaXJlY3RpdmVzL3NsaWRlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2RpcmVjdGl2ZXMveEF4aXMuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3Jpbmdyb2FkL2FwcC9kaXJlY3RpdmVzL3lBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9yaW5ncm9hZC9hcHAvaGVscGVycy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL21mZC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL21vZGVscy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL3NldHRpbmdzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUE7O0FBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7QUFDTCxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0FBQ0osQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSOztBQUNKLE1BQXVCLE9BQUEsQ0FBUSxVQUFSLENBQXZCLEVBQUMs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QUFDLENBQUEsU0FBWCxFQUFxQixJQUFDLENBQUEsU0FBRCxHQUFXLENBQWhDLENBREMsQ0FFVCxDQUFDLEtBRlEsQ0FFRixDQUNOLFNBRE0sRUFFTixTQUZNLEVBR04sU0FITSxFQUlOLFNBSk0sRUFLTixTQUxNLEVBTU4sU0FOTSxDQUZFO0lBVVYsSUFBQyxDQUFBLEtBQUQsR0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQVQsQ0FBQSxDQUNSLENBQUMsTUFETyxDQUNBLENBQUMsQ0FBRCxFQUFHLElBQUMsQ0FBQSxTQUFKLENBREEsQ0FFUixDQUFDLEtBRk8sQ0FFRCxDQUFDLENBQUQsRUFBRyxHQUFILENBRkM7RUE5QkU7O3FCQWtDWixPQUFBLEdBQVMsU0FBQTtXQUNSLElBQUMsQ0FBQSxJQUFEO0VBRFE7O3FCQUVULFVBQUEsR0FBWSxTQUFBO0lBQ1gsSUFBQyxDQUFBLEdBQUQ7V0FDQSxJQUFDLENBQUEsSUFBRCxHQUFRO0VBRkc7Ozs7OztBQUliLE1BQU0sQ0FBQyxPQUFQLEdBQXFCLElBQUEsUUFBQSxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcbntDYXIsVHJhZmZpYyxTaWduYWx9ID0gcmVxdWlyZSAnLi9tb2RlbHMnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxlbCktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRwYXVzZWQ6IHRydWVcblx0XHRcdHRyYWZmaWM6IG5ldyBUcmFmZmljXG5cdFx0XHRwYWw6IF8ucmFuZ2UgMCxTLnJsLFMucmwvMjVcblx0XHRAY2FycyA9IFswLi4uUy5udW1fY2Fyc10ubWFwIC0+IG5ldyBDYXIoIFMuZGlzdGFuY2UgKyBfLnJhbmRvbSggLTgsNSkgKVxuXHRcdEBzY29wZS5TID0gU1xuXHRcdEB0cmFmZmljLmRheV9zdGFydCBAY2Fyc1xuXG5cdHJvdGF0b3I6IChjYXIpLT4gXCJyb3RhdGUoI3tTLnNjYWxlKGNhci5sb2MpfSkgdHJhbnNsYXRlKDAsNTApXCJcblxuXHRkYXlfc3RhcnQ6IC0+XG5cdFx0Uy5yZXNldF90aW1lKClcblx0XHRAdHJhZmZpYy5kYXlfc3RhcnQgQGNhcnNcblx0XHRAdGljaygpXG5cblx0ZGF5X2VuZDogLT5cblx0XHRAdHJhZmZpYy5kYXlfZW5kIEBjYXJzXG5cdFx0IyBAcGh5c2ljcyA9IGZhbHNlICNwaHlzaWNzIHN0YWdlIG5vdCBoYXBwZW5pbmdcblx0XHRzZXRUaW1lb3V0ID0+IEBkYXlfc3RhcnQgQGNhcnNcblxuXHRjbGljazogKHZhbCkgLT4gaWYgIXZhbCB0aGVuIEBwbGF5KClcblx0cGF1c2U6IC0+IEBwYXVzZWQgPSB0cnVlXG5cdHRpY2s6IC0+XG5cdFx0ZDMudGltZXIgPT5cblx0XHRcdFx0aWYgQHRyYWZmaWMuZG9uZSgpXG5cdFx0XHRcdFx0QGRheV9lbmQgQGNhcnNcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHRTLmFkdmFuY2UoKVxuXHRcdFx0XHRAdHJhZmZpYy50aWNrKClcblx0XHRcdFx0QHRyYWZmaWMudGljaygpXG5cdFx0XHRcdEB0cmFmZmljLnRpY2soKVxuXHRcdFx0XHRAc2NvcGUuJGV2YWxBc3luYygpXG5cdFx0XHRcdEBwYXVzZWRcblx0XHRcdCMgXHRpZiAhQHBhdXNlZCB0aGVuIEB0aWNrKClcblx0XHRcdCMgXHR0cnVlXG5cdFx0XHQjICwgUy5wYWNlXG5cblx0cGxheTogLT5cblx0XHRAcGF1c2UoKVxuXHRcdEBwYXVzZWQgPSBmYWxzZVxuXHRcdEB0aWNrKClcblxudmlzRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IHt9XG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvdmlzLmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5sZWF2ZXIgPSAtPlxuXHRhbmltYXRlID0gXG5cdFx0bGVhdmU6IChlbCktPlxuXHRcdFx0ZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5zZWxlY3QgJ3JlY3QnXG5cdFx0XHRcdC50cmFuc2l0aW9uKClcblx0XHRcdFx0LmR1cmF0aW9uIDUwXG5cdFx0XHRcdC5lYXNlICdjdWJpYydcblx0XHRcdFx0LmF0dHIgJ3RyYW5zZm9ybScsJ3NjYWxlKDEuMiwxKSdcblx0XHRcdFx0LmF0dHIgJ2ZpbGwnLCcjZWVlJ1xuXHRcdFx0XHQudHJhbnNpdGlvbigpXG5cdFx0XHRcdC5kdXJhdGlvbiAxNTBcblx0XHRcdFx0LmVhc2UgJ2N1YmljJ1xuXHRcdFx0XHQuYXR0ciAndHJhbnNmb3JtJywnc2NhbGUoMCwxKSdcblx0XHRlbnRlcjogKGVsKS0+XG5cdFx0XHRkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LnNlbGVjdCAncmVjdCdcblx0XHRcdFx0LmF0dHIgJ3RyYW5zZm9ybScsJ3NjYWxlKDAsLjUpJ1xuXHRcdFx0XHQudHJhbnNpdGlvbigpXG5cdFx0XHRcdC5kdXJhdGlvbiA2MFxuXHRcdFx0XHQuZWFzZSAnY3ViaWMnXG5cdFx0XHRcdC5hdHRyICd0cmFuc2Zvcm0nLCdzY2FsZSgxLjIsMSknXG5cdFx0XHRcdC50cmFuc2l0aW9uKClcblx0XHRcdFx0LmR1cmF0aW9uIDE1MFxuXHRcdFx0XHQuZWFzZSAnY3ViaWMnXG5cdFx0XHRcdC5hdHRyICd0cmFuc2Zvcm0nLCdzY2FsZSgxKSdcblxuYW5ndWxhci5tb2R1bGUgJ21haW5BcHAnICwgW3JlcXVpcmUgJ2FuZ3VsYXItbWF0ZXJpYWwnICwgcmVxdWlyZSAnYW5ndWxhci1hbmltYXRlJ11cblx0LmRpcmVjdGl2ZSAndmlzRGVyJywgdmlzRGVyXG5cdC5kaXJlY3RpdmUgJ2RhdHVtJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL2RhdHVtJ1xuXHQuZGlyZWN0aXZlICdkM0RlcicsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9kM0Rlcidcblx0LmRpcmVjdGl2ZSAnY3VtQ2hhcnQnLCByZXF1aXJlICcuL2N1bUNoYXJ0J1xuXHQuZGlyZWN0aXZlICdtZmRDaGFydCcsIHJlcXVpcmUgJy4vbWZkJ1xuXHQuZGlyZWN0aXZlICdob3JBeGlzJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3hBeGlzJ1xuXHQuZGlyZWN0aXZlICd2ZXJBeGlzJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3lBeGlzJ1xuXHQjIC5hbmltYXRpb24gJy5zaWduYWwnLCBzaWduYWxBblxuXHQjIC5hbmltYXRpb24gJy5nLWNhcicsIGxlYXZlclxuXHQuZGlyZWN0aXZlICdzbGlkZXJEZXInLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvc2xpZGVyJ1xuIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLGVsKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHdpZHRoOiAzMDBcblx0XHRcdGhlaWdodDogMzAwXG5cdFx0XHRtOiBcblx0XHRcdFx0dDogMTBcblx0XHRcdFx0bDogNDBcblx0XHRcdFx0cjogMTVcblx0XHRcdFx0YjogMzVcblxuXHRcdEBob3IgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0XHQuZG9tYWluIFswLFMucnVzaF9sZW5ndGgrMTIwXVxuXHRcdFx0XHQucmFuZ2UgWzAsQHdpZHRoXVxuXG5cdFx0QHZlciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQjIC5kb21haW4gWzAsIFMubnVtX2NhcnNdXG5cdFx0XHQuZG9tYWluIFswLDJdXG5cdFx0XHQucmFuZ2UgW0BoZWlnaHQsIDBdXG5cblx0XHRAbGluZUVuID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQudGltZVxuXHRcdFx0LnkgKGQpPT5AdmVyIGQuZW5cblxuXHRcdEBsaW5lRXggPSBkMy5zdmcubGluZSgpXG5cdFx0XHQueCAoZCk9PkBob3IgZC50aW1lXG5cdFx0XHQueSAoZCk9PkB2ZXIgZC5leFxuXG5cdFx0QGhvckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQGhvclxuXHRcdFx0Lm9yaWVudCAnYm90dG9tJ1xuXHRcdFx0LnRpY2tzIDhcblxuXHRcdEB2ZXJBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEB2ZXJcblx0XHRcdC5vcmllbnQgJ2xlZnQnXG5cblxuXHRleDogLT5cblx0XHRAbGluZUV4IEByYXRlXG5cdGVuOiAtPlxuXHRcdEBsaW5lRW4gQHJhdGVcblx0XG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0c2NvcGU6IFxuXHRcdFx0cmF0ZTogJz0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvY2hhcnQuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcbmFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuXG5kZXIgPSAoJHBhcnNlKS0+ICNnb2VzIG9uIGEgc3ZnIGVsZW1lbnRcblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGQzRGVyOiAnPSdcblx0XHRcdHRyYW46ICc9J1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0dSA9ICd0LScgKyBNYXRoLnJhbmRvbSgpXG5cdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSBmYWxzZVxuXHRcdFx0c2NvcGUuJHdhdGNoICdkM0Rlcidcblx0XHRcdFx0LCAodiktPlxuXHRcdFx0XHRcdGlmIHNjb3BlLnRyYW4gYW5kIGhhc1RyYW5zaXRpb25lZFxuXHRcdFx0XHRcdFx0aGFzVHJhbnNpdGlvbmVkID0gdHJ1ZVxuXHRcdFx0XHRcdFx0c2VsLnRyYW5zaXRpb24gdVxuXHRcdFx0XHRcdFx0XHQuYXR0ciB2XG5cdFx0XHRcdFx0XHRcdC5jYWxsIHNjb3BlLnRyYW5cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSB0cnVlXG5cdFx0XHRcdFx0XHRzZWwuYXR0ciB2XG5cdFx0XHRcdCwgdHJ1ZVxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJtb2R1bGUuZXhwb3J0cyA9ICgkcGFyc2UpLT5cblx0KHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdGQzLnNlbGVjdChlbFswXSkuZGF0dW0gJHBhcnNlKGF0dHIuZGF0dW0pKHNjb3BlKSIsImRlciA9IC0+XG5cdHJlcyA9IFxuXHRcdHNjb3BlOiBcblx0XHRcdGxhYmVsOiAnQCdcblx0XHRcdG15RGF0YTogJz0nXG5cdFx0XHRtaW46ICc9J1xuXHRcdFx0bWF4OiAnPSdcblx0XHRcdHN0ZXA6ICc9J1xuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHJlcGxhY2U6IHRydWVcblx0XHRjb250cm9sbGVyOiAtPlxuXHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWVcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC9zbGlkZXIuaHRtbCdcblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZnVuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzY2FsZSA9IHNjb3BlLmZ1bi5zY2FsZSgpXG5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuY2xhc3NlZCAnaG9yIGF4aXMnLCB0cnVlXG5cblx0XHRcdHNlbC5jYWxsIHNjb3BlLmZ1blxuXHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5cbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHJlc3RyaWN0OiAnQSdcblx0XHRzY29wZTogXG5cdFx0XHRmdW46ICc9J1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNjYWxlID0gc2NvcGUuZnVuLnNjYWxlKClcblxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5jbGFzc2VkICd2ZXIgYXhpcycsIHRydWVcblxuXHRcdFx0c2VsLmNhbGwgc2NvcGUuZnVuXG5cdFx0XHRcbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiJ3VzZSBzdHJpY3QnXG5cbkZ1bmN0aW9uOjpwcm9wZXJ0eSA9IChwcm9wLCBkZXNjKSAtPlxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgcHJvcCwgZGVzYyIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxlbCktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHR3aWR0aDogMzAwXG5cdFx0XHRoZWlnaHQ6IDMwMFxuXHRcdFx0bTogXG5cdFx0XHRcdHQ6IDEwXG5cdFx0XHRcdGw6IDQwXG5cdFx0XHRcdHI6IDE4XG5cdFx0XHRcdGI6IDM1XG5cblx0XHRAaG9yID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdFx0LmRvbWFpbiBbMCxTLm51bV9jYXJzKi44XVxuXHRcdFx0XHQucmFuZ2UgWzAsQHdpZHRoXVxuXG5cdFx0QHZlciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLCBTLm51bV9jYXJzKi41NV1cblx0XHRcdC5yYW5nZSBbQGhlaWdodCwgMF1cblxuXHRcdEBsaW5lID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQublxuXHRcdFx0LnkgKGQpPT5AdmVyIGQuZlxuXG5cdFx0QGhvckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQGhvclxuXHRcdFx0Lm9yaWVudCAnYm90dG9tJ1xuXHRcdFx0LnRpY2tzIDhcblxuXHRcdEB2ZXJBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEB2ZXJcblx0XHRcdC5vcmllbnQgJ2xlZnQnXG5cblx0ZDogLT4gQGxpbmUgQG1lbW9yeVxuXG5cdFxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHNjb3BlOiBcblx0XHRcdG1lbW9yeTogJz0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvbWZkQ2hhcnQuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xucmVxdWlyZSAnLi9oZWxwZXJzJ1xuXG5jbGFzcyBTaWduYWxcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QGNvdW50ID0gMFxuXHRcdEBncmVlbiA9IHRydWVcblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdzaWduYWwtJ1xuXG5cdHRpY2s6IC0+XG5cdFx0QGNvdW50Kytcblx0XHRpZiBAY291bnQgPj0gUy5waGFzZVxuXHRcdFx0QGNvdW50ID0gMFxuXHRcdFx0QGdyZWVuID0gdHJ1ZVxuXHRcdFx0cmV0dXJuXG5cdFx0aWYgQGNvdW50ID49IChTLmdyZWVuKlMucGhhc2UpXG5cdFx0XHRAZ3JlZW4gPSBmYWxzZVxuXG5jbGFzcyBDZWxsXG5cdGNvbnN0cnVjdG9yOiAoQGxvYyktPlxuXHRcdEBsYXN0ID0gLUluZmluaXR5XG5cdFx0QHRlbXBfY2FyID0gZmFsc2Vcblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdjZWxsJ1xuXG5cdHNldF9zaWduYWw6IChAc2lnbmFsKS0+XG5cdFx0QHNpZ25hbC5sb2MgPSBAbG9jXG5cblx0c3BhY2U6IDRcblxuXHRyZWNlaXZlOihjYXIpLT5cblx0XHRjYXIuc2V0X2xvYyBAbG9jXG5cdFx0QGxhc3QgPSBTLnRpbWVcblx0XHRAdGVtcF9jYXIgPSBjYXJcblx0XHRjYXIuY2VsbCA9IHRoaXNcblxuXHRyZW1vdmU6IC0+XG5cdFx0QHRlbXBfY2FyID0gZmFsc2VcblxuXHRmaW5hbGl6ZTogLT5cblx0XHRAc2lnbmFsPy50aWNrKClcblx0XHRpZiAoQGNhcj1AdGVtcF9jYXIpXG5cdFx0XHRAbGFzdCA9IFMudGltZVxuXG5cdGlzX2ZyZWU6IC0+XG5cdFx0aWYgQHNpZ25hbFxuXHRcdFx0QHNpZ25hbC5ncmVlbiBhbmQgKFMudGltZS1AbGFzdCk+QHNwYWNlXG5cdFx0ZWxzZVxuXHRcdFx0KFMudGltZS1AbGFzdCk+QHNwYWNlXG5cblxuY2xhc3MgVHJhZmZpY1xuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAY2VsbHMgPSAobmV3IENlbGwgbiBmb3IgbiBpbiBbMC4uLlMubnVtX2NlbGxzXSlcblx0XHRAc2lnbmFscyA9IFtdXG5cdFx0Zm9yIGkgaW4gWzAuLi5TLm51bV9zaWduYWxzXVxuXHRcdFx0c2lnbmFsID0gbmV3IFNpZ25hbFxuXHRcdFx0QHNpZ25hbHMucHVzaCBzaWduYWxcblx0XHRcdG4gPSBNYXRoLmZsb29yKCBpL1MubnVtX3NpZ25hbHMqUy5udW1fY2VsbHMgKVxuXHRcdFx0QGNlbGxzW25dLnNldF9zaWduYWwgc2lnbmFsXG5cblx0ZGF5X3N0YXJ0OihjYXJzKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHRyYXZlbGluZzogW11cblx0XHRcdGN1bTogW11cblx0XHRcdHJhdGU6IFtdXG5cdFx0XHRtZW1vcnk6IFtdXG5cdFx0XHRjdW1FbjogMFxuXHRcdFx0Y3VtRXg6IDBcblx0XHRcdHdhaXRpbmc6IF8uY2xvbmUgY2Fyc1xuXHRcdFx0Y2FyczogXy5jbG9uZSBjYXJzXG5cblx0XHRmb3IgY2VsbCBpbiBAY2VsbHNcblx0XHRcdGNlbGwuY2FyID0gY2VsbC50ZW1wX2NhciA9IGZhbHNlXG5cdFx0XHRjZWxsLmxhc3QgPSAtSW5maW5pdHlcblxuXHRcdGNhci5hc3NpZ25fZXJyb3IoKSBmb3IgY2FyIGluIEB3YWl0aW5nXG5cblx0ZGF5X2VuZDooY2FycyktPlxuXHRcdGNhci5ldmFsX2Nvc3QoKSBmb3IgY2FyIGluIGNhcnNcblx0XHRjYXIuY2hvb3NlKCkgZm9yIGNhciBpbiBfLnNhbXBsZShjYXJzLFMuc2FtcGxlKVxuXHRcdGNhci5yZXNldCgpIGZvciBjYXIgaW4gY2Fyc1xuXG5cdGRvbmU6IC0+XG5cdFx0KEB3YWl0aW5nLmxlbmd0aCtAdHJhdmVsaW5nLmxlbmd0aCk9PTBcblxuXHR0aWNrOi0+XG5cdFx0ayA9IEBjZWxsc1xuXHRcdGZvciBjYXIgaW4gQHdhaXRpbmdcblx0XHRcdGlmIChjYXIudF9lbjw9Uy50aW1lKVxuXHRcdFx0XHRjZWxsID0gXy5zYW1wbGUgXy5maWx0ZXIoIEBjZWxscywoYyktPmMuaXNfZnJlZSgpKVxuXHRcdFx0XHRpZiBjZWxsXG5cdFx0XHRcdFx0Y2FyLmVudGVyIGNlbGwubG9jXG5cdFx0XHRcdFx0Y2VsbC5yZWNlaXZlIGNhclxuXHRcdFx0XHRcdEB0cmF2ZWxpbmcucHVzaCBjYXJcblxuXHRcdCMgY2VsbC5maW5hbGl6ZSgpIGZvciBjZWxsIGluIEBjZWxsc1xuXHRcdFxuXHRcdGZvciBjZWxsLGkgaW4ga1xuXHRcdFx0aWYgY2VsbC5jYXJcblx0XHRcdFx0aWYgY2VsbC5jYXIuZGVzdGluYXRpb249PWNlbGwubG9jXG5cdFx0XHRcdFx0Y2VsbC5jYXIuZXhpdCgpXG5cdFx0XHRcdFx0Y2VsbC5yZW1vdmUoKVxuXHRcdFx0XHRpZiBrWyhpKzEpJWsubGVuZ3RoXS5pc19mcmVlKClcblx0XHRcdFx0XHRrWyhpKzEpJWsubGVuZ3RoXS5yZWNlaXZlIGNlbGwuY2FyXG5cdFx0XHRcdFx0Y2VsbC5yZW1vdmUoKVxuXHRcdFx0XHRcdFxuXHRcdGNlbGwuZmluYWxpemUoKSBmb3IgY2VsbCBpbiBAY2VsbHNcblxuXHRcdEB3YWl0aW5nID0gXy5maWx0ZXIgQHdhaXRpbmcsIChjKS0+ICFjLmVudGVyZWRcblx0XHRAdHJhdmVsaW5nID0gXy5maWx0ZXIgQHRyYXZlbGluZywgKGMpLT4gIWMuZXhpdGVkXG5cblxuY2xhc3MgQ2FyXG5cdGNvbnN0cnVjdG9yOi0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdGlkOiBfLnVuaXF1ZUlkICdjYXItJ1xuXHRcdFx0Y29zdDA6IEluZmluaXR5IFxuXHRcdFx0dGFyZ2V0OiBfLnJhbmRvbSAyLFMucnVzaF9sZW5ndGhcblx0XHRcdGV4aXRlZDogZmFsc2Vcblx0XHRcdGVudGVyZWQ6IGZhbHNlXG5cdFx0XHRkaXN0YW5jZTogNjBcblxuXHRhc3NpZ25fZXJyb3I6LT4gXG5cdFx0QHRfZW4gPSBNYXRoLm1heCAwLChAdGFyZ2V0ICsgXy5yYW5kb20gLTMsMylcblxuXHRyZXNldDotPlxuXHRcdFtAY29zdDAsIEBlbnRlcmVkLCBAZXhpdGVkXSA9IFtAY29zdCxmYWxzZSxmYWxzZV1cblxuXHRleGl0Oi0+XG5cdFx0W0B0X2V4LCBAZXhpdGVkXSA9IFtTLnRpbWUsIHRydWVdXG5cblx0ZXZhbF9jb3N0OiAtPlxuXHRcdEBzZCA9IEB0X2V4IC0gUy53aXNoXG5cdFx0QHNwID0gTWF0aC5tYXgoIC1TLmJldGEgKiBAc2QsIFMuZ2FtbWEgKiBAc2QpXG5cdFx0QHR0ID0gQHRfZXggLSBAdF9lblxuXHRcdEBjb3N0ID0gIEB0dCtAc3AgXG5cblx0Y2hvb3NlOiAtPlxuXHRcdGlmIEBjb3N0PkBjb3N0MFxuXHRcdFx0W0Bjb3N0MCxAdGFyZ2V0XSA9IFtAY29zdCwgQHRfZW5dXG5cblx0c2V0X2xvYzogKEBsb2MpLT5cblxuXHRlbnRlcjooQGxvYyktPlxuXHRcdEBlbnRlcmVkID0gdHJ1ZVxuXHRcdEBkZXN0aW5hdGlvbiA9IE1hdGguZmxvb3IgKEBsb2MgKyBAZGlzdGFuY2UpJVMubnVtX2NlbGxzXG5cdFx0QGNvbG9yID0gUy5jb2xvcnMgXy5yYW5kb20gUy5udW1fY2VsbHNcblxubW9kdWxlLmV4cG9ydHMgPSBcblx0Q2FyOiBDYXJcblx0VHJhZmZpYzogVHJhZmZpY1xuIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG4jIHJlcXVpcmUgJy4vaGVscGVycydcblxuY2xhc3MgU2V0dGluZ3Ncblx0Y29uc3RydWN0b3I6LT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0bnVtX2NhcnM6IDEwMDBcblx0XHRcdHRpbWU6IDBcblx0XHRcdHNwYWNlOiAzXG5cdFx0XHRwYWNlOiAxXG5cdFx0XHRkaXN0YW5jZTogOTBcblx0XHRcdHNhbXBsZTogMzBcblx0XHRcdGJldGE6IC41XG5cdFx0XHRnYW1tYTogMlxuXHRcdFx0cnVzaF9sZW5ndGg6IDgwMFxuXHRcdFx0IyBmcmVxdWVuY3k6IDhcblx0XHRcdG51bV9jZWxsczogMTAwMFxuXHRcdFx0cGhhc2U6IDUwXG5cdFx0XHRncmVlbjogLjVcblx0XHRcdHdpc2g6IDMyNVxuXHRcdFx0bnVtX3NpZ25hbHM6IDIwXG5cdFx0XHRkYXk6IDBcblx0XHRcdG9mZnNldDogLjNcblxuXHRcdEBjb2xvcnMgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBfLnJhbmdlIDAsQG51bV9jZWxscyxAbnVtX2NlbGxzLzZcblx0XHRcdC5yYW5nZSBbXG5cdFx0XHRcdCcjRjQ0MzM2JywgI3JlZFxuXHRcdFx0XHQnIzIxOTZGMycsICNibHVlXG5cdFx0XHRcdCcjRTkxRTYzJywgI3Bpbmtcblx0XHRcdFx0JyMwMEJDRDQnLCAjY3lhblxuXHRcdFx0XHQnI0ZGQzEwNycsICNhbWJlclxuXHRcdFx0XHQnIzRDQUY1MCcsICNncmVlblxuXHRcdFx0XHRdXG5cdFx0QHNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsQG51bV9jZWxsc11cblx0XHRcdC5yYW5nZSBbMCwzNjBdXG5cblx0YWR2YW5jZTogLT5cblx0XHRAdGltZSsrXG5cdHJlc2V0X3RpbWU6IC0+XG5cdFx0QGRheSsrXG5cdFx0QHRpbWUgPSAwXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFNldHRpbmdzKCkiXX0=
