// Copyright (C) 2013 Emmanuel Durand
//
// Class Grid, an Object3D which Blocs as children

/*************/
function Grid(w, h) {
    THREE.Object3D.call(this);

    // Constants
    this.baseSize = cBaseBlocSize;

    // Attributes
    this.width = Math.max(1, w);
    this.height = Math.max(1, h);

    this.grid = new ArrayBuffer(w * h);
    this.bytes = new Uint8Array(this.grid);
    for (var i = 0; i < this.bytes.length; i++) {
        this.bytes[i] = 0;
    }
}

Grid.prototype = Object.create(THREE.Object3D.prototype);
Grid.prototype.constructor = Grid;

/*************/
Grid.prototype.add = function(object, x, y) {
    if (object === undefined)
        return false;

    if (x === undefined)
        x = 0;
    if (y === undefined)
        y = 0;

    // Check that there is room for this bloc
    size = object.getSize();
    if (x + size[0] > this.width || y + size[1] > this.height)
        return false;

    var isRoom = true;
    for (var i = x; i < x + size[0]; i++) {
        for (var j = y; j < y + size[1]; j++) {
            if (this.bytes[i + j * this.width] > 0) {
                isRoom = false;
            }
        }
    }

    if (isRoom === true) {
        THREE.Object3D.prototype.add.call(this, object);
        object.position.x = x * this.baseSize;
        object.position.y = 0;
        object.position.z = y * this.baseSize;

        for (var i = x; i < x + size[0] && i < this.width; i++) {
            for (var j = y; j < y + size[1] && j < this.height; j++) {
                this.bytes[i + j * this.width] = 255;
            }
        }

        return true;
    }
    else {
        return false;
    }

}