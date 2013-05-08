function cos(x) {return Math.cos(x);}
function sin(x) {return Math.sin(x);}

var _renderer, _scene, _camera;
var _height, _width;

/*************/
function createScene() {
    grid = new Grid(4, 4);
    grid.name = "grid";
    _scene.add(grid);

    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            bloc = new Bloc();
            bloc.name = "ground";
            var result = grid.add(bloc, i, j);

            building = new Building();
            building.name = "building";
            bloc.add(building);
            building.setSize(2, 1, 1);
            building.setPosition(j, 0, i);
        }
    }

}

/*************/
var camPosition = new THREE.Vector3(2, 1.5, 2);
var newCamPosition, newCamDirection;
function init() {
    _renderer = new THREE.WebGLRenderer();
    _renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(_renderer.domElement);

    _width = _renderer.domElement.width;
    _height = _renderer.domElement.height

    _scene = new THREE.Scene();

    camDirection = new THREE.Vector3(16, 0, 16);

    var ratio = window.innerWidth / window.innerHeight;
    _camera = new THREE.OrthographicCamera(-cFOV, cFOV, cFOV/ratio, -cFOV/ratio, 1, 1000);
    //_camera = new THREE.PerspectiveCamera(45, _width/_height, 1, 1000);
    _camera.position = camPosition.setLength(100);
    _camera.lookAt(camDirection);

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
}

/*************/
window.onmousedown = function(ev) {
    if (ev.target == _renderer.domElement) {
        var projector = new THREE.Projector();
        sx = ev.clientX;
        sy = ev.clientY;
        //var v = new THREE.Vector3((sx / _width) * 2 - 1, -(sy / _height) * 2 + 1, 0.5);
        //projector.unprojectVector(v, _camera);
        var v = new THREE.Vector3(((sx / _width) * 2 - 1) * cFOV,
                                 (-(sy / _height) * 2 + 1) * cFOV,
                                  0.0);
        var rotMat = new THREE.Matrix4();
        rotMat.extractRotation(_camera.matrixWorld);
        v = v.applyMatrix4(rotMat);
        var n = new THREE.Vector3(0, 0, -1);
        n = n.applyMatrix4(rotMat);
        var position = v.clone();
        position.add(_camera.position);
        var rayCaster = new THREE.Raycaster(position, n.normalize(), 10, 1000);
        var intersects = rayCaster.intersectObject(_scene, true);
        if (intersects.length > 0) {
            var obj = _scene.getObjectById(intersects[0].object.id, true);
            var father = obj.parent;
            father.parent.remove(father);
        }
    }
}

/*************/
function draw() {
    requestAnimationFrame(draw);

    _renderer.render(_scene, _camera);
}

init();
draw();