import React, { Component } from 'react';
import PropTypes from 'prop-types';
import sizeMe from 'react-sizeme';

import * as d3Force from 'd3-force';
import * as d3Sel from 'd3-selection';
import * as d3Drag from 'd3-drag';
import * as d3Scale from 'd3-scale';
import * as d3Zoom from 'd3-zoom';
import * as d3Cluster from 'd3-force-cluster'; // eslint-disable-line import/extensions

import compareArrays from '../../../lib/arrays';
import './cluster.scss';

class ClusterLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodes: props.nodes,
      init: false,
    };

    this.drag = false;
    this.zoom = {
      scaleFactor: 1,
      translation: [0, 0],
    };
  }

  componentWillMount() {
    const width = document.getElementById('window-cluster-content').clientWidth; // eslint-disable-line no-undef
    const height = document.getElementById('window-cluster-content').clientHeight; // eslint-disable-line no-undef
    this.padding = 1.5; // separation between same-color circles
    this.clusterPadding = 6; // separation between different-color circles
    this.maxRadius = 12;

    this.nClusters = 0;
    this.state.nodes.forEach((d) => {
      this.nClusters = d.cluster > this.nClusters ? d.cluster : this.nClusters;
    });

    const color = [
      '#e6194b', // Red
      '#3cb44b', // Green
      '#ffe119', // Yellow
      '#0082c8', // Blue
      '#f58231', // Orange
      '#911eb4', // Purple
      '#f032e6', // Magenta
      '#008080', // Teal
      '#aa6e28', // Brown
      '#000000', // Black
    ];

    this.color = d3Scale.scaleOrdinal(color);
    this.clusters = new Array(this.nClusters);
    this.state.nodes.forEach((d) => {
      const i = d.cluster;
      const r = (Math.sqrt((i + 1) / this.nClusters) * -Math.log(Math.random())) * this.maxRadius;
      d.radius = 4;
      d.defaultRadius = 4;
      if (!this.clusters[i] || (r > this.clusters[i].radius)) this.clusters[i] = d;
    });

    this.nodes = this.state.nodes;
    this.setState({ ...this.state, width, height }, () => this.initializeD3());
  }

  componentWillReceiveProps() {
    const width = document.getElementById('window-cluster-content').clientWidth; // eslint-disable-line no-undef
    const height = document.getElementById('window-cluster-content').clientHeight; // eslint-disable-line no-undef
    this.handleResize(width, height, this.state.width, this.state.height);
    this.setState({ ...this.state, width, height }, () => {
      if (!this.props.queryResult) this.filterNodes();
      else this.handleNewNodes();
    });
  }

  filterNodes() {
    const filter = this.props.filteredNodes;
    if (!this.state.init || compareArrays(this.state.nodes, filter)) return;

    this.node.attr('class', (d) => {
      const isPresent = filter.filter(nodeE => nodeE.title === d.title).length > 0;
      return isPresent ? 'network-node' : 'network-node node-greyed-out';
    });
  }

  handleNewNodes = () => {
    this.nodes = this.props.filteredNodes;
    this.updateNodes();
  }

  handleNodeHover = (d, state) => {
    if (!d3Sel.event.ctrlKey) this.hoverTooltip.classed('hover-tn', state);
    this.props.hoverNode(d, state);
  }

  handleResize(newWidth, newHeight, oldWidth, oldHeight) {
    if (!this.state.init) return;
    if (newWidth === oldWidth && newHeight === oldHeight) return;

    this.svg.attr('width', newWidth).attr('height', newHeight);
    this.simulation.force('x', d3Force.forceX(newWidth / 2)).force('y', d3Force.forceY(newHeight / 2));
    this.simulation.alphaTarget(0.3).restart();
  }

  initializeD3() {
    const { width, height } = this.state;
    const mountPoint = this.mountClusterLayout;

    const zoom = d3Zoom.zoom().on('zoom', () => {
      const scaleFactor = d3Sel.event.transform.k;
      const translation = [d3Sel.event.transform.x, d3Sel.event.transform.y];
      this.zoom = {
        scaleFactor, translation,
      };
      if (this.simulation) this.simulation.restart();
    }).scaleExtent([0.01, 100]);

    this.svg = d3Sel.select(mountPoint)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('overflow', 'hidden')
      .attr('id', 'cluster-svg-element')
      .on('click', () => {
        if (d3Sel.event.ctrlKey) {
          console.log('Ctrl+click has just happened!');
        } else if (d3Sel.event.altKey) {
          console.log('Alt+click has just happened!');
        }
      })
      .call(zoom)
     .on('dblclick.zoom', null);

    this.node = this.svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle');

    this.simulation = d3Force.forceSimulation()
      .force('cluster', d3Cluster.forceCluster()
        .centers(d => this.clusters[d.cluster])
        .strength(0.5))
      .force('collide', d3Force.forceCollide(d => d.radius + this.padding))
      .force('x', d3Force.forceX(width / 2))
      .force('y', d3Force.forceY(height / 2))
      .on('tick', () => {
        this.node
          .attr('cx', d => this.zoom.translation[0] + (this.zoom.scaleFactor * d.x))
          .attr('cy', d => this.zoom.translation[1] + (this.zoom.scaleFactor * d.y));
      });

    this.hoverTooltip = this.svg.append('text')
      .attr('x', 2)
      .attr('y', height - 5)
      .attr('class', 'cluster-toolip-text')
      .text('To highlight the document on the list, hold the ctrl key when hovering');
    this.setState({ ...this.state, init: true }, () => this.updateNodes());
  }

  updateNodes = () => {
    this.node.remove();
    this.node = this.svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle');
    this.node = this.node.data(this.nodes, d => d.id);
    this.node.exit().remove();
    this.node = this.node.enter()
     .append('circle')
     .attr('class', 'network-node')
     .attr('r', d => d.radius)
     .attr('id', d => d.id)
     .attr('fill', d => this.color(d.cluster / 10))
     .on('mouseover', (d) => {
       if (!this.drag) {
         this.handleNodeHover(d, true);
       }
     })
     .on('mouseout', (d) => {
       if (!this.drag) {
         this.handleNodeHover(d, false);
       }
     })
     .call(d3Drag.drag()
       .on('start', (d) => {
         if (!d3Sel.event.active) this.simulation.alphaTarget(0.3).restart();
         this.props.hoverNode(d, true);
         this.drag = true;
         d.fx = d.x;
         d.fy = d.y;
       })
       .on('drag', (d) => {
         const mouseCoords = d3Sel.mouse(this.svg.node());
         d.fx = (mouseCoords[0] - this.zoom.translation[0]) / this.zoom.scaleFactor;
         d.fy = (mouseCoords[1] - this.zoom.translation[1]) / this.zoom.scaleFactor;
       })
       .on('end', (d) => {
         if (!d3Sel.event.active) this.simulation.alphaTarget(0);
         this.drag = false;
         this.props.hoverNode(d, false);
         d.fx = null;
         d.fy = null;
       }));

    this.simulation.nodes(this.nodes);
    this.simulation.alpha(1).restart();
  }

  render() {
    return (
      <div className="mount" ref={(r) => { this.mountClusterLayout = r; }} />
    );
  }
}

ClusterLayout.propTypes = {
  hoverNode: PropTypes.func.isRequired,
  queryResult: PropTypes.bool.isRequired,
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
};

export default sizeMe({ monitorHeight: true })(ClusterLayout);
