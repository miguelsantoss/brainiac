import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import Dashboard from './Dashboard.jsx';
import View from './View.jsx';

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <Dashboard />
        <View />
      </div>
    );
  }
}
