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

    // Private attributes
    var camera = undefined;
    var cameraRotationMatrix = undefined;
    var cameraGroundProjectionMatrix = undefined;
    lastMousePosition = THREE.Vector3(0, 0, 0);

    // Private methods
    /*********/
    function initializeCamera() {
        camera = that.parent.getObjectByName("Camera", true);
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
    }

    // Public methods
    /*********/
    this.addBloc = function() {
        this.reset();

        if (camera === undefined)
            initializeCamera();

        var position = camera.position.clone();
        var target = position.clone();
        target.applyMatrix3(cameraGroundProjectionMatrix);

        var bloc = new Grid(4, 4, 4);
        bloc.setDefaultMesh();
        var building = new Item();
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
        var building = new Item();
        building.setDefaultMesh(4);

        var isPlaced = false;
        for (var i = 0; i < grid.width; i++) {
            if (isPlaced)
                break;

            for (var j = 0; j < grid.height; j++) {
                if (isPlaced)
                    break;
                if (grid.addObject(building, i, j))
                    isPlaced = true;
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
    this.gui.add(this, 'addBloc');
    this.gui.add(this, 'addItem');
    this.gui.add(this, 'delete');

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

        this.selectedObject = undefined;
        this.setXCb.setValue(0);
        this.setYCb.setValue(0);
        this.setZCb.setValue(0);
    }

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

        if (camera === undefined)
            initalizeCamera();

        var projector = new THREE.Projector();
        var rotMat = new THREE.Matrix4();
        rotMat.extractRotation(camera.matrixWorld);
        v = v.applyMatrix4(rotMat);
        var n = new THREE.Vector3(0, 0, -1);
        n = n.applyMatrix4(rotMat);
        var position = v.clone();
        position.add(camera.position);
        var rayCaster = new THREE.Raycaster(position, n.normalize(), 10, 1000);
        var intersects = rayCaster.intersectObject(_scene, true);

        if (intersects.length > 0) {
            var obj = this.parent.getObjectById(intersects[0].object.id, true);
            this.setSelectedObject(obj.parent);
        }
        else {
            this.reset();
        }
    }

    /*********/
    this.ongrabMove = function(event, from, to, v) {
        lastMousePosition = v;
    }

    /*********/
    this.onmouseMove = function(event, from, to, v) {
        if (camera === undefined)
            initializeCamera();

        var movement = v.clone();
        movement.sub(lastMousePosition);
        lastMousePosition = v;

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
        lastMousePosition = v;
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