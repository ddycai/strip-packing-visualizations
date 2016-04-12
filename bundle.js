/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var packer = __webpack_require__(1);
	var painter = __webpack_require__(3);

	var purples = painter.tintGradient("#722364", .05, 20);
	var rainbow = painter.makeColorGradient(.3, .3, .3, 0, 2, 4, 200, 55);
	var config = {
	  rectBorder: '#ffffff',
	  rectMaxHeight: 200,
	  configBorder: '#FFBC42',
	  configLineWidth: 2,
	  colours: purples
	};

	/**
	 * Draws the packing given the string. Caches the result of solving the linear
	 * program in the following declared variables.
	 */
	var rects, result, stage;

	function customRand() {
	  return (Math.random() + Math.random() + Math.random()) / 3;
	}

	function toggleColours() {
	  config.colours = config.colours == purples ? rainbow : purples;
	  resetPacking();
	}

	function randomInput(n, randFunction) {
	  var s = "";
	  for (var i = 0; i < n; i++) {
	    var w = Math.round(randFunction() * 100) / 100;
	    var h = Math.round(randFunction() * 100) / 100;
	    s += h + " " + w + "\n";
	  }
	  return s;
	}

	// VERY IMPORTANT: stores the state of the packing
	var packingState;

	function nextFitDecreasingHeight(s, noSort) {
	  try {
	    rects = packer.parseRectangles(s);
	  } catch (e) {
	    alert(e);
	    return;
	  }
	  packingState = new packer.NFDH(rects, noSort);
	  continuePackingSequence();
	}

	function firstFitDecreasingHeight(s, noSort) {
	  try {
	    rects = packer.parseRectangles(s);
	  } catch (e) {
	    alert(e);
	    return;
	  }
	  packingState = new packer.FFDH(rects, noSort);
	  continuePackingSequence();
	}

	function bestFitDecreasingHeight(s, noSort) {
	  try {
	    rects = packer.parseRectangles(s);
	  } catch (e) {
	    alert(e);
	    return;
	  }
	  packingState = new packer.BFDH(rects, noSort);
	  continuePackingSequence();
	}

	function resetPacking() {
	  var choice = $("#algorithm :selected").val();
	  var s = $('#input').val();
	  var noSort = false;
	  console.log(noSort);
	  switch (choice) {
	    case "0":
	      firstFitDecreasingHeight(s, noSort);
	      break;
	    case "1":
	      nextFitDecreasingHeight(s, noSort);
	      break;
	    case "2":
	      bestFitDecreasingHeight(s, noSort);
	      break;
	    case "3":
	      splitFit(s);
	      break;
	  }
	}

	function splitFit(s) {
	  try {
	    rects = packer.parseRectangles(s);
	  } catch (e) {
	    alert(e);
	    return;
	  }
	  packingState = new packer.SplitFit(rects);
	  continuePackingSequence();
	}

	/**
	 * Go to the next stage in the packing sequence.
	 */
	function continuePackingSequence() {
	  var canvas = document.getElementById("packing");
	  if (packingState.nextIteration()) {
	    painter.drawPacking(packingState.state, canvas, 0, config);
	    $('#message').text(packingState.message);
	    packingState.flushMessage();
	    return true;
	  }
	  return false;
	}

	function randomSolution() {
	  if ($("#uniform-random").prop('checked')) {
	    console.log("using math.random");
	    var fn = Math.random;
	  } else {
	    var fn = customRand;
	  }
	  var randomCount = $("#random-count").val();
	  console.log(randomCount);
	  var defSolution = randomInput(randomCount, fn);
	  $('#input').val(defSolution);
	  resetPacking();
	}

	$(function () {
	  randomSolution();
	  // If you click the solve button
	  $('#solve-button').click(resetPacking);

	  $('#reset-button').click(resetPacking);

	  // Continue packing button...
	  $('#continue-button').click(function () {
	    continuePackingSequence();
	  });

	  $('#random-button').click(function () {
	    randomSolution();
	  });

	  $('#finish-button').click(function () {
	    while (continuePackingSequence()) {}
	  });

	  // Changing the select button
	  $("#algorithm").change(resetPacking);
	  $('#rainbow-rectangles').change(toggleColours);

	  // Code for the slider...
	  var slider = $("#slider").slideReveal({
	    trigger: $("#trigger"),
	    push: false,
	    show: function show() {
	      $('#trigger span').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-left');
	      $('#slider').addClass('right-shadow-overlay');
	    },
	    hide: function hide() {
	      $('#trigger span').removeClass('glyphicon-chevron-left').addClass('glyphicon-chevron-right');
	      $('#slider').removeClass('right-shadow-overlay');
	    },
	    width: 250
	  });
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var sprintf = __webpack_require__(2);

	"use strict";
	// ==============
	// Algorithms for solving strip packing problem.
	// ==============
	module.exports = {
	  parseRectangles: parseRectangles,
	  printLevels: printLevels,
	  NFDH: function NFDH(rectangles, noSort) {
	    return new _NFDH(rectangles, noSort);
	  },
	  FFDH: function FFDH(rectangles, noSort) {
	    return new _FFDH(rectangles, noSort);
	  },
	  BFDH: function BFDH(rectangles, noSort) {
	    return new _BFDH(rectangles, noSort);
	  },
	  SplitFit: function SplitFit(rectangles) {
	    return new _SplitFit(rectangles);
	  }
	};

	var StripPackingAlgorithm = function () {
	  function StripPackingAlgorithm(rectangles) {
	    _classCallCheck(this, StripPackingAlgorithm);

	    this._message = "";
	    this._rects = rectangles.slice();
	    this._levels = [new Level(0, 0, 1)];
	    this._y = 0;
	  }

	  _createClass(StripPackingAlgorithm, [{
	    key: "flushMessage",
	    value: function flushMessage() {
	      this._message = "";
	    }
	  }, {
	    key: "checkPacking",
	    value: function checkPacking() {
	      if (this._rects.length == 0) {
	        this._message += sprintf("The packing is complete! The total height of the packing is %.3f. ", this._y + this.levels[this.levels.length - 1].height);
	      }
	    }
	  }, {
	    key: "levels",
	    get: function get() {
	      return this._levels;
	    }
	  }, {
	    key: "state",
	    get: function get() {
	      return this._levels;
	    }
	  }, {
	    key: "message",
	    get: function get() {
	      return this._message;
	    }
	  }]);

	  return StripPackingAlgorithm;
	}();

	var _NFDH = function (_StripPackingAlgorith) {
	  _inherits(_NFDH, _StripPackingAlgorith);

	  function _NFDH(rectangles, noSort) {
	    _classCallCheck(this, _NFDH);

	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_NFDH).call(this, rectangles));

	    console.log("value of nosrotll" + noSort);
	    if (!noSort) {
	      _this._rects.sort(heightComparator);
	      _this._message += "First, we sort the rectangles in decreasing order of height. ";
	    }
	    return _this;
	  }
	  /*
	  constructor(rectangles) {
	    super(rectangles);
	    this._message += "First, we sort the rectangles in decreasing order of height. ";
	  }*/
	  // executes one iteration of the algorithm


	  _createClass(_NFDH, [{
	    key: "nextIteration",
	    value: function nextIteration() {
	      if (this._rects.length == 0) {
	        return false;
	      }
	      var rect = this._rects.pop();
	      if (!this.levels[this.levels.length - 1].fits(rect)) {
	        this._y += this.levels[this.levels.length - 1].height;
	        this.levels.push(new Level(0, this._y, 1));
	        this._message += sprintf("There is not enough space on the topmost level to fit rectangle %s so we create a new level. We can't add anymore rectangles to the levels under the new level. ", rect.toString());
	      } else {
	        this._message += sprintf("The topmost level fits rectangle %s so we place it there. ", rect.toString());
	      }
	      this.levels[this.levels.length - 1].addFloor(rect);
	      this.checkPacking();
	      return true;
	    }
	  }]);

	  return _NFDH;
	}(StripPackingAlgorithm);

	var _FFDH = function (_StripPackingAlgorith2) {
	  _inherits(_FFDH, _StripPackingAlgorith2);

	  function _FFDH(rectangles, noSort) {
	    _classCallCheck(this, _FFDH);

	    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(_FFDH).call(this, rectangles));

	    if (!noSort) {
	      _this2._rects.sort(heightComparator);
	      _this2._message += "First, we sort the rectangles in decreasing order of height. ";
	    }
	    return _this2;
	  }
	  // executes one iteration of the algorithm


	  _createClass(_FFDH, [{
	    key: "nextIteration",
	    value: function nextIteration() {
	      if (this._rects.length == 0) {
	        return false;
	      }
	      var rect = this._rects.pop();
	      for (var j = 0; j < this.levels.length; j++) {
	        if (this.levels[j].fits(rect)) {
	          this.levels[j].addFloor(rect);
	          this._message += sprintf("There is space to fit rectangle %s on level %d so we place it there. ", rect.toString(), j + 1);
	          this.checkPacking();
	          return true;
	        }
	      }

	      this._message += sprintf("There is no space in any of the existing levels to fit rectangle %s so we create a new level. ", rect.toString());
	      this._y += this.levels[this.levels.length - 1].height;
	      this.levels.push(new Level(0, this._y, 1));
	      this.levels[this.levels.length - 1].addFloor(rect);
	      this.checkPacking();
	      return true;
	    }
	  }]);

	  return _FFDH;
	}(StripPackingAlgorithm);

	var _SplitFit = function (_StripPackingAlgorith3) {
	  _inherits(_SplitFit, _StripPackingAlgorith3);

	  function _SplitFit(rectangles) {
	    _classCallCheck(this, _SplitFit);

	    var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(_SplitFit).call(this, rectangles));

	    _this3._h0 = -1;
	    _this3._narrow_levels = [];
	    _this3._top_levels = [];
	    _this3._wide = [];
	    _this3._narrow = [];
	    for (var i = 0; i < _this3._rects.length; i++) {
	      if (_this3._rects[i].width > 0.5) {
	        _this3._wide.push(_this3._rects[i]);
	      } else {
	        _this3._narrow.push(_this3._rects[i]);
	      }
	    }
	    _this3._wide.sort(widthComparator);
	    _this3._narrow.sort(heightComparator);
	    _this3._message += "We partition the rectangle into two sets with width > 1/2 and <= 1/2. We sort the first set by width and the second set by height (for FFDH) in decreasing order. ";
	    return _this3;
	  }

	  _createClass(_SplitFit, [{
	    key: "checkPacking",
	    value: function checkPacking() {
	      if (this._wide.length == 0 && this._narrow.length == 0) {
	        var packingHeight = this._y;
	        if (this._top_levels.length > 0) {
	          packingHeight += this._top_levels[this._top_levels.length - 1].height;
	        }
	        this._message += sprintf("The packing is complete! The total height of the packing is %.3f. ", packingHeight);
	      }
	    }

	    // executes one iteration of the algorithm

	  }, {
	    key: "nextIteration",
	    value: function nextIteration() {
	      if (this._narrow.length == 0 && this._wide.length == 0) {
	        return false;
	      }
	      if (this._wide.length > 0) {
	        var rect = this._wide.pop();
	        this._y += this.levels[this.levels.length - 1].height;
	        if (rect.width <= .66666 && this._h0 == -1) {
	          this._h0 = this._y;
	          // Add a new narrow level.
	          this._narrow_levels.push(new Level(.66666, this._h0, .33334));
	          console.log("h0 : " + this._h0);
	        }
	        this._message += sprintf("Since rectangle %s has width greater than 1/2, we pack it at the bottom. ", rect.toString());
	        this.levels.push(new Level(0, this._y, 1));
	        this.levels[this.levels.length - 1].addFloor(rect);
	        if (this._wide.length == 0) {
	          this._y += this.levels[this.levels.length - 1].height;
	          this._h1 = this._y;
	          this._top_levels.push(new Level(0, this._h1, 1));
	        }
	      } else {
	        var rect = this._narrow.pop();
	        // Check if it fits in any of the narrow levels.
	        if (rect.height + this._h0 <= this._h1) {
	          for (var i = 0; i < this._narrow_levels.length; i++) {
	            if (this._narrow_levels[i].fits(rect)) {
	              this._narrow_levels[i].addFloor(rect);
	              this._message += sprintf("Rectangle %s fits in R so we place it there using FFDH. ", rect.toString());
	              return true;
	            }
	          }
	        }
	        if (rect.width > .33334 || rect.height + this._h0 + this._narrow_levels[this._narrow_levels.length - 1].height > this._h1) {
	          //FFDH it
	          for (var i = 0; i < this._top_levels.length; i++) {
	            if (this._top_levels[i].fits(rect)) {
	              this._top_levels[i].addFloor(rect);
	              this.checkPacking();
	              this._message += sprintf("Rectangle %s fits does not fit in R so it goes to the top of the packing using FFDH. ", rect.toString());
	              return true;
	            }
	          }
	          this._message += sprintf("Rectangle %s fits does not fit in R so it goes to the top of the packing using FFDH. ", rect.toString());
	          this._y += this._top_levels[this._top_levels.length - 1].height;
	          this._top_levels.push(new Level(0, this._y, 1));
	          this._top_levels[this._top_levels.length - 1].addFloor(rect);
	        } else {
	          this._message += sprintf("We create a new level for rectangle %s in R, and we place it there. ", rect.toString());
	          this._h0 += this._narrow_levels[this._narrow_levels.length - 1].height;
	          this._narrow_levels.push(new Level(.66666, this._h0, .33334));
	          this._narrow_levels[this._narrow_levels.length - 1].addFloor(rect);
	        }
	      }
	      this.checkPacking();
	      return true;
	    }
	  }, {
	    key: "state",
	    get: function get() {
	      return this._levels.concat(this._narrow_levels).concat(this._top_levels);
	    }
	  }]);

	  return _SplitFit;
	}(StripPackingAlgorithm);

	var _BFDH = function (_StripPackingAlgorith4) {
	  _inherits(_BFDH, _StripPackingAlgorith4);

	  function _BFDH(rectangles, noSort) {
	    _classCallCheck(this, _BFDH);

	    var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(_BFDH).call(this, rectangles));

	    if (!noSort) {
	      _this4._rects.sort(heightComparator);
	      _this4._message += "First, we sort the rectangles in decreasing order of height. ";
	    }
	    return _this4;
	  }
	  // executes one iteration of the algorithm


	  _createClass(_BFDH, [{
	    key: "nextIteration",
	    value: function nextIteration() {
	      if (this._rects.length == 0) {
	        return false;
	      }
	      var rect = this._rects.pop();
	      var bestLevel = -1;
	      var bestFit = 1;
	      for (var j = 0; j < this.levels.length; j++) {
	        var fit = this.levels[j].capacity - rect.width;
	        if (this.levels[j].fits(rect) && fit < bestFit) {
	          bestLevel = j;
	          bestFit = fit;
	        }
	      }

	      if (bestLevel == -1) {
	        this._message += sprintf("There is no space in any of the existing levels to fit rectangle %s so we create a new level. ", rect.toString());
	        this._y += this.levels[this.levels.length - 1].height;
	        this.levels.push(new Level(0, this._y, 1));
	        this.levels[this.levels.length - 1].addFloor(rect);
	      } else {
	        this._message += sprintf("We put rectangle %s on level %d because it putting it there leaves the minimum empty width.", rect.toString(), bestLevel + 1);
	        this.levels[bestLevel].addFloor(rect);
	      }
	      this.checkPacking();
	      return true;
	    }
	  }]);

	  return _BFDH;
	}(StripPackingAlgorithm);

	var Rectangle = function () {
	  function Rectangle(id, width, height) {
	    _classCallCheck(this, Rectangle);

	    this._id = id;
	    this._height = height;
	    this._width = width;
	  }

	  _createClass(Rectangle, [{
	    key: "toString",
	    value: function toString() {
	      return sprintf("#%d (%f, %f)", this.id, this.width, this.height);
	    }
	  }, {
	    key: "width",
	    get: function get() {
	      return this._width;
	    }
	  }, {
	    key: "height",
	    get: function get() {
	      return this._height;
	    }
	  }, {
	    key: "id",
	    get: function get() {
	      return this._id;
	    }
	  }]);

	  return Rectangle;
	}();

	var Level = function () {
	  function Level(x, y, capacity) {
	    _classCallCheck(this, Level);

	    this._x = x;
	    this._y = y;
	    this._rects = [];
	    this._capacity = capacity;
	  }

	  _createClass(Level, [{
	    key: "fits",


	    // Check if this level fits this rectangle
	    value: function fits(r) {
	      return this._capacity - r.width >= 0;
	    }

	    // Adds a rectangle to this level

	  }, {
	    key: "addFloor",
	    value: function addFloor(r) {
	      if (!this.fits(r)) {
	        throw "Rectangle " + r + " does not fit!";
	      }
	      this._rects.push(r);
	      this._capacity -= r.width;
	    }
	  }, {
	    key: "toString",
	    value: function toString() {
	      var s = sprintf("[(%s, %s) -> ", this._x, this._y);
	      for (var i = 0; i < this.rects.length; i++) {
	        s += this.rects[i].toString() + " ";
	      }
	      return s;
	    }
	  }, {
	    key: "rects",
	    get: function get() {
	      return this._rects;
	    }
	  }, {
	    key: "capacity",
	    get: function get() {
	      return this._capacity;
	    }
	  }, {
	    key: "x",
	    get: function get() {
	      return this._x;
	    }
	  }, {
	    key: "y",
	    get: function get() {
	      return this._y;
	    }
	  }, {
	    key: "height",
	    get: function get() {
	      var result = 0;
	      for (var i = 0; i < this.rects.length; i++) {
	        result = Math.max(result, this.rects[i].height);
	      }
	      return result;
	    }
	  }]);

	  return Level;
	}();

	/**
	 * Given a string where each line contains the description of a rectangle
	 * returns a list of rectangle objects.
	 */


	function parseRectangles(s) {
	  var tokens = s.trim().split('\n');
	  var result = [];
	  var w, h;
	  for (var i = 0; i < tokens.length; i++) {
	    if (!tokens[i]) {
	      continue;
	    }
	    var rect = tokens[i].trim().split(' ');
	    if (rect.length != 2) {
	      throw "Make sure you have two numbers per line: " + tokens[i];
	    }
	    w = parseFloat(rect[0]);
	    h = parseFloat(rect[1]);
	    if (w < 0 || w > 1 || h < 0 || h > 1) {
	      throw "Rectangle height and width must be in [0, 1]: " + tokens[i];
	    }
	    result.push(new Rectangle(i + 1, w, h));
	  }
	  return result;
	}

	function heightComparator(a, b) {
	  return a.height - b.height;
	}

	function widthComparator(a, b) {
	  return a.width - b.width;
	}

	function printLevels(levels) {
	  for (var i = 0; i < levels.length; i++) {
	    console.log("Level " + i + ": " + levels[i].toString());
	  }
	}

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	/**
	sprintf() for JavaScript 0.7-beta1
	http://www.diveintojavascript.com/projects/javascript-sprintf

	Copyright (c) Alexandru Marasteanu <alexaholic [at) gmail (dot] com>
	All rights reserved.

	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions are met:
	    * Redistributions of source code must retain the above copyright
	      notice, this list of conditions and the following disclaimer.
	    * Redistributions in binary form must reproduce the above copyright
	      notice, this list of conditions and the following disclaimer in the
	      documentation and/or other materials provided with the distribution.
	    * Neither the name of sprintf() for JavaScript nor the
	      names of its contributors may be used to endorse or promote products
	      derived from this software without specific prior written permission.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	DISCLAIMED. IN NO EVENT SHALL Alexandru Marasteanu BE LIABLE FOR ANY
	DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
	ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


	Changelog:
	2010.11.07 - 0.7-beta1-node
	  - converted it to a node.js compatible module

	2010.09.06 - 0.7-beta1
	  - features: vsprintf, support for named placeholders
	  - enhancements: format cache, reduced global namespace pollution

	2010.05.22 - 0.6:
	 - reverted to 0.4 and fixed the bug regarding the sign of the number 0
	 Note:
	 Thanks to Raphael Pigulla <raph (at] n3rd [dot) org> (http://www.n3rd.org/)
	 who warned me about a bug in 0.5, I discovered that the last update was
	 a regress. I appologize for that.

	2010.05.09 - 0.5:
	 - bug fix: 0 is now preceeded with a + sign
	 - bug fix: the sign was not at the right position on padded results (Kamal Abdali)
	 - switched from GPL to BSD license

	2007.10.21 - 0.4:
	 - unit test and patch (David Baird)

	2007.09.17 - 0.3:
	 - bug fix: no longer throws exception on empty paramenters (Hans Pufal)

	2007.09.11 - 0.2:
	 - feature: added argument swapping

	2007.04.03 - 0.1:
	 - initial release
	**/

	var sprintf = function () {
		function get_type(variable) {
			return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
		}
		function str_repeat(input, multiplier) {
			for (var output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */}
			return output.join('');
		}

		var str_format = function str_format() {
			if (!str_format.cache.hasOwnProperty(arguments[0])) {
				str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
			}
			return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
		};

		// convert object to simple one line string without indentation or
		// newlines. Note that this implementation does not print array
		// values to their actual place for sparse arrays.
		//
		// For example sparse array like this
		//    l = []
		//    l[4] = 1
		// Would be printed as "[1]" instead of "[, , , , 1]"
		//
		// If argument 'seen' is not null and array the function will check for
		// circular object references from argument.
		str_format.object_stringify = function (obj, depth, maxdepth, seen) {
			var str = '';
			if (obj != null) {
				switch (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) {
					case 'function':
						return '[Function' + (obj.name ? ': ' + obj.name : '') + ']';
						break;
					case 'object':
						if (obj instanceof Error) {
							return '[' + obj.toString() + ']';
						};
						if (depth >= maxdepth) return '[Object]';
						if (seen) {
							// add object to seen list
							seen = seen.slice(0);
							seen.push(obj);
						}
						if (obj.length != null) {
							//array
							str += '[';
							var arr = [];
							for (var i in obj) {
								if (seen && seen.indexOf(obj[i]) >= 0) arr.push('[Circular]');else arr.push(str_format.object_stringify(obj[i], depth + 1, maxdepth, seen));
							}
							str += arr.join(', ') + ']';
						} else if ('getMonth' in obj) {
							// date
							return 'Date(' + obj + ')';
						} else {
							// object
							str += '{';
							var arr = [];
							for (var k in obj) {
								if (obj.hasOwnProperty(k)) {
									if (seen && seen.indexOf(obj[k]) >= 0) arr.push(k + ': [Circular]');else arr.push(k + ': ' + str_format.object_stringify(obj[k], depth + 1, maxdepth, seen));
								}
							}
							str += arr.join(', ') + '}';
						}
						return str;
						break;
					case 'string':
						return '"' + obj + '"';
						break;
				}
			}
			return '' + obj;
		};

		str_format.format = function (parse_tree, argv) {
			var cursor = 1,
			    tree_length = parse_tree.length,
			    node_type = '',
			    arg,
			    output = [],
			    i,
			    k,
			    match,
			    pad,
			    pad_character,
			    pad_length;
			for (i = 0; i < tree_length; i++) {
				node_type = get_type(parse_tree[i]);
				if (node_type === 'string') {
					output.push(parse_tree[i]);
				} else if (node_type === 'array') {
					match = parse_tree[i]; // convenience purposes only
					if (match[2]) {
						// keyword argument
						arg = argv[cursor];
						for (k = 0; k < match[2].length; k++) {
							if (!arg.hasOwnProperty(match[2][k])) {
								throw new Error(sprintf('[sprintf] property "%s" does not exist', match[2][k]));
							}
							arg = arg[match[2][k]];
						}
					} else if (match[1]) {
						// positional argument (explicit)
						arg = argv[match[1]];
					} else {
						// positional argument (implicit)
						arg = argv[cursor++];
					}

					if (/[^sO]/.test(match[8]) && get_type(arg) != 'number') {
						throw new Error(sprintf('[sprintf] expecting number but found %s "' + arg + '"', get_type(arg)));
					}
					switch (match[8]) {
						case 'b':
							arg = arg.toString(2);break;
						case 'c':
							arg = String.fromCharCode(arg);break;
						case 'd':
							arg = parseInt(arg, 10);break;
						case 'e':
							arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential();break;
						case 'f':
							arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg);break;
						case 'O':
							arg = str_format.object_stringify(arg, 0, parseInt(match[7]) || 5);break;
						case 'o':
							arg = arg.toString(8);break;
						case 's':
							arg = (arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg;break;
						case 'u':
							arg = Math.abs(arg);break;
						case 'x':
							arg = arg.toString(16);break;
						case 'X':
							arg = arg.toString(16).toUpperCase();break;
					}
					arg = /[def]/.test(match[8]) && match[3] && arg >= 0 ? '+' + arg : arg;
					pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
					pad_length = match[6] - String(arg).length;
					pad = match[6] ? str_repeat(pad_character, pad_length) : '';
					output.push(match[5] ? arg + pad : pad + arg);
				}
			}
			return output.join('');
		};

		str_format.cache = {};

		str_format.parse = function (fmt) {
			var _fmt = fmt,
			    match = [],
			    parse_tree = [],
			    arg_names = 0;
			while (_fmt) {
				if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
					parse_tree.push(match[0]);
				} else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
					parse_tree.push('%');
				} else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosOuxX])/.exec(_fmt)) !== null) {
					if (match[2]) {
						arg_names |= 1;
						var field_list = [],
						    replacement_field = match[2],
						    field_match = [];
						if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
							field_list.push(field_match[1]);
							while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
								if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
									field_list.push(field_match[1]);
								} else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
									field_list.push(field_match[1]);
								} else {
									throw new Error('[sprintf] ' + replacement_field);
								}
							}
						} else {
							throw new Error('[sprintf] ' + replacement_field);
						}
						match[2] = field_list;
					} else {
						arg_names |= 2;
					}
					if (arg_names === 3) {
						throw new Error('[sprintf] mixing positional and named placeholders is not (yet) supported');
					}
					parse_tree.push(match);
				} else {
					throw new Error('[sprintf] ' + _fmt);
				}
				_fmt = _fmt.substring(match[0].length);
			}
			return parse_tree;
		};

		return str_format;
	}();

	var vsprintf = function vsprintf(fmt, argv) {
		var argvClone = argv.slice();
		argvClone.unshift(fmt);
		return sprintf.apply(null, argvClone);
	};

	module.exports = sprintf;
	sprintf.sprintf = sprintf;
	sprintf.vsprintf = vsprintf;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var packer = __webpack_require__(1);

	"use strict";

	module.exports = {
	  /**
	   * In: a list of the levels
	   * canvas the HTML canvas and config a list of options, draws the packing
	   * specified by result onto the canvas.
	   */
	  drawPacking: function drawPacking(levels, canvas, stage, options) {
	    var info = {
	      heights: [],
	      configs: []
	    };
	    // resize the canvas accordingly and rename variables for better readability
	    var height = options.rectMaxHeight;
	    var width = canvas.width;
	    options.canvasWidth = canvas.width;
	    //var packing = result.packing;
	    var context = canvas.getContext("2d");

	    // We have to do two passes to get the height of the final packing
	    var coordsList = [];
	    var currentHeight = 0;
	    for (var i = 0; i < levels.length; i++) {
	      var coords = levelCoordinates(levels[i], currentHeight);
	      coordsList.push(coords);
	      var configurationHeight = 0;
	      for (var j = 0; j < coords.length; j++) {
	        var h = coords[j].y2 - coords[j].y1;
	        configurationHeight = Math.max(configurationHeight, coords[j].y2 - currentHeight);
	      }
	      currentHeight += configurationHeight;
	    }

	    console.log(coordsList);

	    // Set the height of the canvas
	    canvas.height = height * currentHeight + 50;
	    // Flip the canvas
	    context.translate(0, canvas.height);
	    context.scale(1, -1);

	    currentHeight = 0;
	    for (var i = 0; i < coordsList.length; i++) {
	      var coords = coordsList[i];
	      var configurationHeight = drawLevel(context, coords, currentHeight, options);
	      info.heights.push(configurationHeight);
	      currentHeight += configurationHeight;
	    }
	    return info;
	  },

	  /**
	   * Returns a gradient of lighter colours given an initial shade.
	   */
	  tintGradient: function tintGradient(hex, tintFactor, iterations) {
	    var colours = [];
	    var rgb = hexToRgb(hex);
	    //var rgb = hexToRgb("#D81159");
	    for (var i = 0; i < iterations; i++) {
	      colours.push(rgbToHex(rgb));
	      rgb = tint(rgb, tintFactor);
	    }
	    return colours;
	  },
	  makeColorGradient: makeColorGradient
	};

	/**
	 * Draws a level onto to canvas. A level is a set of stacks.
	 */
	function drawLevel(context, coords, currentHeight, options) {
	  var configurationHeight = 0;
	  var height = options.rectMaxHeight;
	  var width = options.canvasWidth;
	  //console.log(coords);
	  for (var j = 0; j < coords.length; j++) {
	    //var context = canvas.getContext('2d');
	    var h = coords[j].y2 - coords[j].y1;
	    var w = coords[j].x2 - coords[j].x1;
	    context.lineWidth = 1;
	    context.strokeStyle = options.rectBorder;
	    //console.log(coords[j].id);
	    context.fillStyle = options.colours[coords[j].id % options.colours.length];
	    context.fillRect(coords[j].x1 * width, coords[j].y1 * height, w * width, h * height);
	    context.strokeRect(coords[j].x1 * width, coords[j].y1 * height, w * width, h * height);
	    configurationHeight = Math.max(configurationHeight, coords[j].y2 - currentHeight);
	  }
	  //console.log(i + ": " + configurationHeight);
	  context.lineWidth = options.configLineWidth;
	  context.strokeStyle = options.configBorder;
	  context.strokeRect(0, currentHeight * height, width, configurationHeight * height);
	  return configurationHeight;
	}

	function clearCanvas(canvas) {
	  var context = canvas.getContext('2d');
	  context.clearRect(0, 0, canvas.width, canvas.height);
	}

	function levelCoordinates(level) {
	  var coords = [];
	  var x = level.x,
	      y = level.y;
	  for (var i = 0; i < level.rects.length; i++) {
	    coords.push({
	      id: level.rects[i].id,
	      x1: x,
	      y1: y,
	      x2: x + level.rects[i].width,
	      y2: y + level.rects[i].height
	    });
	    x += level.rects[i].width;
	  }
	  return coords;
	}

	// ==========
	// Colour functions
	// ==========

	function tint(rgb, tint_factor) {
	  return {
	    r: rgb.r + Math.round((255 - rgb.r) * tint_factor),
	    g: rgb.g + Math.round((255 - rgb.g) * tint_factor),
	    b: rgb.b + Math.round((255 - rgb.b) * tint_factor)
	  };
	}

	// Source: http://krazydad.com/tutorials/makecolors.php
	function makeColorGradient(frequency1, frequency2, frequency3, phase1, phase2, phase3, center, width, len) {
	  if (center == undefined) center = 128;
	  if (width == undefined) width = 127;
	  if (len == undefined) len = 50;

	  var colours = [];
	  for (var i = 0; i < len; ++i) {
	    var red = Math.sin(frequency1 * i + phase1) * width + center;
	    var grn = Math.sin(frequency2 * i + phase2) * width + center;
	    var blu = Math.sin(frequency3 * i + phase3) * width + center;
	    colours.push(rgbToHex({
	      r: Math.round(red),
	      g: Math.round(grn),
	      b: Math.round(blu)
	    }));
	  }
	  return colours;
	}

	// Source: http://stackoverflow.com/q/5623838/2372271
	function componentToHex(c) {
	  var hex = c.toString(16);
	  return hex.length == 1 ? "0" + hex : hex;
	}

	function rgbToHex(rgb) {
	  return "#" + componentToHex(rgb.r) + componentToHex(rgb.g) + componentToHex(rgb.b);
	}

	function hexToRgb(hex) {
	  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	  return result ? {
	    r: parseInt(result[1], 16),
	    g: parseInt(result[2], 16),
	    b: parseInt(result[3], 16)
	  } : null;
	}

/***/ }
/******/ ]);