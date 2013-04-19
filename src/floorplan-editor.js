// Container for "use strict"
(function() {

"use strict";

window.FloorplanEditor = function(config) {
    this.init(config);
}

FloorplanEditor.prototype.init = function(config) {
    this.canvas = new FloorplanCanvas(config);
    this.scrollScale = config.scrollScale || 1.02;

    this.registerDefaultShapeTypes();
    if (config.shapeTypes) {
        for (var i = 0; i < config.shapeTypes.length; i++) {
            this.canvas.registerShapeType(config.shapeTypes[i]);
        }
    }

    if (Hammer) {
        this.installHammerEventHandlers();
    }
    this.installMouseEventHandlers();

    this.canvas.draw();
};

FloorplanEditor.prototype.registerDefaultShapeTypes = function() {
    this.canvas.registerShapeType(new FloorplanShapes.RectangularRoom());
    this.canvas.registerShapeType(new FloorplanShapes.CathedralRoom());
    this.canvas.registerShapeType(new FloorplanShapes.VaultedRoom());
    this.canvas.registerShapeType(new FloorplanShapes.LShapedRoom());
};

FloorplanEditor.prototype.setZoom = function(zoom) {
    this.canvas.setZoom(zoom);
};

FloorplanEditor.prototype.setOffset = function(offset) {
    this.canvas.setOffset(offset);
};

FloorplanEditor.prototype.installHammerEventHandlers = function() {
    var editor = this;

    (function() {
        var hammertime = Hammer(editor.canvas.canvas, {
            drag_min_distance: 5,
            prevent_mouseevents: true,
            swipe: false
        });

        var lastPoint;
        var lastScale;

        hammertime.on("dragstart", function(event) {
            lastPoint = {x: event.gesture.center.pageX, y: event.gesture.center.pageY};
        });

        hammertime.on("transformstart", function(event) {
            lastScale = 1.0;
        });

        hammertime.on("drag", function(event) {
            editor.canvas.translateByScreenDelta({
                x: event.gesture.center.pageX - lastPoint.x,
                y: event.gesture.center.pageY - lastPoint.y
            });
            lastPoint = {x: event.gesture.center.pageX, y: event.gesture.center.pageY};
        });

        hammertime.on("pinch", function(event) {
            editor.canvas.scaleAtPagePoint(
                event.gesture.scale / lastScale,
                {x: event.gesture.center.pageX, y: event.gesture.center.pageY});
            lastScale = event.gesture.scale;
        });
    })();
};

FloorplanEditor.prototype.installMouseEventHandlers = function() {
    var editor = this;
    (function() {
        var lastPoint;
        var mode = null;

        editor.addEventHandler(editor.canvas.canvas, "mousedown", function(event) {
            if (event.button == 0) {
                lastPoint = {x: event.clientX, y: event.clientY};
                mode = "drag";
            }
            // FIXME: Also handle select with mouseup
        });

        editor.addEventHandler(editor.canvas.canvas, "mousemove", function(event) {
            switch (mode) {
                case "drag":
                    editor.canvas.translateByScreenDelta({
                        x: event.clientX - lastPoint.x,
                        y: event.clientY - lastPoint.y
                    });
                    lastPoint = {x: event.clientX, y: event.clientY};
                    break;
            }
        });

        editor.addEventHandler(editor.canvas.canvas, "mouseup", function(event) {
            switch (mode) {
                case "drag":
                    mode = null;
            }
            // FIXME: Handle select here
        });

        editor.addEventHandler(editor.canvas.canvas, "mousewheel", function(event) {
            event.preventDefault();
            var scale = 1;
            if (event.wheelDelta) {
                if (event.wheelDelta > 0) {
                    scale = editor.scrollScale;
                } else if (event.wheelDelta < 0) {
                    scale = 1 / editor.scrollScale;
                }
                editor.canvas.scaleAtPagePoint(scale, {x: event.clientX, y: event.clientY});
            };
        });

        editor.addEventHandler(editor.canvas.canvas, "DOMMouseScroll", function(event) {
            event.preventDefault();
            var scale = 1;
            if (event.detail) {
                if (event.detail > 0) {
                    scale = editor.scrollScale;
                } else if (event.detail < 0) {
                    scale = 1 / editor.scrollScale;
                }
                editor.canvas.scaleAtPagePoint(scale, {x: event.clientX, y: event.clientY});
            };
        });
    })();
};

FloorplanEditor.prototype.addEventHandler = function(elem, eventType, eventHandler) {
    if (elem.addEventListener) {
        elem.addEventListener(eventType, eventHandler, false);
    } else if (elem.attachEvent) {
        elem.attachEvent("on" + eventType, function(e) {
            var event = e || window.event;
            eventHandler.call(elem, event);
        });
    }
};

// End container for "use strict"
})();
