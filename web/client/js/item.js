// Copyright (C) 2013 Emmanuel Durand
//
// Class Item, representing objects

/*************/
function Item(gridSize) {
    THREE.Object3D.call(this);

    // Attributes
    this.type = "Item";
    this.size = [1, 1];

    // Private attributes
    var _gridSize;
    if (gridSize === undefined)
        _gridSize = 1;
    else
        _gridSize = Math.max(1, Math.floor(gridSize));

    var _position = new THREE.Vector3(0, 0, 0);

    // Public methods
    /**********/
    this.setMesh = function(pMesh) {
        if (pMesh === undefined)
            return;

        if (this.mesh != undefined)
            this.remove(this.mesh);

        pMesh.geometry.computeBoundingBox();
        var bbox = pMesh.geometry.boundingBox;
        this.size[0] = Math.ceil((bbox.max.x - bbox.min.x) / _gridSize) * _gridSize;
        this.size[1] = Math.ceil((bbox.max.z - bbox.min.z) / _gridSize) * _gridSize;
        this.size[2] = Math.ceil((bbox.max.y - bbox.min.y) / _gridSize) * _gridSize;

        this.mesh = pMesh;
        this.add(this.mesh);
    }

    /**********/
    this.setDefaultMesh = function() {
        var width = _gridSize;
        var height = _gridSize * 3;
        var depth = _gridSize;

        var geometry = new THREE.CubeGeometry(width, height, depth);
        var material = new THREE.MeshLambertMaterial({color: 0x444444});
        var mesh = new THREE.Mesh(geometry, material);

        //this.mesh = mesh;
        this.setMesh(mesh);
        this.mesh.position.set(width * 0.5,
                               height * 0.5,
                               depth * 0.5);
    }

    // State machine callbacks
    /*********/
    this.onselect = function(event, from, to) {
        var geometry = new THREE.CubeGeometry(this.size[0] + 1,
                                              this.size[2] + 1,
                                              this.size[1] + 1);
        var material = new THREE.MeshLambertMaterial({color: 0xAA6600,
                                                      wireframe: true,
                                                      wireframeLinewidth: 2.0,
                                                      emissive: 0xAA6600});
        var halo = new THREE.Mesh(geometry, material);
        halo.position.set(this.size[0]/2, this.size[2]/2 + 0.5, this.size[1]/2);
        halo.name = "selectionHalo";

        this.add(halo);
    }

    /*********/
    this.onrelease = function(event, from, to) {
        var halo = this.getObjectByName("selectionHalo");
        this.remove(halo);
    }

    /*********/
    this.ongrab = function(event, from, to) {
        _position = this.position.clone();
    }

    /*********/
    this.onungrab = function(event, from, to) {
        var newPosition = this.position.clone();
        newPosition.x += this.size[0] / 2;
        newPosition.z += this.size[1] / 2;
        this.position.copy(_position);
        this.parent.setObjectProperty(this, ['absolutePositionVector'], newPosition);
    }

    /*********/
    this.onmouseMove = function(event, from, to, v) {
        this.translateX(v.x);
        this.translateY(v.y);
        this.translateZ(v.z);
    }

    // State machine startup
    this.startup();
}

Item.prototype = Object.create(THREE.Object3D.prototype);
Item.prototype.constructor = Item;

/*************/
StateMachine.create({
    target: Item.prototype,
    events: [
        {name: 'startup',   from: 'none',       to: 'idle'},
        {name: 'select',    from: 'idle',       to: 'selected'},
        {name: 'grab',      from: 'selected',   to: 'moveAround'},
        {name: 'mouseMove', from: 'moveAround', to: 'moveAround'},
        {name: 'ungrab',    from: 'moveAround', to: 'selected'},
        {name: 'release',   from: 'selected',   to: 'idle'}
    ]
});