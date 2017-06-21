// Import React stuff
import React, { Component } from 'react';
import sizeMe from 'react-sizeme';

// Import d3 stuff
import * as d3Force from 'd3-force';
import * as d3Scale from 'd3-scale';
import * as d3Sel from 'd3-selection';
// import * as d3Drag from 'd3-drag';
// import * as d3Request from 'd3-request';
import { extent } from 'd3-array';
import * as d3Axis from 'd3-axis';
import * as d3Voronoi from 'd3-voronoi';
import * as d3Transition from 'd3-transition'
import * as d3Timer from 'd3-timer';
// import * as d3Format from 'd3-format';
// import * as d3Time from 'd3-time';

// import css
import '../css/Timeline.scss';

const marginBottom = 20;
const marginRight = 20;
const marginLeft = 20;
const forceYspaceCollide = 1.5;

class Timeline extends Component {
  static propTypes = {
    nodes: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.string,
      title: React.PropTypes.string,
      authors: React.PropTypes.arrayOf(React.PropTypes.shape({
        name: React.PropTypes.string
      })),
      date: React.PropTypes.string,
      value: React.PropTypes.number,
    })).isRequired,
    filteredNodes: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.string,
      title: React.PropTypes.string,
      authors: React.PropTypes.arrayOf(React.PropTypes.shape({
        name: React.PropTypes.string
      })),
      date: React.PropTypes.string,
      value: React.PropTypes.number,
    })).isRequired,
    hoverNode: React.PropTypes.func.isRequired,
  }

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

  componentDidMount() {
    const height = document.getElementById('window-timeline-content').clientHeight;
    const width = document.getElementById('window-timeline-content').clientWidth;

    this.state.nodes.forEach(d => {
      d.radius = 4;
      d.defaultRadius = 4;
    })

    this.setState({
      ...this.state,
      width,
      height
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

  initializeD3() {
    const mountPoint = this.mountTimeline;
    const width = this.state.width;
    const height = this.state.height;
    const nodeRadius = this.state.nodeRadius;
    const forceYcollide = nodeRadius + forceYspaceCollide;
    const nodeData = this.state.nodes;
    const nTicks = Math.ceil(width * 0.01);

    const x = d3Scale.scaleLinear().rangeRound([0, width - (marginRight + marginLeft)]);
    x.domain(extent(nodeData, d => d.date.slice(0, 4)));

    const svg = d3Sel.select(mountPoint)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('overflow', 'hidden')
      .attr('id', 'timeline-svg-element');

    const g = svg.append('g')
      .attr('transform', 'translate(20,0)');

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

    var t = d3Transition.transition()
        .duration(750);

    var voronoi = d3Voronoi.voronoi()
        .x(d => d.x)
        .y(d => d.y)
        .extent([[0, 0], [width, height]]);

    const voronoiG = g.append('g').attr('class', 'voronoi-path');
    
    const voronoiGroup = voronoiG
      .selectAll('.voronoi')
      .data(voronoi(nodeData).polygons(), d => d.data.id);

    voronoiGroup.enter().append('path')
          .attr('class', 'voronoi')
          .attr('d', d => d ? 'M' + d.join('L') + 'Z' : null)
          .on('mouseover', d => {
            this.props.hoverNode(d.data, true);
          })
          .on('mouseout', d => {
            this.props.hoverNode(d.data, false);
          });

    const nodes = g.append('g')
      .attr('class', 'timeline-nodes')
      .selectAll('timeline-node').data(nodeData, d => d.id)
      .enter().append('circle')
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

    const d3Viz = { svg, g, x, xAxis, simulation, nodes, t, voronoiG };
    this.setState({ ...this.state, d3Viz, init: true });
  }

  handleResize() {
    if (!this.state.init) return;
    const height = document.getElementById('window-timeline-content').clientHeight;
    const width = document.getElementById('window-timeline-content').clientWidth;
    const nTicks = Math.ceil(width * 0.01);
    const nodeRadius = this.state.nodeRadius;
    const forceYcollide = nodeRadius + forceYspaceCollide;
    const nodeData = this.state.nodes;
    const { t, g, voronoiG } = this.state.d3Viz;

    this.setState({ ...this.state, width, height });

    this.state.d3Viz.svg
      .attr('width', width)
      .attr('height', height);

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

    var voronoi = d3Voronoi.voronoi()
        .x(d => d.x)
        .y(d => d.y)
        .extent([[0, 0], [width, height]]);
    
    const voronoiGroup = voronoiG.selectAll('.voronoi')
      .data(voronoi(nodeData).polygons(), d => d.data.id);

    voronoiGroup
          .attr('d', d => d ? 'M' + d.join('L') + 'Z' : null)
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
      <div className="drag-wrapper">
        <div className="LayoutHandle handle text-vert-center">
          <span>Timeline</span>
        </div>
        <div id="window-timeline-content" className="content text-vert-center">
          <div className="mount" ref={(r) => { this.mountTimeline = r; }} />
        </div>
      </div>
    );
  }
}

export default sizeMe({ monitorHeight: true })(Timeline);