// Copyright (C) 2013 Emmanuel Durand
//
// Class Grid, used to place items on it

/*************/
function Grid(pGridSize, pWidth, pHeight) {
    THREE.Object3D.call(this);
    var that = this;

    // Attributes
    /**********/
    this.type = "Grid";
    this.gridSize = pGridSize;
    this.width = Math.max(1, pWidth);
    this.height = Math.max(1, pHeight);

    this.size = [this.width * this.gridSize, this.height * this.gridSize];

    this.grid = new ArrayBuffer(pWidth * pHeight);
    this.gridBytes = new Uint8Array(this.grid);
    for (var i = 0; i < this.gridBytes.length; ++i)
        this.gridBytes[i] = 0;

    // Private attributes
    _meshPosition = new THREE.Vector3(0, 0, 0);

    // Private methods
    /**********/
    function checkRoom(x, y, size) {
        if (x === undefined || y === undefined || size === undefined)
            return false;

        if (x + size.x > that.width || y + size.z > that.height)
            return false;

        var isRoom = true;
        for (var i = x; i < x + size.x; i++)
            for (var j = y; j < y + size.z; j++)
                if (that.gridBytes[i + j * that.width] > 0)
                    isRoom = false;

                return isRoom
    }

    /**********/
    function releaseRoom(x, y, size) {
        if (x === undefined || y === undefined || size === undefined)
            return false;

        for (var i = x; i < x + size.x && i < that.width; i++)
            for (var j = y; j < y + size.z && j < that.height; j++)
                that.gridBytes[i + j * that.width] = 0;

        return true;
    }

    /**********/
    function occupyRoom(x, y, size) {
        if (x === undefined || y === undefined || size === undefined)
            return false;

        for (var i = x; i < x + size.x && i < that.width; i++)
            for (var j = y; j < y + size.z && j < that.height; j++)
                that.gridBytes[i + j * that.width] = 255;

        return true;
    }

    // Public methods
    /**********/
    this.setMesh = function(pMesh) {
        if (pMesh === undefined)
            return;

        if (this.mesh != undefined)
            this.remove(this.mesh);
        else
            this.mesh = undefined;

        this.mesh = pMesh;
        this.add(this.mesh);
    }

    /**********/
    this.setDefaultMesh = function() {
        var width = this.gridSize * this.width;
        var height = this.gridSize * this.height;

        var geometry = new THREE.CubeGeometry(width, this.gridSize, height);
        var material = new THREE.MeshLambertMaterial({color: 0xBBBBBB});
        var mesh = new THREE.Mesh(geometry, material);

        this.setMesh(mesh);
        this.mesh.position.set(this.size[0] * 0.5,
                               -this.gridSize * 0.5,
                               this.size[1] * 0.5);
    }

    /**********/
    this.addObject = function(pObject, x, y) {
        if (pObject === undefined)
            return;

        if (x === undefined)
            x = 0;
        if (y === undefined)
            y = 0;

        // Check that there is room for this block
        var size = Object;
        size.x = pObject.size[0] / this.gridSize;
        size.z = pObject.size[1] / this.gridSize;
        if (!checkRoom(x, y, size))
            return false

        THREE.Object3D.prototype.add.call(this, pObject);
        pObject.position.x = x * this.gridSize;
        pObject.position.y = 0;
        pObject.position.z = y * this.gridSize;
        occupyRoom(x, y, size);

        return true;
    }

    /**********/
    this.removeObject = function(pObject) {
        if (pObject === undefined)
            return false;

        var obj = this.getObjectById(pObject.id);
        if (obj === undefined)
            return false;

        var position = obj.position.clone();
        var size = new THREE.Vector3(0, 0, 0);
        size.x = obj.size[0] / this.gridSize;
        size.z = obj.size[1] / this.gridSize;
        position.x = position.x / this.gridSize;
        position.z = position.z / this.gridSize;

        this.remove(obj);
        releaseRoom(position.x, position.z, size);
    }

    /**********/
    this.setObjectProperty = function(pObject, pPropChain, value) {
        if (pObject === undefined || pPropChain === undefined)
            return false;

        var child = this.getObjectById(pObject.id);

        if (pPropChain[0] === 'position') {
            var axis = pPropChain[1];
            var size = new Object();
            var maxValue, x, y;

            size.x = Math.ceil(pObject.size[0] / this.gridSize);
            size.y = -1;
            size.z = Math.ceil(pObject.size[1] / this.gridSize);

            if (axis === 'x') {
                x = value;
                y = pObject.position.z / this.gridSize;
                maxValue = this.width;
            }
            else if (axis === 'z') {
                y = value;
                x = pObject.position.x / this.gridSize;
                maxValue = this.height;
            }
            else {
                x = pObject.position.x / this.gridSize;
                y = pObject.position.z / this.gridSize;
                maxValue = undefined;
            }

            if (value + size[axis] > maxValue || value < 0)
                return false;

            // Check that there is room for the object
            releaseRoom(Math.floor(pObject.position.x / this.gridSize),
                        Math.floor(pObject.position.z / this.gridSize),
                        size);

            if (!checkRoom(x, y, size))
                return false;

            occupyRoom(x, y, size);

            pObject['position'][axis] = value * this.gridSize;
        }
        else if (pPropChain[0] === 'absolutePositionVector') {
            var size = new Object();
            size.x = Math.ceil(pObject.size[0] / this.gridSize);
            size.y = -1;
            size.z = Math.ceil(pObject.size[1] / this.gridSize);

            var x, y;
            x = Math.floor(value.x / this.gridSize);
            y = Math.floor(value.z / this.gridSize);

            if (x + size.x > this.width || x < 0)
                return false;
            if (y + size.z > this.width || y < 0)
                return false;

            if (!checkRoom(x, y, size))
                return false;

            releaseRoom(Math.floor(pObject.position.x / this.gridSize),
                        Math.floor(pObject.position.z / this.gridSize),
                        size);

            occupyRoom(x, y, size);
            pObject.position.x = x * this.gridSize;
            pObject.position.z = y * this.gridSize;
        }
    }

    // State machine callbacks
    /*********/
    this.onselect = function(event, from, to) {
        var geometry = new THREE.CubeGeometry(this.size[0] + 1,
                                              this.gridSize + 1,
                                              this.size[1] + 1);
        var material = new THREE.MeshLambertMaterial({color: 0xAA6600,
                                                      wireframe: true,
                                                      wireframeLinewidth: 2.0,
                                                      emissive: 0xAA6600});
        var halo = new THREE.Mesh(geometry, material);
        halo.position.set(this.size[0]/2, -this.gridSize/2, this.size[1]/2);
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

Grid.prototype = Object.create(THREE.Object3D.prototype);
Grid.prototype.constructor = Grid;

/*************/
StateMachine.create({
    target: Grid.prototype,
    events: [
        {name: 'startup',   from: 'none',       to: 'idle'},
        {name: 'select',    from: 'idle',       to: 'selected'},
        {name: 'grab',      from: 'selected',   to: 'moveAround'},
        {name: 'mouseMove', from: 'moveAround', to: 'moveAround'},
        {name: 'ungrab',    from: 'moveAround', to: 'selected'},
        {name: 'release',   from: 'selected',   to: 'idle'}
    ]
});