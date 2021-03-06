import React, { Component } from 'react';
import './ImageTransformator.css';
import * as ThreeCode from './ThreeCode';


class ImageTransformator extends Component{
  	componentDidMount(){
		const width = this.mount.clientWidth;
		const height = this.mount.clientHeight;
		
		ThreeCode.setImagePath(process.env.PUBLIC_URL + '/textures');
		
		//ADD SCENE
		ThreeCode.initScene();
		//ADD CAMERA
		ThreeCode.initCamera(width, height);
		//ADD RENDERER
		ThreeCode.initRenderer(this.mount);
		//ADD CUBE

		ThreeCode.threeMeta.scene.add(this.cube);
		
		ThreeCode.addContent();

//		ThreeCode.start();
  	}
	componentWillUnmount(){
    	ThreeCode.stop()
    	this.mount.removeChild(this.renderer.domElement)
  	}

	
	render(){
		return(
	   	<div
	   		style={{ width: '100%', height: '100%' }}
	        	ref={(mount) => { this.mount = mount }}
	      />
	   )
	}
}

export default ImageTransformator;