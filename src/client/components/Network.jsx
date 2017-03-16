// Import React stuff
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Draggable from 'react-draggable';
import Resizable from 'react-resizable';

// Import d3 stuff
import * as d3 from 'd3-force';
import { scaleOrdinal, schemeCategory20 } from 'd3-scale';
import * as d3_sel from 'd3-selection';
import { drag } from 'd3-drag';

// import css
import './App.css';
import './Network.css';

const doc_sim= require('../cosine-sample.json');

export default class Network extends Component {
  constructor(props) {
    super(props);

    this.state = {
      initialData: [],
      nodes: [],
      links: []
    }; 
    this.initializeD3 = this.initializeD3.bind(this);
  }

  componentDidMount() {
    fetch(doc_sim).then((response) => {
      return doc_sim;
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

  initializeD3() {
    const width = 500;
    const height = 300;

    const aspect = width / height;

    const color = scaleOrdinal(schemeCategory20);
    
    console.log(d3_sel.select(this.refs.mountPoint));

    const svg = d3_sel.select(this.refs.mountPoint)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('id', 'initialD3Element');
      
    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(this.state.links)
      .enter()
      .append('line')
      .attr('stroke-width', 1.5);

    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(this.state.nodes)
      .enter()
      .append('circle')
      .attr('r', 10)
      .style('stroke', '#FFFFFF')
			.attr('x', () => Math.floor(Math.random() * (width-300 - 200 + 1)) + 200)
			.attr('y', () => Math.floor(Math.random() * (height-300 - 200 + 1)) + 200)
			.attr('cx', () => Math.floor(Math.random() * (width-300 - 200 + 1)) + 200)
			.attr('cy', () => Math.floor(Math.random() * (height-300 - 200 + 1)) + 200)
      .style('fill', (d) => color(d.value))
      .call(drag()
        .on('start', (d) => {
        	if (!d3_sel.event.active) simulation.alphaTarget(0.3).restart();
        	d.fx = d.x;
        	d.fy = d.y;
				})
        .on('drag', (d) => {
        	d.fx = d3_sel.event.x;
        	d.fy = d3_sel.event.y;
				})
        .on('end', (d) => {
        	if (!d3_sel.event.active) simulation.alphaTarget(0);
        	d.fx = null;
        	d.fy = null;
				}));

    node.append('title')
      .text((d) => d.author);

    const simulation = d3.forceSimulation()
      .force('link', d3.forceLink(link).id((d) => d.index).distance((d) => (1-d.value)*300))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2));

    simulation
      .nodes(this.state.nodes)
      .on('tick', () => {
				link
        	.attr("x1", (d) => d.source.x)
        	.attr("y1", (d) => d.source.y)
        	.attr("x2", (d) => d.target.x)
        	.attr("y2", (d) => d.target.y);

    	node
    	    .attr("cx", (d) => d.x)
    	    .attr("cy", (d) => d.y);
		});

    simulation.force('link')
      .links(this.state.links);
  }

  render() {
    return (
      <Draggable
        axis="both"
        handle=".handle"
        defaultPosition={{x: 50, y: 50}}
        position={null}
        grid={[1, 1]}
        zIndex={100}
        onStart={this.handleStart}
        onDrag={this.handleDrag}
        onStop={this.handleStop}>
        <div className="drag-wrapper">
          <div className="handle box">Network</div>
          <div className="Network">
            <div className="content" id="mountDiv" ref="mountPoint"></div>
          </div>
        </div>
      </Draggable>
    );
  }
};
