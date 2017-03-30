// Import React stuff
import React, { Component } from 'react';

import Layout from './Layout.jsx';

import Network from './Network.jsx';
import Timeline from './Timeline.jsx';

const vizArray = [
  {
    'id': 'network',
    'd3': <Network />,
    'lg': {x: 0, y: 0, w: 12, h: 8}
  },
  {
    'id': 'timeline',
    'd3': <Timeline />,
    'lg': {x: 0, y: 1, w: 12, h: 8}
  }
];

export default class View extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viz: vizArray
    }
  }

  onLayoutChange() { }

  render() {
    return (
      <div>
        <Layout onLayoutChange={this.onLayoutChange.bind(this)} vizArray={this.state.viz}/>
      </div>
    );
  }
};
