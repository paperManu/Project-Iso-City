// Copyright (C) 2013 Emmanuel Durand
//
// Class Bloc, base class of all city blocs

/*************/
function Bloc() {
    THREE.Object3D.call(this);

    // Constants
    this.baseSize = cBaseBlocSize;

    this.geometry = new THREE.CubeGeometry(this.baseSize, this.baseSize * 0.5, this.baseSize);
    this.material = new THREE.MeshLambertMaterial({color: 0xBBBBBB});

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.add(this.mesh);
    this.mesh.position.set(this.baseSize * 0.5,
                           -this.baseSize * this.scale.y * 0.25,
                           this.baseSize * 0.5);

    // Attributes
    this.size = [1, 1, 0.5]; // Size of the bloc in units
    this.floor = new THREE.Object3D(); // This object is always located on the floor of the bloc
}

Bloc.prototype = Object.create(THREE.Object3D.prototype);
Bloc.prototype.constructor = Bloc;

/*************/
Bloc.prototype.setSize = function(h, w) {
    if (h >= 1 && w >= 1)
    {
        this.size = [h, w, 0.5];
        this.mesh.scale.x = h;
        this.mesh.scale.z = w;
        this.mesh.scale.y = 0.5;

        this.mesh.position.x = h * this.baseSize * 0.5;
        this.mesh.position.z = w * this.baseSize * 0.5;
    }
}

/*************/
Bloc.prototype.getSize = function() {
    return this.size;
}