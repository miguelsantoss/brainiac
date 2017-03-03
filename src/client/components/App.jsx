import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Network from './network.jsx';

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <header>
          <h1>test</h1>
        </header>
        <Network />
      </div>
    );
  }
}
