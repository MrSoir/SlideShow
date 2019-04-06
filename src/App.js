import React, { Component } from 'react';
import './App.css';
import SlideShow from './SlideShow';
import ImageTransformator from './ImageTransformator/ImageTransformator';
import WebGL2 from './WebGL2/WebGL2';

class App extends Component {
  render() {
    return (
      <div className="App">
			<SlideShow/>
			{/*<ImageTransformator/>*/}
			<WebGL2/>
      </div>
    );
  }
}

export default App;
