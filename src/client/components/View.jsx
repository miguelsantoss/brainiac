// Import React stuff
import React, { Component } from 'react';
import _ from 'lodash';

import Layout from './Layout.jsx';

export default class View extends Component {
  constructor(props) {
    const vizArray = [];
    super(props);
    this.state = {
      viz: vizArray
    }
  }

  onLayoutChange() { }
  
  render() {
    return (
      <div>
        <Layout onLayoutChange={this.onLayoutChange.bind(this)} viz={this.state.viz}/>
      </div>
    );
  }
};
