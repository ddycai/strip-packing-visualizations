var packer = require("./packer");
var painter = require("./painter");

var purples = painter.tintGradient("#722364", .05, 20);
var rainbow = painter.makeColorGradient(.3,.3,.3,0,2,4, 200, 55);
var config = {
  rectBorder: '#ffffff',
  rectMaxHeight: 200,
  configBorder: '#FFBC42',
  configLineWidth: 2,
  colours: purples,
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
  config.colours = (config.colours == purples) ? rainbow : purples;
  resetPacking();
}

function randomInput(n, randFunction) {
  var s = "";
  for (var i = 0; i < n; i++) {
    var w = Math.round(randFunction() * 100)/100;
    var h = Math.round(randFunction() * 100)/100;
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
  try {rects = packer.parseRectangles(s);
  } catch (e) {
    alert(e);
    return;
  }
  packingState = new packer.FFDH(rects, noSort);
  continuePackingSequence();
}

function bestFitDecreasingHeight(s, noSort) {
  try {rects = packer.parseRectangles(s);
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
  switch(choice) {
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
  try {rects = packer.parseRectangles(s);
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
  if(packingState.nextIteration()) {
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


$(function() {
  randomSolution();
  // If you click the solve button
  $('#solve-button').click(resetPacking);

  $('#reset-button').click(resetPacking);

  // Continue packing button...
  $('#continue-button').click(function (){
    continuePackingSequence();
  });

  $('#random-button').click(function (){
    randomSolution();
  });

  $('#finish-button').click(function (){
    while(continuePackingSequence());
  });

  // Changing the select button
  $("#algorithm").change(resetPacking);
  $('#rainbow-rectangles').change(toggleColours);

  // Code for the slider...
  var slider = $("#slider").slideReveal({
    trigger: $("#trigger"),
    push: false,
    show: function() {
      $('#trigger span')
        .removeClass('glyphicon-chevron-right')
        .addClass('glyphicon-chevron-left');
      $('#slider').addClass('right-shadow-overlay');
    },
    hide: function() {
      $('#trigger span')
        .removeClass('glyphicon-chevron-left')
        .addClass('glyphicon-chevron-right');
      $('#slider').removeClass('right-shadow-overlay');
    },
    width: 250
  });
});

