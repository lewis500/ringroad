(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Car, Ctrl, S, Traffic, _, angular, d3, ref, visDer;

angular = require('angular');

d3 = require('d3');

_ = require('lodash');

S = require('./settings');

ref = require('./models'), Car = ref.Car, Traffic = ref.Traffic;

Ctrl = (function() {
  function Ctrl(scope, el) {
    this.scope = scope;
    _.assign(this, {
      paused: true,
      colors: S.colors,
      traffic: new Traffic,
      pal: _.range(0, 360, 20),
      cars: _.range(S.num_cars).map(function(n) {
        return new Car(S.distance + _.random(-8, 5));
      })
    });
    this.day_start();
  }

  Ctrl.prototype.rotator = function(car) {
    return "rotate(" + car.loc + ")";
  };

  Ctrl.prototype.tran = function(tran) {
    return tran.transition().duration(S.pace);
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
      })(this), S.pace * 1000);
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

angular.module('mainApp', [require('angular-material')]).directive('visDer', visDer).directive('datum', require('./directives/datum')).directive('d3Der', require('./directives/d3Der')).directive('cumChart', require('./cumChart')).directive('horAxis', require('./directives/xAxis')).directive('verAxis', require('./directives/yAxis'));



},{"./cumChart":2,"./directives/d3Der":3,"./directives/datum":4,"./directives/xAxis":5,"./directives/yAxis":6,"./models":7,"./settings":8,"angular":undefined,"angular-material":undefined,"d3":undefined,"lodash":undefined}],2:[function(require,module,exports){
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
        l: 30,
        r: 10,
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
    this.horAxis = d3.svg.axis().scale(this.hor).orient('bottom');
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



},{"./settings":8,"d3":undefined,"lodash":undefined}],3:[function(require,module,exports){
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



},{"d3":undefined}],6:[function(require,module,exports){
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



},{"d3":undefined}],7:[function(require,module,exports){
var Car, S, Traffic, _;

S = require('./settings');

_ = require('lodash');

Traffic = (function() {
  function Traffic() {}

  Traffic.prototype.reset = function(waiting) {
    var ref;
    return ref = [[], [], 0, 0, _.clone(waiting)], this.traveling = ref[0], this.cum = ref[1], this.cumEn = ref[2], this.cumEx = ref[3], this.waiting = ref[4], ref;
  };

  Traffic.prototype.done = function() {
    return (this.waiting.length + this.traveling.length) === 0;
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
    _.remove(this.waiting, car);
    this.cumEn++;
    loc = _.random(0, 359);
    g0 = 0;
    _.forEach(this.traveling, function(c) {
      var g;
      g = c.get_gap();
      if (_.gte(g, S.space) && _.gt(g, g0)) {
        loc = (c.loc + g / 2) % 360;
        return g0 = g;
      }
    });
    loc = (loc + _.random(-1, 1)) % 360;
    car.enter(loc);
    this.traveling.push(car);
    return this.order_cars();
  };

  Traffic.prototype.remove = function(car) {
    this.cumEx++;
    return _.remove(this.traveling, car);
  };

  Traffic.prototype.update = function() {
    this.waiting.forEach((function(_this) {
      return function(car) {
        if (_.lt(car.t_en, S.time)) {
          return _this.receive(car);
        }
      };
    })(this));
    this.traveling.forEach((function(_this) {
      return function(car) {
        car.move();
        if (car.exited) {
          return _this.remove(car);
        }
      };
    })(this));
    this.log();
    return this.order_cars();
  };

  Traffic.prototype.order_cars = function() {
    var l;
    if ((l = this.traveling.length) > 1) {
      this.traveling.sort(function(a, b) {
        return a.loc - b.loc;
      });
      return this.traveling.forEach(function(car, i, k) {
        return car.set_next(k[(i + 1) % l]);
      });
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
      target: _.random(4, S.rush_length - S.distance - 10),
      exited: false
    });
  }

  Car.prototype.assign_error = function() {
    return this.t_en = Math.max(0, this.target + _.random(-2, 2));
  };

  Car.prototype.set_next = function(next) {
    this.next = next;
  };

  Car.prototype.set_destination = function(destination) {
    this.destination = destination;
  };

  Car.prototype.get_gap = function() {
    var gap;
    if (!this.next) {
      return 180;
    }
    gap = this.next.loc - this.loc;
    if (_.lte(gap, 0)) {
      return _.add(gap, 360);
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
    this.set_destination((this.loc + this.distance) % 360);
    return ref = [this.cost, false, 0, S.colors(this.destination)], this.cost0 = ref[0], this.exited = ref[1], this.stopped = ref[2], this.color = ref[3], ref;
  };

  Car.prototype.move = function() {
    if (this.stopped > 0) {
      return this.stopped--;
    } else {
      if (_.gte(this.get_gap(), S.space)) {
        if ((this.loc = _.add(this.loc, 1) % 360) === this.destination) {
          return this.exit();
        }
      } else {
        return this.stopped = S.stopping_time;
      }
    }
  };

  return Car;

})();

module.exports = {
  Car: Car,
  Traffic: Traffic
};



},{"./settings":8,"lodash":undefined}],8:[function(require,module,exports){
var S, colors, d3;

d3 = require('d3');

colors = d3.scale.linear().domain([0, 60, 120, 180, 240]).range(['#F44336', '#E91E63', '#2196F3', '#00BCD4', '#4CAF50']);

S = {
  num_cars: 60,
  time: 0,
  space: 5,
  pace: .025,
  stopping_time: 6,
  distance: 28,
  beta: .5,
  gamma: 2,
  rush_length: 100,
  wish: 50,
  day: 0,
  advance: function() {
    return this.time++;
  },
  reset_time: function() {
    return this.time = 0;
  },
  colors: colors
};

module.exports = S;



},{"d3":undefined}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2FwcC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2N1bUNoYXJ0LmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9yaW5ncm9hZC9hcHAvZGlyZWN0aXZlcy9kM0Rlci5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2RpcmVjdGl2ZXMvZGF0dW0uY29mZmVlIiwiL1VzZXJzL2xld2lzL1Jlc2VhcmNoL3Jpbmdyb2FkL2FwcC9kaXJlY3RpdmVzL3hBeGlzLmNvZmZlZSIsIi9Vc2Vycy9sZXdpcy9SZXNlYXJjaC9yaW5ncm9hZC9hcHAvZGlyZWN0aXZlcy95QXhpcy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL21vZGVscy5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL3NldHRpbmdzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUE7O0FBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7QUFDTCxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0FBQ0osQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSOztBQUNKLE1BQWdCLE9BQUEsQ0FBUSxVQUFSLENBQWhCLEVBQUMsVUFBQSxHQUFELEVBQUssY0FBQTs7QUFFQztFQUNPLGNBQUMsS0FBRCxFQUFRLEVBQVI7SUFBQyxJQUFDLENBQUEsUUFBRDtJQUNaLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxFQUNDO01BQUEsTUFBQSxFQUFRLElBQVI7TUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFDLE1BRFY7TUFFQSxP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T0EsS0FBQSxFQUFPLENBUFA7RUFRQSxXQUFBLEVBQWEsR0FSYjtFQVNBLElBQUEsRUFBTSxFQVROO0VBVUEsR0FBQSxFQUFLLENBVkw7RUFXQSxPQUFBLEVBQVMsU0FBQTtXQUNSLElBQUMsQ0FBQSxJQUFEO0VBRFEsQ0FYVDtFQWFBLFVBQUEsRUFBWSxTQUFBO1dBQ1gsSUFBQyxDQUFBLElBQUQsR0FBUTtFQURHLENBYlo7RUFlQSxNQUFBLEVBQVEsTUFmUjs7O0FBaUJELE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImFuZ3VsYXIgPSByZXF1aXJlICdhbmd1bGFyJ1xuZDMgPSByZXF1aXJlICdkMydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5TID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcbntDYXIsVHJhZmZpY30gPSByZXF1aXJlICcuL21vZGVscydcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLGVsKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHBhdXNlZDogdHJ1ZVxuXHRcdFx0Y29sb3JzOiBTLmNvbG9yc1xuXHRcdFx0dHJhZmZpYzogbmV3IFRyYWZmaWNcblx0XHRcdHBhbDogXy5yYW5nZSAwLDM2MCwyMFxuXHRcdFx0Y2FyczogXy5yYW5nZSBTLm51bV9jYXJzXG5cdFx0XHRcdFx0Lm1hcCAobiktPiBcdG5ldyBDYXIoIFMuZGlzdGFuY2UgKyBfLnJhbmRvbSAtOCw1KVxuXHRcdEBkYXlfc3RhcnQoKVxuXG5cdHJvdGF0b3I6IChjYXIpLT4gXCJyb3RhdGUoI3tjYXIubG9jfSlcIlxuXHR0cmFuOiAodHJhbiktPiB0cmFuLnRyYW5zaXRpb24oKS5kdXJhdGlvbiBTLnBhY2VcblxuXHRkYXlfc3RhcnQ6IC0+XG5cdFx0Uy5yZXNldF90aW1lKClcblx0XHRAcGh5c2ljcyA9IHRydWUgI3BoeXNpY3Mgc3RhZ2UgaGFwcGVuaW5nXG5cdFx0QHRyYWZmaWMucmVzZXQgQGNhcnNcblx0XHRfLmludm9rZSBAY2FycywgJ2Fzc2lnbl9lcnJvcidcblx0XHRAdGljaygpXG5cblx0ZGF5X2VuZDogLT5cblx0XHRAcGh5c2ljcyA9IGZhbHNlICNwaHlzaWNzIHN0YWdlIG5vdCBoYXBwZW5pbmdcblx0XHRfLmludm9rZSBAY2FycywgJ2V2YWxfY29zdCdcblx0XHRfLnNhbXBsZSBAY2FycywgMjVcblx0XHRcdC5mb3JFYWNoIChkKS0+IGQuY2hvb3NlKClcblxuXHRcdHNldFRpbWVvdXQgPT4gQGRheV9zdGFydCgpXG5cblx0Y2xpY2s6KHZhbCkgLT4gaWYgIXZhbCB0aGVuIEBwbGF5KClcblx0cGF1c2U6IC0+IEBwYXVzZWQgPSB0cnVlXG5cdHRpY2s6IC0+XG5cdFx0aWYgQHBoeXNpY3Ncblx0XHRcdGQzLnRpbWVyID0+XG5cdFx0XHRcdFx0aWYgQHRyYWZmaWMuZG9uZSgpXG5cdFx0XHRcdFx0XHRAZGF5X2VuZCgpXG5cdFx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdFx0Uy5hZHZhbmNlKClcblx0XHRcdFx0XHRAdHJhZmZpYy51cGRhdGUoKVxuXHRcdFx0XHRcdEBzY29wZS4kZXZhbEFzeW5jKClcblx0XHRcdFx0XHRpZiAhQHBhdXNlZCB0aGVuIEB0aWNrKClcblx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdCwgUy5wYWNlKjEwMDBcblxuXHRwbGF5OiAtPlxuXHRcdEBwYXVzZSgpXG5cdFx0ZDMudGltZXIuZmx1c2goKVxuXHRcdEBwYXVzZWQgPSBmYWxzZVxuXHRcdEB0aWNrKClcblxudmlzRGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0c2NvcGU6IHt9XG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0dGVtcGxhdGVVcmw6ICcuL2Rpc3QvdmlzLmh0bWwnXG5cdFx0Y29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCBDdHJsXVxuXG5hbmd1bGFyLm1vZHVsZSAnbWFpbkFwcCcgLCBbcmVxdWlyZSAnYW5ndWxhci1tYXRlcmlhbCddXG5cdC5kaXJlY3RpdmUgJ3Zpc0RlcicsIHZpc0RlclxuXHQuZGlyZWN0aXZlICdkYXR1bScsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy9kYXR1bSdcblx0LmRpcmVjdGl2ZSAnZDNEZXInLCByZXF1aXJlICcuL2RpcmVjdGl2ZXMvZDNEZXInXG5cdC5kaXJlY3RpdmUgJ2N1bUNoYXJ0JywgcmVxdWlyZSAnLi9jdW1DaGFydCdcblx0LmRpcmVjdGl2ZSAnaG9yQXhpcycsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy94QXhpcydcblx0LmRpcmVjdGl2ZSAndmVyQXhpcycsIHJlcXVpcmUgJy4vZGlyZWN0aXZlcy95QXhpcydcbiIsImQzID0gcmVxdWlyZSAnZDMnXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuUyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLGVsKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdHdpZHRoOiAzMDBcblx0XHRcdGhlaWdodDogMzAwXG5cdFx0XHRtOiBcblx0XHRcdFx0dDogMTBcblx0XHRcdFx0bDogMzBcblx0XHRcdFx0cjogMTBcblx0XHRcdFx0YjogMzVcblxuXHRcdEBob3IgPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdFx0XHQuZG9tYWluIFswLFMucnVzaF9sZW5ndGhdXG5cdFx0XHRcdC5yYW5nZSBbMCxAd2lkdGhdXG5cblx0XHRAdmVyID0gZDMuc2NhbGUubGluZWFyKClcblx0XHRcdC5kb21haW4gWzAsIFMubnVtX2NhcnNdXG5cdFx0XHQucmFuZ2UgW0BoZWlnaHQsIDBdXG5cblx0XHRAbGluZUVuID0gZDMuc3ZnLmxpbmUoKVxuXHRcdFx0LnggKGQpPT5AaG9yIGQudGltZVxuXHRcdFx0LnkgKGQpPT5AdmVyIGQuY3VtRW5cblxuXHRcdEBsaW5lRXggPSBkMy5zdmcubGluZSgpXG5cdFx0XHQueCAoZCk9PkBob3IgZC50aW1lXG5cdFx0XHQueSAoZCk9PkB2ZXIgZC5jdW1FeFxuXG5cdFx0QGhvckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQGhvclxuXHRcdFx0Lm9yaWVudCAnYm90dG9tJ1xuXG5cdFx0QHZlckF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0XHQuc2NhbGUgQHZlclxuXHRcdFx0Lm9yaWVudCAnbGVmdCdcblxuXG5cdGV4OiAtPlxuXHRcdEBsaW5lRXggQGN1bVxuXHRlbjogLT5cblx0XHRAbGluZUVuIEBjdW1cblx0XG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0Y29udHJvbGxlckFzOiAndm0nXG5cdFx0c2NvcGU6IFxuXHRcdFx0Y3VtOiAnPSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC9jaGFydC5odG1sJ1xuXHRcdGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgQ3RybF1cblxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuYW5ndWxhciA9IHJlcXVpcmUgJ2FuZ3VsYXInXG5cbmRlciA9ICgkcGFyc2UpLT4gI2dvZXMgb24gYSBzdmcgZWxlbWVudFxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZDNEZXI6ICc9J1xuXHRcdFx0dHJhbjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2VsID0gZDMuc2VsZWN0IGVsWzBdXG5cdFx0XHR1ID0gJ3QtJyArIE1hdGgucmFuZG9tKClcblx0XHRcdGhhc1RyYW5zaXRpb25lZCA9IGZhbHNlXG5cdFx0XHRzY29wZS4kd2F0Y2ggJ2QzRGVyJ1xuXHRcdFx0XHQsICh2KS0+XG5cdFx0XHRcdFx0aWYgc2NvcGUudHJhbiBhbmQgaGFzVHJhbnNpdGlvbmVkXG5cdFx0XHRcdFx0XHRoYXNUcmFuc2l0aW9uZWQgPSB0cnVlXG5cdFx0XHRcdFx0XHRzZWwudHJhbnNpdGlvbiB1XG5cdFx0XHRcdFx0XHRcdC5hdHRyIHZcblx0XHRcdFx0XHRcdFx0LmNhbGwgc2NvcGUudHJhblxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGhhc1RyYW5zaXRpb25lZCA9IHRydWVcblx0XHRcdFx0XHRcdHNlbC5hdHRyIHZcblx0XHRcdFx0LCB0cnVlXG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsIm1vZHVsZS5leHBvcnRzID0gKCRwYXJzZSktPlxuXHQoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0ZDMuc2VsZWN0KGVsWzBdKS5kYXR1bSAkcGFyc2UoYXR0ci5kYXR1bSkoc2NvcGUpIiwiZDMgPSByZXF1aXJlICdkMydcblxuZGVyID0gLT5cblx0ZGlyZWN0aXZlID0gXG5cdFx0cmVzdHJpY3Q6ICdBJ1xuXHRcdHNjb3BlOiBcblx0XHRcdGZ1bjogJz0nXG5cdFx0bGluazogKHNjb3BlLCBlbCwgYXR0ciktPlxuXHRcdFx0c2NhbGUgPSBzY29wZS5mdW4uc2NhbGUoKVxuXG5cdFx0XHRzZWwgPSBkMy5zZWxlY3QgZWxbMF1cblx0XHRcdFx0LmNsYXNzZWQgJ2hvciBheGlzJywgdHJ1ZVxuXG5cdFx0XHRzZWwuY2FsbCBzY29wZS5mdW5cblx0XHRcdFxubW9kdWxlLmV4cG9ydHMgPSBkZXIiLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuXG5kZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRyZXN0cmljdDogJ0EnXG5cdFx0c2NvcGU6IFxuXHRcdFx0ZnVuOiAnPSdcblx0XHRsaW5rOiAoc2NvcGUsIGVsLCBhdHRyKS0+XG5cdFx0XHRzY2FsZSA9IHNjb3BlLmZ1bi5zY2FsZSgpXG5cblx0XHRcdHNlbCA9IGQzLnNlbGVjdCBlbFswXVxuXHRcdFx0XHQuY2xhc3NlZCAndmVyIGF4aXMnLCB0cnVlXG5cblx0XHRcdHNlbC5jYWxsIHNjb3BlLmZ1blxuXHRcdFx0XG5tb2R1bGUuZXhwb3J0cyA9IGRlciIsIlMgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblxuY2xhc3MgVHJhZmZpY1xuXHRjb25zdHJ1Y3RvcjogLT5cblxuXHRyZXNldDood2FpdGluZyktPlxuXHRcdFtAdHJhdmVsaW5nLCBAY3VtLCBAY3VtRW4sIEBjdW1FeCxAd2FpdGluZ10gPSBbW10sW10sIDAsIDAsIF8uY2xvbmUod2FpdGluZyldXG5cblx0ZG9uZTogLT5cblx0XHQoQHdhaXRpbmcubGVuZ3RoK0B0cmF2ZWxpbmcubGVuZ3RoKT09MFxuXG5cdGxvZzogLT5cblx0XHRAY3VtLnB1c2hcblx0XHRcdHRpbWU6IFMudGltZVxuXHRcdFx0Y3VtRW46IEBjdW1FblxuXHRcdFx0Y3VtRXg6IEBjdW1FeFxuXG5cdHJlY2VpdmU6IChjYXIpLT5cblx0XHRfLnJlbW92ZSBAd2FpdGluZywgY2FyXG5cdFx0QGN1bUVuKytcblx0XHRsb2MgPSBfLnJhbmRvbSAwLDM1OVxuXHRcdGcwID0gMFxuXHRcdF8uZm9yRWFjaCBAdHJhdmVsaW5nLCAoYyktPlxuXHRcdFx0ZyA9IGMuZ2V0X2dhcCgpXG5cdFx0XHRpZiBfLmd0ZShnLCBTLnNwYWNlKSBhbmQgXy5ndChnLGcwKVxuXHRcdFx0XHRsb2MgPSAoYy5sb2MgKyBnLzIpJTM2MFxuXHRcdFx0XHRnMCA9IGdcblx0XHRsb2MgPSAobG9jICsgXy5yYW5kb20gLTEsMSkgJTM2MFxuXHRcdGNhci5lbnRlciBsb2Ncblx0XHRAdHJhdmVsaW5nLnB1c2ggY2FyXG5cdFx0QG9yZGVyX2NhcnMoKVxuXG5cdHJlbW92ZTogKGNhciktPlxuXHRcdEBjdW1FeCsrXG5cdFx0Xy5yZW1vdmUgQHRyYXZlbGluZywgY2FyXG5cblx0dXBkYXRlOiAtPlxuXHRcdEB3YWl0aW5nLmZvckVhY2ggKGNhcik9PlxuXHRcdFx0aWYgXy5sdCBjYXIudF9lbixTLnRpbWUgdGhlbiBAcmVjZWl2ZSBjYXJcblx0XHRAdHJhdmVsaW5nLmZvckVhY2ggKGNhcik9PlxuXHRcdFx0Y2FyLm1vdmUoKVxuXHRcdFx0aWYgY2FyLmV4aXRlZCB0aGVuIEByZW1vdmUgY2FyXG5cblx0XHRAbG9nKClcblxuXHRcdEBvcmRlcl9jYXJzKClcblxuXHRvcmRlcl9jYXJzOiAtPlxuXHRcdGlmIChsID0gQHRyYXZlbGluZy5sZW5ndGgpID4gMVxuXHRcdFx0QHRyYXZlbGluZy5zb3J0IChhLGIpLT4gYS5sb2MgLSBiLmxvY1xuXHRcdFx0QHRyYXZlbGluZy5mb3JFYWNoIChjYXIsaSxrKS0+XG5cdFx0XHRcdGNhci5zZXRfbmV4dCBrWyhpKzEpJWxdXG5cbmNsYXNzIENhclxuXHRjb25zdHJ1Y3RvcjooQGRpc3RhbmNlKS0+XG5cdFx0Xy5hc3NpZ24gdGhpcyxcblx0XHRcdGlkOiBfLnVuaXF1ZUlkKClcblx0XHRcdGNvc3QwOiBJbmZpbml0eSBcblx0XHRcdHRhcmdldDogXy5yYW5kb20gNCwoUy5ydXNoX2xlbmd0aCAtIFMuZGlzdGFuY2UgLSAxMClcblx0XHRcdGV4aXRlZDogZmFsc2VcblxuXHRhc3NpZ25fZXJyb3I6LT4gXG5cdFx0QHRfZW4gPSBNYXRoLm1heCAwLChAdGFyZ2V0ICsgXy5yYW5kb20gLTIsMilcblxuXHQjIHNldHRlcnNcblx0c2V0X25leHQ6IChAbmV4dCktPlxuXHRzZXRfZGVzdGluYXRpb246IChAZGVzdGluYXRpb24pLT5cblxuXHRnZXRfZ2FwOi0+XG5cdFx0aWYgIUBuZXh0IHRoZW4gcmV0dXJuIDE4MFxuXHRcdGdhcCA9IEBuZXh0LmxvYyAtIEBsb2Ncblx0XHRpZiBfLmx0ZSBnYXAsMCB0aGVuIF8uYWRkIGdhcCwzNjAgZWxzZSBnYXBcblxuXHRleGl0OiAtPlxuXHRcdFtAbmV4dCwgQHRfZXgsIEBleGl0ZWRdID0gW3VuZGVmaW5lZCwgUy50aW1lLCB0cnVlXVxuXG5cdGV2YWxfY29zdDogLT5cblx0XHRAc2QgPSBAdF9leCAtIFMud2lzaFxuXHRcdEBzcCA9IE1hdGgubWF4KCAtUy5iZXRhICogQHNkLCBTLmdhbW1hICogQHNkKVxuXHRcdEB0dCA9IEB0X2V4IC0gQHRfZW5cblx0XHRAY29zdCA9ICBAdHQrQHNwIFxuXG5cdGNob29zZTogLT5cblx0XHRpZiBfLmx0ZSBAY29zdCxAY29zdDAgdGhlbiBbQGNvc3QwLEB0YXJnZXRdID0gW0Bjb3N0LCBAdF9lbl1cblxuXHRlbnRlcjooQGxvYyktPlxuXHRcdEBzZXRfZGVzdGluYXRpb24gKEBsb2MgKyBAZGlzdGFuY2UpJTM2MFxuXHRcdFtAY29zdDAsIEBleGl0ZWQsIEBzdG9wcGVkLCBAY29sb3JdID0gW0Bjb3N0LGZhbHNlLDAsIFMuY29sb3JzKEBkZXN0aW5hdGlvbildXG5cblx0bW92ZTogLT5cblx0XHRpZiBAc3RvcHBlZCA+IDAgdGhlbiBAc3RvcHBlZC0tXG5cdFx0ZWxzZVxuXHRcdFx0aWYgXy5ndGUgQGdldF9nYXAoKSxTLnNwYWNlXG5cdFx0XHRcdGlmIChAbG9jID0gXy5hZGQoQGxvYywxKSUzNjApID09IEBkZXN0aW5hdGlvbiB0aGVuIEBleGl0KClcblx0XHRcdGVsc2Vcblx0XHRcdFx0QHN0b3BwZWQgPSBTLnN0b3BwaW5nX3RpbWVcblxubW9kdWxlLmV4cG9ydHMgPSBcblx0Q2FyOiBDYXJcblx0VHJhZmZpYzogVHJhZmZpY1xuIiwiZDMgPSByZXF1aXJlICdkMydcbmNvbG9ycyA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0LmRvbWFpbiBbMCwgNjAsIDEyMCwgMTgwLCAyNDBdXG5cdFx0LnJhbmdlIFtcblx0XHRcdCcjRjQ0MzM2JywgI3JlZFxuXHRcdFx0JyNFOTFFNjMnLCAjcGlua1xuXHRcdFx0JyMyMTk2RjMnLCAjYmx1ZVxuXHRcdFx0JyMwMEJDRDQnLCAjY3lhblxuXHRcdFx0JyM0Q0FGNTAnLCAjZ3JlZW5cblx0XHRcdF1cblxuUyA9IFxuXHRudW1fY2FyczogNjBcblx0dGltZTogMFxuXHRzcGFjZTogNVxuXHRwYWNlOiAuMDI1XG5cdHN0b3BwaW5nX3RpbWU6IDZcblx0ZGlzdGFuY2U6IDI4XG5cdGJldGE6IC41XG5cdGdhbW1hOiAyXG5cdHJ1c2hfbGVuZ3RoOiAxMDBcblx0d2lzaDogNTBcblx0ZGF5OiAwXG5cdGFkdmFuY2U6IC0+XG5cdFx0QHRpbWUrK1xuXHRyZXNldF90aW1lOiAtPlxuXHRcdEB0aW1lID0gMFxuXHRjb2xvcnM6IGNvbG9yc1xuXG5tb2R1bGUuZXhwb3J0cyA9IFMiXX0=
