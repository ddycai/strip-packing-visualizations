const packer = require('./packer');

"use strict";

module.exports = {
  /**
   * In: a list of the levels
   * canvas the HTML canvas and config a list of options, draws the packing
   * specified by result onto the canvas.
   */
  drawPacking: function (levels, canvas, stage, options) {
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
  tintGradient: function (hex, tintFactor, iterations) {
    var colours = [];
    var rgb = hexToRgb(hex);
    //var rgb = hexToRgb("#D81159");
    for (var i = 0; i < iterations; i++) {
      colours.push(rgbToHex(rgb));
      rgb = tint(rgb, tintFactor);
    }
    return colours;
  },
  makeColorGradient: makeColorGradient,
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
    context.fillRect(
        coords[j].x1 * width,
        coords[j].y1 * height,
        w * width,
        h * height
    );
    context.strokeRect(
        coords[j].x1 * width,
        coords[j].y1 * height,
        w * width,
        h * height
    );
    configurationHeight = Math.max(configurationHeight, coords[j].y2 - currentHeight);
  }
  //console.log(i + ": " + configurationHeight);
  context.lineWidth = options.configLineWidth;
  context.strokeStyle = options.configBorder;
  context.strokeRect(
      0,
      currentHeight * height,
      width,
      configurationHeight * height
  );
  return configurationHeight;
}


function clearCanvas(canvas) {
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function levelCoordinates(level) {
  var coords = [];
  var x = level.x, y = level.y;
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
  }
}

// Source: http://krazydad.com/tutorials/makecolors.php
function makeColorGradient(frequency1, frequency2, frequency3,
                           phase1, phase2, phase3,
                           center, width, len)
{
  if (center == undefined)   center = 128;
  if (width == undefined)    width = 127;
  if (len == undefined)      len = 50;

  var colours = [];
  for (var i = 0; i < len; ++i)
  {
     var red = Math.sin(frequency1*i + phase1) * width + center;
     var grn = Math.sin(frequency2*i + phase2) * width + center;
     var blu = Math.sin(frequency3*i + phase3) * width + center;
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
