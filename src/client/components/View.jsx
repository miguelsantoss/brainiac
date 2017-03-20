// Import React stuff
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Rnd from 'react-rnd';

import Network from './Network.jsx';
import Timeline from './Timeline.jsx';

export default class View extends Component {
  render() {
    return (
      <div>
        <Network />
        <Timeline />
      </div>
    );
  }
}
