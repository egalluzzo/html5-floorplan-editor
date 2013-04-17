// Start container for "use strict"
(function() {

"use strict";

window.FloorplanCanvas = function(config) {
    this.init(config);
}

FloorplanCanvas.prototype.init = function(config) {
    var defaultConfig = {
        // ID of canvas on which to draw the floorplan (required)
        canvasId: null,
        // Spacing (in pixels) between grid lines; null for no grid lines
        gridLineSpacing: [1, 6, 120, 1200, 12000],
        // Colors of lines on the grid, from light to dark; only the given number of grid line levels will be shown
        gridLineColors: ['#d0d0d0', '#808080'],
        // Minimum number of pixels between grid spaces before going to the next grid zoom level
        gridMinPixels: 3,
        // Initial offset; must have x and y properties, in pixels
        offset: {x: 0, y: 0},
        // Initial set of shapes on the canvas
        shapes: [],
        // Initial zoom level
        zoom: 1.0
    };

    // Roughly equivalent to $.extend
    this.config = {};
    for (var prop in defaultConfig) {
        if (config[prop] === undefined) {
            this.config[prop] = defaultConfig[prop];
        } else {
            this.config[prop] = config[prop];
        }
    }

    if (!this.config.canvasId) {
        throw new Error("No canvas ID specified; please use the canvasId configuration option");
    }

    this.canvas = document.getElementById(this.config.canvasId);
    if (!this.canvas) {
        throw new Error("Canvas ID '" + this.config.canvasId + "'' does not exist");
    }

    if (!this.canvas.getContext) {
        throw new Error(
            "Cannot get drawing context for element '"
            + this.config.canvasId
            + "'' -- either it is not a canvas or this browser does not support the HTML5 canvas");
    }

    this.offset = this.config.offset;
    this.zoom = this.config.zoom;
    this.shapes = this.config.shapes;

    this.shapeTypes = {};

    this.draw();
};

FloorplanCanvas.prototype.draw = function() {
    var ctx = this.canvas.getContext("2d");
    ctx.save();
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid(ctx);
    this.applyOffsetAndZoom(ctx);
    this.drawShapes(ctx);
    ctx.restore();
};

FloorplanCanvas.prototype.registerShapeType = function(shapeType) {
    this.shapeTypes[shapeType.name] = shapeType;
}

FloorplanCanvas.prototype.unregisterShapeType = function(shapeName) {
    delete this.shapeTypes[shapeName];
}

FloorplanCanvas.prototype.applyOffsetAndZoom = function(ctx) {
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.zoom, this.zoom);
};

FloorplanCanvas.prototype.drawGrid = function(ctx) {
    // No grid if gridLineSpacing is not specified
    if (!this.config.gridLineSpacing) {
        return;
    }

    ctx.save();

    // Figure out the smallest visible grid line spacing.
    var smallestGridSpacingIndex = 0;
    for (var i = 0; i < this.config.gridLineSpacing.length; i++) {
        var visibleGridSpacing = this.config.gridLineSpacing[i] * this.zoom;
        if (visibleGridSpacing >= this.config.gridMinPixels) {
            smallestGridSpacingIndex = i;
            break;
        }
    }

    // Figure out how many grid line levels to display.  If we're zoomed out far enough, this could be none.
    var availableLineColors = this.config.gridLineColors.length;
    var availableGridSpacingLevels = this.config.gridLineSpacing.length - smallestGridSpacingIndex;
    var gridLevels = Math.min(availableLineColors, availableGridSpacingLevels);

    // Draw each level of the grid.
    for (var i = 0; i < gridLevels; i++) {
        ctx.strokeStyle = this.config.gridLineColors[i];
        var gridSpacing = this.config.gridLineSpacing[i + smallestGridSpacingIndex];

        var numHorizontalLines = Math.round(this.canvas.width / (this.zoom * gridSpacing)) + 1;
        var firstLine = this.offset.x % (gridSpacing * this.zoom); // May be off the screen to the left, but that's OK
        for (var j = 0; j < numHorizontalLines; j++) {
            // We make sure x is on a 0.5 offset so that 1-pixel lines look clear.
            var x = Math.round(firstLine + (j * this.zoom * gridSpacing) - 0.5) + 0.5;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }

        var numVerticalLines = Math.round(this.canvas.height / (this.zoom * gridSpacing)) + 1;
        firstLine = this.offset.y % (gridSpacing * this.zoom); // May be off the top of the screen
        for (var j = 0; j < numVerticalLines; j++) {
            // We make sure y is on a 0.5 offset so that 1-pixel lines look clear.
            var y = Math.round(firstLine + (j * this.zoom * gridSpacing) - 0.5) + 0.5;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
    }

    ctx.restore();
};

FloorplanCanvas.prototype.drawShapes = function(ctx) {
    for (var i = 0; i < this.shapes.length; i++) {
        var shape = this.shapes[i];
        var shapeType = this.shapeTypes[shape.type];
        if (shapeType) {
            ctx.save();
            try {
                shapeType.draw(ctx, shape, this);
            } catch (e) {
                console.log("Error while trying to draw shape: ", e);
            } finally {
                ctx.restore();
            }
        }
    }
};

FloorplanCanvas.prototype.setZoom = function(zoom) {
    this.zoom = zoom;
    this.draw();
};

FloorplanCanvas.prototype.setOffset = function(offset) {
    this.offset = {x: offset.x, y: offset.y};
    this.draw();
};

FloorplanCanvas.prototype.translateByScreenDelta = function(delta) {
    this.offset = {
        x: this.offset.x + (delta.x / this.zoom),
        y: this.offset.y + (delta.y / this.zoom)
    };
    this.draw();
};

FloorplanCanvas.prototype.scaleAtPagePoint = function(scale, center) {
    this.zoom = this.zoom * scale;
    // FIXME: Translate also, based on center
    this.draw();
};

// End container for "use strict"
})();
