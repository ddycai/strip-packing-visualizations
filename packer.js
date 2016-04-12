var sprintf = require('sprintf');

"use strict";
// ==============
// Algorithms for solving strip packing problem.
// ==============
module.exports = { 
  parseRectangles: parseRectangles,
  printLevels: printLevels,
  NFDH: function(rectangles, noSort) {
    return new NFDH(rectangles, noSort);
  },
  FFDH: function(rectangles, noSort) {
    return new FFDH(rectangles, noSort);
  },
  BFDH: function(rectangles, noSort) {
    return new BFDH(rectangles, noSort);
  },
  SplitFit: function(rectangles) {
    return new SplitFit(rectangles);
  },
}

class StripPackingAlgorithm {
  constructor(rectangles) {
    this._message = "";
    this._rects = rectangles.slice();
    this._levels = [new Level(0, 0, 1)];
    this._y = 0;
  }
  get levels() { return this._levels; }
  get state() { return this._levels; }
  get message() { return this._message; }
  flushMessage() { this._message = ""; }

  checkPacking() {
    if (this._rects.length == 0) {
      this._message += sprintf(
        "The packing is complete! The total height of the packing is %.3f. ",
        this._y + this.levels[this.levels.length - 1].height
      );
    }
  }
}

class NFDH extends StripPackingAlgorithm {
  constructor(rectangles, noSort) {
    super(rectangles);
    console.log("value of nosrotll" + noSort);
    if (!noSort) {
      this._rects.sort(heightComparator);
      this._message += "First, we sort the rectangles in decreasing order of height. ";
    }
  }
  /*
  constructor(rectangles) {
    super(rectangles);
    this._message += "First, we sort the rectangles in decreasing order of height. ";
  }*/
  // executes one iteration of the algorithm
  nextIteration() {
    if (this._rects.length == 0) {
      return false;
    }
    var rect = this._rects.pop();
    if (!this.levels[this.levels.length - 1].fits(rect)) {
      this._y += this.levels[this.levels.length - 1].height;
      this.levels.push(new Level(0, this._y, 1));
      this._message += sprintf(
        "There is not enough space on the topmost level to fit rectangle %s so we create a new level. We can't add anymore rectangles to the levels under the new level. ",
        rect.toString());
    } else {
      this._message += sprintf(
        "The topmost level fits rectangle %s so we place it there. ",
        rect.toString());
    }
    this.levels[this.levels.length - 1].addFloor(rect);
    this.checkPacking();
    return true;
  }
}

class FFDH extends StripPackingAlgorithm {
  constructor(rectangles, noSort) {
    super(rectangles);
    if (!noSort) {
      this._rects.sort(heightComparator);
      this._message += "First, we sort the rectangles in decreasing order of height. ";
    }
  }
  // executes one iteration of the algorithm
  nextIteration() {    
    if (this._rects.length == 0) {
      return false;
    }
    var rect = this._rects.pop();
    for (var j = 0; j < this.levels.length; j++) {
      if (this.levels[j].fits(rect)) {
        this.levels[j].addFloor(rect);
        this._message += sprintf(
          "There is space to fit rectangle %s on level %d so we place it there. ",
          rect.toString(), j + 1);
        this.checkPacking();
        return true;
      }
    }

    this._message += sprintf(
      "There is no space in any of the existing levels to fit rectangle %s so we create a new level. ",
      rect.toString());
    this._y +=  this.levels[this.levels.length - 1].height;
    this.levels.push(new Level(0, this._y, 1));      
    this.levels[this.levels.length - 1].addFloor(rect);
    this.checkPacking();
    return true;
  } 
}

class SplitFit extends StripPackingAlgorithm {
  constructor(rectangles) {
    super(rectangles);
    this._h0 = -1;
    this._narrow_levels = [];
    this._top_levels = [];
    this._wide = [];
    this._narrow = [];
    for (var i = 0; i < this._rects.length; i++) {
      if (this._rects[i].width > 0.5) {
        this._wide.push(this._rects[i]);
      } else {
        this._narrow.push(this._rects[i]);
      }
    }
    this._wide.sort(widthComparator);
    this._narrow.sort(heightComparator);
    this._message += "We partition the rectangle into two sets with width > 1/2 and <= 1/2. We sort the first set by width and the second set by height (for FFDH) in decreasing order. ";
  }

  get state() {
    return this._levels.concat(this._narrow_levels).concat(this._top_levels);
  }

  checkPacking() {
    if (this._wide.length == 0 && this._narrow.length == 0) {
      var packingHeight = this._y;
      if (this._top_levels.length > 0) {
        packingHeight += this._top_levels[this._top_levels.length - 1].height;
      }
      this._message += sprintf(
        "The packing is complete! The total height of the packing is %.3f. ",
        packingHeight
      );
    }
  }

  // executes one iteration of the algorithm
  nextIteration() {    
    if (this._narrow.length == 0 && this._wide.length == 0) {
      return false;
    }
    if (this._wide.length > 0) {
      var rect = this._wide.pop();
      this._y +=  this.levels[this.levels.length - 1].height;
      if (rect.width <= .66666 && this._h0 == -1) {
        this._h0 = this._y;
        // Add a new narrow level.
        this._narrow_levels.push(new Level(.66666, this._h0, .33334));
        console.log("h0 : " + this._h0);
      }
      this._message += sprintf("Since rectangle %s has width greater than 1/2, we pack it at the bottom. ",
        rect.toString());
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
            this._message += sprintf(
              "Rectangle %s fits in R so we place it there using FFDH. "
              , rect.toString());
            return true;
          }
        }
      }
      if (rect.width > .33334 || 
          rect.height + this._h0 + this._narrow_levels[this._narrow_levels.length - 1].height > this._h1) {
        //FFDH it
        for (var i = 0; i < this._top_levels.length; i++) {
          if (this._top_levels[i].fits(rect)) {
            this._top_levels[i].addFloor(rect);
            this.checkPacking();
            this._message += sprintf(
              "Rectangle %s fits does not fit in R so it goes to the top of the packing using FFDH. "
              , rect.toString());
            return true;
          }
        }
        this._message += sprintf(
              "Rectangle %s fits does not fit in R so it goes to the top of the packing using FFDH. "
              , rect.toString());
        this._y +=  this._top_levels[this._top_levels.length - 1].height;      
        this._top_levels.push(new Level(0, this._y, 1));      
        this._top_levels[this._top_levels.length - 1].addFloor(rect);
      } else {
        this._message += sprintf(
              "We create a new level for rectangle %s in R, and we place it there. "
              , rect.toString());
        this._h0 +=  this._narrow_levels[this._narrow_levels.length - 1].height;      
        this._narrow_levels.push(new Level(.66666, this._h0, .33334));      
        this._narrow_levels[this._narrow_levels.length - 1].addFloor(rect);
      }
    }
    this.checkPacking();
    return true;
  } 
}

class BFDH extends StripPackingAlgorithm {
  constructor(rectangles, noSort) {
    super(rectangles);
    if (!noSort) {
      this._rects.sort(heightComparator);
      this._message += "First, we sort the rectangles in decreasing order of height. ";
    }
  }
  // executes one iteration of the algorithm
  nextIteration() {    
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
      this._message += sprintf(
        "There is no space in any of the existing levels to fit rectangle %s so we create a new level. ",
        rect.toString());
      this._y +=  this.levels[this.levels.length - 1].height;
      this.levels.push(new Level(0, this._y, 1));      
      this.levels[this.levels.length - 1].addFloor(rect);
    } else {
      this._message += sprintf(
        "We put rectangle %s on level %d because it putting it there leaves the minimum empty width.",
        rect.toString(), bestLevel + 1);
      this.levels[bestLevel].addFloor(rect);
    }
    this.checkPacking();
    return true;
  } 
}

class Rectangle {
  constructor(id, width, height) {
    this._id = id;
    this._height = height;
    this._width = width;
  }

  get width() { return this._width; }

  get height() { return this._height; }

  get id() { return this._id; }

  toString() {
    return sprintf("#%d (%f, %f)", this.id, this.width, this.height);
  }
}

class Level {
  constructor(x, y, capacity) {
    this._x = x;
    this._y = y;
    this._rects = [];
    this._capacity = capacity;
  }

  get rects() {
    return this._rects;
  }

  get capacity() {
    return this._capacity;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get height() {
    var result = 0;
    for (var i = 0; i < this.rects.length; i++) {
      result = Math.max(result, this.rects[i].height);
    }
    return result;
  }

  // Check if this level fits this rectangle
  fits(r) {
    return this._capacity - r.width >= 0;
  }

  // Adds a rectangle to this level
  addFloor(r) {
    if (!this.fits(r)) {
      throw "Rectangle " + r + " does not fit!";
    }
    this._rects.push(r);
    this._capacity -= r.width;
  }

  toString() {
    var s = sprintf("[(%s, %s) -> ", this._x, this._y);
    for (var i = 0; i < this.rects.length; i++) {
      s += this.rects[i].toString() + " ";
    }
    return s;
  }
}

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