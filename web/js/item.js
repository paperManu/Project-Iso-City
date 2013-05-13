// Copyright (C) 2013 Emmanuel Durand
//
// Class Item, representing objects

/*************/
function Item() {
    THREE.Object3D.call(this);

    // Attributes
    this.size = [1, 1];
}

Item.prototype = Object.create(THREE.Object3D.prototype);
Item.prototype.constructor = Item;

/*************/
Item.prototype.setMesh = function(pMesh, pSize) {
    if (pMesh === undefined)
        return;

    if (pSize.length === 2) {
        this.size[0] = pSize[0];
        this.size[1] = pSize[1];
    }

    if (this.mesh != undefined)
        this.remove(this.mesh);

    this.mesh = pMesh;
    this.add(this.mesh);
}

/*************/
Item.prototype.setDefaultMesh = function(gridSize) {
    gridSize = Math.max(1, gridSize);

    var width = gridSize;
    var height = gridSize * 3;
    var depth = gridSize;

    var geometry = new THREE.CubeGeometry(width, height, depth);
    var material = new THREE.MeshLambertMaterial({color: 0x444444});
    var mesh = new THREE.Mesh(geometry, material);

    this.mesh = mesh;
    this.setMesh(mesh, [width, depth]);
    this.mesh.position.set(width * 0.5,
                           height * 0.5,
                           depth * 0.5);
}