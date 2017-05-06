// Import React stuff
import React, { Component } from 'react';
import sizeMe from 'react-sizeme';

// Import d3 stuff
import { forceX, forceY, forceSimulation, forceLink, forceManyBody } from 'd3-force';
import { select, event } from 'd3-selection';
import { drag } from 'd3-drag';

// import css
import '../css/Network.scss';

class Network extends Component {
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
    links: React.PropTypes.arrayOf(React.PropTypes.shape({
      source: React.PropTypes.any,
      target: React.PropTypes.any,
      value: React.PropTypes.number,
    })).isRequired,
    hoverNode: React.PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      nodes: props.nodes,
      links: props.links,
      init: false,
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
    this.setState({ ...this.state }, () => { this.filterNodes(); });
    this.handleResize();
  }

  setupNetwork() {
    const svg = this.state.d3Viz.svg;
    const simulation = this.state.d3Viz.simulation;
    const nodes = this.props.filteredNodes;

    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(this.state.links)
      .enter()
      .append('line')
      .attr('class', 'line-network')
      .attr('stroke-width', 1.5);

    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes, d => d.id)
      .enter()
      .append('circle')
      .attr('class', 'network-node')
      .attr('r', 7)
      .attr('id', d => d.id)
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
      .text(d => d.title);

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
    const { node, link } = this.state.d3Viz;
    const filter = this.props.filteredNodes;
    node.attr('class', (d) => {
      const isPresent = filter.filter(nodeE => nodeE.title === d.title).length > 0;
      return isPresent ? 'network-node' : 'network-node node-greyed-out';
    });
    link.attr('class', (d) => {
      const filterLength = filter.length;
      for (let i = 0; i < filterLength; i += 1) {
        if (filter[i].title === d.source.title) {
          for (let j = 0; j < filterLength; j += 1) {
            if (filter[j].title === d.target.title && i !== j) {
              return 'line-network';
            }
          }
        }
      }
      return 'line-network line-greyed-out';
    });
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
      .force('x', forceX(width / 2))
      .force('y', forceY(height / 2));
      // .force('center', forceCenter(width / 2, height / 2));

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

    this.state.d3Viz.svg.attr('width', width).attr('height', height);

    this.state.d3Viz.simulation.force('x', forceX(width / 2)).force('y', forceY(height / 2));
    this.state.d3Viz.simulation.alphaTarget(0.3).restart();
  }

  render() {
    return (
      <div className="drag-wrapper">
        <div className="LayoutHandle handle text-vert-center">
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
