// Copyright (C) 2013 Emmanuel Durand
//
// Class MeshDb, containing all meshes in the scene

/*************/
function MeshDb() {
    THREE.Object3D.call(this);

    var meshes = [];

    // Public methods
    /*********/
    this.loadMesh = function(file, name) {
    }

    /*********/
    this.unloadMesh = function(name) {
    }

    /*********/
    this.getMesh = function(name) {
    }

    /*********/
    this.getMeshes = function() {
        return this.meshes;
    }
}

MeshDb.prototype = Object.create(THREE.Object3D.prototype);
MeshDb.prototype.constructor = MeshDb;