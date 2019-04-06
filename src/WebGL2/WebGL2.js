import React, { Component } from 'react';
import './WebGL2.css';
import * as WebGLMain from './main';

class WebGL2 extends Component {
	
	componentDidMount(){
		WebGLMain.main();
	}
  render() {
    return (
      <div className="App">
			<canvas id="canvas"> </canvas>
      </div>
    );
  }
}

export default WebGL2;
