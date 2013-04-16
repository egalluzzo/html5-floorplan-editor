function FloorplanEditor(config) {
    this.init(config);
}

FloorplanEditor.prototype.init = function(config) {
    this.canvas = new FloorplanCanvas(config);

    this.registerDefaultShapeTypes();
    if (config.shapeTypes) {
        for (var i = 0; i < config.shapeTypes.length; i++) {
            this.canvas.registerShapeType(config.shapeTypes[i]);
        }
    }

    if (Hammer) {
        this.installHammerEventHandlers();
    }

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
            //prevent_mouseevents: true,
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
            editor.canvas.translateByScreenDelta(
                {
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
