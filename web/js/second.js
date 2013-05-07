function cos(x) {return Math.cos(x);}
function sin(x) {return Math.sin(x);}

var _renderer, _scene, _camera;

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
    _scene = new THREE.Scene();

    camDirection = new THREE.Vector3(16, 0, 16);

    var ratio = window.innerWidth / window.innerHeight;
    _camera = new THREE.OrthographicCamera(-50, 50, 50/ratio, -50/ratio, 1, 1000);
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

    _renderer = new THREE.WebGLRenderer();
    _renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(_renderer.domElement);
}

/*************/
function draw() {
    requestAnimationFrame(draw);

    _renderer.render(_scene, _camera);
}

init();
grid = _scene.getChildByName("grid", false);
draw();