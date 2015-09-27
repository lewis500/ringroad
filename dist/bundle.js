(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Car, Ctrl, S, Traffic, _, angular, d3, leaver, visDer;

angular = require('angular');

d3 = require('d3');

_ = require('lodash');

S = require('./settings');

Traffic = require('./models/traffic');

Car = require('./models/car');

require('./solver');

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
        S.offset = Math.round(S.offset * S.num_signals) / S.num_signals;
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
        _this.traffic.tick();
        _this.traffic.tick();
        _this.traffic.tick();
        _this.traffic.tick();
        _this.traffic.tick();
        _this.traffic.tick();
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



},{"./cumChart":2,"./directives/d3Der":3,"./directives/datum":4,"./directives/slider":5,"./directives/xAxis":6,"./directives/yAxis":7,"./mfd":9,"./models/car":10,"./models/traffic":13,"./settings":14,"./solver":15,"angular":undefined,"angular-animate":undefined,"angular-material":undefined,"d3":undefined,"lodash":undefined}],2:[function(require,module,exports){
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
    this.hor = d3.scale.linear().domain([0, 1]).range([0, this.width]);
    this.ver = d3.scale.linear().domain([0, .25]).range([this.height, 0]);
    this.line = d3.svg.line().x((function(_this) {
      return function(d) {
        return _this.hor(d.k);
      };
    })(this)).y((function(_this) {
      return function(d) {
        return _this.ver(d.q);
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

console.log('hello');

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
    this.day_start();
  }

  Memory.prototype.reset = function() {
    var ref;
    return ref = [0, 0, 0], this.q = ref[0], this.k = ref[1], this.i = ref[2], ref;
  };

  Memory.prototype.span = 30;

  Memory.prototype.day_start = function() {
    this.long_term = [];
    return this.reset();
  };

  Memory.prototype.remember = function(q, k) {
    this.i++;
    this.q += q;
    this.k += k;
    if (this.i >= this.span) {
      this.long_term.push({
        q: this.q / (this.span * S.num_cells),
        k: this.k / (this.span * S.num_cells),
        id: _.uniqueId('memory-')
      });
      return this.reset();
    }
  };

  return Memory;

})();

Traffic = (function() {
  function Traffic() {
    var cell, i, j, len, n, ref;
    this.cells = (function() {
      var j, ref, results;
      results = [];
      for (n = j = 0, ref = S.num_cells; 0 <= ref ? j < ref : j > ref; n = 0 <= ref ? ++j : --j) {
        results.push(new Cell(n));
      }
      return results;
    })();
    ref = this.cells;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      cell = ref[i];
      cell.next = this.cells[(i + 1) % this.cells.length];
    }
    this.memory = new Memory();
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
      waiting: _.clone(cars),
      cars: _.clone(cars)
    });
    this.memory.day_start();
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
    S.advance();
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
        } else if (cell.next.is_free()) {
          cell.next.receive(cell.car);
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
    return this.memory.remember(flow, this.traveling.length);
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
      num_cars: 1500,
      time: 0,
      space: 4,
      pace: 1,
      distance: 90,
      sample: 30,
      beta: .5,
      gamma: 2,
      offset: 0,
      rush_length: 600,
      num_cells: 1000,
      phase: 50,
      green: .5,
      wish: 400,
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



},{"d3":undefined,"lodash":undefined}],15:[function(require,module,exports){
var Solver, _, q;

_ = require('lodash');

Solver = (function() {
  function Solver(cycle, delta, d, red, vf, w, q0) {
    this.cycle = cycle;
    this.delta = delta;
    this.d = d;
    this.red = red;
    this.vf = vf;
    this.w = w;
    this.q0 = q0;
    this.kj = this.q0 * (-1 / this.w + 1 / this.vf);
    this.red_time = this.red * this.cycle;
  }

  Solver.prototype.solve = function() {
    var g, l, ref, ref1, res, t, time_stopped, x;
    res = [];
    ref = [0, 1000, 0], x = ref[0], g = ref[1], l = ref[2];
    while (g > 0) {
      t = this.red_time + x / this.vf;
      g = this.green_left(t, l);
      time_stopped = Math.max(0, g);
      res.push({
        x: x,
        t: t,
        g: g,
        l: l,
        c: this.q0 * time_stopped
      });
      x += this.d;
      l += 1;
    }
    ref1 = [this.d / this.w, 1000, -1], x = ref1[0], g = ref1[1], l = ref1[2];
    while (g > 0) {
      t = this.red_time + x / this.w;
      g = this.green_left(t, l);
      res.push({
        x: x,
        t: t,
        g: g,
        l: l,
        c: this.kj * t
      });
      x -= this.d;
      l -= 1;
    }
    return res;
  };

  Solver.prototype.green_left = function(t, l) {
    var leftover;
    leftover = (t + Math.abs(l) * this.delta) % this.cycle;
    if (leftover < this.red_time) {
      return leftover - this.red_time;
    } else {
      return this.cycle - leftover;
    }
  };

  Solver.prototype.find_min = function(k) {
    var e, flow, flow_l, i, len, res, table;
    table = this.solve();
    flow = Infinity;
    res;
    for (i = 0, len = table.length; i < len; i++) {
      e = table[i];
      flow_l = (e.c + k * e.x) / e.t;
      if (flow_l < flow) {
        flow = flow_l;
        res = e;
      }
    }
    res.k = k;
    return res;
  };

  Solver.prototype.find_mfd = function() {
    var i, k, len, ref, results;
    ref = _.range(0, this.kj, this.kj / 10);
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      k = ref[i];
      results.push(this.find_min(k));
    }
    return results;
  };

  return Solver;

})();

q = new Solver(10, 1, 3, .5, 3, -1, 3);

console.log(q.find_mfd());



},{"lodash":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2FwcC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2N1bUNoYXJ0LmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9yaW5ncm9hZC9hcHAvZGlyZWN0aXZlcy9kM0Rlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2RpcmVjdGl2ZXMvZGF0dW0uY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3Jpbmdyb2FkL2FwcC9kaXJlY3RpdmVzL3NsaWRlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2RpcmVjdGl2ZXMveEF4aXMuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3Jpbmdyb2FkL2FwcC9kaXJlY3RpdmVzL3lBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9yaW5ncm9hZC9hcHAvaGVscGVycy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL21mZC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL21vZGVscy9jYXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3Jpbmdyb2FkL2FwcC9tb2RlbHMvY2VsbC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL21vZGVscy9zaWduYWwuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3Jpbmdyb2FkL2FwcC9tb2RlbHMvdHJhZmZpYy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL3NldHRpbmdzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9y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QUEsUUFBRCxDQUFVLENBQVY7QUFBQTs7RUFETzs7Ozs7O0FBR1YsQ0FBQSxHQUFRLElBQUEsTUFBQSxDQUFPLEVBQVAsRUFBVSxDQUFWLEVBQVksQ0FBWixFQUFjLEVBQWQsRUFBaUIsQ0FBakIsRUFBbUIsQ0FBQyxDQUFwQixFQUFzQixDQUF0Qjs7QUFDUixPQUFPLENBQUMsR0FBUixDQUFZLENBQUMsQ0FBQyxRQUFGLENBQUEsQ0FBWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJhbmd1bGFyID0gcmVxdWlyZSAnYW5ndWxhcidcbmQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5UcmFmZmljID0gcmVxdWlyZSAnLi9tb2RlbHMvdHJhZmZpYydcbkNhciA9IHJlcXVpcmUgJy4vbW9kZWxzL2NhcidcbnJlcXVpcmUgJy4vc29sdmVyJ1xuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLGVsKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHBhdXNlZDogdHJ1ZVxuXHRcdFx0dHJhZmZpYzogbmV3IFRyYWZmaWNcblx0XHRcdHBhbDogXy5yYW5nZSAwLFMucmwsUy5ybC8yNVxuXHRcdEBjYXJzID0gWzAuLi5TLm51bV9jYXJzXS5tYXAgLT4gbmV3IENhciggUy5kaXN0YW5jZSArIF8ucmFuZG9tKCAtOCw1KSApXG5cdFx0QHNjb3BlLlMgPSBTXG5cdFx0QHRyYWZmaWMuZGF5X3N0YXJ0IEBjYXJzXG5cdFx0QHNjb3BlLiR3YXRjaCAnUy5udW1fc2lnbmFscycsKG4pPT5cblx0XHRcdFMub2Zmc2V0ID0gTWF0aC5yb3VuZChTLm9mZnNldCpuKS9uXG5cdFx0XHRAdHJhZmZpYy5jaGFuZ2Vfc2lnbmFscyBTLm51bV9zaWduYWxzXG5cblx0XHRAc2NvcGUuJHdhdGNoICdTLm9mZnNldCcsKG4pPT5cblx0XHRcdFMub2Zmc2V0ID0gTWF0aC5yb3VuZChTLm9mZnNldCpTLm51bV9zaWduYWxzKS9TLm51bV9zaWduYWxzXG5cdFx0XHRAdHJhZmZpYy5jaGFuZ2Vfb2Zmc2V0cygpXG5cblx0cm90YXRvcjogKGNhciktPiBcInJvdGF0ZSgje1Muc2NhbGUoY2FyLmxvYyl9KSB0cmFuc2xhdGUoMCw1MClcIlxuXG5cdGRheV9zdGFydDogLT5cblx0XHRTLnJlc2V0X3RpbWUoKVxuXHRcdEB0cmFmZmljLmRheV9zdGFydCBAY2Fyc1xuXHRcdEB0aWNrKClcblxuXHRkYXlfZW5kOiAtPlxuXHRcdEB0cmFmZmljLmRheV9lbmQgQGNhcnNcblx0XHRzZXRUaW1lb3V0ID0+IEBkYXlfc3RhcnQgQGNhcnNcblxuXHRjbGljazogKHZhbCkgLT4gaWYgIXZhbCB0aGVuIEBwbGF5KClcblx0cGF1c2U6IC0+IEBwYXVzZWQgPSB0cnVlXG5cdHRpY2s6IC0+XG5cdFx0ZDMudGltZXIgPT5cblx0XHRcdFx0aWYgQHRyYWZmaWMuZG9uZSgpXG5cdFx0XHRcdFx0QGRheV9lbmQgQGNhcnNcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHRAdHJhZmZpYy50aWNrKClcblx0XHRcdFx0QHRyYWZmaWMudGljaygpXG5cdFx0XHRcdEB0cmFmZmljLnRpY2soKVxuXHRcdFx0XHRAdHJhZmZpYy50aWNrKClcblx0XHRcdFx0QHRyYWZmaWMudGljaygpXG5cdFx0XHRcdEB0cmFmZmljLnRpY2soKVxuXHRcdFx0XHRAdHJhZmZpYy50aWNrKClcblx0XHRcdFx0QHRyYWZmaWMudGljaygpXG5cdFx0XHRcdEB0cmFmZmljLnRpY2soKVxuXG5cdFx0XHRcdEBzY29wZS4kZXZhbEFzeW5jKClcblx0XHRcdFx0QHBhdXNlZFxuXG5cdHBsYXk6IC0+XG5cdFx0QHBhdXNlKClcblx0XHRAcGF1c2VkID0gZmFsc2Vcblx0XHRAdGljaygpXG5cbnZpc0RlciA9IC0+XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHNjb3BlOiB7fVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L3Zpcy5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxubGVhdmVyID0gLT5cblx0YW5pbWF0ZSA9IFxuXHRcdGxlYXZlOiAoZWwpLT5cblx0XHRcdGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuc2VsZWN0ICdyZWN0J1xuXHRcdFx0XHQudHJhbnNpdGlvbigpXG5cdFx0XHRcdC5kdXJhdGlvbiA1MFxuXHRcdFx0XHQuZWFzZSAnY3ViaWMnXG5cdFx0XHRcdC5hdHRyICd0cmFuc2Zvcm0nLCdzY2FsZSgxLjIsMSknXG5cdFx0XHRcdC5hdHRyICdmaWxsJywnI2VlZSdcblx0XHRcdFx0LnRyYW5zaXRpb24oKVxuXHRcdFx0XHQuZHVyYXRpb24gMTUwXG5cdFx0XHRcdC5lYXNlICdjdWJpYydcblx0XHRcdFx0LmF0dHIgJ3RyYW5zZm9ybScsJ3NjYWxlKDAsMSknXG5cdFx0ZW50ZXI6IChlbCktPlxuXHRcdFx0ZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHRcdC5zZWxlY3QgJ3JlY3QnXG5cdFx0XHRcdC5hdHRyICd0cmFuc2Zvcm0nLCdzY2FsZSgwLC41KSdcblx0XHRcdFx0LnRyYW5zaXRpb24oKVxuXHRcdFx0XHQuZHVyYXRpb24gNjBcblx0XHRcdFx0LmVhc2UgJ2N1YmljJ1xuXHRcdFx0XHQuYXR0ciAndHJhbnNmb3JtJywnc2NhbGUoMS4yLDEpJ1xuXHRcdFx0XHQudHJhbnNpdGlvbigpXG5cdFx0XHRcdC5kdXJhdGlvbiAxNTBcblx0XHRcdFx0LmVhc2UgJ2N1YmljJ1xuXHRcdFx0XHQuYXR0ciAndHJhbnNmb3JtJywnc2NhbGUoMSknXG5cbmFuZ3VsYXIubW9kdWxlICdtYWluQXBwJyAsIFtyZXF1aXJlICdhbmd1bGFyLW1hdGVyaWFsJyAsIHJlcXVpcmUgJ2FuZ3VsYXItYW5pbWF0ZSddXG5cdC5kaXJlY3RpdmUgJ3Zpc0RlcicsIHZpc0RlclxuXHQuZGlyZWN0aXZlICdkYXR1bScsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9kYXR1bSdcblx0LmRpcmVjdGl2ZSAnZDNEZXInLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvZDNEZXInXG5cdC5kaXJlY3RpdmUgJ2N1bUNoYXJ0JywgcmVxdWlyZSAnLi9jdW1DaGFydCdcblx0LmRpcmVjdGl2ZSAnbWZkQ2hhcnQnLCByZXF1aXJlICcuL21mZCdcblx0LmRpcmVjdGl2ZSAnaG9yQXhpcycsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy94QXhpcydcblx0LmRpcmVjdGl2ZSAndmVyQXhpcycsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy95QXhpcydcblx0IyAuYW5pbWF0aW9uICcuc2lnbmFsJywgc2lnbmFsQW5cblx0IyAuYW5pbWF0aW9uICcuZy1jYXInLCBsZWF2ZXJcblx0LmRpcmVjdGl2ZSAnc2xpZGVyRGVyJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3NsaWRlcidcbiIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxlbCktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHR3aWR0aDogMzAwXG5cdFx0XHRoZWlnaHQ6IDMwMFxuXHRcdFx0bTogXG5cdFx0XHRcdHQ6IDEwXG5cdFx0XHRcdGw6IDQwXG5cdFx0XHRcdHI6IDE1XG5cdFx0XHRcdGI6IDM1XG5cblx0XHRAaG9yID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdFx0LmRvbWFpbiBbMCxTLnJ1c2hfbGVuZ3RoKzEyMF1cblx0XHRcdFx0LnJhbmdlIFswLEB3aWR0aF1cblxuXHRcdEB2ZXIgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0IyAuZG9tYWluIFswLCBTLm51bV9jYXJzXVxuXHRcdFx0LmRvbWFpbiBbMCwyXVxuXHRcdFx0LnJhbmdlIFtAaGVpZ2h0LCAwXVxuXG5cdFx0QGxpbmVFbiA9IGQzLnN2Zy5saW5lKClcblx0XHRcdC54IChkKT0+QGhvciBkLnRpbWVcblx0XHRcdC55IChkKT0+QHZlciBkLmVuXG5cblx0XHRAbGluZUV4ID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQudGltZVxuXHRcdFx0LnkgKGQpPT5AdmVyIGQuZXhcblxuXHRcdEBob3JBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEBob3Jcblx0XHRcdC5vcmllbnQgJ2JvdHRvbSdcblx0XHRcdC50aWNrcyA4XG5cblx0XHRAdmVyQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAdmVyXG5cdFx0XHQub3JpZW50ICdsZWZ0J1xuXG5cblx0ZXg6IC0+XG5cdFx0QGxpbmVFeCBAcmF0ZVxuXHRlbjogLT5cblx0XHRAbGluZUVuIEByYXRlXG5cdFxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHNjb3BlOiBcblx0XHRcdHJhdGU6ICc9J1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L2NoYXJ0Lmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5hbmd1bGFyID0gcmVxdWlyZSAnYW5ndWxhcidcblxuZGVyID0gKCRwYXJzZSktPiAjZ29lcyBvbiBhIHN2ZyBlbGVtZW50XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHJlc3RyaWN0OiAnQSdcblx0XHRzY29wZTogXG5cdFx0XHRkM0RlcjogJz0nXG5cdFx0XHR0cmFuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdHUgPSAndC0nICsgTWF0aC5yYW5kb20oKVxuXHRcdFx0aGFzVHJhbnNpdGlvbmVkID0gZmFsc2Vcblx0XHRcdHNjb3BlLiR3YXRjaCAnZDNEZXInXG5cdFx0XHRcdCwgKHYpLT5cblx0XHRcdFx0XHRpZiBzY29wZS50cmFuIGFuZCBoYXNUcmFuc2l0aW9uZWRcblx0XHRcdFx0XHRcdGhhc1RyYW5zaXRpb25lZCA9IHRydWVcblx0XHRcdFx0XHRcdHNlbC50cmFuc2l0aW9uIHVcblx0XHRcdFx0XHRcdFx0LmF0dHIgdlxuXHRcdFx0XHRcdFx0XHQuY2FsbCBzY29wZS50cmFuXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0aGFzVHJhbnNpdGlvbmVkID0gdHJ1ZVxuXHRcdFx0XHRcdFx0c2VsLmF0dHIgdlxuXHRcdFx0XHQsIHRydWVcbm1vZHVsZS5leHBvcnRzID0gZGVyIiwibW9kdWxlLmV4cG9ydHMgPSAoJHBhcnNlKS0+XG5cdChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRkMy5zZWxlY3QoZWxbMF0pLmRhdHVtICRwYXJzZShhdHRyLmRhdHVtKShzY29wZSkiLCJkZXIgPSAtPlxuXHRyZXMgPSBcblx0XHRzY29wZTogXG5cdFx0XHRsYWJlbDogJ0AnXG5cdFx0XHRteURhdGE6ICc9J1xuXHRcdFx0bWluOiAnPSdcblx0XHRcdG1heDogJz0nXG5cdFx0XHRzdGVwOiAnPSdcblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHRyZXBsYWNlOiB0cnVlXG5cdFx0Y29udHJvbGxlcjogLT5cblx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3Qvc2xpZGVyLmh0bWwnXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcblxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGZ1bjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2NhbGUgPSBzY29wZS5mdW4uc2NhbGUoKVxuXG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LmNsYXNzZWQgJ2hvciBheGlzJywgdHJ1ZVxuXG5cdFx0XHRzZWwuY2FsbCBzY29wZS5mdW5cblx0XHRcdFxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZnVuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzY2FsZSA9IHNjb3BlLmZ1bi5zY2FsZSgpXG5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuY2xhc3NlZCAndmVyIGF4aXMnLCB0cnVlXG5cblx0XHRcdHNlbC5jYWxsIHNjb3BlLmZ1blxuXHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsIid1c2Ugc3RyaWN0J1xuXG5GdW5jdGlvbjo6cHJvcGVydHkgPSAocHJvcCwgZGVzYykgLT5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsIHByb3AsIGRlc2MiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsZWwpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0d2lkdGg6IDMwMFxuXHRcdFx0aGVpZ2h0OiAzMDBcblx0XHRcdG06IFxuXHRcdFx0XHR0OiAxMFxuXHRcdFx0XHRsOiA0MFxuXHRcdFx0XHRyOiAxOFxuXHRcdFx0XHRiOiAzNVxuXG5cdFx0QGhvciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHRcdC5kb21haW4gWzAsMV1cblx0XHRcdFx0LnJhbmdlIFswLEB3aWR0aF1cblxuXHRcdEB2ZXIgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0LmRvbWFpbiBbMCwgLjI1XVxuXHRcdFx0LnJhbmdlIFtAaGVpZ2h0LCAwXVxuXG5cdFx0QGxpbmUgPSBkMy5zdmcubGluZSgpXG5cdFx0XHQueCAoZCk9PkBob3IgZC5rXG5cdFx0XHQueSAoZCk9PkB2ZXIgZC5xXG5cblx0XHRAaG9yQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAaG9yXG5cdFx0XHQub3JpZW50ICdib3R0b20nXG5cdFx0XHQudGlja3MgOFxuXG5cdFx0QHZlckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQHZlclxuXHRcdFx0Lm9yaWVudCAnbGVmdCdcblxuXHRkOiAtPiBAbGluZSBAbWVtb3J5XG5cblx0XG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0c2NvcGU6IFxuXHRcdFx0bWVtb3J5OiAnPSdcblx0XHRcdCMgdGhlb3J5OiAnPSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC9tZmRDaGFydC5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJTID0gcmVxdWlyZSAnLi4vc2V0dGluZ3MnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuY2xhc3MgQ2FyXG5cdGNvbnN0cnVjdG9yOi0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdGlkOiBfLnVuaXF1ZUlkICdjYXItJ1xuXHRcdFx0Y29zdDA6IEluZmluaXR5IFxuXHRcdFx0dGFyZ2V0OiBfLnJhbmRvbSAyLFMucnVzaF9sZW5ndGhcblx0XHRcdGV4aXRlZDogZmFsc2Vcblx0XHRcdGVudGVyZWQ6IGZhbHNlXG5cdFx0XHRkaXN0YW5jZTogNjBcblxuXHRhc3NpZ25fZXJyb3I6LT4gXG5cdFx0QHRfZW4gPSBNYXRoLm1heCAwLChAdGFyZ2V0ICsgXy5yYW5kb20gLTMsMylcblxuXHRyZXNldDotPlxuXHRcdFtAY29zdDAsIEBlbnRlcmVkLCBAZXhpdGVkXSA9IFtAY29zdCxmYWxzZSxmYWxzZV1cblxuXHRleGl0Oi0+XG5cdFx0W0B0X2V4LCBAZXhpdGVkXSA9IFtTLnRpbWUsIHRydWVdXG5cblx0ZXZhbF9jb3N0OiAtPlxuXHRcdEBzZCA9IEB0X2V4IC0gUy53aXNoXG5cdFx0QHNwID0gTWF0aC5tYXgoIC1TLmJldGEgKiBAc2QsIFMuZ2FtbWEgKiBAc2QpXG5cdFx0QHR0ID0gQHRfZXggLSBAdF9lblxuXHRcdEBjb3N0ID0gIEB0dCtAc3AgXG5cblx0Y2hvb3NlOiAtPlxuXHRcdGlmIEBjb3N0PkBjb3N0MFxuXHRcdFx0W0Bjb3N0MCxAdGFyZ2V0XSA9IFtAY29zdCwgQHRfZW5dXG5cblx0c2V0X2xvYzogKEBsb2MpLT5cblxuXHRlbnRlcjooQGxvYyktPlxuXHRcdEBlbnRlcmVkID0gdHJ1ZVxuXHRcdEBkZXN0aW5hdGlvbiA9IE1hdGguZmxvb3IgKEBsb2MgKyBAZGlzdGFuY2UpJVMubnVtX2NlbGxzXG5cdFx0QGNvbG9yID0gUy5jb2xvcnMgXy5yYW5kb20gUy5udW1fY2VsbHNcblxubW9kdWxlLmV4cG9ydHMgPSBDYXIiLCJTID0gcmVxdWlyZSAnLi4vc2V0dGluZ3MnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuY29uc29sZS5sb2cgJ2hlbGxvJ1xuXG5jbGFzcyBDZWxsXG5cdGNvbnN0cnVjdG9yOiAoQGxvYyktPlxuXHRcdEBsYXN0ID0gLUluZmluaXR5XG5cdFx0QHRlbXBfY2FyID0gZmFsc2Vcblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdjZWxsJ1xuXG5cdHNldF9zaWduYWw6IChAc2lnbmFsKS0+XG5cdFx0QHNpZ25hbC5sb2MgPSBAbG9jXG5cblx0Y2xlYXJfc2lnbmFsOiAtPlxuXHRcdEBzaWduYWwgPSB1bmRlZmluZWRcblxuXHRzcGFjZTogNFxuXG5cdHJlY2VpdmU6KGNhciktPlxuXHRcdGNhci5zZXRfbG9jIEBsb2Ncblx0XHRAbGFzdCA9IFMudGltZVxuXHRcdEB0ZW1wX2NhciA9IGNhclxuXHRcdGNhci5jZWxsID0gdGhpc1xuXG5cdHJlbW92ZTogLT5cblx0XHRAdGVtcF9jYXIgPSBmYWxzZVxuXG5cdGZpbmFsaXplOiAtPlxuXHRcdEBzaWduYWw/LnRpY2soKVxuXHRcdGlmIChAY2FyPUB0ZW1wX2Nhcilcblx0XHRcdEBsYXN0ID0gUy50aW1lXG5cblx0aXNfZnJlZTogLT5cblx0XHRpZiBAc2lnbmFsXG5cdFx0XHRAc2lnbmFsLmdyZWVuIGFuZCAoUy50aW1lLUBsYXN0KT5Ac3BhY2Vcblx0XHRlbHNlXG5cdFx0XHQoUy50aW1lLUBsYXN0KT5Ac3BhY2VcblxubW9kdWxlLmV4cG9ydHMgPSBDZWxsIiwiUyA9IHJlcXVpcmUgJy4uL3NldHRpbmdzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbnJlcXVpcmUgJy4uL2hlbHBlcnMnXG5cbmNsYXNzIFNpZ25hbFxuXHRjb25zdHJ1Y3RvcjogKEBpKSAtPlxuXHRcdEBjb3VudCA9IDBcblx0XHRAZ3JlZW4gPSB0cnVlXG5cdFx0QGlkID0gXy51bmlxdWVJZCAnc2lnbmFsLSdcblx0XHRAcmVzZXQoKVxuXG5cdEBwcm9wZXJ0eSAnb2Zmc2V0JywgXG5cdFx0Z2V0OiAtPiBcblx0XHRcdFMucGhhc2UqKChAaSpTLm9mZnNldCklMSlcblxuXHRyZXNldDogLT5cblx0XHRbQGNvdW50LCBAZ3JlZW5dID0gW0BvZmZzZXQsIHRydWVdXG5cblx0dGljazogLT5cblx0XHRAY291bnQrK1xuXHRcdGlmIChAY291bnQpID49IChTLnBoYXNlKVxuXHRcdFx0W0Bjb3VudCwgQGdyZWVuXSA9IFswLCB0cnVlXVxuXHRcdFx0cmV0dXJuXG5cdFx0aWYgKEBjb3VudCk+PSAoUy5ncmVlbipTLnBoYXNlKVxuXHRcdFx0QGdyZWVuID0gZmFsc2VcblxubW9kdWxlLmV4cG9ydHMgPSBTaWduYWwiLCJTID0gcmVxdWlyZSAnLi4vc2V0dGluZ3MnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuQ2FyID0gcmVxdWlyZSAnLi9jYXInXG5TaWduYWwgPSByZXF1aXJlICcuL3NpZ25hbCdcbkNlbGwgPSByZXF1aXJlICcuL2NlbGwnXG5cbmNsYXNzIE1lbW9yeVxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAZGF5X3N0YXJ0KClcblx0cmVzZXQ6LT5cblx0XHRbQHEsQGssQGldID0gWzAsMCwwXVxuXG5cdHNwYW46IDMwXG5cblx0ZGF5X3N0YXJ0OiAtPlxuXHRcdEBsb25nX3Rlcm0gPSBbXVxuXHRcdEByZXNldCgpXG5cblx0cmVtZW1iZXI6KHEsayktPlxuXHRcdEBpKytcblx0XHRAcSs9cVxuXHRcdEBrKz1rXG5cdFx0aWYgQGk+PUBzcGFuXG5cdFx0XHRAbG9uZ190ZXJtLnB1c2ggXG5cdFx0XHRcdHE6IEBxLyhAc3BhbipTLm51bV9jZWxscylcblx0XHRcdFx0azogQGsvKEBzcGFuKlMubnVtX2NlbGxzKVxuXHRcdFx0XHRpZDogXy51bmlxdWVJZCAnbWVtb3J5LSdcblx0XHRcdEByZXNldCgpXG5cbmNsYXNzIFRyYWZmaWNcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QGNlbGxzID0gKG5ldyBDZWxsIG4gZm9yIG4gaW4gWzAuLi5TLm51bV9jZWxsc10pXG5cdFx0Zm9yIGNlbGwsaSBpbiBAY2VsbHNcblx0XHRcdGNlbGwubmV4dCA9IEBjZWxsc1soaSsxKSVAY2VsbHMubGVuZ3RoXVxuXG5cdFx0QG1lbW9yeSA9IG5ldyBNZW1vcnkoKVxuXG5cdGNoYW5nZV9zaWduYWxzOiAobiktPlxuXHRcdEBzaWduYWxzID0gW11cblx0XHRjZWxsLmNsZWFyX3NpZ25hbCgpIGZvciBjZWxsIGluIEBjZWxsc1xuXHRcdGZvciBpIGluIFswLi4ubl1cblx0XHRcdHNpZ25hbCA9IG5ldyBTaWduYWwgaVxuXHRcdFx0QHNpZ25hbHMucHVzaCBzaWduYWxcblx0XHRcdHEgPSBNYXRoLmZsb29yKGkvbipTLm51bV9jZWxscylcblx0XHRcdEBjZWxsc1txXS5zZXRfc2lnbmFsIHNpZ25hbFxuXG5cdGNoYW5nZV9vZmZzZXRzOiAtPlxuXHRcdHMucmVzZXQoKSBmb3IgcyBpbiBAc2lnbmFsc1xuXG5cdGRheV9zdGFydDooY2FycyktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHR0cmF2ZWxpbmc6IFtdXG5cdFx0XHRjdW06IFtdXG5cdFx0XHRyYXRlOiBbXVxuXHRcdFx0IyBjdW1FbjogMFxuXHRcdFx0IyBjdW1FeDogMFxuXHRcdFx0d2FpdGluZzogXy5jbG9uZSBjYXJzXG5cdFx0XHRjYXJzOiBfLmNsb25lIGNhcnNcblxuXHRcdEBtZW1vcnkuZGF5X3N0YXJ0KClcblxuXHRcdGZvciBjZWxsIGluIEBjZWxsc1xuXHRcdFx0Y2VsbC5jYXIgPSBjZWxsLnRlbXBfY2FyID0gZmFsc2Vcblx0XHRcdGNlbGwubGFzdCA9IC1JbmZpbml0eVxuXG5cdFx0Y2FyLmFzc2lnbl9lcnJvcigpIGZvciBjYXIgaW4gQHdhaXRpbmdcblxuXHRkYXlfZW5kOihjYXJzKS0+XG5cdFx0Y2FyLmV2YWxfY29zdCgpIGZvciBjYXIgaW4gY2Fyc1xuXHRcdGNhci5jaG9vc2UoKSBmb3IgY2FyIGluIF8uc2FtcGxlKGNhcnMsUy5zYW1wbGUpXG5cdFx0Y2FyLnJlc2V0KCkgZm9yIGNhciBpbiBjYXJzXG5cblx0ZG9uZTogLT5cblx0XHQoQHdhaXRpbmcubGVuZ3RoK0B0cmF2ZWxpbmcubGVuZ3RoKT09MFxuXG5cdHRpY2s6LT5cblx0XHRbZmxvdyxleGl0cyxlbnRyaWVzXSA9IFswLDAsMF1cblx0XHRTLmFkdmFuY2UoKVxuXHRcdGsgPSBAY2VsbHNcblx0XHRmb3IgY2FyIGluIEB3YWl0aW5nXG5cdFx0XHRpZiAoY2FyLnRfZW48PVMudGltZSlcblx0XHRcdFx0Y2VsbCA9IF8uc2FtcGxlIF8uZmlsdGVyKCBAY2VsbHMsKGMpLT5jLmlzX2ZyZWUoKSlcblx0XHRcdFx0aWYgY2VsbFxuXHRcdFx0XHRcdGNhci5lbnRlciBjZWxsLmxvY1xuXHRcdFx0XHRcdGNlbGwucmVjZWl2ZSBjYXJcblx0XHRcdFx0XHRAdHJhdmVsaW5nLnB1c2ggY2FyXG5cdFx0XHRcdFx0ZW50cmllcysrXG5cdFx0XHRcdFx0ZmxvdysrXG5cblx0XHRmb3IgY2VsbCxpIGluIGtcblx0XHRcdGlmIGNlbGwuY2FyXG5cdFx0XHRcdGlmIGNlbGwuY2FyLmRlc3RpbmF0aW9uPT1jZWxsLmxvY1xuXHRcdFx0XHRcdGNlbGwuY2FyLmV4aXQoKVxuXHRcdFx0XHRcdGNlbGwucmVtb3ZlKClcblx0XHRcdFx0XHRleGl0cysrXG5cdFx0XHRcdFx0ZmxvdysrXG5cdFx0XHRcdGVsc2UgaWYgY2VsbC5uZXh0LmlzX2ZyZWUoKVxuXHRcdFx0XHRcdGNlbGwubmV4dC5yZWNlaXZlIGNlbGwuY2FyXG5cdFx0XHRcdFx0Y2VsbC5yZW1vdmUoKVxuXHRcdFx0XHRcdGZsb3crK1xuXG5cdFx0Y2VsbC5maW5hbGl6ZSgpIGZvciBjZWxsIGluIEBjZWxsc1xuXG5cdFx0QHdhaXRpbmcgPSBfLmZpbHRlciBAd2FpdGluZywgKGMpLT4gIWMuZW50ZXJlZFxuXHRcdEB0cmF2ZWxpbmcgPSBfLmZpbHRlciBAdHJhdmVsaW5nLCAoYyktPiAhYy5leGl0ZWRcblx0XHRAbWVtb3J5LnJlbWVtYmVyIGZsb3csQHRyYXZlbGluZy5sZW5ndGhcblxubW9kdWxlLmV4cG9ydHMgPSBUcmFmZmljXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblxuY2xhc3MgU2V0dGluZ3Ncblx0Y29uc3RydWN0b3I6LT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0bnVtX2NhcnM6IDE1MDBcblx0XHRcdHRpbWU6IDBcblx0XHRcdHNwYWNlOiA0XG5cdFx0XHRwYWNlOiAxXG5cdFx0XHRkaXN0YW5jZTogOTBcblx0XHRcdHNhbXBsZTogMzBcblx0XHRcdGJldGE6IC41XG5cdFx0XHRnYW1tYTogMlxuXHRcdFx0b2Zmc2V0OiAwXG5cdFx0XHRydXNoX2xlbmd0aDogNjAwXG5cdFx0XHRudW1fY2VsbHM6IDEwMDBcblx0XHRcdHBoYXNlOiA1MFxuXHRcdFx0Z3JlZW46IC41XG5cdFx0XHR3aXNoOiA0MDBcblx0XHRcdG51bV9zaWduYWxzOiAyMFxuXHRcdFx0ZGF5OiAwXG5cdFx0XHRvZmZzZXQ6IC4zXG5cblx0XHRAY29sb3JzID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gXy5yYW5nZSAwLEBudW1fY2VsbHMsQG51bV9jZWxscy82XG5cdFx0XHQucmFuZ2UgW1xuXHRcdFx0XHQnI0Y0NDMzNicsICNyZWRcblx0XHRcdFx0JyMyMTk2RjMnLCAjYmx1ZVxuXHRcdFx0XHQnI0U5MUU2MycsICNwaW5rXG5cdFx0XHRcdCcjMDBCQ0Q0JywgI2N5YW5cblx0XHRcdFx0JyNGRkMxMDcnLCAjYW1iZXJcblx0XHRcdFx0JyM0Q0FGNTAnLCAjZ3JlZW5cblx0XHRcdFx0XVxuXHRcdEBzY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLEBudW1fY2VsbHNdXG5cdFx0XHQucmFuZ2UgWzAsMzYwXVxuXG5cdGFkdmFuY2U6IC0+XG5cdFx0QHRpbWUrK1xuXHRyZXNldF90aW1lOiAtPlxuXHRcdEBkYXkrK1xuXHRcdEB0aW1lID0gMFxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBTZXR0aW5ncygpIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblxuY2xhc3MgU29sdmVyXG5cdGNvbnN0cnVjdG9yOiAoQGN5Y2xlLEBkZWx0YSxAZCxAcmVkLEB2ZixAdyxAcTApLT5cblx0XHRAa2ogPSBAcTAqKC0xL0B3ICsgMS9AdmYpXG5cdFx0QHJlZF90aW1lID0gQHJlZCpAY3ljbGVcblxuXHRzb2x2ZTotPlxuXHRcdHJlcyA9IFtdXG5cdFx0W3gsZyxsXSA9IFswLDEwMDAsMF1cblx0XHR3aGlsZSBnPjBcblx0XHRcdHQgPSBAcmVkX3RpbWUgKyB4L0B2ZlxuXHRcdFx0ZyA9IEBncmVlbl9sZWZ0IHQsbFxuXHRcdFx0dGltZV9zdG9wcGVkID0gTWF0aC5tYXgoMCxnKVxuXHRcdFx0cmVzLnB1c2ggXG5cdFx0XHRcdHg6eFxuXHRcdFx0XHR0OiB0XG5cdFx0XHRcdGc6IGdcblx0XHRcdFx0bDogbFxuXHRcdFx0XHRjOiBAcTAqdGltZV9zdG9wcGVkXG5cdFx0XHR4Kz1AZFxuXHRcdFx0bCs9MVxuXHRcdFt4LGcsbF0gPSBbQGQvQC53LCAxMDAwLC0xXVxuXHRcdHdoaWxlIGc+MFxuXHRcdFx0dCA9IEByZWRfdGltZSArIHgvQHdcblx0XHRcdGcgPSBAZ3JlZW5fbGVmdCB0LGxcblx0XHRcdHJlcy5wdXNoXG5cdFx0XHRcdHg6eFxuXHRcdFx0XHR0OiB0XG5cdFx0XHRcdGc6IGdcblx0XHRcdFx0bDogbFxuXHRcdFx0XHRjOiBAa2oqdFxuXHRcdFx0eC09QGRcblx0XHRcdGwtPTFcblx0XHRyZXNcblxuXHRncmVlbl9sZWZ0OiAodCxsKS0+XG5cdFx0bGVmdG92ZXIgPSAodCtNYXRoLmFicyhsKSpAZGVsdGEpJUBjeWNsZVxuXHRcdGlmIGxlZnRvdmVyPChAcmVkX3RpbWUpXG5cdFx0XHRsZWZ0b3ZlciAtIEByZWRfdGltZVxuXHRcdGVsc2Vcblx0XHRcdEBjeWNsZS1sZWZ0b3ZlclxuXG5cdGZpbmRfbWluOiAoayktPlxuXHRcdHRhYmxlID0gQHNvbHZlKClcblx0XHRmbG93ID0gSW5maW5pdHlcblx0XHRyZXNcblx0XHRmb3IgZSBpbiB0YWJsZVxuXHRcdFx0Zmxvd19sID0gKGUuYyArIGsqZS54KS9lLnRcblx0XHRcdGlmIGZsb3dfbDxmbG93XG5cdFx0XHRcdGZsb3cgPSBmbG93X2xcblx0XHRcdFx0cmVzID0gZVxuXHRcdHJlcy5rID0ga1xuXHRcdHJldHVybiByZXNcblxuXHRmaW5kX21mZDotPlxuXHRcdChAZmluZF9taW4gayBmb3IgayBpbiBfLnJhbmdlIDAsQGtqLEBrai8xMClcblxucSA9IG5ldyBTb2x2ZXIgMTAsMSwzLC41LDMsLTEsM1xuY29uc29sZS5sb2cgcS5maW5kX21mZCgpXG4iXX0=
