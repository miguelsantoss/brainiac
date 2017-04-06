// Import React stuff
import React, { Component } from 'react';
import sizeMe from 'react-sizeme';

// Import d3 stuff
import { forceCenter, forceX, forceY, forceSimulation, forceLink, forceManyBody } from 'd3-force';
import { select, event } from 'd3-selection';
import { drag } from 'd3-drag';

// import css
import '../css/App.css';
import '../css/Network.css';

class Network extends Component {
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
    links: React.PropTypes.arrayOf(React.PropTypes.shape({
      source: React.PropTypes.number,
      target: React.PropTypes.number,
      value: React.PropTypes.number,
    })).isRequired,
    hoverNode: React.PropTypes.func.isRequired,
    hover: React.PropTypes.shape({
      name: React.PropTypes.string,
      author: React.PropTypes.string,
      year: React.PropTypes.string,
      value: React.PropTypes.number,
    }),
  }

  static defaultProps = {
    hover: null,
  }

  constructor(props) {
    super(props);
    this.state = {
      nodes: props.nodes,
      links: props.links,
      init: false,
      hover: props.hover,
      filterNodes: props.filterNodes,
    };
    this.initializeD3 = this.initializeD3.bind(this);
    this.setupNetwork = this.setupNetwork.bind(this);
    this.filterNodes = this.filterNodes.bind(this);
  }

  componentDidMount() {
    const height = document.getElementById('window-network-content').clientHeight;
    const width = document.getElementById('window-network-content').clientWidth;

    this.setState({
      ...this.state,
      width,
      height
    }, () => {
      this.initializeD3();
    });
  }

  componentWillReceiveProps() {
    this.handleResize();
    console.log(this.props.filterNodes);
    if (this.props.filterNodes.length !== this.state.filterNodes.length) {
      this.setState({
        ...this.state,
        nodes: this.props.nodes,
        filterNodes: this.props.filterNodes
      }, () => {
        // console.log(this.props.filterNodes);
        // console.log(this.state.filterNodes);
        // this.filterNodes();
      });
    }
  }

  setupNetwork() {
    const svg = this.state.d3Viz.svg;
    const simulation = this.state.d3Viz.simulation;
    const nodes = this.state.filterNodes;

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
      .data(nodes, d => d.author)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', 7)
      .style('stroke', '#FFFFFF')
      .style('fill', '#111111')
      .attr('id', d => d.author)
      .on('mouseover', (d) => {
        this.props.hoverNode(d, true);
      })
      .on('mouseout', (d) => {
        this.props.hoverNode(d, false);
      })
      .call(drag()
        .on('start', (d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    node.append('title')
      .text(d => d.author);

    simulation
      .nodes(nodes)
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

  filterNodes() {
    const { node } = this.state.d3Viz;
    const filter = this.state.filterNodes;
    node.style('fill', d => (filter.filter(nodeE => nodeE.name === d.name).length > 0 ? '#ff00ff' : '#111111'));
  }

  initializeD3() {
    const width = this.state.width;
    const height = this.state.height;
    const linkDistanceMult = this.state.height / 2;
    const mountPoint = this.mountNetwork;

    const svg = select(mountPoint)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('overflow', 'hidden')
      .attr('id', 'network-svg-element');

    const simulation = forceSimulation()
      .force('link', forceLink().distance(linkDistanceMult))
      .force('charge', forceManyBody())
      .force('center', forceCenter(width / 2, height / 2));
      // .force('x', forceX(width / 2))
      // .force('y', forceY(height / 2));

    const d3Viz = { svg, simulation };
    this.setState({ ...this.state, d3Viz }, () => {
      this.setupNetwork();
    });
  }

  handleResize() {
    const height = document.getElementById('window-network-content').clientHeight;
    const width = document.getElementById('window-network-content').clientWidth;

    this.setState({ ...this.state, width, height });

    if (!this.state.init) return;

    this.state.d3Viz.svg = select('#network-svg-element')
      .attr('width', width)
      .attr('height', height);

    this.state.d3Viz.simulation.force('x', forceX(width / 2)).force('y', forceY(height / 2));
    this.state.d3Viz.simulation.alphaTarget(0.3).restart();
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
