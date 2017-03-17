// Import React stuff
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Draggable from 'react-draggable';
import { Resizable, ResizableBox } from 'react-resizable';
import Rnd from 'react-rnd';

// Import d3 stuff
import * as d3 from 'd3-force';
import { scaleOrdinal, schemeCategory20 } from 'd3-scale';
import * as d3_sel from 'd3-selection';
import { drag } from 'd3-drag';

// import css
import './App.css';
import './Network.css';

// import some placeholder data
const doc_sim= require('../cosine-sample.json');

export default class Network extends Component {
  constructor(props) {
    super(props);

    this.state = {
      initialData: [],
      nodes: [],
      links: [],
      height: 500,
      width: 500,
      x: 25,
      y: 25,
      width_viz: 0,
      height_viz: 0,
    }; 
    this.initializeD3 = this.initializeD3.bind(this);
  }

  componentDidMount() {
    const height_content = document.getElementById('window-network-content').clientHeight;
    const width_content = document.getElementById('window-network-content').clientWidth;

    //this.setState({ ...this.state });
    // newState = { ...this.state };
    // this.setState({...this.state, width_viz: width_content, height_viz: height_content });

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

  onResize(event, {element, size}) {
    this.setState({width: size.width, height: size.height});
  }

  initializeD3() {
    const width = this.state.width;
    const height = this.state.height;
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
      <Rnd
				ref={c => { this.rnd = c; }}
        initial={{
          x: this.state.x,
          y: this.state.y,
          width: this.state.width,
          height: this.state.height,
        }}
        dragHandlerClassName='.handle'
        moveGrid={[1, 1]}
        resizeGrid={[1, 1]}
      >
				<div className='drag-wrapper'>
          <div className='handle text-vert-center'>
            <span>Network</span>
          </div>
          <div id="window-network-content" className='content no-cursor text-vert-center'>
            <div className="Network"></div>
            <div id="mountDiv" ref="mountPoint"></div>
          </div>
        </div>
      </Rnd>
    );
  }
};
