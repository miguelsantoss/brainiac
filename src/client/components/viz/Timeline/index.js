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
      nodeRadius: 4,
      brush: [],
    };

    this.hover = null;
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

  mouseMoveHandler() {
    // get the current mouse position
    const [mx, my] = d3Sel.mouse(this.state.d3Viz.brushG.node());

    // use the new diagram.find() function to find the voronoi site closest to
    // the mouse, limited by max distance defined by voronoiRadius
    const site = this.state.d3Viz.voronoi.find(mx, my);

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

  createBrush(
    x = this.state.d3Viz.x,
    plotAreaWidth = this.state.d3Viz.plotAreaWidth,
    plotAreaHeight = this.state.d3Viz.plotAreaHeight,
  ) {
    return d3Brush.brushX()
      .extent([[0, 0], [plotAreaWidth, plotAreaHeight]])
      .on('end', () => {
        if (!d3Sel.event.sourceEvent) return; // Only transition after input.
        if (!d3Sel.event.selection) {
          this.props.clearFilterByDate();
          return;
        }
        const d0 = d3Sel.event.selection.map(x.invert);
        const d1 = d0.map(n => Math.round(n));
        this.props.filterByDate(d1);
        this.setState({ ...this.state, brush: d1 });
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

    const plotAreaWidth = width - padding.left - padding.right;
    const plotAreaHeight = height - padding.top - padding.bottom;
    const nTicks = Math.round(plotAreaWidth / 60);

    const x = d3Scale.scaleLinear()
      .rangeRound([0, plotAreaWidth])
      .domain(extent(nodeData, d => parseInt(d.date.slice(0, 4), 10))).nice();

    const svg = d3Sel.select(mountPoint)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('overflow', 'hidden')
      .attr('id', 'timeline-svg-element');

    const g = svg.append('g')
      .attr('transform', `translate(${padding.left},0)`);

    const simulation = d3Force.forceSimulation(nodeData)
      .force('x', d3Force.forceX(d => x(d.date.slice(0, 4))).strength(1))
      .force('y', d3Force.forceY(plotAreaHeight / 2))
      .force('collide', d3Force.forceCollide(forceYcollide))
      .stop();

    for (let i = 0; i < 120; i += 1) simulation.tick();

    const xAxis = g.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', () => `translate(0,${plotAreaHeight})`)
      .call(d3Axis.axisBottom(x).ticks(nTicks, ''));

    const voronoi = d3Voronoi.voronoi()
      .x(d => d.x)
      .y(d => d.y)
      .size([plotAreaWidth, plotAreaHeight])(nodeData);

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

    const brush = this.createBrush(x, plotAreaWidth, plotAreaHeight);
    const brushG = g.append('g')
      .attr('class', 'timeline-brush')
      .call(brush);

    const d3Viz = {
      svg,
      g,
      x,
      xAxis,
      simulation,
      nodes,
      voronoi,
      brushG,
      brush,
      plotAreaHeight,
      plotAreaWidth,
    };
    this.setState({ ...this.state, d3Viz, init: true });
  }

  handleResize() {
    if (!this.state.init) return;
    const height = document.getElementById('window-timeline-content').clientHeight; // eslint-disable-line no-undef
    const width = document.getElementById('window-timeline-content').clientWidth; // eslint-disable-line no-undef
    const nodeRadius = this.state.nodeRadius;
    const forceYcollide = nodeRadius + forceYspaceCollide;
    const nodeData = this.state.nodes;

    const plotAreaWidth = width - padding.left - padding.right;
    const plotAreaHeight = height - padding.top - padding.bottom;
    const nTicks = Math.round(plotAreaWidth / 60);
    const { x } = this.state.d3Viz;

    this.state.d3Viz.svg
      .attr('width', width)
      .attr('height', height);

    const brush = this.createBrush();
    this.state.d3Viz.brushG.remove();

    const brushG = this.state.d3Viz.g.append('g')
      .attr('class', 'timeline-brush')
      .call(brush)
      .on('mousemove.voronoi', () => {
        this.mouseMoveHandler();
      })
      .on('mouseleave.voronoi', () => {
        this.props.hoverNode(this.hover, false);
        this.hover = null;
      });

    x.rangeRound([0, plotAreaWidth]).nice();

    if (this.state.brush.length) {
      brushG.transition().call(brush.move, this.state.brush.map(x));
    }

    this.state.d3Viz.xAxis.attr('transform', () => {
      const translate = `translate(0,${plotAreaHeight})`;
      return translate;
    }).call(d3Axis.axisBottom(x).ticks(nTicks, ''));

    const simulation = d3Force.forceSimulation(nodeData)
      .force('x', d3Force.forceX(d => this.state.d3Viz.x(d.date.slice(0, 4))).strength(1))
      .force('y', d3Force.forceY(plotAreaHeight / 2))
      .force('collide', d3Force.forceCollide(forceYcollide))
      .stop();

    for (let i = 0; i < 120; i += 1) simulation.tick();

    this.state.d3Viz.nodes.attr('cx', d => d.x);
    this.state.d3Viz.nodes.attr('cy', d => d.y);

    const voronoi = d3Voronoi.voronoi()
      .x(d => d.x)
      .y(d => d.y)
      .size([plotAreaWidth, plotAreaHeight])(nodeData);

    this.setState({
      ...this.state,
      width,
      height,
      d3Viz: {
        ...this.state.d3Viz,
        brushG,
        brush,
        voronoi,
        plotAreaHeight,
        plotAreaWidth,
      },
    });
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
  clearFilterByDate: PropTypes.func.isRequired,
};

export default sizeMe({ monitorHeight: true })(Timeline);
