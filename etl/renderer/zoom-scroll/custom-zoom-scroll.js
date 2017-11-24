'use strict';

var inherits = require('inherits');

var domClosest = require('min-dom/lib/closest');

var hasPrimaryModifier = require('diagram-js/lib/util/Mouse').hasPrimaryModifier,
    hasSecondaryModifier = require('diagram-js/lib/util/Mouse').hasSecondaryModifier;

var isMac = require('diagram-js/lib/util/Platform').isMac;

var zoomScroll = require('diagram-js/lib/navigation/zoomscroll/ZoomScroll');

function CustomZoomScroll(eventBus, canvas, config){
  zoomScroll.call(this, eventBus, canvas, config);
}

CustomZoomScroll.$inject = [ 'eventBus', 'canvas', 'config.zoomScroll' ];

inherits(CustomZoomScroll, zoomScroll);

module.exports = CustomZoomScroll;

CustomZoomScroll.prototype._handleWheel = function handleWheel(event) {
  // event is already handled by '.djs-scrollable'
  if (domClosest(event.target, '.djs-scrollable', true)) {
    return;
  }

  var element = this._container;

  event.preventDefault();

  // mouse-event: SELECTION_KEY
  // mouse-event: AND_KEY
  var isCtrlKeyPressed = hasPrimaryModifier(event),
      isShiftKeyPressed = hasSecondaryModifier(event);

  var factor;

  if (isCtrlKeyPressed) {
    factor = (event.deltaMode === 0 ? 1/40 : 1/2);

    var elementRect = element.getBoundingClientRect();

    var offset =  {
      x: event.clientX - elementRect.left,
      y: event.clientY - elementRect.top
    };

    // zoom in relative to diagram {x,y} coordinates
    this.zoom(event.deltaY * factor / (-5), offset);
  } else {
    if (isMac) {
      factor = event.deltaMode === 0 ? 1.25 : 50;
    } else {
      factor = event.deltaMode === 0 ? 1/40 : 1/2;
    }

    var delta = {};

    if (isShiftKeyPressed) {
      delta.dx = (factor * (event.deltaX || event.deltaY));
    } else {
      delta.dy = (-1) * (factor * event.deltaY);
    }
    this.scroll(delta);
  }
};