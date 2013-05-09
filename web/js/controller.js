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
            for (var i = 0; i < properties.length - 1; i++)
                object = object[properties[i]];
            object[last] = v;
        });
        console.log(cb);
        return cb;
    }

    this.setXCb = this.proxy(['position', 'x']).min(-50).max(50);
    console.log(this.setXCb);
    this.setYCb = this.proxy(['position', 'y']).min(-50).max(50);
    this.setZCb = this.proxy(['position', 'z']).min(-50).max(50);
}

Controller.prototype = Object.create(THREE.Object3D.prototype);
Controller.prototype.constructor = Controller;

/**************/
Controller.prototype.setCurrent = function(object) {
    this.current = object;
    if (this.current) {
        this.setXCb.setValue(object.parent.position.x);
        this.setYCb.setValue(object.parent.position.y);
        this.setZCb.setValue(object.parent.position.z);
    }
}
