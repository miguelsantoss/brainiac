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

import './Timeline.scss';

const marginBottom = 20;
const marginRight = 20;
const marginLeft = 20;
const forceYspaceCollide = 1.5;

class Timeline extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodes: props.nodes,
      init: false,
      nodeRadius: 4,
    };

    this.initializeD3 = this.initializeD3.bind(this);
    this.setupNetwork = this.setupNetwork.bind(this);
    this.filterNodes = this.filterNodes.bind(this);
  }

  componentWillMount() {
    const height = document.getElementById('window-timeline-content').clientHeight; // eslint-disable-line no-undef
    const width = document.getElementById('window-timeline-content').clientWidth; // eslint-disable-line no-undef

    this.state.nodes.forEach((d) => {
      d.radius = 4;
      d.defaultRadius = 4;
    });

    this.setState({
      ...this.state,
      width,
      height,
    }, () => {
      this.initializeD3();
    });
  }

  componentWillReceiveProps() {
    this.setState({ ...this.state }, () => { this.filterNodes(); });
    this.handleResize();
  }

  setupNetwork() {
    console.log(this);
  }

  createBrush(x = this.state.d3Viz.x) {
    const { width, height } = this.state;
    return d3Brush.brushX()
      .extent([[0, 0], [width, height]])
      .on('end', () => {
        if (!d3Sel.event.sourceEvent) return; // Only transition after input.
        if (!d3Sel.event.selection) return;
        const d0 = d3Sel.event.selection.map(x.invert);
        const d1 = d0.map(n => Math.round(n));
        this.props.filterByDate(d1);
        this.state.d3Viz.brushG.transition().call(d3Sel.event.target.move, d1.map(x));
      });
  }

  initializeD3() {
    const mountPoint = this.mountTimeline;
    const width = this.state.width;
    const height = this.state.height;
    const nodeRadius = this.state.nodeRadius;
    const forceYcollide = nodeRadius + forceYspaceCollide;
    const nodeData = this.state.nodes;
    const nTicks = Math.ceil(width * 0.01);

    const x = d3Scale.scaleLinear().range([marginLeft, width - (marginRight + marginLeft)]);
    x.domain(extent(nodeData, d => d.date.slice(0, 4)));

    const svg = d3Sel.select(mountPoint)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('overflow', 'hidden')
      .attr('id', 'timeline-svg-element');

    const g = svg.append('g')
      .attr('transform', `translate(${0},0)`);

    const simulation = d3Force.forceSimulation(nodeData)
      .force('x', d3Force.forceX(d => x(d.date.slice(0, 4))).strength(1))
      .force('y', d3Force.forceY(height / 2))
      .force('collide', d3Force.forceCollide(forceYcollide))
      .stop();

    for (let i = 0; i < 120; i += 1) simulation.tick();

    const xAxis = g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', () => `translate(0,${height - marginBottom})`)
      .call(d3Axis.axisBottom(x).ticks(nTicks, ''));

    // const t = d3Transition.transition()
    //     .duration(750);

    const voronoi = d3Voronoi.voronoi()
        .x(d => d.x)
        .y(d => d.y)
        .extent([[0, 0], [width, height]]);

    const voronoiG = g.append('g').attr('class', 'voronoi-path');

    const voronoiGroup = voronoiG
      .selectAll('.voronoi')
      .data(voronoi(nodeData).polygons(), d => d.data.id);

    voronoiGroup.enter().append('path')
          .attr('class', 'voronoi')
          .attr('d', d => (d ? `M${d.join('L')}Z` : null))
          .on('mouseover', (d) => {
            this.props.hoverNode(d.data, true);
          })
          .on('mouseout', (d) => {
            this.props.hoverNode(d.data, false);
          });

    const nodes = g.append('g')
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
        this.props.hoverNode(d, true);
      })
      .on('mouseout', (d) => {
        this.props.hoverNode(d, false);
      });

    const brush = this.createBrush(x);

    const brushG = svg.append('g')
      .attr('class', 'timeline-brush')
      .call(brush);

    const d3Viz = { svg, g, x, xAxis, simulation, nodes, voronoiG, brushG };
    this.setState({ ...this.state, d3Viz, init: true });
  }

  handleResize() {
    if (!this.state.init) return;
    const height = document.getElementById('window-timeline-content').clientHeight; // eslint-disable-line no-undef
    const width = document.getElementById('window-timeline-content').clientWidth; // eslint-disable-line no-undef
    const nTicks = Math.ceil(width * 0.01);
    const nodeRadius = this.state.nodeRadius;
    const forceYcollide = nodeRadius + forceYspaceCollide;
    const nodeData = this.state.nodes;
    const { voronoiG } = this.state.d3Viz;

    this.state.d3Viz.svg
      .attr('width', width)
      .attr('height', height);

    const brush = this.createBrush();
    this.state.d3Viz.brushG.remove();

    const brushG = this.state.d3Viz.svg.append('g')
      .attr('class', 'timeline-brush')
      .call(brush);

    this.state.d3Viz.x.rangeRound([0, width - (marginRight + marginLeft)]);

    this.state.d3Viz.xAxis.attr('transform', () => {
      const translate = `translate(0,${height - marginBottom})`;
      return translate;
    }).call(d3Axis.axisBottom(this.state.d3Viz.x).ticks(nTicks, ''));

    const simulation = d3Force.forceSimulation(nodeData)
      .force('x', d3Force.forceX(d => this.state.d3Viz.x(d.date.slice(0, 4))).strength(1))
      .force('y', d3Force.forceY(height / 2))
      .force('collide', d3Force.forceCollide(forceYcollide))
      .stop();

    for (let i = 0; i < 120; i += 1) simulation.tick();

    this.state.d3Viz.nodes.attr('cx', d => d.x);
    this.state.d3Viz.nodes.attr('cy', d => d.y);

    const voronoi = d3Voronoi.voronoi()
        .x(d => d.x)
        .y(d => d.y)
        .extent([[0, 0], [width, height]]);

    const voronoiGroup = voronoiG.selectAll('.voronoi')
      .data(voronoi(nodeData).polygons(), d => d.data.id);

    voronoiGroup
          .attr('d', d => (d ? `M${d.join('L')}Z` : null));

    this.setState({ ...this.state, width, height, d3Viz: { ...this.state.d3Viz, brushG } });
  }

  filterNodes() {
    const { nodes } = this.state.d3Viz;
    const filter = this.props.filteredNodes;
    nodes.attr('class', (d) => {
      const isPresent = filter.filter(nodeE => nodeE.title === d.title).length > 0;
      return isPresent ? 'timeline-node' : 'timeline-node node-greyed-out';
    });
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
};

export default sizeMe({ monitorHeight: true })(Timeline);
