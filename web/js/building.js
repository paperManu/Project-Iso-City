// Copyright (C) 2013 Emmanuel Durand
//
// Class Building, base class of all buildings

/*************/
function Building() {
    THREE.Object3D.call(this);

    // Constants
    this.baseSize = cBaseElementSize;
    this.baseObjectSize = cBaseElementSize;

    // Attributes
    this.size = [1, 1, 1]; // Size of the bloc in units

    this.geometry = new THREE.CubeGeometry(cBaseElementSize,
                                           cBaseElementSize,
                                           cBaseElementSize);
    this.material = new THREE.MeshLambertMaterial({color: 0x444444});

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.add(this.mesh);
    this.mesh.position.set(0, cBaseElementSize * this.size[1] * 0.5, 0);
}

Building.prototype = Object.create(THREE.Object3D.prototype);
Building.prototype.constructor = Building;

/*************/
Building.prototype.setSize = function(h, w, d) {
    if (h >= 1 && w >= 1 && d >= 1)
    {
        this.size = [w, h, d];
        this.mesh.scale.x = w;
        this.mesh.scale.y = h;
        this.mesh.scale.z = d;

        this.mesh.position.x = this.mesh.scale.x * this.baseSize * 0.5;
        this.mesh.position.y = Math.max(this.mesh.position.y,
                                        this.baseSize * this.size[1] * 0.5);
        this.mesh.position.z = this.mesh.scale.z * this.baseSize * 0.5;
    }
}

/*************/
Building.prototype.getSize = function() {
    return this.size;
}

/*************/
Building.prototype.setPosition = function(x, y, z) {
    this.position.x = x * this.baseSize;
    this.position.y = y * this.baseSize;
    this.position.z = z * this.baseSize;
}