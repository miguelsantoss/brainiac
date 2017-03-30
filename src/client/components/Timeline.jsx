// Import React stuff
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import sizeMe from 'react-sizeme';

// Import d3 stuff
import * as d3 from 'd3-force';
import { scaleOrdinal, schemeCategory20, scaleLog, scaleLinear } from 'd3-scale';
import * as d3_sel from 'd3-selection';
import { drag } from 'd3-drag';
import * as d3_request from 'd3-request';
import * as d3_array from 'd3-array';
import * as d3_axis from 'd3-axis';
import * as d3_voronoi from 'd3-voronoi';
import * as d3_format from 'd3-format';
import * as d3_time from 'd3-time';

// import css
import '../css/App.css';
import '../css/Timeline.css';

// import some placeholder data
const doc_sim = require('../cosine-sample.json');

const margin_bottom = 20;
const margin_right = 20;
const margin_left = 20;

class Timeline extends Component {
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
    const height = document.getElementById('window-timeline-content').clientHeight;
    const width = document.getElementById('window-timeline-content').clientWidth;

    this.setState({...this.state, width: width, height: height});

    fetch(doc_sim).then((response) => {
      return doc_sim;
    }).then((data) => {
      this.setState({
        initialData: data,
        nodes: data.nodes,
        links: data.links,
      }, () => {})
    })
      .then(() => {
        this.initializeD3();
      })
  }

  componentWillReceiveProps() {
    this.handleResize();
  }

  handleResize(){
    const height = document.getElementById('window-timeline-content').clientHeight;
    const width = document.getElementById('window-timeline-content').clientWidth;
    const oldHeight = this.state.height;
    this.setState({...this.state, width, height});
    this.state.d3Viz.svg
      .attr('width', width)
      .attr('height', height);
    this.state.d3Viz.x.rangeRound([0, width - (margin_right + margin_left)]);
    const n_ticks = Math.ceil(width * 0.01);
    this.state.d3Viz.g_x.attr('transform', 'translate(0,' + (height-margin_bottom) + ')').call(d3_axis.axisBottom(this.state.d3Viz.x).ticks(n_ticks, ""));
    this.state.d3Viz.simulation
      .force('x', d3.forceX((d) => this.state.d3Viz.x(d.year)).strength(1))
      .force("y", d3.forceY(height / 2))
      .force("collide", d3.forceCollide(4))
      .stop();

    for (var i = 0; i < 120; ++i) this.state.d3Viz.simulation.tick();

    this.state.d3Viz.nodes.attr('x', (d) => { return this.state.d3Viz.x(d.data.year)});
    this.state.d3Viz.nodes.attr('cx', (d) => { return this.state.d3Viz.x(d.data.year)});
    // this.state.d3Viz.nodes.attr('cy', (d) => { return d.data.y });
    // this.state.d3Viz.nodes.attr('y', (d) => {
    //   console.log("oldHeight: ", oldHeight);
    //   console.log("height: ", height);
    //   console.log("y: ", d.data.y);
    //   console.log("cy: ", d.data.y);
    //   console.log("oldHeight/2: ", oldHeight/2);
    //   console.log("height/2: ", height/2);
    //   console.log("diff: ", ((oldHeight / 2) - d.data.y));
    //   console.log("new: ", (height/2) + (d.data.y - (oldHeight / 2)));
    //   const y = ((height / 2) + ((oldHeight / 2) - d.data.y));
    //   return y;
    // });
  }

  initializeD3() {
    const width = this.state.width;
    const height = this.state.height;
    const aspect = width / height;
    const color = scaleOrdinal(schemeCategory20);

    const x = scaleLinear().rangeRound([0, width - (margin_right + margin_left)]);
		const formatValue = d3_format.format(",d");

    x.domain(d3_array.extent(this.state.nodes, (d) => d.year));
    
    const svg = d3_sel.select(this.refs.mountPoint_timeline)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('overflow', 'hidden')
      .attr('id', 'timeline-svg-element')
      .attr('ref', 'svg_el');

    const g = svg.append('g')
      .attr('transform', 'translate(20,0)');

		const simulation = d3.forceSimulation(this.state.nodes)
      .force("x", d3.forceX((d) => x(d.year)).strength(1))
      .force("y", d3.forceY(height / 2))
      .force("collide", d3.forceCollide(4))
      .stop();

    for (var i = 0; i < 120; ++i) simulation.tick();

    const n_ticks = Math.ceil(width * 0.01);
    const g_x = g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + (height-margin_bottom) + ')')
      .call(d3_axis.axisBottom(x).ticks(n_ticks, ""));

    const cell = g.append("g")
      .attr("class", "cells")
    .selectAll("g").data(d3_voronoi.voronoi()
    		.extent([[0, 0], [width, height]])
        .x((d) => d.x)
    		.y((d) => d.y)
      .polygons(this.state.nodes)).enter().append("g");

    const nodes = cell.append("circle")
      .attr("r", 3)
      .attr("cx", (d) => d.data.x)
      .attr("cy", (d) => d.data.y);

    cell.append("path")
      .attr("d", (d) => "M" + d.join("L") + "Z");

    cell.append("title")
      .text((d) => d.data.name + "\n" + d.data.author);

    const d3Viz = { svg, cell, g, x, g_x, simulation, nodes }
    this.setState({ ...this.state, d3Viz });
  }

  render() {
    return (
			<div className='drag-wrapper'>
        <div className='handle text-vert-center'>
          <span>Timeline</span>
        </div>
        <div id="window-timeline-content" className='content no-cursor text-vert-center'>
          <div className="mount" ref="mountPoint_timeline"></div>
        </div>
      </div>
    );
  }
};

export default sizeMe({ monitorHeight: true })(Timeline);
