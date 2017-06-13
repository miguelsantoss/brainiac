// Import React stuff
import React, { Component } from 'react';
import sizeMe from 'react-sizeme';

// Import d3 stuff
import { forceX, forceY, forceSimulation, forceLink, forceManyBody, forceCollide } from 'd3-force';
import { select, event, mouse } from 'd3-selection';
import { drag } from 'd3-drag';
import { range } from 'd3-array';
import * as d3Scale from 'd3-scale';
import * as d3Zoom from 'd3-zoom';
import * as d3Cluster from 'd3-force-cluster'
import * as d3Attract from 'd3-force-attract'

// import css
// import '../css/Network.scss';

class ClusterLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodes: props.filteredNodes,
      links: props.links,
      init: false,
      drag: false,
      zoom: {
        scaleFactor: 1,
        translation: [0,0],
      },
    };
    this.initializeD3 = this.initializeD3.bind(this);
    this.setupNetwork = this.setupNetwork.bind(this);
    this.filterNodes = this.filterNodes.bind(this);
  }

  componentDidMount() {
    const height = document.getElementById('window-cluster-content').clientHeight;
    const width = document.getElementById('window-cluster-content').clientWidth;

    let padding = 1.5, // separation between same-color circles
        clusterPadding = 6, // separation between different-color circles
        maxRadius = 12;
    
    let n_clusters = 0;
    this.state.nodes.forEach((d) => {
      n_clusters = d.cluster > n_clusters ? d.cluster : n_clusters;
    })
    
    const color = d3Scale.scaleSequential(d3Scale.interpolateRainbow)
    .domain(range(n_clusters));

    let clusters = new Array(n_clusters);

    this.state.nodes.forEach(d => {
      const i = d.cluster;
      const r = Math.sqrt((i + 1) / n_clusters * -Math.log(Math.random())) * maxRadius;
      d.radius = 5;
      if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
    })

    this.setState({
      ...this.state,
      width,
      height,
      padding, clusterPadding, n_clusters, color, clusters
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
    const { nodes, clusters, n_clusters, color, maxRadius, padding, clusterPadding, width, height } = this.state;

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
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'network-node')
      .attr('r', d => d.radius)
      .attr('id', d => d.id)
      .attr('fill', d => color(d.cluster/10))
      .on('mouseover', (d) => {
        if(!this.state.drag)
          this.props.hoverNode(d, true);
      })
      .on('mouseout', (d) => {
        if(!this.state.drag)
          this.props.hoverNode(d, false);
      })
      .call(drag()
        .on('start', (d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          this.props.hoverNode(d, true);
          this.state.drag = true;
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (d) => {
          const mouseCoords = mouse(svg.node());
          d.fx = (mouseCoords[0] - this.state.zoom.translation[0]) / this.state.zoom.scaleFactor;
          d.fy = (mouseCoords[1] - this.state.zoom.translation[1]) / this.state.zoom.scaleFactor;
        })
        .on('end', (d) => {
          if (!event.active) simulation.alphaTarget(0);
          this.state.drag = false;
          this.props.hoverNode(d, false);
          d.fx = null;
          d.fy = null;
        })
      );

    simulation
      .force('cluster', d3Cluster.forceCluster()
        .centers(function (d) { return clusters[d.cluster]; })
        .strength(0.5))
      .force('collide', forceCollide(d => d.radius + padding))
      .on('tick', (e) => {
        node
          .attr('cx', d => this.state.zoom.translation[0] + this.state.zoom.scaleFactor * d.x)
          .attr('cy', d => this.state.zoom.translation[1] + this.state.zoom.scaleFactor * d.y);
      })
      .nodes(nodes);
      
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
    const { width, height, nodes } = this.state;
    const linkDistanceMult = this.state.height / 2;
    const mountPoint = this.mountClusterLayout;

    const svg = select(mountPoint)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('overflow', 'hidden')
      .attr('id', 'cluster-svg-element')
      .on('click', () => {
        if(event.ctrlKey) {
          console.log('Ctrl+click has just happened!');
        }
        else if(event.altKey) {
          console.log('Alt+click has just happened!');
        }
      })
      .call(d3Zoom.zoom().on('zoom', (d) => {
        const scaleFactor = event.transform.k;
        const translation = [event.transform.x, event.transform.y];
        this.setState({
          ...this.state,
          zoom: {
            scaleFactor, translation,
          }
        }, () => {
          this.state.d3Viz.simulation.restart();
        })
     }).scaleExtent([0.1,10]))
     .on('dblclick.zoom', null);

    const simulation = forceSimulation()
      .force('x', forceX(width / 2))
      .force('y', forceY(height / 2));

    const d3Viz = { svg, simulation };
    this.setState({ ...this.state, d3Viz }, () => {
      this.setupNetwork();
    });
  }

  handleResize() {
    const height = document.getElementById('window-cluster-content').clientHeight;
    const width = document.getElementById('window-cluster-content').clientWidth;

    this.setState({ ...this.state, width, height });

    if (!this.state.init) return;

    this.state.d3Viz.svg.attr('width', width).attr('height', height);

    this.state.d3Viz.simulation.force('x', forceX(width / 2).strength(0.0005)).force('y', forceY(height / 2).strength(0.0005));
    this.state.d3Viz.simulation.alphaTarget(0.3).restart();
  }

  render() { 
    return (
      <div className="drag-wrapper">
        <div className="LayoutHandle handle text-vert-center">
          <span>ClusterLayout</span>
        </div>
        <div id="window-cluster-content" className="content no-cursor text-vert-center">
          <div className="mount" ref={(r) => { this.mountClusterLayout = r; }} />
        </div>
      </div>
    );
  }
}

export default sizeMe({ monitorHeight: true })(ClusterLayout);