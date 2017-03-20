import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Rnd from 'react-rnd';

import Network from './Network.jsx';

const name = "Network";
const resize_grid = [1, 1];
const move_grid = [1, 1];
export default class Titlebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      height: 500,
      width: 500,
      x: 25,
      y: 25,
    }; 
  }

  onResize(direction, styleSize, clientSize, delta, newPos){
    this.setState({...this.state, width: clientSize.width, height: clientSize.heightt });
  }

  render() {
    return (
      <Rnd
				ref={c => { this.rnd = c; }}
        initial={{
          x: this.state.x,
          y: this.state.y,
          width: this.state.width,
          height: this.state.height,
        }}
        onResize={this.onResize.bind(this)}
        dragHandlerClassName='.handle'
        moveGrid={move_grid}
        resizeGrid={resize_grid} >
				<div className='drag-wrapper'>
          <div className='handle text-vert-center'>
            <span>{name}</span>
          </div>
          <div id="window-network-content" className='content no-cursor text-vert-center'>
            <div className={name}></div>
            <Network />
          </div>
        </div>
      </Rnd>
    );
  }
}
