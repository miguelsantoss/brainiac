// Import React stuff
import React, { Component } from 'react';
import sizeMe from 'react-sizeme';

// Import d3 stuff
import { forceX, forceY, forceSimulation, forceLink, forceManyBody } from 'd3-force';
import { select, event } from 'd3-selection';
import { drag } from 'd3-drag';
import { range } from 'd3-array';
import { scaleOrdinal, schemeCategory20 } from 'd3-scale';
import * as d3quadtree from 'd3-quadtree';

// import css
import '../css/Network.scss';

class ClusterLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodes: props.nodes,
      links: props.links,
      init: false
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
    
    let n = 200, // total number of nodes
        m = 10, // number of distinct clusters
        z = scaleOrdinal(schemeCategory20);

    let clusters = new Array(m);

    let nodes = range(200).map(() => {
        let i = Math.floor(Math.random() * m),
            radius = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,
        d = {
          cluster: i,
          r: radius,
          x: Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random(),
          y: Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random()
        };
        if (!clusters[i] || (radius > clusters[i].r)) clusters[i] = d;
        return d;
    });

    this.setState({
      ...this.state,
      width,
      height,
      padding, clusterPadding, n, m, z, clusters
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
    const z = scaleOrdinal(schemeCategory20);
    const { nodes, clusters, n, m, maxRadius, padding, clusterPadding } = this.state;

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
      .attr('r', d => d.r)
      .attr('id', d => d.id)
      .attr('fill', d => z(d.cluster))
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

    simulation
      .force('collide', (alpha) => {
        var quadtree = d3quadtree.quadtree()
        .x((d) => d.x)
        .y((d) => d.y)
        .addAll(nodes);

        nodes.forEach(function(d) {
          var r = d.r + maxRadius + Math.max(padding, clusterPadding),
              nx1 = d.x - r,
              nx2 = d.x + r,
              ny1 = d.y - r,
              ny2 = d.y + r;
          quadtree.visit(function(quad, x1, y1, x2, y2) {

            if (quad.data && (quad.data !== d)) {
              var x = d.x - quad.data.x,
                  y = d.y - quad.data.y,
                  l = Math.sqrt(x * x + y * y),
                  r = d.r + quad.data.r + (d.cluster === quad.data.cluster ? padding : clusterPadding);
              if (l < r) {
                l = (l - r) / l * alpha;
                d.x -= x *= l;
                d.y -= y *= l;
                quad.data.x += x;
                quad.data.y += y;
              }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
          });
        });
      })
      .force('cluster', (alpha) => {
        nodes.forEach(function(d) {
          var cluster = clusters[d.cluster];
          if (cluster === d) return;
          var x = d.x - cluster.x,
              y = d.y - cluster.y,
              l = Math.sqrt(x * x + y * y),
              r = d.r + cluster.r;
          if (l !== r) {
            l = (l - r) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            cluster.x += x;
            cluster.y += y;
          }
        });
      })
      .on('tick', () => {
        node
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);
      });
      
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
      .attr('id', 'cluster-svg-element');

    const simulation = forceSimulation(nodes)
      .velocityDecay(0.2)
      .force('x', forceX(width / 2).strength(0.005))
      .force('y', forceY(height / 2).strength(0.005));

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
