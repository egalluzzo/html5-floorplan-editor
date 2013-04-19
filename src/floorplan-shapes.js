// Start container for "use strict"
(function() {

"use strict";

/**
 * A shape has the following contract:
 *
 * MyShape.name: A property that returns the name of this shape type that will be stored in each shape (a string).
 *
 * MyShape.draw(ctx, shape, canvas):
 * Draws the given shape on a canvas.  No save/restore is necessary; this is
 * done in the calling function.
 *     - ctx:    The HTML5 canvas context
 *     - shape:  The shape
 *     - canvas: The FloorplanCanvas that is calling this shape handler
 *
 * MyShape.getCenter(shape):
 * Determines the center point of the shape.
 *
 * MyShape.getSize(shape):
 * Determines the bounding box of the shape.
 */

window.FloorplanShapes = {};

FloorplanShapes.DEFAULT_STROKE_WIDTH = 2;
FloorplanShapes.DEFAULT_STROKE_STYLE = "rgba(0, 0, 0, 0.8)";
FloorplanShapes.DEFAULT_FILL_STYLE = "rgba(192, 192, 192, 0.8)";
FloorplanShapes.VAULTED_FILL_STYLE = "rgba(255, 255, 255, 0.8)";
FloorplanShapes.DEFAULT_FONT = "12px sans-serif";
FloorplanShapes.DEFAULT_FONT_FILL_STYLE = "rgba(0, 0, 0, 0.8)";

FloorplanShapes.GenericRoom = function(name) {
    this.name = name;
}

FloorplanShapes.GenericRoom.prototype.draw = function(ctx, shape, canvas) {
    ctx.strokeWidth = FloorplanShapes.DEFAULT_STROKE_WIDTH;
    ctx.strokeStyle = FloorplanShapes.DEFAULT_STROKE_STYLE;
    ctx.translate(shape.center.x, shape.center.y);
    ctx.save();
    if (shape.rotation) {
        ctx.rotate(shape.rotation * Math.PI / 180.0);
    }

    this.drawRoom(ctx, shape, canvas);

    ctx.restore();

    ctx.font = FloorplanShapes.DEFAULT_FONT;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = FloorplanShapes.DEFAULT_FONT_FILL_STYLE;
    ctx.fillText(shape.label, 0, 0);
}

FloorplanShapes.GenericRoom.prototype.drawRoom = function(ctx, shape, canvas) {
    // "abstract" method
}

FloorplanShapes.GenericRoom.prototype.getCenter = function(shape) {
    return shape.center;
}

/**
 * A rectangular room.  Required properties:
 *
 *     - id:       The shape ID
 *     - type:     "rect-room"
 *     - center:   The center point of the shape (contains x and y properties)
 *     - size:     The length (horizontal) and width (vertical) of the shape
 *     - rotation: The rotation of the shape, in degrees
 */
FloorplanShapes.RectangularRoom = function() {};
FloorplanShapes.RectangularRoom.prototype = new FloorplanShapes.GenericRoom("rect-room");
FloorplanShapes.RectangularRoom.prototype.constructor = FloorplanShapes.RectangularRoom;

FloorplanShapes.RectangularRoom.prototype.drawRoom = function(ctx, shape, canvas) {
    ctx.fillStyle = FloorplanShapes.DEFAULT_FILL_STYLE;
    ctx.fillRect(-shape.size.length / 2, -shape.size.width / 2, shape.size.length, shape.size.width);
    ctx.strokeRect(-shape.size.length / 2, -shape.size.width / 2, shape.size.length, shape.size.width);
};


/**
 * A room with a vaulted ceiling on one side.  Before rotation, it will be
 * vaulted on the south side.  Required properties:
 *
 *     - id:          The shape ID
 *     - type:        "vaulted-room"
 *     - center:      The center point of the shape (contains x and y properties)
 *     - size:        The length (horizontal) and width (vertical) of the shape
 *     - rotation: The rotation of the shape, in degrees
 */
FloorplanShapes.VaultedRoom = function() {};
FloorplanShapes.VaultedRoom.prototype = new FloorplanShapes.GenericRoom("vaulted-room");
FloorplanShapes.VaultedRoom.prototype.constructor = FloorplanShapes.VaultedRoom;

FloorplanShapes.VaultedRoom.prototype.drawRoom = function(ctx, shape, canvas) {
    var gradient = ctx.createLinearGradient(0, -shape.size.width / 2, 0, shape.size.width / 2);
    gradient.addColorStop(0, FloorplanShapes.DEFAULT_FILL_STYLE);
    gradient.addColorStop(1, FloorplanShapes.VAULTED_FILL_STYLE);
    ctx.fillStyle = gradient;
    ctx.fillRect(-shape.size.length / 2, -shape.size.width / 2, shape.size.length, shape.size.width);
    ctx.strokeRect(-shape.size.length / 2, -shape.size.width / 2, shape.size.length, shape.size.width);
};


/**
 * A room with a ceiling that is vaulted in the middle.  Before rotation, the
 * highest line of the ceiling will be horizontal.  Required properties:
 *
 *     - id:       The shape ID
 *     - type:     "cathedral-room"
 *     - center:   The center point of the shape (contains x and y properties)
 *     - size:     The length (horizontal) and width (vertical) of the shape
 *     - rotation: The rotation of the shape, in degrees
 */
FloorplanShapes.CathedralRoom = function() {};
FloorplanShapes.CathedralRoom.prototype = new FloorplanShapes.GenericRoom("cathedral-room");
FloorplanShapes.CathedralRoom.prototype.constructor = FloorplanShapes.CathedralRoom;

FloorplanShapes.CathedralRoom.prototype.drawRoom = function(ctx, shape, canvas) {
    var gradient = ctx.createLinearGradient(0, -shape.size.width / 2, 0, shape.size.width / 2);
    gradient.addColorStop(0, FloorplanShapes.DEFAULT_FILL_STYLE);
    gradient.addColorStop(0.5, FloorplanShapes.VAULTED_FILL_STYLE);
    gradient.addColorStop(1, FloorplanShapes.DEFAULT_FILL_STYLE);
    ctx.fillStyle = gradient;

    ctx.fillRect(-shape.size.length / 2, -shape.size.width / 2, shape.size.length, shape.size.width);
    ctx.strokeRect(-shape.size.length / 2, -shape.size.width / 2, shape.size.length, shape.size.width);
};


/**
 * An L-shaped room.  Required properties:
 *
 *     - id:         The shape ID
 *     - type:       "l-shaped-room"
 *     - center:     The center point of the shape (contains x and y properties)
 *     - size:       The length (horizontal) and width (vertical) of the shape
 *     - cornerSize: The length (horizontal) and width (vertical) of the missing corner
 *     - rotation:   The rotation of the shape, in degrees
 */
FloorplanShapes.LShapedRoom = function() {};
FloorplanShapes.LShapedRoom.prototype = new FloorplanShapes.GenericRoom("l-shaped-room");
FloorplanShapes.LShapedRoom.prototype.constructor = FloorplanShapes.LShapedRoom;

FloorplanShapes.LShapedRoom.prototype.drawRoom = function(ctx, shape, canvas) {
    ctx.fillStyle = FloorplanShapes.DEFAULT_FILL_STYLE;
    ctx.beginPath();
    ctx.moveTo(-shape.size.length / 2, -shape.size.width / 2);
    ctx.lineTo(shape.size.length / 2 - shape.cornerSize.length, -shape.size.width / 2);
    ctx.lineTo(shape.size.length / 2 - shape.cornerSize.length, -shape.size.width / 2 + shape.cornerSize.width);
    ctx.lineTo(shape.size.length / 2, -shape.size.width / 2 + shape.cornerSize.width);
    ctx.lineTo(shape.size.length / 2, shape.size.width / 2);
    ctx.lineTo(-shape.size.length / 2, shape.size.width / 2);
    ctx.lineTo(-shape.size.length / 2, -shape.size.width / 2);
    ctx.fill();
    ctx.stroke();
};

// End container for "use strict"
})();