"use strict";

import * as glMatrix from 'gl-matrix';
import resizeCanvasToDisplaySize from 'webgl-utils';


//-----------------------------------------------------------------

	var vertexShaderSource = `#version 300 es
	
	// an attribute is an input (in) to a vertex shader.
	// It will receive data from a buffer
	in vec3 pos;
	in vec3 col;
	
	uniform mat4 modelView;
	uniform mat4 perspective;
	
	out vec3 fcol;
	
	// all shaders have a main function
	void main() {
		// gl_Position is a special variable a vertex shader
		// is responsible for setting
		gl_Position = perspective * modelView * vec4(pos, 1.0);
		fcol = col;
	}
`;

//-----------------------------------------------------------------

var fragmentShaderSource = `#version 300 es
	
	// fragment shaders don't have a default precision so we need
	// to pick one. mediump is a good default. It means "medium precision"
	precision mediump float;
	
	in vec3 fcol;
	
	// we need to declare an output for the fragment shader
	out vec4 outColor;
	
	void main() {
		// Just set the output to a constant redish-purple
		outColor = vec4(fcol,  1.0);
	}
`;

//-----------------------------------------------------------------


function createShader(type, source) {
	var shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if (success) {
		return shader;
	}

	console.log(gl.getShaderInfoLog(shader));	// eslint-disable-line
	gl.deleteShader(shader);
	return undefined;
}

//-----------------------

function createProgram(name, vertexShader, fragmentShader) {	
	var program = gl.createProgram();
	
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	
	gl.linkProgram(program);
	
	var success = gl.getProgramParameter(program, gl.LINK_STATUS);
	
	if (success) {
		programs[name] = {
			program: program, 
			vertexShader: vertexShader,
			fragmentShader: fragmentShader
		};
		return program;
	}

	console.log(gl.getProgramInfoLog(program));	// eslint-disable-line
	gl.deleteProgram(program);
	return undefined;
}

function	bindProgram(name){
	let program = programs[name];
	if(program){
		gl.linkProgram(program.program);
		shaderMeta.curShaderProgram = program;
	}
}

//-----------------------------------------------------------------

var programs = new Map();
var uniforms = new Map();
var shaderMeta = { curShaderProgram: null };
var gl = null;

function createUniform(name, data){
	let shaderLoc = gl.getUniformLocation(shaderMeta.curShaderProgram.program, name);
	uniforms[name] = {shaderLoc: shaderLoc, data: data};
}

//---------------

function _setUniform(name, glFunc){
	let uniform = uniforms[name];
	glFunc( [uniform.shaderLoc, false, uniform.data] );
}

//---------------

function setUniformMatrix3fv(name){
	_setUniform(name, (args)=>{gl.uniformMatrix3fv(...args)});
}
function setUniformMatrix4fv(name){
	_setUniform(name, (args)=>{gl.uniformMatrix4fv(...args)});
}

//---------------

function setUniformVector1fv(name){
	_setUniform(name, (args)=>{gl.uniform1fv(...args)});
}
function setUniformVector2fv(name){
	_setUniform(name, (args)=>{gl.uniform2fv(...args)});
}
function setUniformVector3fv(name){
	_setUniform(name, (args)=>{gl.uniform3fv(...args)});
}
function setUniformVector4fv(name){
	_setUniform(name, (args)=>{gl.uniform4fv(...args)});
}

//-----------------------------------------------------------------


function genPerspective(){
	const fieldOfView = 45 * Math.PI / 180;	 // in radians
	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	const zNear = 0.1;
	const zFar = 1000.0;
	const projectionMatrix = glMatrix.mat4.create();

	// note: glmatrix.js always has the first argument
	// as the destination to receive the result.
	glMatrix.mat4.perspective(projectionMatrix,
									  fieldOfView,
									  aspect,
									  zNear,
									  zFar);
	return projectionMatrix;
}
function setPerspective(){
	if (!uniforms['perspective']){
		let perspMatrix = genPerspective();
		createUniform('perspective', perspMatrix);
	}
	setUniformMatrix4fv('perspective');
}

//-----------------------------------------------------------------

function genModelView(){
	const modelViewMatrix = glMatrix.mat4.create();

	// Now move the drawing position a bit to where we want to
	// start drawing the square.

	glMatrix.mat4.translate(modelViewMatrix,		 // destination matrix
								   modelViewMatrix,		 // matrix to translate
								   [0.0, 0.0, -20.0]);	 // amount to translat
	console.log('modelViewMatrix: ', modelViewMatrix);
	return modelViewMatrix;
}
function setModelView(){
	if (!uniforms['modelView']){
		let modelViewMatrix = genModelView();
		createUniform('modelView', modelViewMatrix);
	}
	setUniformMatrix4fv('modelView');
}

//-----------------------------------------------------------------

function bindVertexData(data, size, shader_name, stride=0, offset=0){
	// data: vertices in a 1D-array
	// size: values per vertex (usually 3, sometimes 2 (textures))
	// shader_name: name-representation in the vertex-shader
	// stride: mal genau nachschlagen...
	// offset: the first offset vertices in the data-array will be discarded/ignored
	
	console.log('shader_name: ', shader_name);
		
	let program = shaderMeta.curShaderProgram.program;
	
	// create buffer -> afterwards the data will be bound to the buffer
	let positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	
	// bind data to previously created buffer:
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

	// Turn on the attribute
	let shaderLoc = gl.getAttribLocation(program, shader_name);
	gl.enableVertexAttribArray(shaderLoc);
	
	// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
//	let size = 3;					// 3 components per iteration
	let type = gl.FLOAT;	 	   // the data is 32bit floats
	let normalize = false;     // don't normalize the data
//	let stride = 0;				// 0 = move forward size * sizeof(type) each iteration to get the next position
//	let offset = 0;				// start at the beginning of the buffer
	gl.vertexAttribPointer( shaderLoc, size, type, normalize, stride, offset );
	
	gl.enableVertexAttribArray(shaderLoc);
	
	return {
		data: data,
		shaderLoc: shaderLoc,
		shader_name: shader_name,
		size: size,
		stride: stride,
		offset: offset,
		normalize: normalize,
		type: type
	};
}

function createAndDrawVertexData(data, size, shader_name, stride=0, offset=0){
	
	let vertexBinding =  bindVertexData(data, size, shader_name, stride, offset);
	
	return vertexBinding;
}

//-----------------------------------------------------------------

var vertexData = {};

function genAndBindVertexData(data, size, shader_name, stride=0, offset=0){	
	let data_buffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, data_buffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	
	let shaderProgram = shaderMeta.curShaderProgram.program;
	
	gl.bindBuffer(gl.ARRAY_BUFFER, data_buffer);
	let shaderLoc = gl.getAttribLocation(shaderProgram, shader_name);
	gl.vertexAttribPointer(shaderLoc, size, gl.FLOAT, false, stride, offset) ;
	gl.enableVertexAttribArray(shaderLoc);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	let shaderData = {
   	dataBuffer: data_buffer,
	   data: data,
	   shaderName: shader_name,
	   stride: stride,
	   offset: offset
	};
	vertexData[shader_name] = shaderData;
	return shaderData;
}

function createPane(){
	let vao = gl.createVertexArray();
	gl.bindVertexArray(vao);
	
	let offs = 5.0;
	
	let positions = [
		-offs, -offs,  0.0,
		 offs,  offs,  0.0,
		 offs, -offs,  0.0,
		 
		-offs, -offs,  0.0,
		-offs,  offs,  0.0,
		 offs,  offs,  0.0
	];
	vertexData.positions = positions;
	
	let colors = [
		0.0, 1.0, 0.0,
		1.0, 0.0, 0.0,
		0.0, 0.0, 1.0,
		
		1.0, 1.0, 0.0,
		1.0, 0.0, 1.0,
		0.0, 1.0, 1.0
	];
	vertexData.colors = colors;
	
	genAndBindVertexData(positions, 3, 'pos');
	genAndBindVertexData(colors,    3, 'col');
	
	let primitiveType = gl.TRIANGLES;
	let offset = 0;
	let count = 6;
	gl.drawArrays(primitiveType, offset, count);
}

//-----------------------------------------------------------------

function signedAngle(a,b){
	return Math.atan2(b[1], b[0]) - Math.atan2(a[1], a[0])
}

function genTranslationMatrix(v0, v1, v2, fctr){
	let avgx = (v0[0] + v1[0] + v2[0]) / 3.0;
	let avgy = (v0[1] + v1[1] + v2[1]) / 3.0;
	let avgz = (v0[2] + v1[2] + v2[2]) / 3.0;
	
	let v3 = glMatrix.vec3.fromValues(avgx, avgy, avgz);
	let v2 = glMatrix.vec2.fromValues(avgx, avgy);
	
	let refv2 = glMatrix.vec2.fromValues(1.0, 0.0);
	
	let centerAngle = signedAngle(v2, refv2);
	
	let rotAngleRad = fctr * Math.PI * 2.0;
	let rotAngleDeg = fctr * 360;
	let angleVorz = rotAngleRad >= 0 ? 1.0 : -1.0;
	
	let scale = 1.0 - Math.sin(fctr * Math.PI) * 0.9;
	
	let translateFctr = 2.0;
	let translx = Math.cos(rotAngleRad) * Math.sin(fctr * Math.PI) * translateFctr;
	let transly = Math.sin(rotAngleRad) * Math.sin(fctr * Math.PI) * translateFctr;
	let translz = angleVorz * Math.sin(fctr * Math.PI) * translateFctr;
	
	let quat = glMatrix.quat.fromEuler(rotAngleDeg, rotAngleDeg, 0.0);
	let translVec3 = glMatrix.vec3.fromValues(translx, transly, translz);
	let scalceVec3 = glMatrix.vec3.fromValues(scale, scale, scale);
	
	let transformMat4 = glMatrix.mat4.create();
	let transformMat4 = glMatrix.mat4.fromRotationTranslationScale(transformMat4, quat, translVec3, scalceVec3);
	return transformMat4;
}

//-----------------------------------------------------------------

function main() {
	// Get A WebGL context
	var canvas = document.getElementById("canvas");
	gl = canvas.getContext("webgl2");
	if (!gl) {
		return;
	}

	// create GLSL shaders, upload the GLSL source, compile the shaders
	var vertexShader   = createShader(gl.VERTEX_SHADER,   vertexShaderSource);
	var fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

	// Link the two shaders into a program
	var program = createProgram('picture', vertexShader, fragmentShader);
	bindProgram('picture');

	resizeCanvasToDisplaySize(gl.canvas, 0.1);

	// Tell WebGL how to convert from clip space to pixels
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	// Clear the canvas
	gl.clearColor(0.2, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Tell it to use our program (pair of shaders)
	gl.useProgram(program);
	
	setModelView();
	setPerspective();
	
	createPane();
}


export {main};