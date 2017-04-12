// Import React stuff
import React, { Component } from 'react';
import sizeMe from 'react-sizeme';

// Import d3 stuff
import * as d3Force from 'd3-force';
import * as d3Scale from 'd3-scale';
import * as d3Sel from 'd3-selection';
// import * as d3Drag from 'd3-drag';
// import * as d3Request from 'd3-request';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import * as d3Voronoi from 'd3-voronoi';
// import * as d3Format from 'd3-format';
// import * as d3Time from 'd3-time';

// import css
import '../css/Timeline.scss';

const marginBottom = 20;
const marginRight = 20;
const marginLeft = 20;

class Timeline extends Component {
  static propTypes = {
    nodes: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string,
      author: React.PropTypes.string,
      year: React.PropTypes.string,
      value: React.PropTypes.number,
    })).isRequired,
    filterNodes: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string,
      author: React.PropTypes.string,
      year: React.PropTypes.string,
      value: React.PropTypes.number,
    })).isRequired,
    hoverNode: React.PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      nodes: props.nodes,
      init: false,
    };

    this.initializeD3 = this.initializeD3.bind(this);
    this.setupNetwork = this.setupNetwork.bind(this);
    this.filterNodes = this.filterNodes.bind(this);
  }

  componentDidMount() {
    const height = document.getElementById('window-timeline-content').clientHeight;
    const width = document.getElementById('window-timeline-content').clientWidth;

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
    const nodeRadius = 6;

    const x = d3Scale.scaleLinear().rangeRound([0, width - (marginRight + marginLeft)]);
    x.domain(d3Array.extent(this.state.nodes, d => d.year));

    const svg = d3Sel.select(mountPoint)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('overflow', 'hidden')
      .attr('id', 'timeline-svg-element');

    const g = svg.append('g')
      .attr('transform', 'translate(20,0)');

    const simulation = d3Force.forceSimulation(this.state.nodes)
      .force('x', d3Force.forceX(d => x(d.year)).strength(1))
      .force('y', d3Force.forceY(height / 2))
      .force('collide', d3Force.forceCollide(nodeRadius + 1.5))
      .stop();

    for (let i = 0; i < 120; i += 1) simulation.tick();

    const nTicks = Math.ceil(width * 0.01);
    const xAxis = g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', () => {
        const translate = `translate(0,${height - marginBottom})`;
        return translate;
      })
      .call(d3Axis.axisBottom(x).ticks(nTicks, ''));

    const cell = g.append('g')
      .attr('class', 'cells')
    .selectAll('g').data(d3Voronoi.voronoi()
        .extent([[0, 0], [width, height]])
        .x(d => d.x)
        .y(d => d.y)
      .polygons(this.state.nodes))
      .enter()
      .append('g');

    const nodes = cell.append('circle')
      .attr('class', 'timeline-node')
      .attr('r', nodeRadius)
      .attr('cx', d => d.data.x)
      .attr('cy', d => d.data.y)
      .attr('id', d => d.data.author);

    cell.append('path')
      .attr('d', d => `M${d.join('L')}Z`)
      .on('mouseover', (d) => {
        this.props.hoverNode(d.data, true);
      })
      .on('mouseout', (d) => {
        this.props.hoverNode(d.data, false);
      });

    cell.append('title')
      .text(d => `${d.data.name}\n${d.data.author}`);

    const d3Viz = { svg, cell, g, x, xAxis, simulation, nodes };
    this.setState({ ...this.state, d3Viz, init: true });
  }

  handleResize() {
    const height = document.getElementById('window-timeline-content').clientHeight;
    const width = document.getElementById('window-timeline-content').clientWidth;

    this.setState({ ...this.state, width, height });

    if (!this.state.init) return;

    this.state.d3Viz.svg
      .attr('width', width)
      .attr('height', height);

    this.state.d3Viz.x.rangeRound([0, width - (marginRight + marginLeft)]);

    const nTicks = Math.ceil(width * 0.01);
    this.state.d3Viz.xAxis.attr('transform', () => {
      const translate = `translate(0,${height - marginBottom})`;
      return translate;
    }).call(d3Axis.axisBottom(this.state.d3Viz.x).ticks(nTicks, ''));

    this.state.d3Viz.simulation
      .force('x', d3Force.forceX(d => this.state.d3Viz.x(d.year)).strength(1))
      .force('y', d3Force.forceY(height / 2))
      .force('collide', d3Force.forceCollide(4))
      .stop();

    for (let i = 0; i < 120; i += 1) this.state.d3Viz.simulation.tick();

    this.state.d3Viz.nodes.attr('x', d => this.state.d3Viz.x(d.data.year));
    this.state.d3Viz.nodes.attr('cx', d => this.state.d3Viz.x(d.data.year));

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

  filterNodes() {
    const { nodes } = this.state.d3Viz;
    const filter = this.props.filterNodes;
    nodes.attr('class', (d) => {
      const isPresent = filter.filter(nodeE => nodeE.name === d.data.name).length > 0;
      return isPresent ? 'timeline-node' : 'timeline-node node-greyed-out';
    });
  }

  render() {
    return (
      <div className="drag-wrapper">
        <div className="handle text-vert-center">
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
