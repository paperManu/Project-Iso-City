// Copyright (C) 2013 Emmanuel Durand
//
// Class Controller, to add dat.gui control to the scene

/*************/
function Controller() {
    THREE.Object3D.call(this);

    // Attributes
    this.gui = new dat.GUI();
    this.current = undefined;

    // Some methods
    this.proxy = function(properties) {
        var controller = this;
        var target = controller;
        for (var i = 0; i < properties.length - 1; i++)
            target = target[properties[i]];

        var last = properties[properties.length - 1];

        var cb = this.gui.add(target, last).onChange(function(v) {
            var object = controller.current;
            var parent = object.parent;
            parent.setChildProperty(object, properties, v);
        });
        return cb;
    }

    this.setXCb = this.proxy(['position', 'x']);
    this.setYCb = this.proxy(['position', 'y']);
    this.setZCb = this.proxy(['position', 'z']);
}

Controller.prototype = Object.create(THREE.Object3D.prototype);
Controller.prototype.constructor = Controller;

/**************/
Controller.prototype.setCurrent = function(object) {
    this.current = object.parent;
    if (this.current) {
        this.setXCb.setValue(object.parent.position.x / object.parent.baseObjectSize);
        this.setYCb.setValue(object.parent.position.y / object.parent.baseObjectSize);
        this.setZCb.setValue(object.parent.position.z / object.parent.baseObjectSize);
    }
}