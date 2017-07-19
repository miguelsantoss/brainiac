import React, { Component } from 'react';
import PropTypes from 'prop-types';
import sizeMe from 'react-sizeme';

import * as d3Force from 'd3-force';
import * as d3Scale from 'd3-scale';
import * as d3Sel from 'd3-selection';
import { extent } from 'd3-array';
import * as d3Axis from 'd3-axis';
import * as d3Voronoi from 'd3-voronoi';
import * as d3Brush from 'd3-brush';
import * as d3Transition from 'd3-transition';

import compareArrays from '../../../lib/arrays';
import './Timeline.scss';

const padding = {
  top: 0,
  right: 20,
  bottom: 20,
  left: 20,
};
const forceYspaceCollide = 1.5;

class Timeline extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodes: props.nodes,
      init: false,
    };

    this.nodeRadius = 4;
    this.brushArray = [];
    this.hover = null;

    this.initializeD3 = this.initializeD3.bind(this);
    this.filterNodes = this.filterNodes.bind(this);
    this.testFunc = this.testFunc.bind(this);
  }

  testFunc = () => {
    console.log('asd');
    console.log(this);
  }

  componentWillMount() {
    const width = document.getElementById('window-timeline-content').clientWidth; // eslint-disable-line no-undef
    const height = document.getElementById('window-timeline-content').clientHeight; // eslint-disable-line no-undef

    this.state.nodes.forEach((d) => {
      d.radius = 4;
      d.defaultRadius = 4;
    });

    this.setState({ ...this.state, width, height }, () => this.initializeD3());
  }

  componentWillReceiveProps() {
    const width = document.getElementById('window-timeline-content').clientWidth; // eslint-disable-line no-undef
    const height = document.getElementById('window-timeline-content').clientHeight; // eslint-disable-line no-undef
    this.handleResize(width, height, this.state.width, this.state.height);
    this.setState({ ...this.state, width, height }, () => this.filterNodes());
  }

  mouseMoveHandler() {
    // get the current mouse position
    const [mx, my] = d3Sel.mouse(this.brushG.node());

    // use the new diagram.find() function to find the voronoi site closest to
    // the mouse, limited by max distance defined by voronoiRadius
    const site = this.voronoi.find(mx, my);

    if (this.hover) {
      if (this.hover === site.data) return;
      this.props.hoverNode(this.hover, false);
      this.hover = null;
    }
    this.hover = site.data;
    this.props.hoverNode(site.data, true);
    // highlight the point if we found one, otherwise hide the highlight circle
    // highlight(site && site.data);
  }

  createBrush() {
    return d3Brush.brushX()
      .extent([[0, 0], [this.plotAreaWidth, this.plotAreaHeight]])
      .on('end', () => {
        if (!d3Sel.event.sourceEvent) return; // Only transition after input.
        if (!d3Sel.event.selection) {
          this.props.clearFilterByDate();
          this.brushArray = [];
          return;
        }
        const d0 = d3Sel.event.selection.map(this.x.invert);
        const d1 = d0.map(n => Math.round(n));
        this.props.filterByDate(d1);
        this.brushArray = d1;
        this.brushG.transition().call(d3Sel.event.target.move, d1.map(this.x));
      });
  }

  filterNodes() {
    const nodes = this.nodes;
    const filter = this.props.filteredNodes;
    if (!this.state.init || compareArrays(this.state.nodes, filter)) return;

    nodes.attr('class', (d) => {
      const isPresent = filter.filter(nodeE => nodeE.title === d.title).length > 0;
      return isPresent ? 'timeline-node' : 'timeline-node node-greyed-out';
    });
  }

  handleNodeHover = (d, state) => {
    this.props.hoverNode(d, state);
  }

  handleResize(newWidth, newHeight, oldWidth, oldHeight) {
    if (!this.state.init) return;
    if (newWidth === oldWidth && newHeight === oldHeight) return;

    const nodeRadius = this.nodeRadius;
    const forceYcollide = nodeRadius + forceYspaceCollide;
    const nodeData = this.state.nodes;

    const plotAreaWidth = newWidth - padding.left - padding.right;
    const plotAreaHeight = newHeight - padding.top - padding.bottom;
    const nTicks = Math.round(plotAreaWidth / 60);

    this.svg.attr('width', newWidth).attr('height', newHeight);

    this.brush = this.createBrush();
    this.brushG.remove();

    this.brushG = this.g.append('g')
      .attr('class', 'timeline-brush')
      .call(this.brush)
      .on('mousemove.voronoi', () => {
        this.mouseMoveHandler();
      })
      .on('mouseleave.voronoi', () => {
        this.props.hoverNode(this.hover, false);
        this.hover = null;
      });

    this.x.rangeRound([0, plotAreaWidth]).nice();

    if (this.brush.length) {
      this.brushG.transition().call(this.brush.move, this.brushArray.map(this.x));
    }

    this.xAxis.attr('transform', () => {
      const translate = `translate(0,${plotAreaHeight})`;
      return translate;
    }).call(d3Axis.axisBottom(this.x).ticks(nTicks, ''));

    this.simulation = d3Force.forceSimulation(nodeData)
      .force('x', d3Force.forceX(d => this.x(d.date.slice(0, 4))).strength(1))
      .force('y', d3Force.forceY(plotAreaHeight / 2))
      .force('collide', d3Force.forceCollide(forceYcollide))
      .stop();

    for (let i = 0; i < 120; i += 1) this.simulation.tick();

    this.nodes.attr('cx', d => d.x);
    this.nodes.attr('cy', d => d.y);

    this.voronoi = d3Voronoi.voronoi()
      .x(d => d.x)
      .y(d => d.y)
      .size([plotAreaWidth, plotAreaHeight])(nodeData);
  }

  initializeD3() {
    const { width, height } = this.state;
    const nodeData = this.state.nodes;
    const mountPoint = this.mountTimeline;
    const nodeRadius = this.nodeRadius;

    const forceYcollide = nodeRadius + forceYspaceCollide;
    this.plotAreaWidth = width - padding.left - padding.right;
    this.plotAreaHeight = height - padding.top - padding.bottom;
    const nTicks = Math.round(this.plotAreaWidth / 60);

    this.x = d3Scale.scaleLinear()
      .rangeRound([0, this.plotAreaWidth])
      .domain(extent(nodeData, d => parseInt(d.date.slice(0, 4), 10))).nice();

    this.svg = d3Sel.select(mountPoint)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('overflow', 'hidden')
      .attr('id', 'timeline-svg-element');

    this.g = this.svg.append('g')
      .attr('transform', `translate(${padding.left},0)`);

    this.simulation = d3Force.forceSimulation(nodeData)
      .force('x', d3Force.forceX(d => this.x(d.date.slice(0, 4))).strength(1))
      .force('y', d3Force.forceY(this.plotAreaHeight / 2))
      .force('collide', d3Force.forceCollide(forceYcollide))
      .stop();

    for (let i = 0; i < 120; i += 1) this.simulation.tick();

    this.xAxis = this.g.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', () => `translate(0,${this.plotAreaHeight})`)
      .call(d3Axis.axisBottom(this.x).ticks(nTicks, ''));

    this.voronoi = d3Voronoi.voronoi()
      .x(d => d.x)
      .y(d => d.y)
      .size([this.plotAreaWidth, this.plotAreaHeight])(nodeData);

    this.nodes = this.g.append('g')
      .attr('class', 'timeline-nodes')
      .selectAll('timeline-node').data(nodeData, d => d.id)
      .enter()
      .append('circle')
      .attr('class', 'timeline-node')
      .attr('r', d => d.defaultRadius)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('id', d => d.id)
      .on('mouseover', (d) => {
        this.handleNodeHover(d, true);
      })
      .on('mouseout', (d) => {
        this.handleNodeHover(d, false);
      });

    this.brush = this.createBrush();
    this.brushG = this.g.append('g')
      .attr('class', 'timeline-brush')
      .call(this.brush)
      .on('mousemove.voronoi', () => {
        this.mouseMoveHandler();
      })
      .on('mouseleave.voronoi', () => {
        this.props.hoverNode(this.hover, false);
        this.hover = null;
      });

    this.setState({ ...this.state, init: true });
  }

  render() {
    return (
      <div className="mount" ref={(r) => { this.mountTimeline = r; }} />
    );
  }
}

Timeline.propTypes = {
  nodes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    authors: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
    })),
    date: PropTypes.string,
    value: PropTypes.number,
  })).isRequired,
  filteredNodes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    authors: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
    })),
    date: PropTypes.string,
    value: PropTypes.number,
  })).isRequired,
  hoverNode: PropTypes.func.isRequired,
  filterByDate: PropTypes.func.isRequired,
  clearFilterByDate: PropTypes.func.isRequired,
};

export default sizeMe({ monitorHeight: true })(Timeline);
