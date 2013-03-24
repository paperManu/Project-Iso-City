function cos(x) {return Math.cos(x);}
function sin(x) {return Math.sin(x);}

var camera, scene, renderer;
var meshes = [];

var gui = new dat.GUI();
var folders = [];

/*************/
var datMesh = function()
{
    // Attributes
    this.size = 1;
    this.geometry = new THREE.CubeGeometry(this.size, this.size, this.size);
    this.material = new THREE.MeshLambertMaterial({color: 0xBBBBBB});
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.scaleX = 50;
    this.scaleY = 50;
    this.scaleZ = 50;
    this.posX = 0;
    this.posY = 0;
    this.posZ = 0;
    this.col = [255, 255, 255];

    this.checkPos = true;
    var folderID;

    // Methods
    this.remove = function()
    {
        scene.remove(this.mesh);
    }

    this.gui = function(i)
    {
        folderID = i;
        var folder = folders[i];

        folder.add(this, 'scaleX', 1.0, 100.0, 1.0).step(1.0);
        folder.add(this, 'scaleY', 1.0, 100.0, 1.0).step(1.0);
        folder.add(this, 'scaleZ', 1.0, 100.0, 1.0).step(1.0);

        folder.add(this, 'posX', -50.0, 50.0, 1.0).step(1.0);
        folder.add(this, 'posY', 0.0, 50.0, 1.0).step(1.0);
        folder.add(this, 'posZ', -50.0, 50.0, 1.0).step(1.0);

        folder.addColor(this, 'col');

        folder.add(this, 'remove');
    }

    this.update = function()
    {
        this.mesh.scale.x = this.scaleX;
        this.mesh.scale.y = this.scaleY;
        this.mesh.scale.z = this.scaleZ;

        this.mesh.position.x = this.posX;
        this.mesh.position.z = this.posZ;

        if (this.posY < this.scaleY / 2 && this.checkPos)
            this.posY = this.scaleY / 2;
        this.mesh.position.y = this.posY;

        this.material.color.setRGB(this.col[0] / 255, this.col[1] / 255, this.col[2] / 255);
    }
};

/*************/
function createScene()
{
    meshes[0] = new datMesh();
    meshes[0].scaleX = 50;
    meshes[0].scaleY = 5;
    meshes[0].scaleZ = 50;
    meshes[0].posY = -2.5;
    meshes[0].checkPos = false;
    scene.add(meshes[0].mesh);

    //meshes[1] = new datMesh();
    //meshes[1].scaleX = 5;
    //meshes[1].scaleY = 24;
    //meshes[1].scaleZ = 5;
    //meshes[1].posY = 12;

    //scene.add(meshes[1].mesh);
    //folders[1] = gui.addFolder('Mesh 1');
    //meshes[1].gui(1);
}

/*************/
function addMesh()
{
    var pos = meshes.length;
    meshes[pos] = new datMesh();
    meshes[pos].scaleX = 5;
    meshes[pos].scaleY = 5;
    meshes[pos].scaleZ = 5;
    meshes[pos].posY = 2.5;

    scene.add(meshes[i].mesh);
    folders[pos] = gui.addFolder('Mesh ' + pos);
    meshes[i].gui(i);
}

/*************/
var camPosition = new THREE.Vector3(1, 1, -1);
var newCamPosition, newCamDirection;
function init()
{
    scene = new THREE.Scene();

    var camDirection = camPosition.clone();
    camDirection.negate();

    var ratio = window.innerWidth / window.innerHeight;
    //camera = new THREE.PerspectiveCamera(75, ratio, 1, 1000);
    camera = new THREE.OrthographicCamera(-50, 50, 50/ratio, -50/ratio, 1, 1000);
    camera.position = camPosition.setLength(100);
    camera.lookAt(camDirection);

    newCamPosition = camPosition.clone();
    newCamDirection = camDirection.clone();
  
    gui.add(this, 'addMesh');
    createScene();
  
    var ambientLight = new THREE.AmbientLight(0x222222);
    var pointLight = new THREE.PointLight(0xBBBBBB);
    pointLight.position.x = -500;
    pointLight.position.y = 1000;
    pointLight.position.z = 500;
    scene.add(ambientLight);
    scene.add(pointLight);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);
}

/*************/
var mouseDown = false;
var mouseStartX = 0;
var mouseStartY = 0;
window.onmousedown = function(ev)
{
    mouseDown = true;
    mouseStartX = ev.clientX;
    mouseStartY = ev.clientY;
}
window.onmouseup = function()
{
    mouseDown = false;
}
window.onmousemove = function(ev)
{
    if (mouseDown)
    {
        var dx = ev.clientX - mouseStartX;
        var dy = ev.clientY - mouseStartY;
        var positionY = camera.position.y + dy;

        var a = -dx / 128;
        var rotMat = new THREE.Matrix3(cos(a), 0, sin(a), 0, 1, 0, -sin(a), 0, cos(a));
        newCamPosition = camera.position.clone();
        newCamPosition.applyMatrix3(rotMat);
        newCamDirection = newCamPosition.clone();
        newCamDirection.negate();

        //newCamPosition.y = positionY;
        mouseStartX += dx;
        mouseStartY += dy;
    }
}
function updateCamera()
{
    camera.position = newCamPosition;
    camera.lookAt(newCamDirection);
}

/*************/
function animate()
{
    requestAnimationFrame(animate);

    //mesh.mesh.rotation.x += 0.01;
    //mesh.mesh.rotation.y += 0.02;

    for (i = 0; i < meshes.length; i++)
        meshes[i].update();

    updateCamera();

    renderer.render(scene, camera);
}

init();
animate();
