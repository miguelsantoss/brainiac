import React, { Component } from 'react';
import PropTypes from 'prop-types';
import sizeMe from 'react-sizeme';
import { DropTarget } from 'react-dnd';

import * as d3Force from 'd3-force';
import * as d3Sel from 'd3-selection';
import * as d3Drag from 'd3-drag';
import * as d3Scale from 'd3-scale';
import * as d3Zoom from 'd3-zoom';
import * as d3Transition from 'd3-transition';
import * as d3Cluster from 'd3-force-cluster'; // eslint-disable-line import/extensions
import * as d3Ease from 'd3-ease';

import compareArrays from '../../../lib/arrays';
import './cluster.scss';

const boxTarget = {
  drop(props, monitor, component) {
    const item = monitor.getItem();
    component.svg.dispatch('click', { detail: item });
  },
};

class ClusterLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodes: props.nodes,
      init: false,
    };

    this.drag = false;
    this.magnetNodes = [];
    this.activeMagnets = [];
    this.zoom = {
      scaleFactor: 1,
      translation: [0, 0],
    };

    // click and dblclick stuff
    this.prevent = false;
    this.timer = 0;
    this.delay = 200;
  }

  componentWillMount() {
    const width = document.getElementById('window-cluster-content').clientWidth; // eslint-disable-line no-undef
    const height = document.getElementById('window-cluster-content').clientHeight; // eslint-disable-line no-undef, prettier/prettier
    this.padding = 1.5; // separation between same-color circles
    this.clusterPadding = 6; // separation between different-color circles
    this.maxRadius = 12;

    this.nClusters = 0;
    this.state.nodes.forEach(d => {
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
    this.state.nodes.forEach(d => {
      const i = d.cluster;
      const r =
        Math.sqrt((i + 1) / this.nClusters) *
        -Math.log(Math.random()) *
        this.maxRadius;
      d.radius = 4;
      d.defaultRadius = 4;
      if (!this.clusters[i] || r > this.clusters[i].radius) {
        this.clusters[i] = d;
      }
    });

    this.nodes = this.state.nodes;
    this.setState({ ...this.state, width, height }, () => this.initializeD3());
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.focusedNode && nextProps.focusedNode) {
      console.info('new focus node');
      this.nodes.forEach(n => {
        if (n.id === nextProps.focusedNode.id) {
          n.radius = nextProps.focusedNode.radius;
        }
      });
      this.handleBiggerNode();
    } else if (this.props.focusedNode && !nextProps.focusedNode) {
      console.info('clear focus node');
      this.nodes.forEach(n => {
        if (n.id === this.props.focusedNode.id) {
          n.radius = this.props.focusedNode.radius;
        }
      });
      this.handleBiggerNode();
    }
    const width = document.getElementById('window-cluster-content').clientWidth; // eslint-disable-line no-undef
    const height = document.getElementById('window-cluster-content').clientHeight; // eslint-disable-line no-undef
    this.handleResize(width, height, this.state.width, this.state.height);
    this.setState({ ...this.state, width, height }, () => {
      if (!this.props.queryResult) this.filterNodes();
      else this.handleNewNodes();
    });
  }

  createMagnet = word => {
    const randomNumber = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    let id = `m${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}`;
    for (let i = 0; i < this.magnetNodes.length; i += 1) {
      if (this.magnetNodes[i] === id) {
        id = `m${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}`;
        i = 0;
      }
    }

    this.magnetNodes.push({
      id,
      text: word,
    });

    this.magnets
      .selectAll('.magnet-node')
      .data(this.magnetNodes, d => d.id)
      .enter()
      .append('circle')
      .attr('class', 'magnet-node')
      .attr('r', 10)
      .style('fill', 'green')
      .attr('id', d => d.id)
      .call(
        d3Drag
          .drag()
          .on('start', d => {
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', d => {
            const mouseCoords = d3Sel.mouse(this.svg.node());
            d.fx = (mouseCoords[0] - this.zoom.translation[0]) / this.zoom.scaleFactor;
            d.fy = (mouseCoords[1] - this.zoom.translation[1]) / this.zoom.scaleFactor;
            this.magnets
              .select(`#${d.id}`)
              .attr('cx', (d.x = d.fx))
              .attr('cy', (d.y = d.fy));
            this.magnetLabels
              .select(`#${d.id}label`)
              .attr('x', (d.x = d.fx))
              .attr('y', (d.y = d.fy));
          })
          .on('end', () => {
            const t = d3Transition
              .transition()
              .duration(500)
              .ease(d3Ease.easeBounce);
            d3Sel
              .selectAll('.cluster-node')
              .transition(t)
              .attr('cx', d => {
                // current loc
                let x = d.x;
                this.activeMagnets.forEach(key => {
                  if (key.active === true) {
                    const val = key.name;
                    const dustVal = d[val];
                    // get the difference in distance
                    const deltaX = key.x - x;
                    // get the force scalar
                    const scale = d3Scale
                      .scaleLinear()
                      .domain([key.min, key.max])
                      .range([0.1, 0.9]);
                    const force = scale(dustVal);
                    x += deltaX * force;
                  }
                });
                return x;
              })
              .attr('cy', d => {
                // current loc
                let y = d.y;
                this.activeMagnets.forEach(key => {
                  if (key.active === true) {
                    const val = key.name;
                    const dustVal = d[val];
                    // get the difference in distance
                    const deltaY = key.y - y;
                    // get the force scalar
                    const scale = d3Scale
                      .scaleLinear()
                      .domain([key.min, key.max])
                      .range([0.1, 0.9]);
                    const force = scale(dustVal);
                    y += deltaY * force;
                  }
                });
                return y;
              });
          }),
      );

    this.magnetLabels
      .selectAll('.magnet-label')
      .data(this.magnetNodes, d => d.id)
      .enter()
      .append('text')
      .attr('dx', 13)
      .attr('dy', 2)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('class', 'magnet-label')
      .attr('id', d => `${d.id}label`)
      .style('font-size', '12px')
      .text(d => d.text);
  };

  filterNodes() {
    const filter = this.props.filteredNodes;
    if (!this.state.init || compareArrays(this.state.nodes, filter)) return;

    this.node.attr('class', d => {
      const isPresent =
        filter.filter(nodeE => nodeE.title === d.title).length > 0;
      return isPresent ? 'cluster-node' : 'cluster-node node-greyed-out';
    });
  }

  handleBiggerNode = () => {
    const { width, height } = this.state;

    this.simulation = d3Force
      .forceSimulation()
      .force(
        'cluster',
        d3Cluster
          .forceCluster()
          .centers(d => this.clusters[d.cluster])
          .strength(0.5),
      )
      .force('collide', d3Force.forceCollide(d => d.radius + this.padding))
      .force('x', d3Force.forceX(width / 2))
      .force('y', d3Force.forceY(height / 2))
      .on('tick', () => {
        this.node
          .attr('cx', d => this.zoom.translation[0] + this.zoom.scaleFactor * d.x)
          .attr('cy', d => this.zoom.translation[1] + this.zoom.scaleFactor * d.y);
      });

    this.simulation.nodes(this.nodes);
    this.simulation.alpha(1).restart();
  };

  handleNewNodes = () => {
    this.nodes = this.props.filteredNodes;
    this.updateNodes();
  };

  handleNodeClick = d => {
    this.timer = setTimeout(() => {
      if (!this.prevent) {
        this.props.focusNode(d);
      }
      this.prevent = false;
    }, this.delay);
  };

  handleNodeDoubleClick = d => {
    clearTimeout(this.timer);
    this.prevent = true;
    console.info(d, 'dblclick');
    // this.centerNode(d);
  };

  handleNodeHover = (d, state) => {
    this.props.hoverNode(d, state);
  };

  handleResize = (newWidth, newHeight, oldWidth, oldHeight) => {
    if (!this.state.init) return;
    if (newWidth === oldWidth && newHeight === oldHeight) return;

    this.svg.attr('width', newWidth).attr('height', newHeight);
    this.simulation
      .force('x', d3Force.forceX(newWidth / 2))
      .force('y', d3Force.forceY(newHeight / 2));
    this.simulation.alphaTarget(0.3).restart();
  };

  initializeD3 = () => {
    const { width, height } = this.state;
    const mountPoint = this.mountClusterLayout;

    const zoom = d3Zoom
      .zoom()
      .on('zoom', () => {
        const scaleFactor = d3Sel.event.transform.k;
        const translation = [d3Sel.event.transform.x, d3Sel.event.transform.y];
        this.zoom = {
          scaleFactor,
          translation,
        };
        if (this.simulation) this.simulation.restart();
      })
      .scaleExtent([0.01, 100]);

    this.svg = d3Sel
      .select(mountPoint)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('overflow', 'hidden')
      .attr('id', 'cluster-svg-element')
      .on('click', () => {
        if (d3Sel.event.detail.name) {
          const mouseCoords = d3Sel.mouse(this.svg.node()); // eslint-disable-line no-unused-vars, max-len
          this.createMagnet(d3Sel.event.detail.name);
        }
        // if (event.ctrlKey) {
        //   console.log('Ctrl+click has just happened!');
        //   this.state.d3Viz.node.attr('fx', null).attr('fy', null).attr('r', 5);
        // } else if (event.altKey) {
        //   console.log('Alt+click has just happened!');
        // }
      })
      .call(zoom)
      .on('dblclick.zoom', null);

    this.node = this.svg
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle');

    this.magnets = this.svg.append('g').attr('class', 'magnets');
    this.magnetLabels = this.svg.append('g').attr('class', 'magnetLabels');

    this.simulation = d3Force
      .forceSimulation()
      .force(
        'cluster',
        d3Cluster
          .forceCluster()
          .centers(d => this.clusters[d.cluster])
          .strength(0.5),
      )
      .force('collide', d3Force.forceCollide(d => d.radius + this.padding))
      .force('x', d3Force.forceX(width / 2))
      .force('y', d3Force.forceY(height / 2))
      .on('tick', () => {
        this.node
          .attr('cx', d => this.zoom.translation[0] + this.zoom.scaleFactor * d.x)
          .attr('cy', d => this.zoom.translation[1] + this.zoom.scaleFactor * d.y);
      });

    this.setState({ ...this.state, init: true }, () => this.updateNodes());
  };

  updateNodes = () => {
    this.node.remove();
    this.node = this.svg
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle');
    this.node = this.node.data(this.nodes, d => d.id);
    this.node.exit().remove();
    this.node = this.node
      .enter()
      .append('circle')
      .attr('class', 'cluster-node')
      .attr('r', d => d.radius)
      .attr('id', d => d.id)
      .attr('fill', d => this.color(d.cluster / 10))
      .on('mouseover', d => {
        if (!this.drag) {
          this.handleNodeHover(d, true);
        }
      })
      .on('mouseout', d => {
        if (!this.drag) {
          this.handleNodeHover(d, false);
        }
      })
      .on('click', d => this.handleNodeClick(d))
      .on('dblclick', d => this.handleNodeDoubleClick(d))
      .call(
        d3Drag
          .drag()
          .on('start', d => {
            if (!d3Sel.event.active) this.simulation.alphaTarget(0.3).restart();
            this.props.hoverNode(d, true);
            this.drag = true;
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', d => {
            const mouseCoords = d3Sel.mouse(this.svg.node());
            d.fx = (mouseCoords[0] - this.zoom.translation[0]) / this.zoom.scaleFactor;
            d.fy = (mouseCoords[1] - this.zoom.translation[1]) / this.zoom.scaleFactor;
          })
          .on('end', d => {
            if (!d3Sel.event.active) this.simulation.alphaTarget(0);
            this.drag = false;
            this.props.hoverNode(d, false);
            d.fx = null;
            d.fy = null;
          }),
      );

    this.simulation.nodes(this.nodes);
    this.simulation.alpha(1).restart();
  };

  render() {
    const { canDrop, isOver, connectDropTarget } = this.props;
    const isActive = canDrop && isOver;

    const activeStyle = {};
    activeStyle.backgroundColor = isActive ? 'darkgreen' : '';
    activeStyle.opacity = isActive ? '0.8' : '1';

    return connectDropTarget(
      <div
        className="mount"
        ref={element => {
          this.mountClusterLayout = element;
        }}
      />,
    );
  }
}

const dragWrapper = DropTarget('box', boxTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
}))(ClusterLayout);

ClusterLayout.propTypes = {
  hoverNode: PropTypes.func.isRequired,
  focusNode: PropTypes.func.isRequired,
  queryResult: PropTypes.bool.isRequired,
  nodes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      authors: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
        }),
      ),
      date: PropTypes.string,
      value: PropTypes.number,
    }),
  ).isRequired,
  filteredNodes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      authors: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
        }),
      ),
      date: PropTypes.string,
      value: PropTypes.number,
    }),
  ).isRequired,
  focusedNode: PropTypes.shape({ // eslint-disable-line react/require-default-props, prettier/prettier
    id: PropTypes.string.isRequired,
  }),
  canDrop: PropTypes.bool.isRequired,
  isOver: PropTypes.bool.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
};

export default sizeMe({ monitorHeight: true })(dragWrapper);
