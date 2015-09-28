(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Car, Ctrl, S, Traffic, _, angular, d3, visDer;

angular = require('angular');

d3 = require('d3');

_ = require('lodash');

S = require('./settings');

Traffic = require('./models/traffic');

Car = require('./models/car');

require('./solver');

Ctrl = (function() {
  function Ctrl(scope, el) {
    var j, ref, results;
    this.scope = scope;
    _.assign(this, {
      paused: true,
      traffic: new Traffic,
      pal: _.range(0, S.rl, S.rl / 25)
    });
    this.cars = (function() {
      results = [];
      for (var j = 0, ref = S.num_cars; 0 <= ref ? j < ref : j > ref; 0 <= ref ? j++ : j--){ results.push(j); }
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
    this.scope.$broadcast('dayend');
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
        var i, j;
        if (_this.traffic.done()) {
          _this.day_end(_this.cars);
          return true;
        }
        for (i = j = 0; j < 75; i = ++j) {
          _this.traffic.tick();
        }
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

angular.module('mainApp', [require('angular-material', require('angular-animate'))]).directive('visDer', visDer).directive('datum', require('./directives/datum')).directive('d3Der', require('./directives/d3Der')).directive('cumChart', require('./cumChart')).directive('mfdChart', require('./mfd')).directive('horAxis', require('./directives/xAxis')).directive('verAxis', require('./directives/yAxis')).directive('sliderDer', require('./directives/slider')).directive('shifter', require('./directives/shifter'));



},{"./cumChart":2,"./directives/d3Der":3,"./directives/datum":4,"./directives/shifter":5,"./directives/slider":6,"./directives/xAxis":7,"./directives/yAxis":8,"./mfd":9,"./models/car":10,"./models/traffic":13,"./settings":14,"./solver":15,"angular":undefined,"angular-animate":undefined,"angular-material":undefined,"d3":undefined,"lodash":undefined}],2:[function(require,module,exports){
var Ctrl, S, _, d3, der;

d3 = require('d3');

_ = require('lodash');

S = require('./settings');

Ctrl = (function() {
  function Ctrl(scope, el) {
    var sel;
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
    this.hor = d3.scale.linear().domain([0, S.rush_length + 180]).range([0, this.width]);
    this.ver = d3.scale.linear().domain([0, S.num_cars]).range([this.height, 0]);
    this.lineEn = d3.svg.line().x((function(_this) {
      return function(d) {
        return _this.hor(d.t);
      };
    })(this)).y((function(_this) {
      return function(d) {
        return _this.ver(d.EN);
      };
    })(this));
    this.lineEx = d3.svg.line().x((function(_this) {
      return function(d) {
        return _this.hor(d.t);
      };
    })(this)).y((function(_this) {
      return function(d) {
        return _this.ver(d.EX);
      };
    })(this));
    this.horAxis = d3.svg.axis().scale(this.hor).orient('bottom').ticks(8);
    this.verAxis = d3.svg.axis().scale(this.ver).orient('left');
    sel = d3.select(el[0]);
    this.scope.$on('dayend', (function(_this) {
      return function() {
        sel.select('path.en').attr('d', _this.lineEn(_this.data));
        return sel.select('path.ex').attr('d', _this.lineEx(_this.data));
      };
    })(this));
  }

  return Ctrl;

})();

der = function() {
  var directive;
  return directive = {
    bindToController: true,
    controllerAs: 'vm',
    scope: {
      data: '='
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
var d3, der;

d3 = require('d3');

der = function($parse) {
  var directive;
  return directive = {
    restrict: 'A',
    link: function(scope, el, attr) {
      var reshift, sel, tran, u;
      sel = d3.select(el[0]);
      u = 't-' + Math.random();
      tran = $parse(attr.tran)(scope);
      reshift = function(v) {
        if (tran) {
          sel.transition(u).attr('transform', "translate(" + v[0] + "," + v[1] + ")").call(tran);
        } else {
          sel.attr('transform', "translate(" + v[0] + "," + v[1] + ")");
        }
        return d3.select(el[0]);
      };
      return scope.$watch(function() {
        return $parse(attr.shifter)(scope);
      }, reshift, true);
    }
  };
};

module.exports = der;



},{"d3":undefined}],6:[function(require,module,exports){
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



},{}],7:[function(require,module,exports){
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



},{"d3":undefined}],8:[function(require,module,exports){
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



},{"d3":undefined}],9:[function(require,module,exports){
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
    return this.t_en = Math.max(0, this.target + _.random(-5, 5));
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
    this.sp = this.sd < 0 ? -this.sd * S.beta : this.sd * S.gamma;
    this.tt = this.t_ex - this.t_en;
    return this.cost = this.tt + this.sp;
  };

  Car.prototype.choose = function() {
    if (this.cost < this.cost0) {
      return this.target = this.t_en;
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
    this.been_free = Infinity;
    this.temp_car = this.car = false;
    this.id = _.uniqueId('cell');
    this.signal = void 0;
  }

  Cell.prototype.set_signal = function(signal) {
    this.signal = signal;
    this.signal.loc = this.loc;
    return this.signal.cell = this;
  };

  Cell.prototype.clear_signal = function() {
    return this.signal = void 0;
  };

  Cell.prototype.receive = function(car) {
    car.set_loc(this.loc);
    this.temp_car = car;
    this.been_free = 0;
    return car.cell = this;
  };

  Cell.prototype.reset = function() {
    this.been_free = Infinity;
    return this.temp_car = this.car = false;
  };

  Cell.prototype.remove = function() {
    this.been_free = 1;
    return this.temp_car = this.car = false;
  };

  Cell.prototype.finalize = function() {
    this.car = this.temp_car;
    if (!!this.car) {
      return this.been_free = 0;
    } else {
      return this.been_free++;
    }
  };

  Cell.prototype.is_free = function() {
    if (this.signal) {
      return this.signal.green && this.been_free > S.space;
    } else {
      return this.been_free > S.space;
    }
  };

  return Cell;

})();

module.exports = Cell;



},{"../settings":14,"lodash":undefined}],12:[function(require,module,exports){
var S, Signal, _;

S = require('../settings');

_ = require('lodash');

Signal = (function() {
  function Signal(i) {
    this.i = i;
    this.count = 0;
    this.green = true;
    this.id = _.uniqueId('signal-');
    this.reset();
  }

  Signal.prototype.reset = function() {
    var ref;
    this.offset = S.cycle * ((this.i * S.offset) % 1);
    return ref = [this.offset, true], this.count = ref[0], this.green = ref[1], ref;
  };

  Signal.prototype.tick = function() {
    var ref;
    this.count++;
    if (this.count > S.cycle) {
      ref = [0, true], this.count = ref[0], this.green = ref[1];
    }
    if (this.count >= (S.green * S.cycle)) {
      return this.green = false;
    }
  };

  return Signal;

})();

module.exports = Signal;



},{"../settings":14,"lodash":undefined}],13:[function(require,module,exports){
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
    return ref = [0, 0, 0, 0, 0], this.q = ref[0], this.k = ref[1], this.i = ref[2], this.en = ref[3], this.ex = ref[4], ref;
  };

  Memory.prototype.span = 30;

  Memory.prototype.day_start = function() {
    this.long_term = [];
    this.EN = 0;
    this.EX = 0;
    return this.reset();
  };

  Memory.prototype.remember = function(q, k, en, ex) {
    this.i++;
    this.q += q;
    this.k += k;
    this.en += en;
    this.ex += ex;
    this.EN += en;
    this.EX += ex;
    if (this.i >= this.span) {
      this.long_term.push({
        t: S.time,
        q: this.q / (this.span * S.num_cells),
        k: this.k / (this.span * S.num_cells),
        en: this.en / this.span,
        ex: this.ex / this.span,
        EN: this.EN,
        EX: this.EX,
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
    var car, cell, j, l, len, len1, ref, results;
    _.assign(this, {
      traveling: [],
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
    results = [];
    for (l = 0, len1 = cars.length; l < len1; l++) {
      car = cars[l];
      results.push(car.assign_error());
    }
    return results;
  };

  Traffic.prototype.choose_cell = function(cell) {
    if (!cell.car) {
      return cell;
    } else {
      return this.choose_cell(cell.next);
    }
  };

  Traffic.prototype.day_end = function(cars) {
    var car, j, l, len, len1, len2, m, ref, ref1, ref2, results;
    ref = this.cars;
    for (j = 0, len = ref.length; j < len; j++) {
      car = ref[j];
      car.eval_cost();
    }
    ref1 = _.sample(this.cars, S.sample);
    for (l = 0, len1 = ref1.length; l < len1; l++) {
      car = ref1[l];
      car.choose();
    }
    ref2 = this.cars;
    results = [];
    for (m = 0, len2 = ref2.length; m < len2; m++) {
      car = ref2[m];
      results.push(car.reset());
    }
    return results;
  };

  Traffic.prototype.done = function() {
    return (this.waiting.length + this.traveling.length) === 0;
  };

  Traffic.prototype.tick = function() {
    var C, car, cell, entries, exits, flow, i, j, l, len, len1, len2, len3, m, o, ref, ref1, ref2, ref3, ref4, signal;
    ref = [0, 0, 0], flow = ref[0], exits = ref[1], entries = ref[2];
    S.advance();
    C = this.cells;
    ref1 = this.signals;
    for (j = 0, len = ref1.length; j < len; j++) {
      signal = ref1[j];
      signal.tick();
    }
    ref2 = this.waiting;
    for (l = 0, len1 = ref2.length; l < len1; l++) {
      car = ref2[l];
      if (car.t_en <= S.time) {
        ({
          choose_cell: function(cell) {}
        });
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
    ref3 = this.cells;
    for (i = m = 0, len2 = ref3.length; m < len2; i = ++m) {
      cell = ref3[i];
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
    ref4 = this.cells;
    for (o = 0, len3 = ref4.length; o < len3; o++) {
      cell = ref4[o];
      cell.finalize();
    }
    this.waiting = _.filter(this.waiting, function(c) {
      return !c.entered;
    });
    this.traveling = _.filter(this.traveling, function(c) {
      return !c.exited;
    });
    return this.memory.remember(flow, this.traveling.length, entries, exits);
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
      num_cars: 500,
      time: 0,
      space: 4,
      pace: 1,
      distance: 90,
      sample: 200,
      beta: .5,
      gamma: 2,
      offset: 0,
      rush_length: 500,
      num_cells: 1000,
      cycle: 30,
      green: .5,
      wish: 400,
      num_signals: 60,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2FwcC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2N1bUNoYXJ0LmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9yaW5ncm9hZC9hcHAvZGlyZWN0aXZlcy9kM0Rlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2RpcmVjdGl2ZXMvZGF0dW0uY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3Jpbmdyb2FkL2FwcC9kaXJlY3RpdmVzL3NoaWZ0ZXIuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3Jpbmdyb2FkL2FwcC9kaXJlY3RpdmVzL3NsaWRlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2RpcmVjdGl2ZXMveEF4aXMuY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3Jpbmdyb2FkL2FwcC9kaXJlY3RpdmVzL3lBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9yaW5ncm9hZC9hcHAvbWZkLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9yaW5ncm9hZC9hcHAvbW9kZWxzL2Nhci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL21vZGVscy9jZWxsLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9yaW5ncm9hZC9hcHAvbW9kZWxzL3NpZ25hbC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL21vZGVscy90cmFmZmljLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9yaW5ncm9hZC9hcHAvc2V0dGluZ3MuY29mZmVlIiwiL1VzZXJzL2xld2lz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YXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblRyYWZmaWMgPSByZXF1aXJlICcuL21vZGVscy90cmFmZmljJ1xuQ2FyID0gcmVxdWlyZSAnLi9tb2RlbHMvY2FyJ1xucmVxdWlyZSAnLi9zb2x2ZXInXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsZWwpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0cGF1c2VkOiB0cnVlXG5cdFx0XHR0cmFmZmljOiBuZXcgVHJhZmZpY1xuXHRcdFx0cGFsOiBfLnJhbmdlIDAsUy5ybCxTLnJsLzI1XG5cdFx0QGNhcnMgPSBbMC4uLlMubnVtX2NhcnNdLm1hcCAtPiBuZXcgQ2FyKCBTLmRpc3RhbmNlICsgXy5yYW5kb20oIC04LDUpIClcblx0XHRAc2NvcGUuUyA9IFNcblx0XHRAdHJhZmZpYy5kYXlfc3RhcnQgQGNhcnNcblx0XHRAc2NvcGUuJHdhdGNoICdTLm51bV9zaWduYWxzJywobik9PlxuXHRcdFx0Uy5vZmZzZXQgPSBNYXRoLnJvdW5kKFMub2Zmc2V0Km4pL25cblx0XHRcdEB0cmFmZmljLmNoYW5nZV9zaWduYWxzIFMubnVtX3NpZ25hbHNcblxuXHRcdEBzY29wZS4kd2F0Y2ggJ1Mub2Zmc2V0Jywobik9PlxuXHRcdFx0Uy5vZmZzZXQgPSBNYXRoLnJvdW5kKFMub2Zmc2V0KlMubnVtX3NpZ25hbHMpL1MubnVtX3NpZ25hbHNcblx0XHRcdEB0cmFmZmljLmNoYW5nZV9vZmZzZXRzKClcblxuXHRyb3RhdG9yOiAoY2FyKS0+IFwicm90YXRlKCN7Uy5zY2FsZShjYXIubG9jKX0pIHRyYW5zbGF0ZSgwLDUwKVwiXG5cblx0ZGF5X3N0YXJ0OiAtPlxuXHRcdFMucmVzZXRfdGltZSgpXG5cdFx0QHRyYWZmaWMuZGF5X3N0YXJ0IEBjYXJzXG5cdFx0QHRpY2soKVxuXG5cdGRheV9lbmQ6IC0+XG5cdFx0QHRyYWZmaWMuZGF5X2VuZCBAY2Fyc1xuXHRcdEBzY29wZS4kYnJvYWRjYXN0ICdkYXllbmQnXG5cdFx0c2V0VGltZW91dCA9PiBAZGF5X3N0YXJ0IEBjYXJzXG5cblx0Y2xpY2s6ICh2YWwpIC0+IGlmICF2YWwgdGhlbiBAcGxheSgpXG5cdHBhdXNlOiAtPiBAcGF1c2VkID0gdHJ1ZVxuXHR0aWNrOiAtPlxuXHRcdGQzLnRpbWVyID0+XG5cdFx0XHRcdGlmIEB0cmFmZmljLmRvbmUoKVxuXHRcdFx0XHRcdEBkYXlfZW5kIEBjYXJzXG5cdFx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFx0QHRyYWZmaWMudGljaygpIGZvciBpIGluIFswLi4uNzVdXG5cblx0XHRcdFx0QHNjb3BlLiRldmFsQXN5bmMoKVxuXHRcdFx0XHRAcGF1c2VkXG5cblx0cGxheTogLT5cblx0XHRAcGF1c2UoKVxuXHRcdEBwYXVzZWQgPSBmYWxzZVxuXHRcdEB0aWNrKClcblxudmlzRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IHt9XG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvdmlzLmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG4jIGxlYXZlciA9IC0+XG4jIFx0YW5pbWF0ZSA9IFxuIyBcdFx0bGVhdmU6IChlbCktPlxuIyBcdFx0XHRkMy5zZWxlY3QgZWxbMF1cbiMgXHRcdFx0XHQuc2VsZWN0ICdyZWN0J1xuIyBcdFx0XHRcdC50cmFuc2l0aW9uKClcbiMgXHRcdFx0XHQuZHVyYXRpb24gNTBcbiMgXHRcdFx0XHQuZWFzZSAnY3ViaWMnXG4jIFx0XHRcdFx0LmF0dHIgJ3RyYW5zZm9ybScsJ3NjYWxlKDEuMiwxKSdcbiMgXHRcdFx0XHQuYXR0ciAnZmlsbCcsJyNlZWUnXG4jIFx0XHRcdFx0LnRyYW5zaXRpb24oKVxuIyBcdFx0XHRcdC5kdXJhdGlvbiAxNTBcbiMgXHRcdFx0XHQuZWFzZSAnY3ViaWMnXG4jIFx0XHRcdFx0LmF0dHIgJ3RyYW5zZm9ybScsJ3NjYWxlKDAsMSknXG4jIFx0XHRlbnRlcjogKGVsKS0+XG4jIFx0XHRcdGQzLnNlbGVjdCBlbFswXVxuIyBcdFx0XHRcdC5zZWxlY3QgJ3JlY3QnXG4jIFx0XHRcdFx0LmF0dHIgJ3RyYW5zZm9ybScsJ3NjYWxlKDAsLjUpJ1xuIyBcdFx0XHRcdC50cmFuc2l0aW9uKClcbiMgXHRcdFx0XHQuZHVyYXRpb24gNjBcbiMgXHRcdFx0XHQuZWFzZSAnY3ViaWMnXG4jIFx0XHRcdFx0LmF0dHIgJ3RyYW5zZm9ybScsJ3NjYWxlKDEuMiwxKSdcbiMgXHRcdFx0XHQudHJhbnNpdGlvbigpXG4jIFx0XHRcdFx0LmR1cmF0aW9uIDE1MFxuIyBcdFx0XHRcdC5lYXNlICdjdWJpYydcbiMgXHRcdFx0XHQuYXR0ciAndHJhbnNmb3JtJywnc2NhbGUoMSknXG5cbmFuZ3VsYXIubW9kdWxlICdtYWluQXBwJyAsIFtyZXF1aXJlICdhbmd1bGFyLW1hdGVyaWFsJyAsIHJlcXVpcmUgJ2FuZ3VsYXItYW5pbWF0ZSddXG5cdC5kaXJlY3RpdmUgJ3Zpc0RlcicsIHZpc0RlclxuXHQuZGlyZWN0aXZlICdkYXR1bScsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9kYXR1bSdcblx0LmRpcmVjdGl2ZSAnZDNEZXInLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvZDNEZXInXG5cdC5kaXJlY3RpdmUgJ2N1bUNoYXJ0JywgcmVxdWlyZSAnLi9jdW1DaGFydCdcblx0LmRpcmVjdGl2ZSAnbWZkQ2hhcnQnLCByZXF1aXJlICcuL21mZCdcblx0LmRpcmVjdGl2ZSAnaG9yQXhpcycsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy94QXhpcydcblx0LmRpcmVjdGl2ZSAndmVyQXhpcycsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy95QXhpcydcblx0IyAuYW5pbWF0aW9uICcuc2lnbmFsJywgc2lnbmFsQW5cblx0IyAuYW5pbWF0aW9uICcuZy1jYXInLCBsZWF2ZXJcblx0LmRpcmVjdGl2ZSAnc2xpZGVyRGVyJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL3NsaWRlcidcblx0LmRpcmVjdGl2ZSAnc2hpZnRlcicscmVxdWlyZSAnLi9kaXJlY3RpdmVzL3NoaWZ0ZXInXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5jbGFzcyBDdHJsXG5cdGNvbnN0cnVjdG9yOihAc2NvcGUsZWwpLT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0d2lkdGg6IDMwMFxuXHRcdFx0aGVpZ2h0OiAzMDBcblx0XHRcdG06IFxuXHRcdFx0XHR0OiAxMFxuXHRcdFx0XHRsOiA0MFxuXHRcdFx0XHRyOiAxNVxuXHRcdFx0XHRiOiAzNVxuXG5cdFx0QGhvciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHRcdC5kb21haW4gWzAsUy5ydXNoX2xlbmd0aCsxODBdXG5cdFx0XHRcdC5yYW5nZSBbMCxAd2lkdGhdXG5cblx0XHRAdmVyID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsIFMubnVtX2NhcnNdXG5cdFx0XHQjIC5kb21haW4gWzAsMl1cblx0XHRcdC5yYW5nZSBbQGhlaWdodCwgMF1cblxuXHRcdEBsaW5lRW4gPSBkMy5zdmcubGluZSgpXG5cdFx0XHQueCAoZCk9PkBob3IgZC50XG5cdFx0XHQueSAoZCk9PkB2ZXIgZC5FTlxuXG5cdFx0QGxpbmVFeCA9IGQzLnN2Zy5saW5lKClcblx0XHRcdC54IChkKT0+QGhvciBkLnRcblx0XHRcdC55IChkKT0+QHZlciBkLkVYXG5cblx0XHRAaG9yQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAaG9yXG5cdFx0XHQub3JpZW50ICdib3R0b20nXG5cdFx0XHQudGlja3MgOFxuXG5cdFx0QHZlckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQHZlclxuXHRcdFx0Lm9yaWVudCAnbGVmdCdcblxuXHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXG5cdFx0QHNjb3BlLiRvbiAnZGF5ZW5kJywgPT5cblx0XHRcdFx0c2VsLnNlbGVjdCAncGF0aC5lbidcblx0XHRcdFx0XHQuYXR0ciAnZCcsIEBsaW5lRW4gQGRhdGFcblx0XHRcdFx0c2VsLnNlbGVjdCAncGF0aC5leCdcblx0XHRcdFx0XHQuYXR0ciAnZCcsIEBsaW5lRXggQGRhdGFcblxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuXHRcdGNvbnRyb2xsZXJBczogJ3ZtJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGRhdGE6ICc9J1xuXHRcdHRlbXBsYXRlVXJsOiAnLi9kaXN0L2NoYXJ0Lmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5hbmd1bGFyID0gcmVxdWlyZSAnYW5ndWxhcidcblxuZGVyID0gKCRwYXJzZSktPiAjZ29lcyBvbiBhIHN2ZyBlbGVtZW50XG5cdGRpcmVjdGl2ZSA9IFxuXHRcdHJlc3RyaWN0OiAnQSdcblx0XHRzY29wZTogXG5cdFx0XHRkM0RlcjogJz0nXG5cdFx0XHR0cmFuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdHUgPSAndC0nICsgTWF0aC5yYW5kb20oKVxuXHRcdFx0aGFzVHJhbnNpdGlvbmVkID0gZmFsc2Vcblx0XHRcdHNjb3BlLiR3YXRjaCAnZDNEZXInXG5cdFx0XHRcdCwgKHYpLT5cblx0XHRcdFx0XHRpZiBzY29wZS50cmFuIGFuZCBoYXNUcmFuc2l0aW9uZWRcblx0XHRcdFx0XHRcdGhhc1RyYW5zaXRpb25lZCA9IHRydWVcblx0XHRcdFx0XHRcdHNlbC50cmFuc2l0aW9uIHVcblx0XHRcdFx0XHRcdFx0LmF0dHIgdlxuXHRcdFx0XHRcdFx0XHQuY2FsbCBzY29wZS50cmFuXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0aGFzVHJhbnNpdGlvbmVkID0gdHJ1ZVxuXHRcdFx0XHRcdFx0c2VsLmF0dHIgdlxuXHRcdFx0XHQsIHRydWVcbm1vZHVsZS5leHBvcnRzID0gZGVyIiwibW9kdWxlLmV4cG9ydHMgPSAoJHBhcnNlKS0+XG5cdChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRkMy5zZWxlY3QoZWxbMF0pLmRhdHVtICRwYXJzZShhdHRyLmRhdHVtKShzY29wZSkiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5kZXIgPSAoJHBhcnNlKS0+XG5cdGRpcmVjdGl2ZSA9XG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdGxpbms6IChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0dSA9ICd0LScgKyBNYXRoLnJhbmRvbSgpXG5cdFx0XHR0cmFuID0gJHBhcnNlKGF0dHIudHJhbikoc2NvcGUpXG5cdFx0XHRyZXNoaWZ0ID0gKHYpLT4gXG5cdFx0XHRcdGlmIHRyYW5cblx0XHRcdFx0XHRzZWwudHJhbnNpdGlvbiB1XG5cdFx0XHRcdFx0XHQuYXR0ciAndHJhbnNmb3JtJyAsIFwidHJhbnNsYXRlKCN7dlswXX0sI3t2WzFdfSlcIlxuXHRcdFx0XHRcdFx0LmNhbGwgdHJhblxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0c2VsLmF0dHIgJ3RyYW5zZm9ybScgLCBcInRyYW5zbGF0ZSgje3ZbMF19LCN7dlsxXX0pXCJcblxuXHRcdFx0XHRkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0XHRcblxuXHRcdFx0c2NvcGUuJHdhdGNoIC0+XG5cdFx0XHRcdFx0JHBhcnNlKGF0dHIuc2hpZnRlcikoc2NvcGUpXG5cdFx0XHRcdCwgcmVzaGlmdFxuXHRcdFx0XHQsIHRydWVcblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkZXIgPSAtPlxuXHRyZXMgPSBcblx0XHRzY29wZTogXG5cdFx0XHRsYWJlbDogJ0AnXG5cdFx0XHRteURhdGE6ICc9J1xuXHRcdFx0bWluOiAnPSdcblx0XHRcdG1heDogJz0nXG5cdFx0XHRzdGVwOiAnPSdcblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHRyZXBsYWNlOiB0cnVlXG5cdFx0Y29udHJvbGxlcjogLT5cblx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3Qvc2xpZGVyLmh0bWwnXG5cbm1vZHVsZS5leHBvcnRzID0gZGVyIiwiZDMgPSByZXF1aXJlICdkMydcblxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGZ1bjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2NhbGUgPSBzY29wZS5mdW4uc2NhbGUoKVxuXG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LmNsYXNzZWQgJ2hvciBheGlzJywgdHJ1ZVxuXG5cdFx0XHRzZWwuY2FsbCBzY29wZS5mdW5cblx0XHRcdFxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZnVuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzY2FsZSA9IHNjb3BlLmZ1bi5zY2FsZSgpXG5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuY2xhc3NlZCAndmVyIGF4aXMnLCB0cnVlXG5cblx0XHRcdHNlbC5jYWxsIHNjb3BlLmZ1blxuXHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNsYXNzIEN0cmxcblx0Y29uc3RydWN0b3I6KEBzY29wZSxlbCktPlxuXHRcdF8uYXNzaWduIHRoaXMsXG5cdFx0XHR3aWR0aDogMzAwXG5cdFx0XHRoZWlnaHQ6IDMwMFxuXHRcdFx0bTogXG5cdFx0XHRcdHQ6IDEwXG5cdFx0XHRcdGw6IDQwXG5cdFx0XHRcdHI6IDE4XG5cdFx0XHRcdGI6IDM1XG5cblx0XHRAaG9yID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdFx0LmRvbWFpbiBbMCwxXVxuXHRcdFx0XHQucmFuZ2UgWzAsQHdpZHRoXVxuXG5cdFx0QHZlciA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLCAuMjVdXG5cdFx0XHQucmFuZ2UgW0BoZWlnaHQsIDBdXG5cblx0XHRAbGluZSA9IGQzLnN2Zy5saW5lKClcblx0XHRcdC54IChkKT0+QGhvciBkLmtcblx0XHRcdC55IChkKT0+QHZlciBkLnFcblxuXHRcdEBob3JBeGlzID0gZDMuc3ZnLmF4aXMoKVxuXHRcdFx0LnNjYWxlIEBob3Jcblx0XHRcdC5vcmllbnQgJ2JvdHRvbSdcblx0XHRcdC50aWNrcyA4XG5cblx0XHRAdmVyQXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHRcdC5zY2FsZSBAdmVyXG5cdFx0XHQub3JpZW50ICdsZWZ0J1xuXG5cdGQ6IC0+IEBsaW5lIEBtZW1vcnlcblx0XG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0c2NvcGU6IFxuXHRcdFx0bWVtb3J5OiAnPSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC9tZmRDaGFydC5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJTID0gcmVxdWlyZSAnLi4vc2V0dGluZ3MnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuY2xhc3MgQ2FyXG5cdGNvbnN0cnVjdG9yOi0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdGlkOiBfLnVuaXF1ZUlkICdjYXItJ1xuXHRcdFx0Y29zdDA6IEluZmluaXR5IFxuXHRcdFx0dGFyZ2V0OiBfLnJhbmRvbSAyLFMucnVzaF9sZW5ndGhcblx0XHRcdGV4aXRlZDogZmFsc2Vcblx0XHRcdGVudGVyZWQ6IGZhbHNlXG5cdFx0XHRkaXN0YW5jZTogNjBcblxuXHRhc3NpZ25fZXJyb3I6LT4gXG5cdFx0QHRfZW4gPSBNYXRoLm1heCggMCwoQHRhcmdldCArIF8ucmFuZG9tIC01LDUpKVxuXG5cdHJlc2V0Oi0+XG5cdFx0W0Bjb3N0MCwgQGVudGVyZWQsIEBleGl0ZWRdID0gW0Bjb3N0LGZhbHNlLGZhbHNlXVxuXG5cdGV4aXQ6LT5cblx0XHRbQHRfZXgsIEBleGl0ZWRdID0gW1MudGltZSwgdHJ1ZV1cblxuXHRldmFsX2Nvc3Q6IC0+XG5cdFx0QHNkID0gQHRfZXgtUy53aXNoXG5cdFx0QHNwID0gaWYgQHNkPDAgdGhlbiAtQHNkKlMuYmV0YSBlbHNlIEBzZCpTLmdhbW1hXG5cdFx0QHR0ID0gQHRfZXgtQHRfZW5cblx0XHRAY29zdCA9ICBAdHQrQHNwIFxuXG5cdGNob29zZTogLT5cblx0XHRpZiBAY29zdDxAY29zdDBcblx0XHRcdEB0YXJnZXQgPSBAdF9lblxuXG5cdHNldF9sb2M6IChAbG9jKS0+XG5cblx0ZW50ZXI6KEBsb2MpLT5cblx0XHRAZW50ZXJlZCA9IHRydWVcblx0XHRAZGVzdGluYXRpb24gPSBNYXRoLmZsb29yIChAbG9jICsgQGRpc3RhbmNlKSVTLm51bV9jZWxsc1xuXHRcdEBjb2xvciA9IFMuY29sb3JzIF8ucmFuZG9tIFMubnVtX2NlbGxzXG5cbm1vZHVsZS5leHBvcnRzID0gQ2FyIiwiUyA9IHJlcXVpcmUgJy4uL3NldHRpbmdzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblxuY2xhc3MgQ2VsbFxuXHRjb25zdHJ1Y3RvcjogKEBsb2MpLT5cblx0XHRAYmVlbl9mcmVlID0gSW5maW5pdHlcblx0XHRAdGVtcF9jYXIgPSBAY2FyID0gZmFsc2Vcblx0XHRAaWQgPSBfLnVuaXF1ZUlkICdjZWxsJ1xuXHRcdEBzaWduYWwgPSB1bmRlZmluZWRcblxuXHRzZXRfc2lnbmFsOiAoQHNpZ25hbCktPlxuXHRcdEBzaWduYWwubG9jID0gQGxvY1xuXHRcdEBzaWduYWwuY2VsbCA9IHRoaXNcblxuXHRjbGVhcl9zaWduYWw6IC0+XG5cdFx0QHNpZ25hbCA9IHVuZGVmaW5lZFxuXG5cdHJlY2VpdmU6KGNhciktPlxuXHRcdGNhci5zZXRfbG9jIEBsb2Ncblx0XHRAdGVtcF9jYXIgPSBjYXJcblx0XHRAYmVlbl9mcmVlID0gMFxuXHRcdGNhci5jZWxsID0gdGhpc1xuXG5cdHJlc2V0OiAtPlxuXHRcdEBiZWVuX2ZyZWUgPSBJbmZpbml0eVxuXHRcdEB0ZW1wX2NhciA9IEBjYXIgPSBmYWxzZVxuXG5cdHJlbW92ZTogLT5cblx0XHRAYmVlbl9mcmVlID0gMVxuXHRcdEB0ZW1wX2NhciA9IEBjYXIgPSBmYWxzZVxuXG5cdGZpbmFsaXplOiAtPlxuXHRcdEBjYXIgPSBAdGVtcF9jYXJcblx0XHRpZiAhIUBjYXJcblx0XHRcdEBiZWVuX2ZyZWU9MFxuXHRcdGVsc2Vcblx0XHRcdEBiZWVuX2ZyZWUrK1xuXG5cdGlzX2ZyZWU6IC0+XG5cdFx0aWYgQHNpZ25hbFxuXHRcdFx0cmV0dXJuIEBzaWduYWwuZ3JlZW4gYW5kIEBiZWVuX2ZyZWU+Uy5zcGFjZVxuXHRcdGVsc2Vcblx0XHRcdEBiZWVuX2ZyZWU+Uy5zcGFjZVxuXG5tb2R1bGUuZXhwb3J0cyA9IENlbGwiLCJTID0gcmVxdWlyZSAnLi4vc2V0dGluZ3MnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuXG5jbGFzcyBTaWduYWxcblx0Y29uc3RydWN0b3I6IChAaSkgLT5cblx0XHRAY291bnQgPSAwXG5cdFx0QGdyZWVuID0gdHJ1ZVxuXHRcdEBpZCA9IF8udW5pcXVlSWQgJ3NpZ25hbC0nXG5cdFx0QHJlc2V0KClcblxuXHRyZXNldDogLT5cblx0XHRAb2Zmc2V0ID0gUy5jeWNsZSooKEBpKlMub2Zmc2V0KSUxKVxuXHRcdFtAY291bnQsIEBncmVlbl0gPSBbQG9mZnNldCwgdHJ1ZV1cblxuXHR0aWNrOiAtPlxuXHRcdEBjb3VudCsrXG5cdFx0aWYgQGNvdW50ID4gUy5jeWNsZVxuXHRcdFx0W0Bjb3VudCwgQGdyZWVuXSA9IFswLCB0cnVlXVxuXHRcdGlmIChAY291bnQpPj0oUy5ncmVlbipTLmN5Y2xlKVxuXHRcdFx0QGdyZWVuID0gZmFsc2VcblxubW9kdWxlLmV4cG9ydHMgPSBTaWduYWwiLCJTID0gcmVxdWlyZSAnLi4vc2V0dGluZ3MnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuQ2FyID0gcmVxdWlyZSAnLi9jYXInXG5TaWduYWwgPSByZXF1aXJlICcuL3NpZ25hbCdcbkNlbGwgPSByZXF1aXJlICcuL2NlbGwnXG5cbmNsYXNzIE1lbW9yeVxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAZGF5X3N0YXJ0KClcblxuXHRyZXNldDotPlxuXHRcdFtAcSxAayxAaSxAZW4sQGV4XSA9IFswLDAsMCwwLDBdXG5cblx0c3BhbjogMzBcblxuXHRkYXlfc3RhcnQ6IC0+XG5cdFx0QGxvbmdfdGVybSA9IFtdXG5cdFx0QEVOID0gMFxuXHRcdEBFWCA9IDBcblx0XHRAcmVzZXQoKVxuXG5cdHJlbWVtYmVyOihxLGssZW4sZXgpLT5cblx0XHRAaSsrXG5cdFx0QHErPXFcblx0XHRAays9a1xuXHRcdEBlbis9ZW5cblx0XHRAZXgrPWV4XG5cdFx0QEVOKz1lblxuXHRcdEBFWCs9ZXhcblx0XHRpZiBAaT49QHNwYW5cblx0XHRcdEBsb25nX3Rlcm0ucHVzaCBcblx0XHRcdFx0dDogUy50aW1lXG5cdFx0XHRcdHE6IEBxLyhAc3BhbipTLm51bV9jZWxscylcblx0XHRcdFx0azogQGsvKEBzcGFuKlMubnVtX2NlbGxzKVxuXHRcdFx0XHRlbjogQGVuL0BzcGFuXG5cdFx0XHRcdGV4OiBAZXgvQHNwYW5cblx0XHRcdFx0RU46IEBFTlxuXHRcdFx0XHRFWDogQEVYXG5cdFx0XHRcdGlkOiBfLnVuaXF1ZUlkICdtZW1vcnktJ1xuXHRcdFx0QHJlc2V0KClcblxuY2xhc3MgVHJhZmZpY1xuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRAY2VsbHMgPSAobmV3IENlbGwgbiBmb3IgbiBpbiBbMC4uLlMubnVtX2NlbGxzXSlcblx0XHRmb3IgY2VsbCxpIGluIEBjZWxsc1xuXHRcdFx0Y2VsbC5uZXh0ID0gQGNlbGxzWyhpKzEpJUBjZWxscy5sZW5ndGhdXG5cblx0XHRAbWVtb3J5ID0gbmV3IE1lbW9yeSgpXG5cblx0Y2hhbmdlX3NpZ25hbHM6IChuKS0+XG5cdFx0QHNpZ25hbHMgPSBbXVxuXHRcdGNlbGwuY2xlYXJfc2lnbmFsKCkgZm9yIGNlbGwgaW4gQGNlbGxzXG5cdFx0Zm9yIGkgaW4gWzAuLi5uXVxuXHRcdFx0c2lnbmFsID0gbmV3IFNpZ25hbCBpXG5cdFx0XHRAc2lnbmFscy5wdXNoIHNpZ25hbFxuXHRcdFx0cSA9IE1hdGguZmxvb3IoaS9uKlMubnVtX2NlbGxzKVxuXHRcdFx0QGNlbGxzW3FdLnNldF9zaWduYWwgc2lnbmFsXG5cblx0Y2hhbmdlX29mZnNldHM6IC0+XG5cdFx0cy5yZXNldCgpIGZvciBzIGluIEBzaWduYWxzXG5cblx0ZGF5X3N0YXJ0OihjYXJzKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHRyYXZlbGluZzogW11cblx0XHRcdHdhaXRpbmc6IF8uY2xvbmUgY2Fyc1xuXHRcdFx0Y2FyczogXy5jbG9uZSBjYXJzXG5cblx0XHRAbWVtb3J5LmRheV9zdGFydCgpXG5cblx0XHRmb3IgY2VsbCBpbiBAY2VsbHNcblx0XHRcdGNlbGwuY2FyID0gY2VsbC50ZW1wX2NhciA9IGZhbHNlXG5cdFx0XHRjZWxsLmxhc3QgPSAtSW5maW5pdHlcblxuXHRcdGNhci5hc3NpZ25fZXJyb3IoKSBmb3IgY2FyIGluIGNhcnNcblxuXHRjaG9vc2VfY2VsbDogKGNlbGwpLT5cblx0XHRpZiAhY2VsbC5jYXIgdGhlbiBjZWxsIGVsc2UgQGNob29zZV9jZWxsKGNlbGwubmV4dClcblxuXHRkYXlfZW5kOihjYXJzKS0+XG5cdFx0Y2FyLmV2YWxfY29zdCgpIGZvciBjYXIgaW4gQGNhcnNcblx0XHRjYXIuY2hvb3NlKCkgZm9yIGNhciBpbiBfLnNhbXBsZShAY2FycyxTLnNhbXBsZSlcblx0XHRjYXIucmVzZXQoKSBmb3IgY2FyIGluIEBjYXJzXG5cblx0ZG9uZTogLT5cblx0XHQoQHdhaXRpbmcubGVuZ3RoK0B0cmF2ZWxpbmcubGVuZ3RoKT09MFxuXG5cdHRpY2s6LT5cblx0XHRbZmxvdyxleGl0cyxlbnRyaWVzXSA9IFswLDAsMF1cblx0XHRTLmFkdmFuY2UoKVxuXHRcdEMgPSBAY2VsbHNcblxuXHRcdHNpZ25hbC50aWNrKCkgZm9yIHNpZ25hbCBpbiBAc2lnbmFsc1xuXG5cdFx0Zm9yIGNhciBpbiBAd2FpdGluZ1xuXHRcdFx0aWYgKGNhci50X2VuPD1TLnRpbWUpXG5cdFx0XHRcdGNob29zZV9jZWxsOiAoY2VsbCktPlxuXHRcdFx0XHQjIGlmICFjZWxsLmNhciB0aGVuIGNlbGwgZWxzZSBAY2hvb3NlX2NlbGwoY2VsbC5uZXh0KVxuXHRcdFx0XHRjZWxsID0gXy5zYW1wbGUgXy5maWx0ZXIoIEBjZWxscywoYyktPmMuaXNfZnJlZSgpKVxuXHRcdFx0XHRpZiBjZWxsXG5cdFx0XHRcdFx0Y2FyLmVudGVyIGNlbGwubG9jXG5cdFx0XHRcdFx0Y2VsbC5yZWNlaXZlIGNhclxuXHRcdFx0XHRcdEB0cmF2ZWxpbmcucHVzaCBjYXJcblx0XHRcdFx0XHRlbnRyaWVzKytcblx0XHRcdFx0XHRmbG93KytcblxuXHRcdGZvciBjZWxsLGkgaW4gQGNlbGxzXG5cdFx0XHRpZiBjZWxsLmNhclxuXHRcdFx0XHRpZiBjZWxsLmNhci5kZXN0aW5hdGlvbj09Y2VsbC5sb2Ncblx0XHRcdFx0XHRjZWxsLmNhci5leGl0KClcblx0XHRcdFx0XHRjZWxsLnJlbW92ZSgpXG5cdFx0XHRcdFx0ZXhpdHMrK1xuXHRcdFx0XHRcdGZsb3crK1xuXHRcdFx0XHRlbHNlIGlmIGNlbGwubmV4dC5pc19mcmVlKClcblx0XHRcdFx0XHRjZWxsLm5leHQucmVjZWl2ZSBjZWxsLmNhclxuXHRcdFx0XHRcdGNlbGwucmVtb3ZlKClcblx0XHRcdFx0XHRmbG93KytcblxuXHRcdGNlbGwuZmluYWxpemUoKSBmb3IgY2VsbCBpbiBAY2VsbHNcblxuXHRcdEB3YWl0aW5nID0gXy5maWx0ZXIgQHdhaXRpbmcsIChjKS0+ICFjLmVudGVyZWRcblx0XHRAdHJhdmVsaW5nID0gXy5maWx0ZXIgQHRyYXZlbGluZywgKGMpLT4gIWMuZXhpdGVkXG5cdFx0QG1lbW9yeS5yZW1lbWJlciBmbG93LEB0cmF2ZWxpbmcubGVuZ3RoLGVudHJpZXMsZXhpdHNcblxubW9kdWxlLmV4cG9ydHMgPSBUcmFmZmljXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblxuY2xhc3MgU2V0dGluZ3Ncblx0Y29uc3RydWN0b3I6LT5cblx0XHRfLmFzc2lnbiB0aGlzLFxuXHRcdFx0bnVtX2NhcnM6IDUwMFxuXHRcdFx0dGltZTogMFxuXHRcdFx0c3BhY2U6IDRcblx0XHRcdHBhY2U6IDFcblx0XHRcdGRpc3RhbmNlOiA5MFxuXHRcdFx0c2FtcGxlOiAyMDBcblx0XHRcdGJldGE6IC41XG5cdFx0XHRnYW1tYTogMlxuXHRcdFx0b2Zmc2V0OiAwXG5cdFx0XHRydXNoX2xlbmd0aDogNTAwXG5cdFx0XHRudW1fY2VsbHM6IDEwMDBcblx0XHRcdGN5Y2xlOiAzMFxuXHRcdFx0Z3JlZW46IC41XG5cdFx0XHR3aXNoOiA0MDBcblx0XHRcdG51bV9zaWduYWxzOiA2MFxuXHRcdFx0ZGF5OiAwXG5cdFx0XHRvZmZzZXQ6IC4zXG5cblx0XHRAY29sb3JzID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gXy5yYW5nZSAwLEBudW1fY2VsbHMsQG51bV9jZWxscy82XG5cdFx0XHQucmFuZ2UgW1xuXHRcdFx0XHQnI0Y0NDMzNicsICNyZWRcblx0XHRcdFx0JyMyMTk2RjMnLCAjYmx1ZVxuXHRcdFx0XHQnI0U5MUU2MycsICNwaW5rXG5cdFx0XHRcdCcjMDBCQ0Q0JywgI2N5YW5cblx0XHRcdFx0JyNGRkMxMDcnLCAjYW1iZXJcblx0XHRcdFx0JyM0Q0FGNTAnLCAjZ3JlZW5cblx0XHRcdFx0XVxuXHRcdEBzY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0XHQuZG9tYWluIFswLEBudW1fY2VsbHNdXG5cdFx0XHQucmFuZ2UgWzAsMzYwXVxuXG5cdGFkdmFuY2U6IC0+XG5cdFx0QHRpbWUrK1xuXHRyZXNldF90aW1lOiAtPlxuXHRcdEBkYXkrK1xuXHRcdEB0aW1lID0gMFxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBTZXR0aW5ncygpIiwiXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblxuY2xhc3MgU29sdmVyXG5cdGNvbnN0cnVjdG9yOiAoQGN5Y2xlLEBkZWx0YSxAZCxAcmVkLEB2ZixAdyxAcTApLT5cblx0XHRAa2ogPSBAcTAqKC0xL0B3ICsgMS9AdmYpXG5cdFx0QHJlZF90aW1lID0gQHJlZCpAY3ljbGVcblxuXHRzb2x2ZTotPlxuXHRcdHJlcyA9IFtdXG5cdFx0W3gsZyxsXSA9IFswLDEwMDAsMF1cblx0XHR3aGlsZSBnPjBcblx0XHRcdHQgPSBAcmVkX3RpbWUgKyB4L0B2ZlxuXHRcdFx0ZyA9IEBncmVlbl9sZWZ0IHQsbFxuXHRcdFx0dGltZV9zdG9wcGVkID0gTWF0aC5tYXgoMCxnKVxuXHRcdFx0cmVzLnB1c2ggXG5cdFx0XHRcdHg6eFxuXHRcdFx0XHR0OiB0XG5cdFx0XHRcdGc6IGdcblx0XHRcdFx0bDogbFxuXHRcdFx0XHRjOiBAcTAqdGltZV9zdG9wcGVkXG5cdFx0XHR4Kz1AZFxuXHRcdFx0bCs9MVxuXHRcdFt4LGcsbF0gPSBbQGQvQC53LCAxMDAwLC0xXVxuXHRcdHdoaWxlIGc+MFxuXHRcdFx0dCA9IEByZWRfdGltZSArIHgvQHdcblx0XHRcdGcgPSBAZ3JlZW5fbGVmdCB0LGxcblx0XHRcdHJlcy5wdXNoXG5cdFx0XHRcdHg6eFxuXHRcdFx0XHR0OiB0XG5cdFx0XHRcdGc6IGdcblx0XHRcdFx0bDogbFxuXHRcdFx0XHRjOiBAa2oqdFxuXHRcdFx0eC09QGRcblx0XHRcdGwtPTFcblx0XHRyZXNcblxuXHRncmVlbl9sZWZ0OiAodCxsKS0+XG5cdFx0bGVmdG92ZXIgPSAodCtNYXRoLmFicyhsKSpAZGVsdGEpJUBjeWNsZVxuXHRcdGlmIGxlZnRvdmVyPChAcmVkX3RpbWUpXG5cdFx0XHRsZWZ0b3ZlciAtIEByZWRfdGltZVxuXHRcdGVsc2Vcblx0XHRcdEBjeWNsZS1sZWZ0b3ZlclxuXG5cdGZpbmRfbWluOiAoayktPlxuXHRcdHRhYmxlID0gQHNvbHZlKClcblx0XHRmbG93ID0gSW5maW5pdHlcblx0XHRyZXNcblx0XHRmb3IgZSBpbiB0YWJsZVxuXHRcdFx0Zmxvd19sID0gKGUuYyArIGsqZS54KS9lLnRcblx0XHRcdGlmIGZsb3dfbDxmbG93XG5cdFx0XHRcdGZsb3cgPSBmbG93X2xcblx0XHRcdFx0cmVzID0gZVxuXHRcdHJlcy5rID0ga1xuXHRcdHJldHVybiByZXNcblxuXHRmaW5kX21mZDotPlxuXHRcdChAZmluZF9taW4gayBmb3IgayBpbiBfLnJhbmdlIDAsQGtqLEBrai8xMClcblxucSA9IG5ldyBTb2x2ZXIgMTAsMSwzLC41LDMsLTEsM1xuY29uc29sZS5sb2cgcS5maW5kX21mZCgpXG4iXX0=
