import * as THREE from 'three';

var threeMeta = {
	scene: undefined,
	renderer: undefined,
	camera: undefined,
	width: 0,
	height: 0,
	frameId: 0,
	imgPath: "",
	progress: 0.0
}
var shapes = [];

function setImagePath(path){
	threeMeta.imgPath = path;
}

function genQuaternion(frctn, v=new THREE.Vector3( 0, 1, 1 )){
	var quaternion = new THREE.Quaternion();
	return quaternion.setFromAxisAngle( v, frctn * Math.PI );
}
function genTransformationMatrix(v0, v1, v2, maxx, maxy, maxz, frctn){
	let offs = 10;
	
	let x_avrg = (v0[0] + v2[0] + v2[0]) / 3.0;
	let y_avrg = (v0[1] + v2[1] + v2[1]) / 3.0;
	let z_avrg = (v0[2] + v2[2] + v2[2]) / 3.0;
	
	let x_vorz = x_avrg >= 0.0 ? 1.0 : -1.0;
	let y_vorz = y_avrg >= 0.0 ? 1.0 : -1.0;
	let z_vorz = z_avrg >= 0.0 ? 1.0 : -1.0;
	
	let posx = x_avrg / maxx * frctn * x_vorz * offs;
	let posy = y_avrg / maxy * frctn * y_vorz * offs;
	let posz = z_avrg / maxz * frctn * z_vorz * offs
	
	let sclVal = 1.0 - Math.sin(frctn * Math.PI);
	
	let pos = new THREE.Vector3(posx, posy, posz);
	let rot = genQuaternion(frctn);
	let scl = new THREE.Vector3(sclVal, sclVal, sclVal);
	
	let transformMatrix = THREE.Matrix4.compose(pos, rot, scl);
	return transformMatrix;
}


function genColorBuffer(){
	const faceColors = [
		[1.0, 1.0, 1.0, 1.0],	// Front face: white
		[1.0, 0.0, 0.0, 1.0],	// Back face: red
	];
	
	// Convert the array of colors into a table for all the vertices.
	
	var colors = [];
	
	for (var j = 0; j < faceColors.length; ++j) {
		const c = faceColors[j];
	
		// Repeat each color four times for the four vertices of the face
		colors = colors.concat(c, c, c);
	}
}
function manipulateVertices(vertices){
	let maxx=0, maxy=0, maxz=0;
	
	for(let i=0; i < vertices.length; i+=9){
		let v0 = new THREE.Vector3(vertices[i+0], vertices[i+1], vertices[i+2]);
		let v1 = new THREE.Vector3(vertices[i+3], vertices[i+4], vertices[i+5]);
		let v2 = new THREE.Vector3(vertices[i+6], vertices[i+7], vertices[i+8]);
		let transformMatrix = genTransformationMatrix(v0, v1, v2, )
	}
}
function genGeom(){
	let offs = 1.0;
	let quad_vertices =
	[
		-offs, -offs, 0.0,
		 offs, -offs, 0.0,
		 offs,  offs, 0.0,
		 
		-offs, -offs, 0.0,
		 offs,  offs, 0.0,
		-offs,  offs, 0.0
	];
	
	let quad_uvs =
	[
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0
	];
	
	let quad_indices =
	[
		0, 2, 1, 0, 3, 2
	];
	
	let geometry = new THREE.BufferGeometry();
	
	let vertices = new Float32Array( quad_vertices );
	// Each vertex has one uv coordinate for texture mapping
	let uvs = new Float32Array( quad_uvs);
	// Use the four vertices to draw the two triangles that make up the square.
	let indices = new Uint32Array( quad_indices )
	
	// itemSize = 3 because there are 3 values (components) per vertex
	geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
//	geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );
//	geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );
	
	// Load the texture asynchronously
	let textureLoader = new THREE.TextureLoader();
	textureLoader.load(
		threeMeta.imgPath + "/Hippo.png", 
		(texture)=>{
			console.log('texture loaded');
			
			let material = new THREE.MeshBasicMaterial( { color: 0xffff00 } ); //{map: texture } );
			let mesh = new THREE.Mesh( geometry, material );
			
			shapes.push( geometry );
			
			threeMeta.scene.add(mesh);
		
			threeMeta.renderer.render(threeMeta.scene, threeMeta.camera);
			
			start();
		}, 
		undefined, 
		(err)=>{
			console.error('texture not loaded', err)
		}
	);
}


function addContent(){
	genGeom();
}


function initScene(){
	threeMeta.scene = new THREE.Scene();
}
function initCamera(width, height){
	threeMeta.width = width;
	threeMeta.height = height;
	threeMeta.camera = new THREE.PerspectiveCamera(
		75,
		width / height,
		0.1,
		1000
	);
	threeMeta.camera.position.z = 4;
}
function initRenderer(mount, width, height){
	threeMeta.renderer = new THREE.WebGLRenderer({ antialias: true });
	threeMeta.renderer.setClearColor('#000000');
	threeMeta.renderer.setSize(threeMeta.width, threeMeta.height);
	mount.appendChild(threeMeta.renderer.domElement);
}
function setScene(scene){
	threeMeta.scene = scene;
}
function setCamera(camera){
	threeMeta.camera = camera;
}
function setRenderer(renderer){
	threeMeta.renderer = renderer;
	
	threeMeta.renderer.setClearColor('#1F1F1F');
}


function renderScene() {
  	threeMeta.renderer.render(threeMeta.scene, threeMeta.camera);
}

function start(){
	if (!threeMeta.frameId) {
		console.log('starting animation');
   	threeMeta.frameId = window.requestAnimationFrame(animate);
	}
}
function stop(){
 	cancelAnimationFrame(threeMeta.frameId);
}
function animate(){
	for(let s of shapes){
		let pos = s.getAttribute('position');
//		console.log('pos: ', pos.array[0]);
		pos.array[0] -= 0.0001;
		pos.needsUpdate = true;
/*		s.rotation.z += 0.01;
		s.rotation.y += 0.01;*/
	}
   renderScene();
   threeMeta.frameId = window.requestAnimationFrame(animate);
}

export {setScene, setCamera, setRenderer, threeMeta, start, stop, initScene, initCamera, initRenderer, addContent, setImagePath};
