import React, { Component } from 'react';
import './SlideShow.css';
import Hippo0 from './Hippo1.jpg';
import Hippo1 from './Hippo2.jpg';
import Hippo2 from './Hippo3.jpg';

class SlideShow extends Component {
	constructor(props){
		super(props);
		this.imgRefs = [];
		this.imgRefs.push( React.createRef() );
		this.imgRefs.push( React.createRef() );
		this.imgRefs.push( React.createRef() );
		
		this.onImageOver = this.onImageOver.bind(this);
		this.onImageOut = this.onImageOut.bind(this);
	}
	onImageOver(id){
		let ref = this.imgRefs[id].current;
		ref.className = ref.className + " FocusImage";
	}
	onImageOut(id){
		let ref = this.imgRefs[id].current;
		ref.className = "Image";
	}
  render() {
    return (
	<div className="SlideShow">
		<div className="ImagesContainer">
	      <div className="ImgContainer"
	      	onMouseOver={()=>{this.onImageOver(0)}}
	      	onMouseOut = {()=>{this.onImageOut(0)}}>
	      	<img className="Image"
	      		  src={Hippo0} 
	      		  alt="Logo0" 
	      		  ref={this.imgRefs[0]}
	      		  ></img>
	      	<div className="Legend">Nila</div>
	      </div>
	      <div className="ImgContainer"
	      	onMouseOver={()=>{this.onImageOver(1)}}
	      	onMouseOut = {()=>{this.onImageOut(1)}}>
	      	<img className="Image"
	      		  src={Hippo1} 
	      		  alt="Logo1" 
	      		  ref={this.imgRefs[1]}></img>
	      	<div className="Legend">Hippo</div>
	      </div>
	      <div className="ImgContainer"
	      	onMouseOver={()=>{this.onImageOver(2)}}
	      	onMouseOut = {()=>{this.onImageOut(2)}}>
	      	<img className="Image"
	      		  src={Hippo2} 
	      		  alt="Logo2" 
	      		  ref={this.imgRefs[2]}></img>
	      	<div className="Legend">Wolfi</div>
	      </div>
      </div>
	</div>
    );
  }
}

export default SlideShow;
