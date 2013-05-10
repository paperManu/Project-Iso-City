// Copyright (C) 2013 Emmanuel Durand
//
// Class Bloc, base class of all city blocs

/*************/
function Bloc() {
    Grid.call(this, 16, 16, cBaseElementSize);

    this.baseObjectSize = cBaseBlocSize;

    this.geometry = new THREE.CubeGeometry(cBaseBlocSize, cBaseBlocSize * 0.5, cBaseBlocSize);
    this.material = new THREE.MeshLambertMaterial({color: 0xBBBBBB});

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.addBaseMesh(this.mesh);
    this.mesh.position.set(cBaseBlocSize * 0.5,
                           -cBaseBlocSize * this.scale.y * 0.25,
                           cBaseBlocSize * 0.5);

    // Attributes
    this.size = [1, 1, 0.5]; // Size of the bloc in units
    // We adapt the grid size to match the given size
    this.width = Math.floor(this.size[0] * cBaseBlocSize / cBaseElementSize);
    this.height = Math.floor(this.size[1] * cBaseBlocSize / cBaseElementSize);
}

Bloc.prototype = Object.create(Grid.prototype);
Bloc.prototype.constructor = Bloc;

/*************/
Bloc.prototype.setSize = function(h, w) {
    if (h >= 1 && w >= 1)
    {
        this.size = [h, w, 0.5];
        this.mesh.scale.x = h;
        this.mesh.scale.z = w;
        this.mesh.scale.y = 0.5;

        this.mesh.position.x = h * cBaseBlocSize * 0.5;
        this.mesh.position.z = w * cBaseBlocSize * 0.5;

        this.width = Math.floor(this.size[0] * cBaseBlocSize / cBaseElementSize);
        this.height = Math.floor(this.size[1] * cBaseBlocSize / cBaseElementSize);
    }
}

/*************/
Bloc.prototype.getSize = function() {
    return this.size;
}
