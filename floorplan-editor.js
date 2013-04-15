function FloorplanEditor(config) {
    this.init(config);
}

FloorplanEditor.prototype.init = function(config) {
    this.canvas = new FloorplanCanvas(config);
    this.registerDefaultShapeTypes();
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
