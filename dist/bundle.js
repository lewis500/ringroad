(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Car, Ctrl, S, Traffic, _, angular, d3, visDer;

angular = require('angular');

d3 = require('d3');

_ = require('lodash');

S = {
  num_cars: 50,
  time: 0,
  space: 10,
  vel: 20
};

Traffic = (function() {
  function Traffic() {
    this.reset();
  }

  Traffic.prototype.reset = function() {
    return this.list = [];
  };

  Traffic.prototype.enter_car = function(car) {
    var loc;
    loc = _.random(0, 360, true);
    car.enter(loc);
    this.list.push(car);
    return this.order_cars();
  };

  Traffic.prototype.exit_car = function(car) {
    var i;
    i = this.list.indexOf(car);
    return this.list.splice(i, 1);
  };

  Traffic.prototype.update = function(dt) {
    this.list.forEach((function(_this) {
      return function(car) {
        car.move(dt);
        if (car.exited) {
          return _this.exit_car(car);
        }
      };
    })(this));
    return this.order_cars();
  };

  Traffic.prototype.order_cars = function() {
    this.list.sort(function(a, b) {
      return a.loc - b.loc;
    });
    if (this.list.length > 1) {
      return this.list.forEach(function(car, i, k) {
        car.set_next(k[(i + 1) % k.length]);
        return car.set_prev(k[(i === 0 ? k.length - 1 : i - 1)]);
      });
    }
  };

  return Traffic;

})();

Car = (function() {
  function Car(distance) {
    this.distance = distance;
    this.id = _.uniqueId();
    this.time_entry = _.random(1, 30, true);
    this.exited = false;
    this.next = {
      loc: 361
    };
  }

  Car.prototype.set_next = function(next) {
    this.next = next;
  };

  Car.prototype.set_prev = function(prev) {
    this.prev = prev;
  };

  Car.prototype.exit = function() {
    console.log('exiting');
    this.time_exit = S.time;
    return this.exited = true;
  };

  Car.prototype.enter = function(loc1) {
    this.loc = loc1;
    this.time_queue = this.time_exit - this.time_enter;
    return this.destination = (this.loc + this.distance) % 360;
  };

  Car.prototype.get_gap = function(loc) {
    var gap;
    gap = loc - this.loc;
    if (gap < 0) {
      return gap + 360;
    } else {
      return gap;
    }
  };

  Car.prototype.move = function(dt) {
    if (this.get_gap(this.next.loc) >= S.space) {
      this.loc += (S.vel * dt / 1000) % 360;
      if (this.get_gap(this.destination) <= 0) {
        return this.exit();
      }
    }
  };

  return Car;

})();

Ctrl = (function() {
  function Ctrl(scope, el) {
    this.scope = scope;
    this.paused = true;
    this.cars = _.range(0, S.num_cars).map(function(n) {
      return new Car(50);
    });
    this.to_enter = this.cars.slice(0);
    this.traffic = new Traffic;
  }

  Ctrl.prototype.click = function() {
    if (this.paused) {
      return this.play();
    } else {
      return this.pause();
    }
  };

  Ctrl.prototype.pause = function() {
    return this.paused = true;
  };

  Ctrl.prototype.play = function() {
    var last;
    this.pause();
    d3.timer.flush();
    this.paused = false;
    last = 0;
    return d3.timer((function(_this) {
      return function(elapsed) {
        var dt;
        dt = elapsed - last;
        S.time += dt / 1000;
        _this.to_enter.forEach(function(car) {
          if (car.time_entry < S.time) {
            _this.to_enter.splice(_this.to_enter.indexOf(car), 1);
            return _this.traffic.enter_car(car);
          }
        });
        _this.traffic.update(dt);
        _this.scope.$evalAsync();
        last = elapsed;
        return _this.paused;
      };
    })(this));
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

angular.module('mainApp', [require('angular-material')]).directive('visDer', visDer).directive('datum', require('./directives/datum'));



},{"./directives/datum":2,"angular":undefined,"angular-material":undefined,"d3":undefined,"lodash":undefined}],2:[function(require,module,exports){
module.exports = function($parse) {
  return function(scope, el, attr) {
    return d3.select(el[0]).datum($parse(attr.datum)(scope));
  };
};



},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2FwcC5jb2ZmZWUiLCIvVXNlcnMvbGV3aXMvUmVzZWFyY2gvcmluZ3JvYWQvYXBwL2RpcmVjdGl2ZXMvZGF0dW0uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQTs7QUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0FBQ1YsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztBQUNMLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7QUFFSixDQUFBLEdBQ0M7RUFBQSxRQUFBLEVBQVUsRUFBVjtFQUNBLElBQUEsRUFBTSxDQUROO0VBRUEsS0FBQSxFQUFPLEVBRlA7RUFHQSxHQUFBLEVBQUssRUFITDs7O0FBTUs7RUFDUSxpQkFBQTtJQUNaLElBQUMsQ0FBQSxLQUFELENBQUE7RUFEWTs7b0JBR2IsS0FBQSxHQUFNLFNBQUE7V0FDTCxJQUFDLENBQUEsSUFBRCxHQUFRO0VBREg7O29CQUdOLFNBQUEsR0FBVyxTQUFDLEdBQUQ7QUFZVixRQUFBO0lBQUEsR0FBQSxHQUFPLENBQUMsQ0FBQyxNQUFGLENBQVMsQ0FBVCxFQUFZLEdBQVosRUFBaUIsSUFBakI7SUFDUCxHQUFHLENBQUMsS0FBSixDQUFVLEdBQVY7SUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxHQUFYO1dBQ0EsSUFBQyxDQUFBLFVBQUQsQ0FBQTtFQWZVOztvQkFpQlgsUUFBQSxHQUFTLFNBQUMsR0FBRDtBQUNSLFFBQUE7SUFBQSxDQUFBLEdBQUksSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFOLENBQWMsR0FBZDtXQUNKLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFhLENBQWIsRUFBaUIsQ0FBakI7RUFGUTs7b0JBSVQsTUFBQSxHQUFRLFNBQUMsRUFBRDtJQUNQ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QyxDQUFBLE9BQU8sQ0FBQyxTQUFULENBQW1CLEdBQW5CLEVBRkQ7O1FBRGlCLENBQWxCO1FBSUEsS0FBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLEVBQWhCO1FBQ0EsS0FBQyxDQUFBLEtBQUssQ0FBQyxVQUFQLENBQUE7UUFDQSxJQUFBLEdBQU87ZUFDUCxLQUFDLENBQUE7TUFWTztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVDtFQUxLOzs7Ozs7QUFrQlAsTUFBQSxHQUFTLFNBQUE7QUFDUixNQUFBO1NBQUEsU0FBQSxHQUNDO0lBQUEsS0FBQSxFQUFPLEVBQVA7SUFDQSxZQUFBLEVBQWMsSUFEZDtJQUVBLFdBQUEsRUFBYSxpQkFGYjtJQUdBLFVBQUEsRUFBWSxDQUFDLFFBQUQsRUFBVyxVQUFYLEVBQXVCLElBQXZCLENBSFo7O0FBRk87O0FBT1QsT0FBTyxDQUFDLE1BQVIsQ0FBZSxTQUFmLEVBQTJCLENBQUMsT0FBQSxDQUFRLGtCQUFSLENBQUQsQ0FBM0IsQ0FDQyxDQUFDLFNBREYsQ0FDWSxRQURaLEVBQ3NCLE1BRHRCLENBRUMsQ0FBQyxTQUZGLENBRVksT0FGWixFQUVxQixPQUFBLENBQVEsb0JBQVIsQ0FGckI7Ozs7O0FDekhBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsTUFBRDtTQUNoQixTQUFDLEtBQUQsRUFBUSxFQUFSLEVBQVksSUFBWjtXQUNDLEVBQUUsQ0FBQyxNQUFILENBQVUsRUFBRyxDQUFBLENBQUEsQ0FBYixDQUFnQixDQUFDLEtBQWpCLENBQXVCLE1BQUEsQ0FBTyxJQUFJLENBQUMsS0FBWixDQUFBLENBQW1CLEtBQW5CLENBQXZCO0VBREQ7QUFEZ0IiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiYW5ndWxhciA9IHJlcXVpcmUgJ2FuZ3VsYXInXG5kMyA9IHJlcXVpcmUgJ2QzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcblxuUyA9IFxuXHRudW1fY2FyczogNTBcblx0dGltZTogMFxuXHRzcGFjZTogMTBcblx0dmVsOiAyMFxuXG5cbmNsYXNzIFRyYWZmaWNcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QHJlc2V0KClcblxuXHRyZXNldDotPlxuXHRcdEBsaXN0ID0gW11cblxuXHRlbnRlcl9jYXI6IChjYXIpLT5cblx0XHQjIGlmIEBsaXN0Lmxlbmd0aCA+IDFcblx0XHQjIFx0Z2FwcyA9IFtdXG5cdFx0IyBcdEBsaXN0LmZvckVhY2ggKGNhciktPlxuXHRcdCMgXHRcdGcgPSBjYXIuZ2V0X2dhcCBjYXIubmV4dC5sb2Ncblx0XHQjIFx0XHQjIGlmIGcgPjIqUy5zcGFjZVxuXHRcdCMgXHRcdGdhcHMucHVzaCBcblx0XHQjIFx0XHRcdGdhcDogZ1xuXHRcdCMgXHRcdFx0bG9jOiBjYXIubG9jXG5cdFx0IyBcdHdoaWNoID0gXy5zYW1wbGUgZ2Fwc1xuXHRcdCMgXHRsb2MgPSB3aGljaC5sb2MgKyB3aGljaC5nYXAqLjVcblx0XHQjIGVsc2UgXG5cdFx0bG9jICA9IF8ucmFuZG9tIDAsIDM2MCwgdHJ1ZVxuXHRcdGNhci5lbnRlciBsb2Ncblx0XHRAbGlzdC5wdXNoIGNhclxuXHRcdEBvcmRlcl9jYXJzKClcblxuXHRleGl0X2NhcjooY2FyKSAtPlxuXHRcdGkgPSBAbGlzdC5pbmRleE9mIGNhclxuXHRcdEBsaXN0LnNwbGljZSBpICwgMVxuXG5cdHVwZGF0ZTogKGR0KS0+XG5cdFx0QGxpc3QuZm9yRWFjaCAoY2FyKT0+XG5cdFx0XHRjYXIubW92ZSBkdFxuXHRcdFx0aWYgY2FyLmV4aXRlZCB0aGVuIEBleGl0X2NhciBjYXJcblx0XHRAb3JkZXJfY2FycygpXG5cblx0b3JkZXJfY2FyczogLT5cblx0XHRAbGlzdFxuXHRcdFx0LnNvcnQgKGEsYiktPlxuXHRcdFx0XHRcdGEubG9jIC0gYi5sb2Ncblx0XHRpZiBAbGlzdC5sZW5ndGggPiAxXG5cdFx0XHRAbGlzdC5mb3JFYWNoIChjYXIsaSxrKS0+XG5cdFx0XHRcdGNhci5zZXRfbmV4dCBrWyhpKzEpJWsubGVuZ3RoXVxuXHRcdFx0XHRjYXIuc2V0X3ByZXYga1soaWYgKGk9PTApIHRoZW4gKGsubGVuZ3RoLTEpIGVsc2UgKGktMSkpXVxuXG5jbGFzcyBDYXJcblx0Y29uc3RydWN0b3I6KEBkaXN0YW5jZSktPlxuXHRcdEBpZCA9IF8udW5pcXVlSWQoKVxuXHRcdEB0aW1lX2VudHJ5ID0gXy5yYW5kb20gMSwgMzAsIHRydWVcblx0XHRAZXhpdGVkID0gZmFsc2Vcblx0XHRAbmV4dCA9IFxuXHRcdFx0bG9jOiAzNjFcblxuXHQjIHNldHRlcnNcblx0c2V0X25leHQ6IChAbmV4dCktPlxuXHRzZXRfcHJldjogKEBwcmV2KS0+XG5cdGV4aXQ6IC0+XG5cdFx0Y29uc29sZS5sb2cgJ2V4aXRpbmcnXG5cdFx0QHRpbWVfZXhpdCA9IFMudGltZVxuXHRcdEBleGl0ZWQgPSB0cnVlXG5cblx0ZW50ZXI6KEBsb2MpLT5cblx0XHRAdGltZV9xdWV1ZSA9IEB0aW1lX2V4aXQgLSBAdGltZV9lbnRlclxuXHRcdEBkZXN0aW5hdGlvbiA9KCBAbG9jICsgQGRpc3RhbmNlICklMzYwXG5cblx0Z2V0X2dhcDoobG9jKS0+XG5cdFx0Z2FwID0gbG9jIC0gQGxvY1xuXHRcdGlmIGdhcCA8IDAgdGhlbiAoZ2FwICsgMzYwKSBlbHNlIGdhcFxuXG5cdG1vdmU6IChkdCktPlxuXHRcdGlmIEBnZXRfZ2FwKEBuZXh0LmxvYykgPj0gUy5zcGFjZVxuXHRcdFx0QGxvYys9KFMudmVsKmR0LzEwMDApJTM2MFxuXHRcdFx0aWYgQGdldF9nYXAoIEBkZXN0aW5hdGlvbikgPD0gMCB0aGVuIEBleGl0KClcblxuY2xhc3MgQ3RybFxuXHRjb25zdHJ1Y3RvcjooQHNjb3BlLGVsKS0+XG5cdFx0QHBhdXNlZCA9IHRydWVcblx0XHRAY2FycyA9IF8ucmFuZ2UgMCwgUy5udW1fY2Fyc1xuXHRcdFx0Lm1hcCAobiktPlxuXHRcdFx0XHRuZXcgQ2FyIDUwXG5cblx0XHRAdG9fZW50ZXIgPSBAY2Fycy5zbGljZSAwXG5cblx0XHRAdHJhZmZpYyA9IG5ldyBUcmFmZmljXG5cblx0Y2xpY2s6IC0+IGlmIEBwYXVzZWQgdGhlbiBAcGxheSgpIGVsc2UgQHBhdXNlKClcblx0cGF1c2U6LT4gQHBhdXNlZCA9IHRydWVcblx0cGxheTogLT5cblx0XHRAcGF1c2UoKVxuXHRcdGQzLnRpbWVyLmZsdXNoKClcblx0XHRAcGF1c2VkID0gZmFsc2Vcblx0XHRsYXN0ID0gMFxuXHRcdGQzLnRpbWVyIChlbGFwc2VkKT0+XG5cdFx0XHRkdCA9IGVsYXBzZWQgLSBsYXN0XG5cdFx0XHRTLnRpbWUrPSBkdC8xMDAwXG5cdFx0XHRAdG9fZW50ZXIuZm9yRWFjaCAoY2FyKT0+XG5cdFx0XHRcdGlmIGNhci50aW1lX2VudHJ5IDwgUy50aW1lXG5cdFx0XHRcdFx0QHRvX2VudGVyLnNwbGljZSBAdG9fZW50ZXIuaW5kZXhPZihjYXIpLDFcblx0XHRcdFx0XHRAdHJhZmZpYy5lbnRlcl9jYXIgY2FyXG5cdFx0XHRAdHJhZmZpYy51cGRhdGUgZHRcblx0XHRcdEBzY29wZS4kZXZhbEFzeW5jKClcblx0XHRcdGxhc3QgPSBlbGFwc2VkXG5cdFx0XHRAcGF1c2VkXG5cdCMgbWFrZSBhIGV2YWxhc3luYyB0aGF0IG9ubHkgZmlyZXMgZXZlcnkgdGhpcmQgdGltZVxuXG52aXNEZXIgPSAtPlxuXHRkaXJlY3RpdmUgPSBcblx0XHRzY29wZToge31cblx0XHRjb250cm9sbGVyQXM6ICd2bSdcblx0XHR0ZW1wbGF0ZVVybDogJy4vZGlzdC92aXMuaHRtbCdcblx0XHRjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsIEN0cmxdXG5cbmFuZ3VsYXIubW9kdWxlICdtYWluQXBwJyAsIFtyZXF1aXJlICdhbmd1bGFyLW1hdGVyaWFsJ11cblx0LmRpcmVjdGl2ZSAndmlzRGVyJywgdmlzRGVyXG5cdC5kaXJlY3RpdmUgJ2RhdHVtJywgcmVxdWlyZSAnLi9kaXJlY3RpdmVzL2RhdHVtJ1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoJHBhcnNlKS0+XG5cdChzY29wZSwgZWwsIGF0dHIpLT5cblx0XHRkMy5zZWxlY3QoZWxbMF0pLmRhdHVtICRwYXJzZShhdHRyLmRhdHVtKShzY29wZSkiXX0=
