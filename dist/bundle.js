(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Car, Ctrl, S, Traffic, _, angular, d3, leaver, visDer;

angular = require('angular');

d3 = require('d3');

_ = require('lodash');

S = require('./settings');

Traffic = require('./models/traffic');

Car = require('./models/car');

Ctrl = (function() {
  function Ctrl(scope, el) {
    var i, ref, results;
    this.scope = scope;
    _.assign(this, {
      paused: true,
      traffic: new Traffic,
      pal: _.range(0, S.rl, S.rl / 25)
    });
    this.cars = (function() {
      results = [];
      for (var i = 0, ref = S.num_cars; 0 <= ref ? i < ref : i > ref; 0 <= ref ? i++ : i--){ results.push(i); }
      return results;
    }).apply(this).map(function() {
      return new Car(S.distance + _.random(-8, 5));
    });
    this.scope.S = S;
    this.traffic.day_start(this.cars);
    this.scope.$watch('S.num_signals', (function(_this) {
      return function(n) {
        S.offset = Math.round(S.offset * n) / n;
        return _this.traffic.change_signals(S.num_signals);
      };
    })(this));
    this.scope.$watch('S.offset', (function(_this) {
      return function(n) {
        return _this.traffic.change_offsets();
      };
    })(this));
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



},{"./cumChart":2,"./directives/d3Der":3,"./directives/datum":4,"./directives/slider":5,"./directives/xAxis":6,"./directives/yAxis":7,"./mfd":9,"./models/car":10,"./models/traffic":13,"./settings":14,"angular":undefined,"angular-animate":undefined,"angular-material":undefined,"d3":undefined,"lodash":undefined}],2:[function(require,module,exports){
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



},{"./settings":14,"d3":undefined,"lodash":undefined}],3:[function(require,module,exports){
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
    this.ver = d3.scale.linear().domain([0, S.num_cars * .25]).range([this.height, 0]);
    this.line = d3.svg.line().x((function(_this) {
      return function(d) {
        return _this.hor(d.acc);
      };
    })(this)).y((function(_this) {
      return function(d) {
        return _this.ver(d.flow);
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



},{"./settings":14,"d3":undefined,"lodash":undefined}],10:[function(require,module,exports){
var Car, S, _;

S = require('../settings');

_ = require('lodash');

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

module.exports = Car;



},{"../settings":14,"lodash":undefined}],11:[function(require,module,exports){
var Cell, S, _;

S = require('../settings');

_ = require('lodash');

Cell = (function() {
  function Cell(loc) {
    this.loc = loc;
    this.last = -Infinity;
    this.temp_car = false;
    this.id = _.uniqueId('cell');
  }

  Cell.prototype.set_signal = function(signal) {
    this.signal = signal;
    return this.signal.loc = this.loc;
  };

  Cell.prototype.clear_signal = function() {
    return this.signal = void 0;
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

module.exports = Cell;



},{"../settings":14,"lodash":undefined}],12:[function(require,module,exports){
var S, Signal, _;

S = require('../settings');

_ = require('lodash');

require('../helpers');

Signal = (function() {
  function Signal(i) {
    this.i = i;
    this.count = 0;
    this.green = true;
    this.id = _.uniqueId('signal-');
    this.reset();
  }

  Signal.property('offset', {
    get: function() {
      return S.phase * ((this.i * S.offset) % 1);
    }
  });

  Signal.prototype.reset = function() {
    var ref;
    return ref = [this.offset, true], this.count = ref[0], this.green = ref[1], ref;
  };

  Signal.prototype.tick = function() {
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

module.exports = Signal;



},{"../helpers":8,"../settings":14,"lodash":undefined}],13:[function(require,module,exports){
var Car, Cell, Memory, S, Signal, Traffic, _;

S = require('../settings');

_ = require('lodash');

Car = require('./car');

Signal = require('./signal');

Cell = require('./cell');

Memory = (function() {
  function Memory() {
    this.reset();
  }

  Memory.prototype.reset = function() {
    this.state = [];
    this.cum = [];
    return this._state = [];
  };

  Memory.prototype.store = function(flow, exits, entries, acc) {
    var new_d;
    this._state.push({
      flow: flow,
      exits: exits,
      entries: entries,
      acc: acc
    });
    if (this._state.length > 100) {
      this._state.shift();
    }
    new_d = _.reduce(this._state, function(a, b) {
      var res;
      return res = {
        flow: a.flow += b.flow / 100,
        exits: a.exits += b.exits / 100,
        entries: a.entries += b.entries / 100,
        acc: a.acc += b.acc / 100
      };
    });
    return this.state.push(new_d);
  };

  return Memory;

})();

Traffic = (function() {
  function Traffic() {
    var n;
    this.cells = (function() {
      var j, ref, results;
      results = [];
      for (n = j = 0, ref = S.num_cells; 0 <= ref ? j < ref : j > ref; n = 0 <= ref ? ++j : --j) {
        results.push(new Cell(n));
      }
      return results;
    })();
  }

  Traffic.prototype.change_signals = function(n) {
    var cell, i, j, l, len, q, ref, ref1, results, signal;
    this.signals = [];
    ref = this.cells;
    for (j = 0, len = ref.length; j < len; j++) {
      cell = ref[j];
      cell.clear_signal();
    }
    results = [];
    for (i = l = 0, ref1 = n; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
      signal = new Signal(i);
      this.signals.push(signal);
      q = Math.floor(i / n * S.num_cells);
      results.push(this.cells[q].set_signal(signal));
    }
    return results;
  };

  Traffic.prototype.change_offsets = function() {
    var j, len, ref, results, s;
    ref = this.signals;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      results.push(s.reset());
    }
    return results;
  };

  Traffic.prototype.day_start = function(cars) {
    var car, cell, j, l, len, len1, ref, ref1, results;
    _.assign(this, {
      traveling: [],
      cum: [],
      rate: [],
      memory: new Memory,
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
    var car, cell, entries, exits, flow, i, j, k, l, len, len1, len2, m, ref, ref1, ref2;
    ref = [0, 0, 0], flow = ref[0], exits = ref[1], entries = ref[2];
    k = this.cells;
    ref1 = this.waiting;
    for (j = 0, len = ref1.length; j < len; j++) {
      car = ref1[j];
      if (car.t_en <= S.time) {
        cell = _.sample(_.filter(this.cells, function(c) {
          return c.is_free();
        }));
        if (cell) {
          car.enter(cell.loc);
          cell.receive(car);
          this.traveling.push(car);
          entries++;
          flow++;
        }
      }
    }
    for (i = l = 0, len1 = k.length; l < len1; i = ++l) {
      cell = k[i];
      if (cell.car) {
        if (cell.car.destination === cell.loc) {
          cell.car.exit();
          cell.remove();
          exits++;
          flow++;
        }
        if (k[(i + 1) % k.length].is_free()) {
          k[(i + 1) % k.length].receive(cell.car);
          cell.remove();
          flow++;
        }
      }
    }
    ref2 = this.cells;
    for (m = 0, len2 = ref2.length; m < len2; m++) {
      cell = ref2[m];
      cell.finalize();
    }
    this.waiting = _.filter(this.waiting, function(c) {
      return !c.entered;
    });
    this.traveling = _.filter(this.traveling, function(c) {
      return !c.exited;
    });
    if (S.time % 20 === 0) {
      return this.memory.store(flow, exits, entries, this.traveling.length);
    }
  };

  return Traffic;

})();

module.exports = Traffic;



},{"../settings":14,"./car":10,"./cell":11,"./signal":12,"lodash":undefined}],14:[function(require,module,exports){
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
      offset: 0,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2FwcC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2N1bUNoYXJ0LmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9yaW5ncm9hZC9hcHAvZGlyZWN0aXZlcy9kM0Rlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2RpcmVjdGl2ZXMvZGF0dW0uY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3Jpbmdyb2FkL2FwcC9kaXJlY3RpdmVzL3NsaWRlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2RpcmVjdGl2ZXMveEF4aXMuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3Jpbmdyb2FkL2FwcC9kaXJlY3RpdmVzL3lBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9yaW5ncm9hZC9hcHAvaGVscGVycy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL21mZC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL21vZGVscy9jYXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3Jpbmdyb2FkL2FwcC9tb2RlbHMvY2VsbC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL21vZGVscy9zaWduYWwuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3Jpbmdyb2FkL2FwcC9tb2RlbHMvdHJhZmZpYy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL3NldHRpbmdzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoi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cUIsSUFBQyxDQUFBLFNBQUQsR0FBVyxDQUFoQyxDQURDLENBRVQsQ0FBQyxLQUZRLENBRUYsQ0FDTixTQURNLEVBRU4sU0FGTSxFQUdOLFNBSE0sRUFJTixTQUpNLEVBS04sU0FMTSxFQU1OLFNBTk0sQ0FGRTtJQVVWLElBQUMsQ0FBQSxLQUFELEdBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFULENBQUEsQ0FDUixDQUFDLE1BRE8sQ0FDQSxDQUFDLENBQUQsRUFBRyxJQUFDLENBQUEsU0FBSixDQURBLENBRVIsQ0FBQyxLQUZPLENBRUQsQ0FBQyxDQUFELEVBQUcsR0FBSCxDQUZDO0VBL0JFOztxQkFtQ1osT0FBQSxHQUFTLFNBQUE7V0FDUixJQUFDLENBQUEsSUFBRDtFQURROztxQkFFVCxVQUFBLEdBQVksU0FBQTtJQUNYLElBQUMsQ0FBQSxHQUFEO1dBQ0EsSUFBQyxDQUFBLElBQUQsR0FBUTtFQUZHOzs7Ozs7QUFJYixNQUFNLENBQUMsT0FBUCxHQUFxQixJQUFBLFFBQUEsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJhbmd1bGFyID0gcmVxdWlyZSAnYW5ndWxhcidcbmQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG4jIHtDYXIsVHJhZmZpYyxTaWduYWx9ID0gcmVxdWlyZSAnLi9tb2RlbHMnXG5UcmFmZmljID0gcmVxdWlyZSAnLi9tb2RlbHMvdHJhZmZpYydcbkNhciA9IHJlcXVpcmUgJy4vbW9kZWxzL2NhcidcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLGVsKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHBhdXNlZDogdHJ1ZVxuXHRcdFx0dHJhZmZpYzogbmV3IFRyYWZmaWNcblx0XHRcdHBhbDogXy5yYW5nZSAwLFMucmwsUy5ybC8yNVxuXHRcdEBjYXJzID0gWzAuLi5TLm51bV9jYXJzXS5tYXAgLT4gbmV3IENhciggUy5kaXN0YW5jZSArIF8ucmFuZG9tKCAtOCw1KSApXG5cdFx0QHNjb3BlLlMgPSBTXG5cdFx0QHRyYWZmaWMuZGF5X3N0YXJ0IEBjYXJzXG5cdFx0QHNjb3BlLiR3YXRjaCAnUy5udW1fc2lnbmFscycsKG4pPT5cblx0XHRcdFMub2Zmc2V0ID0gTWF0aC5yb3VuZChTLm9mZnNldCpuKS9uXG5cdFx0XHRAdHJhZmZpYy5jaGFuZ2Vfc2lnbmFscyBTLm51bV9zaWduYWxzXG5cblx0XHRAc2NvcGUuJHdhdGNoICdTLm9mZnNldCcsKG4pPT5cblx0XHRcdCMgUy5vZmZzZXQgPSBNYXRoLnJvdW5kKFMub2Zmc2V0Km4pL25cblx0XHRcdCMgQHRyYWZmaWMuY2hhbmdlX3NpZ25hbHMgUy5udW1fc2lnbmFsc1xuXHRcdFx0QHRyYWZmaWMuY2hhbmdlX29mZnNldHMoKVxuXG5cdHJvdGF0b3I6IChjYXIpLT4gXCJyb3RhdGUoI3tTLnNjYWxlKGNhci5sb2MpfSkgdHJhbnNsYXRlKDAsNTApXCJcblxuXHRkYXlfc3RhcnQ6IC0+XG5cdFx0Uy5yZXNldF90aW1lKClcblx0XHRAdHJhZmZpYy5kYXlfc3RhcnQgQGNhcnNcblx0XHRAdGljaygpXG5cblx0ZGF5X2VuZDogLT5cblx0XHRAdHJhZmZpYy5kYXlfZW5kIEBjYXJzXG5cdFx0c2V0VGltZW91dCA9PiBAZGF5X3N0YXJ0IEBjYXJzXG5cblx0Y2xpY2s6ICh2YWwpIC0+IGlmICF2YWwgdGhlbiBAcGxheSgpXG5cdHBhdXNlOiAtPiBAcGF1c2VkID0gdHJ1ZVxuXHR0aWNrOiAtPlxuXHRcdGQzLnRpbWVyID0+XG5cdFx0XHRcdGlmIEB0cmFmZmljLmRvbmUoKVxuXHRcdFx0XHRcdEBkYXlfZW5kIEBjYXJzXG5cdFx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFx0Uy5hZHZhbmNlKClcblx0XHRcdFx0QHRyYWZmaWMudGljaygpXG5cdFx0XHRcdEB0cmFmZmljLnRpY2soKVxuXHRcdFx0XHRAdHJhZmZpYy50aWNrKClcblx0XHRcdFx0QHNjb3BlLiRldmFsQXN5bmMoKVxuXHRcdFx0XHRAcGF1c2VkXG5cblx0cGxheTogLT5cblx0XHRAcGF1c2UoKVxuXHRcdEBwYXVzZWQgPSBmYWxzZVxuXHRcdEB0aWNrKClcblxudmlzRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IHt9XG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvdmlzLmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5sZWF2ZXIgPSAtPlxuXHRhbmltYXRlID0gXG5cdFx0bGVhdmU6IChlbCktPlxuXHRcdFx0ZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5zZWxlY3QgJ3JlY3QnXG5cdFx0XHRcdC50cmFuc2l0aW9uKClcblx0XHRcdFx0LmR1cmF0aW9uIDUwXG5cdFx0XHRcdC5lYXNlICdjdWJpYydcblx0XHRcdFx0LmF0dHIgJ3RyYW5zZm9ybScsJ3NjYWxlKDEuMiwxKSdcblx0XHRcdFx0LmF0dHIgJ2ZpbGwnLCcjZWVlJ1xuXHRcdFx0XHQudHJhbnNpdGlvbigpXG5cdFx0XHRcdC5kdXJhdGlvbiAxNTBcblx0XHRcdFx0LmVhc2UgJ2N1YmljJ1xuXHRcdFx0XHQuYXR0ciAndHJhbnNmb3JtJywnc2NhbGUoMCwxKSdcblx0XHRlbnRlcjogKGVsKS0+XG5cdFx0XHRkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LnNlbGVjdCAncmVjdCdcblx0XHRcdFx0LmF0dHIgJ3RyYW5zZm9ybScsJ3NjYWxlKDAsLjUpJ1xuXHRcdFx0XHQudHJhbnNpdGlvbigpXG5cdFx0XHRcdC5kdXJhdGlvbiA2MFxuXHRcdFx0XHQuZWFzZSAnY3ViaWMnXG5cdFx0XHRcdC5hdHRyICd0cmFuc2Zvcm0nLCdzY2FsZSgxLjIsMSknXG5cdFx0XHRcdC50cmFuc2l0aW9uKClcblx0XHRcdFx0LmR1cmF0aW9uIDE1MFxuXHRcdFx0XHQuZWFzZSAnY3ViaWMnXG5cdFx0XHRcdC5hdHRyICd0cmFuc2Zvcm0nLCdzY2FsZSgxKSdcblxuYW5ndWxhci5tb2R1bGUgJ21haW5BcHAnICwgW3JlcXVpcmUgJ2FuZ3VsYXItbWF0ZXJpYWwnICwgcmVxdWlyZSAnYW5ndWxhci1hbmltYXRlJ11cblx0LmRpcmVjdGl2ZSAndmlzRGVyJywgdmlzRGVyXG5cdC5kaXJlY3RpdmUgJ2RhdHVtJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL2RhdHVtJ1xuXHQuZGlyZWN0aXZlICdkM0RlcicsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9kM0Rlcidcblx0LmRpcmVjdGl2ZSAnY3VtQ2hhcnQnLCByZXF1aXJlICcuL2N1bUNoYXJ0J1xuXHQuZGlyZWN0aXZlICdtZmRDaGFydCcsIHJlcXVpcmUgJy4vbWZkJ1xuXHQuZGlyZWN0aXZlICdob3JBeGlzJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3hBeGlzJ1xuXHQuZGlyZWN0aXZlICd2ZXJBeGlzJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3lBeGlzJ1xuXHQjIC5hbmltYXRpb24gJy5zaWduYWwnLCBzaWduYWxBblxuXHQjIC5hbmltYXRpb24gJy5nLWNhcicsIGxlYXZlclxuXHQuZGlyZWN0aXZlICdzbGlkZXJEZXInLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvc2xpZGVyJ1xuIiwiZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLGVsKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHdpZHRoOiAzMDBcblx0XHRcdGhlaWdodDogMzAwXG5cdFx0XHRtOiBcblx0XHRcdFx0dDogMTBcblx0XHRcdFx0bDogNDBcblx0XHRcdFx0cjogMTVcblx0XHRcdFx0YjogMzVcblxuXHRcdEBob3IgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0XHQuZG9tYWluIFswLFMucnVzaF9sZW5ndGgrMTIwXVxuXHRcdFx0XHQucmFuZ2UgWzAsQHdpZHRoXVxuXG5cdFx0QHZlciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQjIC5kb21haW4gWzAsIFMubnVtX2NhcnNdXG5cdFx0XHQuZG9tYWluIFswLDJdXG5cdFx0XHQucmFuZ2UgW0BoZWlnaHQsIDBdXG5cblx0XHRAbGluZUVuID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQudGltZVxuXHRcdFx0LnkgKGQpPT5AdmVyIGQuZW5cblxuXHRcdEBsaW5lRXggPSBkMy5zdmcubGluZSgpXG5cdFx0XHQueCAoZCk9PkBob3IgZC50aW1lXG5cdFx0XHQueSAoZCk9PkB2ZXIgZC5leFxuXG5cdFx0QGhvckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQGhvclxuXHRcdFx0Lm9yaWVudCAnYm90dG9tJ1xuXHRcdFx0LnRpY2tzIDhcblxuXHRcdEB2ZXJBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEB2ZXJcblx0XHRcdC5vcmllbnQgJ2xlZnQnXG5cblxuXHRleDogLT5cblx0XHRAbGluZUV4IEByYXRlXG5cdGVuOiAtPlxuXHRcdEBsaW5lRW4gQHJhdGVcblx0XG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0c2NvcGU6IFxuXHRcdFx0cmF0ZTogJz0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvY2hhcnQuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcbmFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuXG5kZXIgPSAoJHBhcnNlKS0+ICNnb2VzIG9uIGEgc3ZnIGVsZW1lbnRcblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGQzRGVyOiAnPSdcblx0XHRcdHRyYW46ICc9J1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0dSA9ICd0LScgKyBNYXRoLnJhbmRvbSgpXG5cdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSBmYWxzZVxuXHRcdFx0c2NvcGUuJHdhdGNoICdkM0Rlcidcblx0XHRcdFx0LCAodiktPlxuXHRcdFx0XHRcdGlmIHNjb3BlLnRyYW4gYW5kIGhhc1RyYW5zaXRpb25lZFxuXHRcdFx0XHRcdFx0aGFzVHJhbnNpdGlvbmVkID0gdHJ1ZVxuXHRcdFx0XHRcdFx0c2VsLnRyYW5zaXRpb24gdVxuXHRcdFx0XHRcdFx0XHQuYXR0ciB2XG5cdFx0XHRcdFx0XHRcdC5jYWxsIHNjb3BlLnRyYW5cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSB0cnVlXG5cdFx0XHRcdFx0XHRzZWwuYXR0ciB2XG5cdFx0XHRcdCwgdHJ1ZVxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJtb2R1bGUuZXhwb3J0cyA9ICgkcGFyc2UpLT5cblx0KHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdGQzLnNlbGVjdChlbFswXSkuZGF0dW0gJHBhcnNlKGF0dHIuZGF0dW0pKHNjb3BlKSIsImRlciA9IC0+XG5cdHJlcyA9IFxuXHRcdHNjb3BlOiBcblx0XHRcdGxhYmVsOiAnQCdcblx0XHRcdG15RGF0YTogJz0nXG5cdFx0XHRtaW46ICc9J1xuXHRcdFx0bWF4OiAnPSdcblx0XHRcdHN0ZXA6ICc9J1xuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHJlcGxhY2U6IHRydWVcblx0XHRjb250cm9sbGVyOiAtPlxuXHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWVcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC9zbGlkZXIuaHRtbCdcblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZnVuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzY2FsZSA9IHNjb3BlLmZ1bi5zY2FsZSgpXG5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuY2xhc3NlZCAnaG9yIGF4aXMnLCB0cnVlXG5cblx0XHRcdHNlbC5jYWxsIHNjb3BlLmZ1blxuXHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5cbmRlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHJlc3RyaWN0OiAnQSdcblx0XHRzY29wZTogXG5cdFx0XHRmdW46ICc9J1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNjYWxlID0gc2NvcGUuZnVuLnNjYWxlKClcblxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5jbGFzc2VkICd2ZXIgYXhpcycsIHRydWVcblxuXHRcdFx0c2VsLmNhbGwgc2NvcGUuZnVuXG5cdFx0XHRcbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiJ3VzZSBzdHJpY3QnXG5cbkZ1bmN0aW9uOjpwcm9wZXJ0eSA9IChwcm9wLCBkZXNjKSAtPlxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgcHJvcCwgZGVzYyIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxlbCktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHR3aWR0aDogMzAwXG5cdFx0XHRoZWlnaHQ6IDMwMFxuXHRcdFx0bTogXG5cdFx0XHRcdHQ6IDEwXG5cdFx0XHRcdGw6IDQwXG5cdFx0XHRcdHI6IDE4XG5cdFx0XHRcdGI6IDM1XG5cblx0XHRAaG9yID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdFx0LmRvbWFpbiBbMCxTLm51bV9jYXJzKi44XVxuXHRcdFx0XHQucmFuZ2UgWzAsQHdpZHRoXVxuXG5cdFx0QHZlciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLCBTLm51bV9jYXJzKi4yNV1cblx0XHRcdC5yYW5nZSBbQGhlaWdodCwgMF1cblxuXHRcdEBsaW5lID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQuYWNjXG5cdFx0XHQueSAoZCk9PkB2ZXIgZC5mbG93XG5cblx0XHRAaG9yQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAaG9yXG5cdFx0XHQub3JpZW50ICdib3R0b20nXG5cdFx0XHQudGlja3MgOFxuXG5cdFx0QHZlckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQHZlclxuXHRcdFx0Lm9yaWVudCAnbGVmdCdcblxuXHRkOiAtPiBAbGluZSBAbWVtb3J5XG5cblx0XG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0c2NvcGU6IFxuXHRcdFx0bWVtb3J5OiAnPSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC9tZmRDaGFydC5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJTID0gcmVxdWlyZSAnLi4vc2V0dGluZ3MnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuY2xhc3MgQ2FyXG5cdGNvbnN0cnVjdG9yOi0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdGlkOiBfLnVuaXF1ZUlkICdjYXItJ1xuXHRcdFx0Y29zdDA6IEluZmluaXR5IFxuXHRcdFx0dGFyZ2V0OiBfLnJhbmRvbSAyLFMucnVzaF9sZW5ndGhcblx0XHRcdGV4aXRlZDogZmFsc2Vcblx0XHRcdGVudGVyZWQ6IGZhbHNlXG5cdFx0XHRkaXN0YW5jZTogNjBcblxuXHRhc3NpZ25fZXJyb3I6LT4gXG5cdFx0QHRfZW4gPSBNYXRoLm1heCAwLChAdGFyZ2V0ICsgXy5yYW5kb20gLTMsMylcblxuXHRyZXNldDotPlxuXHRcdFtAY29zdDAsIEBlbnRlcmVkLCBAZXhpdGVkXSA9IFtAY29zdCxmYWxzZSxmYWxzZV1cblxuXHRleGl0Oi0+XG5cdFx0W0B0X2V4LCBAZXhpdGVkXSA9IFtTLnRpbWUsIHRydWVdXG5cblx0ZXZhbF9jb3N0OiAtPlxuXHRcdEBzZCA9IEB0X2V4IC0gUy53aXNoXG5cdFx0QHNwID0gTWF0aC5tYXgoIC1TLmJldGEgKiBAc2QsIFMuZ2FtbWEgKiBAc2QpXG5cdFx0QHR0ID0gQHRfZXggLSBAdF9lblxuXHRcdEBjb3N0ID0gIEB0dCtAc3AgXG5cblx0Y2hvb3NlOiAtPlxuXHRcdGlmIEBjb3N0PkBjb3N0MFxuXHRcdFx0W0Bjb3N0MCxAdGFyZ2V0XSA9IFtAY29zdCwgQHRfZW5dXG5cblx0c2V0X2xvYzogKEBsb2MpLT5cblxuXHRlbnRlcjooQGxvYyktPlxuXHRcdEBlbnRlcmVkID0gdHJ1ZVxuXHRcdEBkZXN0aW5hdGlvbiA9IE1hdGguZmxvb3IgKEBsb2MgKyBAZGlzdGFuY2UpJVMubnVtX2NlbGxzXG5cdFx0QGNvbG9yID0gUy5jb2xvcnMgXy5yYW5kb20gUy5udW1fY2VsbHNcblxubW9kdWxlLmV4cG9ydHMgPSBDYXIiLCJTID0gcmVxdWlyZSAnLi4vc2V0dGluZ3MnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuY2xhc3MgQ2VsbFxuXHRjb25zdHJ1Y3RvcjogKEBsb2MpLT5cblx0XHRAbGFzdCA9IC1JbmZpbml0eVxuXHRcdEB0ZW1wX2NhciA9IGZhbHNlXG5cdFx0QGlkID0gXy51bmlxdWVJZCAnY2VsbCdcblxuXHRzZXRfc2lnbmFsOiAoQHNpZ25hbCktPlxuXHRcdEBzaWduYWwubG9jID0gQGxvY1xuXG5cdGNsZWFyX3NpZ25hbDogLT5cblx0XHRAc2lnbmFsID0gdW5kZWZpbmVkXG5cblx0c3BhY2U6IDRcblxuXHRyZWNlaXZlOihjYXIpLT5cblx0XHRjYXIuc2V0X2xvYyBAbG9jXG5cdFx0QGxhc3QgPSBTLnRpbWVcblx0XHRAdGVtcF9jYXIgPSBjYXJcblx0XHRjYXIuY2VsbCA9IHRoaXNcblxuXHRyZW1vdmU6IC0+XG5cdFx0QHRlbXBfY2FyID0gZmFsc2VcblxuXHRmaW5hbGl6ZTogLT5cblx0XHRAc2lnbmFsPy50aWNrKClcblx0XHRpZiAoQGNhcj1AdGVtcF9jYXIpXG5cdFx0XHRAbGFzdCA9IFMudGltZVxuXG5cdGlzX2ZyZWU6IC0+XG5cdFx0aWYgQHNpZ25hbFxuXHRcdFx0QHNpZ25hbC5ncmVlbiBhbmQgKFMudGltZS1AbGFzdCk+QHNwYWNlXG5cdFx0ZWxzZVxuXHRcdFx0KFMudGltZS1AbGFzdCk+QHNwYWNlXG5cbm1vZHVsZS5leHBvcnRzID0gQ2VsbCIsIlMgPSByZXF1aXJlICcuLi9zZXR0aW5ncydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5yZXF1aXJlICcuLi9oZWxwZXJzJ1xuY2xhc3MgU2lnbmFsXG5cdGNvbnN0cnVjdG9yOiAoQGkpIC0+XG5cdFx0QGNvdW50ID0gMFxuXHRcdEBncmVlbiA9IHRydWVcblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdzaWduYWwtJ1xuXHRcdEByZXNldCgpXG5cblx0IyBzZXRfb2Zmc2V0OiAoQG9mZnNldCktPlxuXHQjIFx0QHJlc2V0KClcblxuXHRAcHJvcGVydHkgJ29mZnNldCcsIFxuXHRcdGdldDogLT4gXG5cdFx0XHRTLnBoYXNlKigoQGkqUy5vZmZzZXQpJTEpXG5cblx0cmVzZXQ6IC0+XG5cdFx0W0Bjb3VudCwgQGdyZWVuXSA9IFtAb2Zmc2V0LCB0cnVlXVxuXG5cdHRpY2s6IC0+XG5cdFx0QGNvdW50Kytcblx0XHRpZiAoQGNvdW50KSA+PSAoUy5waGFzZSlcblx0XHRcdFtAY291bnQsIEBncmVlbl0gPSBbMCwgdHJ1ZV1cblx0XHRcdHJldHVyblxuXHRcdGlmIChAY291bnQpPj0gKFMuZ3JlZW4qUy5waGFzZSlcblx0XHRcdEBncmVlbiA9IGZhbHNlXG5cbm1vZHVsZS5leHBvcnRzID0gU2lnbmFsIiwiUyA9IHJlcXVpcmUgJy4uL3NldHRpbmdzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbkNhciA9IHJlcXVpcmUgJy4vY2FyJ1xuU2lnbmFsID0gcmVxdWlyZSAnLi9zaWduYWwnXG5DZWxsID0gcmVxdWlyZSAnLi9jZWxsJ1xuXG5jbGFzcyBNZW1vcnlcblx0Y29uc3RydWN0b3I6LT5cblx0XHRAcmVzZXQoKVxuXG5cdHJlc2V0Oi0+XG5cdFx0QHN0YXRlID0gW11cblx0XHRAY3VtID0gW11cblx0XHRAX3N0YXRlID0gW11cblxuXHRzdG9yZTooZmxvdyxleGl0cyxlbnRyaWVzLGFjYyktPlxuXHRcdEBfc3RhdGUucHVzaCBcblx0XHRcdGZsb3c6IGZsb3dcblx0XHRcdGV4aXRzOiBleGl0c1xuXHRcdFx0ZW50cmllczogZW50cmllc1xuXHRcdFx0YWNjOiBhY2NcblxuXHRcdGlmIEBfc3RhdGUubGVuZ3RoID4gMTAwXG5cdFx0XHRAX3N0YXRlLnNoaWZ0KClcblxuXHRcdG5ld19kID0gXy5yZWR1Y2UgQF9zdGF0ZSwgKGEsYiktPlxuXHRcdFx0cmVzID0gXG5cdFx0XHRcdGZsb3c6IGEuZmxvdys9Yi5mbG93LzEwMFxuXHRcdFx0XHRleGl0czogYS5leGl0cys9Yi5leGl0cy8xMDBcblx0XHRcdFx0ZW50cmllczogYS5lbnRyaWVzKz1iLmVudHJpZXMvMTAwXG5cdFx0XHRcdGFjYzogYS5hY2MgKz0gYi5hY2MvMTAwXG5cblx0XHRAc3RhdGUucHVzaCBuZXdfZFxuXG5jbGFzcyBUcmFmZmljXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBjZWxscyA9IChuZXcgQ2VsbCBuIGZvciBuIGluIFswLi4uUy5udW1fY2VsbHNdKVxuXG5cdGNoYW5nZV9zaWduYWxzOiAobiktPlxuXHRcdEBzaWduYWxzID0gW11cblx0XHRjZWxsLmNsZWFyX3NpZ25hbCgpIGZvciBjZWxsIGluIEBjZWxsc1xuXHRcdGZvciBpIGluIFswLi4ubl1cblx0XHRcdHNpZ25hbCA9IG5ldyBTaWduYWwgaVxuXHRcdFx0QHNpZ25hbHMucHVzaCBzaWduYWxcblx0XHRcdHEgPSBNYXRoLmZsb29yKGkvbipTLm51bV9jZWxscylcblx0XHRcdEBjZWxsc1txXS5zZXRfc2lnbmFsIHNpZ25hbFxuXG5cdGNoYW5nZV9vZmZzZXRzOiAtPlxuXHRcdHMucmVzZXQoKSBmb3IgcyBpbiBAc2lnbmFsc1xuXG5cdGRheV9zdGFydDooY2FycyktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHR0cmF2ZWxpbmc6IFtdXG5cdFx0XHRjdW06IFtdXG5cdFx0XHRyYXRlOiBbXVxuXHRcdFx0bWVtb3J5OiBuZXcgTWVtb3J5XG5cdFx0XHRjdW1FbjogMFxuXHRcdFx0Y3VtRXg6IDBcblx0XHRcdHdhaXRpbmc6IF8uY2xvbmUgY2Fyc1xuXHRcdFx0Y2FyczogXy5jbG9uZSBjYXJzXG5cblx0XHRmb3IgY2VsbCBpbiBAY2VsbHNcblx0XHRcdGNlbGwuY2FyID0gY2VsbC50ZW1wX2NhciA9IGZhbHNlXG5cdFx0XHRjZWxsLmxhc3QgPSAtSW5maW5pdHlcblxuXHRcdGNhci5hc3NpZ25fZXJyb3IoKSBmb3IgY2FyIGluIEB3YWl0aW5nXG5cblx0ZGF5X2VuZDooY2FycyktPlxuXHRcdGNhci5ldmFsX2Nvc3QoKSBmb3IgY2FyIGluIGNhcnNcblx0XHRjYXIuY2hvb3NlKCkgZm9yIGNhciBpbiBfLnNhbXBsZShjYXJzLFMuc2FtcGxlKVxuXHRcdGNhci5yZXNldCgpIGZvciBjYXIgaW4gY2Fyc1xuXG5cdGRvbmU6IC0+XG5cdFx0KEB3YWl0aW5nLmxlbmd0aCtAdHJhdmVsaW5nLmxlbmd0aCk9PTBcblxuXHR0aWNrOi0+XG5cdFx0W2Zsb3csZXhpdHMsZW50cmllc10gPSBbMCwwLDBdXG5cblx0XHRrID0gQGNlbGxzXG5cdFx0Zm9yIGNhciBpbiBAd2FpdGluZ1xuXHRcdFx0aWYgKGNhci50X2VuPD1TLnRpbWUpXG5cdFx0XHRcdGNlbGwgPSBfLnNhbXBsZSBfLmZpbHRlciggQGNlbGxzLChjKS0+Yy5pc19mcmVlKCkpXG5cdFx0XHRcdGlmIGNlbGxcblx0XHRcdFx0XHRjYXIuZW50ZXIgY2VsbC5sb2Ncblx0XHRcdFx0XHRjZWxsLnJlY2VpdmUgY2FyXG5cdFx0XHRcdFx0QHRyYXZlbGluZy5wdXNoIGNhclxuXHRcdFx0XHRcdGVudHJpZXMrK1xuXHRcdFx0XHRcdGZsb3crK1xuXG5cdFx0Zm9yIGNlbGwsaSBpbiBrXG5cdFx0XHRpZiBjZWxsLmNhclxuXHRcdFx0XHRpZiBjZWxsLmNhci5kZXN0aW5hdGlvbj09Y2VsbC5sb2Ncblx0XHRcdFx0XHRjZWxsLmNhci5leGl0KClcblx0XHRcdFx0XHRjZWxsLnJlbW92ZSgpXG5cdFx0XHRcdFx0ZXhpdHMrK1xuXHRcdFx0XHRcdGZsb3crK1xuXHRcdFx0XHRpZiBrWyhpKzEpJWsubGVuZ3RoXS5pc19mcmVlKClcblx0XHRcdFx0XHRrWyhpKzEpJWsubGVuZ3RoXS5yZWNlaXZlIGNlbGwuY2FyXG5cdFx0XHRcdFx0Y2VsbC5yZW1vdmUoKVxuXHRcdFx0XHRcdGZsb3crK1xuXG5cdFx0Y2VsbC5maW5hbGl6ZSgpIGZvciBjZWxsIGluIEBjZWxsc1xuXG5cdFx0QHdhaXRpbmcgPSBfLmZpbHRlciBAd2FpdGluZywgKGMpLT4gIWMuZW50ZXJlZFxuXHRcdEB0cmF2ZWxpbmcgPSBfLmZpbHRlciBAdHJhdmVsaW5nLCAoYyktPiAhYy5leGl0ZWRcblx0XHRpZiBTLnRpbWUlMjAgPT0gMFxuXHRcdFx0QG1lbW9yeS5zdG9yZSBmbG93LGV4aXRzLGVudHJpZXMsQHRyYXZlbGluZy5sZW5ndGhcblxubW9kdWxlLmV4cG9ydHMgPSBUcmFmZmljXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbiMgcmVxdWlyZSAnLi9oZWxwZXJzJ1xuXG5jbGFzcyBTZXR0aW5nc1xuXHRjb25zdHJ1Y3RvcjotPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHRudW1fY2FyczogMTAwMFxuXHRcdFx0dGltZTogMFxuXHRcdFx0c3BhY2U6IDNcblx0XHRcdHBhY2U6IDFcblx0XHRcdGRpc3RhbmNlOiA5MFxuXHRcdFx0c2FtcGxlOiAzMFxuXHRcdFx0YmV0YTogLjVcblx0XHRcdGdhbW1hOiAyXG5cdFx0XHRvZmZzZXQ6IDBcblx0XHRcdHJ1c2hfbGVuZ3RoOiA4MDBcblx0XHRcdCMgZnJlcXVlbmN5OiA4XG5cdFx0XHRudW1fY2VsbHM6IDEwMDBcblx0XHRcdHBoYXNlOiA1MFxuXHRcdFx0Z3JlZW46IC41XG5cdFx0XHR3aXNoOiAzMjVcblx0XHRcdG51bV9zaWduYWxzOiAyMFxuXHRcdFx0ZGF5OiAwXG5cdFx0XHRvZmZzZXQ6IC4zXG5cblx0XHRAY29sb3JzID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gXy5yYW5nZSAwLEBudW1fY2VsbHMsQG51bV9jZWxscy82XG5cdFx0XHQucmFuZ2UgW1xuXHRcdFx0XHQnI0Y0NDMzNicsICNyZWRcblx0XHRcdFx0JyMyMTk2RjMnLCAjYmx1ZVxuXHRcdFx0XHQnI0U5MUU2MycsICNwaW5rXG5cdFx0XHRcdCcjMDBCQ0Q0JywgI2N5YW5cblx0XHRcdFx0JyNGRkMxMDcnLCAjYW1iZXJcblx0XHRcdFx0JyM0Q0FGNTAnLCAjZ3JlZW5cblx0XHRcdFx0XVxuXHRcdEBzY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLEBudW1fY2VsbHNdXG5cdFx0XHQucmFuZ2UgWzAsMzYwXVxuXG5cdGFkdmFuY2U6IC0+XG5cdFx0QHRpbWUrK1xuXHRyZXNldF90aW1lOiAtPlxuXHRcdEBkYXkrK1xuXHRcdEB0aW1lID0gMFxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBTZXR0aW5ncygpIl19
