// Copyright (C) 2013 Emmanuel Durand
//
// Class Grid, used to place items on it

/*************/
function Grid(pGridSize, pWidth, pHeight) {
    THREE.Object3D.call(this);
    var that = this;

    // Attributes
    /**********/
    this.gridSize= pGridSize;
    this.width = Math.max(1, pWidth);
    this.height = Math.max(1, pHeight);

    this.size = [this.width * this.gridSize, this.height * this.gridSize];

    this.grid = new ArrayBuffer(pWidth * pHeight);
    this.gridBytes = new Uint8Array(this.grid);
    for (var i = 0; i < this.gridBytes.length; ++i)
        this.gridBytes[i] = 0;

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
    }
}

Grid.prototype = Object.create(THREE.Object3D.prototype);
Grid.prototype.constructor = Grid;