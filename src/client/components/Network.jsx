// Import React stuff
import React, { Component } from 'react';
import sizeMe from 'react-sizeme';

// Import d3 stuff
import * as d3Force from 'd3-force';
import * as d3Scale from 'd3-scale';
import * as d3Sel from 'd3-selection';
import * as d3Drag from 'd3-drag';

// import css
import '../css/App.css';
import '../css/Network.css';

// import some placeholder data
const docSim = require('../cosine-sample.json');

class Network extends Component {
  constructor(props) {
    super(props);

    this.state = {
      initialData: [],
      nodes: [],
      links: [],
      init: false,
    };

    this.initializeD3 = this.initializeD3.bind(this);
  }

  componentDidMount() {
    const height = document.getElementById('window-network-content').clientHeight;
    const width = document.getElementById('window-network-content').clientWidth;

    fetch(docSim).then(() => docSim)
      .then((data) => {
        this.setState({
          ...this.state,
          initialData: data,
          nodes: data.nodes,
          links: data.links,
          width,
          height
        }, () => {});
      })
      .then(() => {
        this.initializeD3();
      });
  }

  componentWillReceiveProps() {
    this.handleResize();
  }

  handleResize() {
    const height = document.getElementById('window-network-content').clientHeight;
    const width = document.getElementById('window-network-content').clientWidth;

    this.setState({ ...this.state, width, height });

    if (!this.state.init) return;

    this.state.d3Viz.svg = d3Sel.select('#network-svg-element')
      .attr('width', width)
      .attr('height', height);

    this.state.d3Viz.simulation.force('center', d3Force.forceCenter(width / 2, height / 2))
      .force('center', d3Force.forceCenter(width / 2, height / 2));

    this.state.d3Viz.simulation.alphaTarget(0.3).restart();
  }

  initializeD3() {
    const width = this.state.width;
    const height = this.state.height;
    const mountPoint = this.mountNetwork;

    const color = d3Scale.scaleOrdinal(d3Scale.schemeCategory20);

    const svg = d3Sel.select(mountPoint)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('overflow', 'hidden')
      .attr('id', 'network-svg-element')
      .attr('ref', 'svg_el');

    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(this.state.links)
      .enter()
      .append('line')
      .attr('stroke-width', 1.5);

    const simulation = d3Force.forceSimulation()
      .force('link', d3Force.forceLink(link).id(d => d.index).distance(d => (1 - d.value) * 300))
      .force('charge', d3Force.forceManyBody())
      .force('center', d3Force.forceCenter(width / 2, height / 2));

    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(this.state.nodes)
      .enter()
      .append('circle')
      .attr('r', 10)
      .style('stroke', '#FFFFFF')
      .style('fill', d => color(d.value))
      .call(d3Drag.drag()
        .on('start', (d) => {
          if (!d3Sel.event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (d) => {
          d.fx = d3Sel.event.x;
          d.fy = d3Sel.event.y;
        })
        .on('end', (d) => {
          if (!d3Sel.event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    node.append('title')
      .text(d => d.author);

    simulation
      .nodes(this.state.nodes)
      .on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);
        node
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);
      });

    simulation.force('link')
      .links(this.state.links);

    const d3Viz = { svg, link, node, simulation };
    this.setState({ ...this.state, d3Viz, init: true });
  }

  render() {
    return (
      <div className="drag-wrapper">
        <div className="handle text-vert-center">
          <span>Network</span>
        </div>
        <div id="window-network-content" className="content no-cursor text-vert-center">
          <div className="mount" ref={(r) => { this.mountNetwork = r; }} />
        </div>
      </div>
    );
  }
}

export default sizeMe({ monitorHeight: true })(Network);
