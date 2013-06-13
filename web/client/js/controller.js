// Copyright (C) 2013 Emmanuel Durand
//
// Class Controller, to add dat.gui control to the scene

/*************/
function Controller() {
    THREE.Object3D.call(this);
    var that = this;

    // Attributes
    this.gui = new dat.GUI();
    this.selectedObject = undefined;
    this.meshPath = '';

    // Private attributes
    var camera = undefined;
    var cameraRatio = 1.0;
    var cameraDirty = true
    var cameraRotationMatrix = undefined;
    var cameraGroundProjectionMatrix = undefined;

    var lastMousePosition = THREE.Vector3(0, 0, 0);

    // Private methods
    /*********/
    function initializeCamera() {
        cameraRotationMatrix = new THREE.Matrix4();
        cameraRotationMatrix.extractRotation(camera.matrixWorld);

        var n = new THREE.Vector3(0, 0, -1);
        n = n.applyMatrix4(cameraRotationMatrix);
        var np = new THREE.Vector3(0, 1, 0);
        cameraGroundProjectionMatrix = new THREE.Matrix3();
        cameraGroundProjectionMatrix.set(n.y, -n.x, 0,
                    0, 0, 0,
                    0, -n.z, n.y);
        cameraGroundProjectionMatrix.multiplyScalar(1 / n.dot(np));

        cameraDirty = false;
    }

    /*********/
    function convertMouseToRect(v) {
        var fov = camera.right;
        var ratio = _width / _height;
        var m = new THREE.Vector3(((v.x / _width) * 2 - 1) * fov,
                                  (-(v.y / _height) * 2 + 1) * fov / cameraRatio,
                                  0.0);
        return m;
    }

    /*********/
    function drawGrid() {
        if (that.selectedObject === undefined)
            return;

        var size = that.selectedObject.parent.gridSize;
        var width = that.selectedObject.parent.width;
        var height = that.selectedObject.parent.height;
        var posX = that.selectedObject.parent.position.x;
        var posZ = that.selectedObject.parent.position.z;

        var geometry = new THREE.Geometry();

        for (var i = 0; i <= width; i++) {
            geometry.vertices.push(new THREE.Vector3(posX, 0, posZ + i * size));
            geometry.vertices.push(new THREE.Vector3(posX + size * height, 0, posZ + i * size));
        }
        for (var i = 0; i <= height; i++) {
            geometry.vertices.push(new THREE.Vector3(posX + i * size, 0, posZ));
            geometry.vertices.push(new THREE.Vector3(posX + i * size, 0, posZ + width * size));
        }

        var mat = new THREE.LineBasicMaterial({color: 0x222222, opacity: 0.5});
        var line = new THREE.Line(geometry, mat);
        line.type = THREE.LinePieces;
        line.name = "lineGrid";
        that.parent.add(line);
    }

    // Public methods
    /*********/
    this.addBloc = function() {
        this.reset();

        if (cameraDirty === true)
            initializeCamera();

        var position = camera.position.clone();
        var target = position.clone();
        target.applyMatrix3(cameraGroundProjectionMatrix);

        var bloc = new Grid(4, 4, 4);
        bloc.setDefaultMesh();
        var building = new Item(cBlocGridSize);
        building.setDefaultMesh(4);
        bloc.addObject(building, 0, 0);

        var city = this.parent.getObjectByName("city");
        var x = Math.abs(Math.floor(target.x / city.gridSize));
        var y = Math.abs(Math.floor(target.z / city.gridSize));

        var isPlaced = false;
        var maxDistance = 2;
        var xsign = 1;
        var xstep = 1;
        for (var i = x; i < city.width && i >= 0 && Math.abs(x - i) <= maxDistance; i += xstep*xsign, xstep += 1, xsign *= -1) {
            if (isPlaced)
                break;
            var ysign = 1;
            var ystep = 1;
            for (var j = y; j < city.height && j >= 0 && Math.abs(y - j) <= maxDistance; j += ystep*ysign, ystep += 1, ysign *= -1) {
                if (isPlaced)
                    break;
                if (city.addObject(bloc, i, j))
                    isPlaced = true;
            }
        }

        if (isPlaced === true) {
            this.setSelect();
            this.setSelectedObject(bloc);
            drawGrid();
        }
    }

    /*********/
    this.addItem = function() {
        //this.reset();
        if (this.selectedObject === undefined)
            return;
        if (this.selectedObject.type != "Grid")
            return;

        var grid = this.selectedObject;
        var building = new Item(cBlocGridSize);
        building.setDefaultMesh(4);

        var isPlaced = false;
        for (var i = 0; i < grid.width; i++) {
            if (isPlaced)
                break;

            for (var j = 0; j < grid.height; j++) {
                if (isPlaced)
                    break;
                if (grid.addObject(building, i, j)) {
                    isPlaced = true;
                    drawGrid();
                }
            }
        }
    }

    /*********/
    this.delete = function() {
        if (this.selectedObject === undefined)
            return;

        var obj = this.selectedObject;
        obj.parent.removeObject(obj);

        this.reset();
    }

    /**********/
    this.loadMesh = function() {
        if (this.selectedObject === undefined)
            return;

        if (this.meshPath === '') {
            this.selectedObject.setDefaultMesh();
            return;
        }

        var loader = new THREE.JSONLoader(true);
        loader.load(this.meshPath, function(geometry, material) {
            var mat = new THREE.MeshFaceMaterial(material)
            var mesh = new THREE.Mesh(geometry, mat);
            that.selectedObject.setMesh(mesh);
        });
    }

    /**********/
    this.setCamera = function(c, r) {
        camera = c;
        cameraRatio = r;
        cameraDirty = true;
    }

    /**********/
    this.setSelectedObject = function(object) {
        this.selectedObject = object;
        if (this.selectedObject) {
            this.setXCb.setValue(object.position.x / object.parent.gridSize);
            this.setYCb.setValue(object.position.y / object.parent.gridSize);
            this.setZCb.setValue(object.position.z / object.parent.gridSize);

            this.selectedObject.select();
        }
    }

    /*********/
    this.unsetSelectedObject = function() {
        if (this.selectedObject != undefined) {
            this.selectedObject.release();
        }

        var line = this.parent.getObjectByName("lineGrid");
        if (line != undefined)
            this.parent.remove(line);

        this.selectedObject = undefined;
        this.setXCb.setValue(0);
        this.setYCb.setValue(0);
        this.setZCb.setValue(0);
    }

    // dat.gui definition
    /*********/
    this.proxy = function(properties) {
        var controller = this;
        var target = controller;
        for (var i = 0; i < properties.length - 1; i++)
            target = target[properties[i]];

        var last = properties[properties.length - 1];

        var cb = this.gui.add(target, last).onChange(function(v) {
            var object = controller.selectedObject;
            if (object != undefined) {
                var parent = object.parent;
                parent.setObjectProperty(object, properties, v);
            }
        });
        return cb;
    }

    this.setXCb = this.proxy(['position', 'x']);
    this.setYCb = this.proxy(['position', 'y']);
    this.setZCb = this.proxy(['position', 'z']);
    var commandFolder = this.gui.addFolder('Commands');
    commandFolder.add(this, 'addBloc');
    commandFolder.add(this, 'addItem');
    commandFolder.add(this, 'delete');
    var loadFolder = this.gui.addFolder('Load mesh');
    loadFolder.add(this, 'meshPath');
    loadFolder.add(this, 'loadMesh');

    // UI callbacks
    /*********/
    $(document).mousewheel(function(event, delta, deltaX, deltaY) {
        var fov = camera.right - cMousewheelSpeed * delta;
        fov = fov < cMinFOV ? cMinFOV : fov;
        fov = fov > cMaxFOV ? cMaxFOV : fov;
        camera.left = -fov;
        camera.right = fov;
        camera.top= fov/cameraRatio;
        camera.bottom = -fov/cameraRatio;
        camera.updateProjectionMatrix();
        cameraDirty = true;
    });

    // State machine callbacks
    /*********/
    this.onidle = function(event, from, to, v) {
        if (from === 'moveOrDeselect' || from === 'select') {
            this.unsetSelectedObject();
        }
    }

    /*********/
    this.onselect = function(event, from, to, v) {
        if (from === 'moveObject') {
            this.selectedObject.ungrab();
            return;
        }

        if (cameraDirty === true)
            initializeCamera();

        v = convertMouseToRect(v);
        var projector = new THREE.Projector();
        v = v.applyMatrix4(cameraRotationMatrix);
        var n = new THREE.Vector3(0, 0, -1);
        n = n.applyMatrix4(cameraRotationMatrix);
        var position = v.clone();
        position.add(camera.position);
        var rayCaster = new THREE.Raycaster(position, n.normalize(), 10, 10000);
        var intersects = rayCaster.intersectObject(_scene, true);

        if (intersects.length > 0) {
            var obj = this.parent.getObjectById(intersects[0].object.id, true);
            this.setSelectedObject(obj.parent);
            drawGrid();
        }
        else {
            this.reset();
        }
    }

    /*********/
    this.ongrabMove = function(event, from, to, v) {
        //lastMousePosition = v;
        lastMousePosition = convertMouseToRect(v);
    }

    /*********/
    this.onmouseMove = function(event, from, to, v) {
        if (cameraDirty === true)
            initializeCamera();

        var movement = convertMouseToRect(v);
        movement.sub(lastMousePosition);
        lastMousePosition = convertMouseToRect(v);

        if (this.current === 'grabMove') {
            var projected = movement.clone();
            projected.applyMatrix4(cameraRotationMatrix);
            projected.applyMatrix3(cameraGroundProjectionMatrix);
            camera.position.sub(projected);
        }
        else if (this.current === 'moveObject') {
            var projected = movement.clone();
            projected.applyMatrix4(cameraRotationMatrix);
            projected.applyMatrix3(cameraGroundProjectionMatrix);
            this.selectedObject.mouseMove(projected);
        }
    }

    /*********/
    this.onmoveObject = function(event, from, to, v) {
        lastMousePosition = convertMouseToRect(v);
        this.selectedObject.grab();
    }

    // State machine startup
    this.startup();
}

Controller.prototype = Object.create(THREE.Object3D.prototype);
Controller.prototype.constructor = Controller;

/*************/
StateMachine.create({
    target: Controller.prototype,
    error: function(event, from, to, args, errorCode, errorMessage) {
    },
    events: [
        {name: 'startup',        from: 'none',          to: 'idle'},
        {name: 'lMousePressed',  from: 'idle',          to: 'grabOrSelect'},
        {name: 'lMousePressed',  from: 'select',        to: 'moveOrDeselect'},
        {name: 'lMouseReleased', from: 'idle',          to: 'idle'},
        {name: 'lMouseReleased', from: 'grabOrSelect',  to: 'select'},
        {name: 'lMouseReleased', from: 'select',        to: 'select'},
        {name: 'lMouseReleased', from: 'grabMove',      to: 'idle'},
        {name: 'lMouseReleased', from: 'moveOrDeselect',to: 'idle'},
        {name: 'lMouseReleased', from: 'moveObject',    to: 'select'},
        {name: 'mouseMove',      from: 'grabOrSelect',  to: 'grabMove'},
        {name: 'mouseMove',      from: 'grabMove',      to: 'grabMove'},
        {name: 'mouseMove',      from: 'moveOrDeselect',to: 'moveObject'},
        {name: 'mouseMove',      from: 'moveObject',    to: 'moveObject'},
        {name: 'reset',          from: 'select',        to: 'idle'},
        {name: 'setSelect',      from: 'idle',          to: 'select'}
    ]
});