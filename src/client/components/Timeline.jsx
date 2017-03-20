// Import React stuff
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Rnd from 'react-rnd';
import axios from 'axios';

// Import d3 stuff
import * as d3 from 'd3-force';
import { scaleOrdinal, schemeCategory20, scaleLog } from 'd3-scale';
import * as d3_sel from 'd3-selection';
import { drag } from 'd3-drag';
import * as d3_request from 'd3-request';
import * as d3_array from 'd3-array';
import * as d3_axis from 'd3-axis';
import * as d3_voronoi from 'd3-voronoi';
import * as d3_format from 'd3-format';

// import css
import './App.css';
import './Timeline.css';

// import some placeholder data
const doc_sim= require('../cosine-sample.json');

export default class Timeline extends Component {
  constructor(props) {
    super(props);

    this.state = {
      initialData: [],
      height: 229,
      width: 964,
      x: 25,
      y: 25,
      width_viz: 0,
      height_viz: 0,
    }; 
    this.initializeD3 = this.initializeD3.bind(this);
  }

  componentDidMount() {
    const height_content = document.getElementById('window-timeline-content').clientHeight;
    const width_content = document.getElementById('window-timeline-content').clientWidth;

    this.setState({...this.state, width_viz: width_content, height_viz: height_content });

    axios.get("https://bl.ocks.org/mbostock/raw/6526445e2b44303eebf21da3b6627320/flare.csv")
      .then((result) => {
        d3_request.csv("https://bl.ocks.org/mbostock/raw/6526445e2b44303eebf21da3b6627320/flare.csv", (d) => {
          if(!d.value) return;
          d.value = +d.value;
          return d;
        }, (error, data) => {
          this.setState({
            ...this.state,
            initialData: data,
          });
          this.initializeD3();
		    });
      });
  }

  onResize(direction, styleSize, clientSize, delta, newPos){
    const height_content = document.getElementById('window-timeline-content').clientHeight;
    const width_content = document.getElementById('window-timeline-content').clientWidth;
    this.setState({...this.state, width: clientSize.width, height: clientSize.height, width_viz: width_content, height_viz: height_content });

    this.state.d3Viz.svg = d3_sel.select('#initialD3Element')
      .attr('width', width_content)
      .attr('height', height_content);
  }

  initializeD3() {
    const width = this.state.width_viz;
    const height = this.state.height_viz;
    const aspect = width / height;
    const color = scaleOrdinal(schemeCategory20);

    const x = scaleLog().rangeRound([0, width]);
		const formatValue = d3_format.format(",d");

    x.domain(d3_array.extent(this.state.initialData, function(d) { return d.value; }));
    
    const svg = d3_sel.select(this.refs.mountPoint_timeline)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('overflow', 'hidden')
      .attr('id', 'initialD3Element')
      .attr('ref', 'svg_el');

    const g = svg.append('g');

		const simulation = d3.forceSimulation(this.state.initialData)
      .force("x", d3.forceX(function(d) { return x(d.value); }).strength(1))
      .force("y", d3.forceY(height / 2))
      .force("collide", d3.forceCollide(4))
      .stop();

    for (var i = 0; i < 120; ++i) simulation.tick();

    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + (height-20) + ')')
      .call(d3_axis.axisBottom(x).ticks(20, '.0s'));

    const cell = g.append("g")
      .attr("class", "cells")
    .selectAll("g").data(d3_voronoi.voronoi()
    		.extent([[0, 0], [width, height]])
        .x(function(d) { return d.x; })
    		.y(function(d) { return d.y; })
      .polygons(this.state.initialData)).enter().append("g");

    cell.append("circle")
      .attr("r", 3)
      .attr("cx", function(d) { return d.data.x; })
      .attr("cy", function(d) { return d.data.y; });

    cell.append("path")
      .attr("d", function(d) { return "M" + d.join("L") + "Z"; });

    cell.append("title")
      .text(function(d) { return d.data.id + "\n" + formatValue(d.data.value); });
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
        onResize={this.onResize.bind(this)}
        dragHandlerClassName='.handle'
        moveGrid={[1, 1]}
        resizeGrid={[1, 1]}
      >
				<div className='drag-wrapper'>
          <div className='handle text-vert-center'>
            <span>Timeline</span>
          </div>
          <div id="window-timeline-content" className='content no-cursor text-vert-center'>
            <div className="mount" ref="mountPoint_timeline"></div>
          </div>
        </div>
      </Rnd>
    );
  }
};
