import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';
import './App.css';
import Search from './Search';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      initialData: [],
      nodes: [],
      links: []
    };

    this.handleSearch = this.handleSearch.bind(this);
    this.updateD3 = this.updateD3.bind(this);
    this.initializeD3 = this.initializeD3.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
  }

  componentDidMount() {
    fetch('/grammy.json').then((response) => {
      return response.json();
    }).then((data) => {
      return this.setState({
        initialData: data,
        nodes: data.nodes,
        links: data.links
      })
    })
      .then(() => {
        this.initializeD3();
      })
  }

  clearSearch() {
    let deleteCurrentSVG = document.getElementById('updatedD3Element');
    deleteCurrentSVG.parentNode.removeChild(deleteCurrentSVG);

    fetch('/grammy.json').then((response) => {
      return response.json();
    }).then((data) => {
      this.setState({
        initialData: data,
        nodes: data.nodes,
        links: data.links
      }, () => {})
    })
      .then(() => {
        this.initializeD3();
      })
  }

  handleSearch(nominee) {
    let searchResults = [];
    let nodes = this.state.nodes;

    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].artist === nominee) {
        searchResults.push(nodes[i])
      }
    }

    this.setState({nodes: searchResults}, () => {});

    this.updateD3(searchResults)
  }

  updateD3(searchResults) {
    let deleteInitialSVG = document.getElementById('initialD3Element');
    deleteInitialSVG.parentNode.removeChild(deleteInitialSVG);

    const width = 1000;
    const height = 500;

    const force = d3.layout.force()
      .charge(-500)
      .linkDistance(100)
      .size([width, height])
      .nodes(searchResults)
      .links(this.state.links);

    const svg = d3.select(this.refs.mountPoint)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('id', 'updatedD3Element');

    const color = d3.scale.category20();

    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(searchResults)
      .enter()
      .append('circle')
      .attr('r', 5)
      .style('stroke', '#FFFFFF')
      .style('stroke-width', 1.5)
      .style('fill', (d) => color(d.value));

    const transform = (d) => {
      return "translate(" + d.x + "," + d.y + ")";
    };

    const text = svg.append('g')
      .selectAll('text')
      .data(force.nodes())
      .enter()
      .append('text')
      .attr('x', 8)
      .attr('y', '.31em')
      .text((d) => {
        return d.artist + ' nominated for:  ' + d.category + ' for the feature: ' + d.feature; });

    force.on('tick', () => {
      node
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y)
        .call(force.drag);

      text
        .attr('transform', transform)
    });

    force.start();
  }

  initializeD3() {
    const width = 960;
    const height = 600;

    const force = d3.layout.force()
      .charge(-500)
      .linkDistance(100)
      .size([width, height])
      .nodes(this.state.nodes)
      .links(this.state.links);

    const svg = d3.select(this.refs.mountPoint)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('id', 'initialD3Element');

    const color = d3.scale.category20();

    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(this.state.nodes)
      .enter()
      .append('circle')
      .attr('r', 5)
      .style('stroke', '#FFFFFF')
      .style('stroke-width', 1.5)
      .style('fill', (d) => color(d.value));

    const transform = (d) => {
      return "translate(" + d.x + "," + d.y + ")";
    };

    const text = svg.append('g')
      .selectAll('text')
      .data(force.nodes())
      .enter()
      .append('text')
      .attr('x', 8)
      .attr('y', '.31em')
      .text((d) => {
        return d.artist; });

    force.on('tick', () => {
      node
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y)
        .call(force.drag);

      text
        .attr('transform', transform)
    });

    force.start();
  }

  render() {
    return (
      <div className="App">
        <header>
          <h1>2017 Grammy Nominations</h1>
        </header>
        <main className="Section--main">
          <Search handleSearch={this.handleSearch} clearSearch={this.clearSearch} />
          <div id="mountDiv" ref="mountPoint" />
        </main>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.querySelector('#root')
);

export default App;
