// Copyright (C) 2013 Emmanuel Durand
//
// Main file

/*************/
// Socket.io related
var socket = io.connect();

/*************/
// Three.js related
var _renderer, _scene, _camera, _controller;
var _height, _width;
var _stats;

/*************/
function createScene() {
    var grid = new Grid(cCityGridSize, 32, 32);
    grid.name = "city";
    _scene.add(grid);

    var bloc = new Grid(4, 4, 4);
    bloc.setDefaultMesh();
    grid.addObject(bloc, 0, 0);

    var building = new Item(cBlocGridSize);
    building.setDefaultMesh();
    bloc.addObject(building, 0, 0);
}

/*************/
var camPosition = new THREE.Vector3(2, 1.5, 2);
var newCamPosition, newCamDirection;
function init() {
    _stats = new Stats();
    _stats.domElement.style.position = 'absolute';
    _stats.domElement.style.left = '0px';
    _stats.domElement.style.top = '0px';
    document.body.appendChild(_stats.domElement);

    _renderer = new THREE.WebGLRenderer();
    _renderer.setSize(window.innerWidth - 32, window.innerHeight - 32);

    document.body.appendChild(_renderer.domElement);

    _width = window.innerWidth;
    _height = window.innerHeight;

    _scene = new THREE.Scene();
    _scene.type = "Scene";

    camDirection = new THREE.Vector3(16, 0, 16);

    var ratio = _width / _height;
    _camera = new THREE.OrthographicCamera(-cFOV, cFOV, cFOV/ratio, -cFOV/ratio, 1, 10000);
    _camera.name = "Camera";
    _camera.position = camPosition.setLength(1000);
    _camera.lookAt(camDirection);
    _scene.add(_camera);

    newCamPosition = camPosition.clone();
    newCamDirection = camDirection.clone();

    createScene();

    var ambientLight = new THREE.AmbientLight(0x222222);
    var pointLight = new THREE.PointLight(0xBBBBBB);
    pointLight.position.x = 750;
    pointLight.position.y = 1000;
    pointLight.position.z = 500;
    _scene.add(ambientLight);
    _scene.add(pointLight);

    _controller = new Controller();
    _scene.add(_controller);
    _controller.setCamera(_camera, ratio);
}

/*************/
window.onmousedown = function(ev) {
    if (ev.target == _renderer.domElement) {
        var sx = ev.clientX;
        var sy = ev.clientY;
        var v = new THREE.Vector3(sx, sy, 0);

        _controller.lMousePressed(v);
    }
}

/*************/
window.onmouseup = function(ev) {
    var sx = ev.clientX;
    var sy = ev.clientY;
    var v = new THREE.Vector3(sx, sy, 0);

    _controller.lMouseReleased(v);
}

/*************/
window.onmousemove = function(ev) {
    var sx = ev.clientX;
    var sy = ev.clientY;
    var v = new THREE.Vector3(sx, sy, 0);

    _controller.mouseMove(v);
}

/*************/
function draw() {
    _stats.begin();
    requestAnimationFrame(draw);
    _renderer.render(_scene, _camera);
    _stats.end();
    //console.log("state:", _controller.current);
}

$(document).ready(function() {
    init();
    draw();
})