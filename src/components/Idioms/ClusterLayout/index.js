import React, { Component } from 'react';
import PropTypes from 'prop-types';
import sizeMe from 'react-sizeme';
import { DropTarget } from 'react-dnd';

import * as d3Array from 'd3-array';
import * as d3Force from 'd3-force';
import * as d3Sel from 'd3-selection';
import * as d3Drag from 'd3-drag';
import * as d3Scale from 'd3-scale';
import * as d3Zoom from 'd3-zoom';
import * as d3Transition from 'd3-transition';
import * as d3Ease from 'd3-ease';

import compareArrays from '../../../lib/arrays';
import * as d3Cluster from './forceCluster';
import './cluster.scss';

const boxTarget = {
  drop(props, monitor, component) {
    const item = monitor.getItem();
    component.svg.dispatch('click', { detail: item });
  },
};

const zoomToCluster = 0.6;
const ZOOM_MODE_NODE = 0;
const ZOOM_MODE_CLUSTER = 1;

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
    this.preventMagnet = false;
    this.timerMagnet = 0;
    this.delayMagnet = 200;
    this.display = ZOOM_MODE_NODE;
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

    // Cluster and forces setup
    this.color = d3Scale.scaleOrdinal(color);
    this.clusters = new Array(this.nClusters);
    this.clusterNodes = [];

    // Pick one of the nodes as the cluster center
    // (Giving them random r; center = node with highest r)
    this.state.nodes.forEach(d => {
      const i = d.cluster;
      const r =
        Math.sqrt((i + 1) / this.nClusters) *
        -Math.log(Math.random()) *
        this.maxRadius;

      const classN = `cluster-node cluster${d.cluster}`;

      d.radius = 4;
      d.defaultRadius = 4;
      d.class = classN;
      d.defaultClass = classN;

      if (!this.clusters[i] || r > this.clusters[i].radius) {
        this.clusters[i] = d;
      }
    });

    for (let i = 0; i <= this.nClusters; i += 1) {
      const classN = `cluster-node-cluster cluster${i}`;
      this.clusterNodes.push({
        id: `cluster-${i}-center-${this.clusters[i].id}`,
        clusterId: i,
        radius: 8,
        defaultRadius: 8,
        class: classN,
        defaultClass: classN,
        filtered: false,
      });
    }

    this.nodes = this.state.nodes;
    this.setState({ ...this.state, width, height }, () => this.initializeD3());
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.focusedNode && nextProps.focusedNode) {
      this.nodes.forEach(n => {
        if (n.id === nextProps.focusedNode.id) {
          n.radius = nextProps.focusedNode.radius;
          n.class = `${n.class} focus-node`;
        }
      });
      this.handleBiggerNode();
    } else if (this.props.focusedNode && !nextProps.focusedNode) {
      this.nodes.forEach(n => {
        if (n.id === this.props.focusedNode.id) {
          n.radius = this.props.focusedNode.radius;
          n.class = n.defaultClass;
        }
      });
      this.handleBiggerNode();
    }
    const width = document.getElementById('window-cluster-content').clientWidth; // eslint-disable-line no-undef
    const height = document.getElementById('window-cluster-content').clientHeight; // eslint-disable-line no-undef, prettier/prettier
    this.handleResize(width, height, this.state.width, this.state.height);
    this.setState({ ...this.state, width, height }, () => {
      if (!this.props.queryResult) {
        this.filterNodes();
      } else if (!this.props.queryResult) {
        this.zoomInToNodes();
        this.handleNewNodes();
      }
    });
  }

  createMagnet = word => {
    for (let i = 0; i < this.magnetNodes.length; i += 1) {
      if (this.magnetNodes[i].word === word) {
        return;
      }
    }

    const randomNumber = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    let id = `m${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}`; // eslint-disable-line prettier/prettier
    for (let i = 0; i < this.magnetNodes.length; i += 1) {
      if (this.magnetNodes[i] === id) {
        id = `m${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}`; // eslint-disable-line prettier/prettier
        i = 0;
      }
    }

    this.magnetNodes.push({
      id,
      word,
      min: d3Array.min(this.props.wordDistances[word]),
      max: d3Array.max(this.props.wordDistances[word]),
      active: false,
      x: 20,
      y: 260 - 20 * this.magnetNodes.length,
    });

    this.magnets
      .selectAll('.magnet-node')
      .data(this.magnetNodes, d => d.id)
      .enter()
      .append('circle')
      .attr('class', 'magnet-node')
      .attr('r', 10)
      .style('fill', d => (d.active ? 'green' : 'black'))
      .attr('id', d => d.id)
      .on('click', d => this.handleMagnetClick(d))
      .on('dblclick', d => this.handleMagnetDoubleClick(d))
      .call(
        d3Drag
          .drag()
          .on('drag', d => {
            const mouseCoords = d3Sel.mouse(this.svg.node());
            d.x =
              (mouseCoords[0] - this.zoom.translation[0]) /
              this.zoom.scaleFactor;
            d.y =
              (mouseCoords[1] - this.zoom.translation[1]) /
              this.zoom.scaleFactor;

            // For some reason, only works like this
            this.updateMagnets();
            // this.magnets
            //   .select(`#${d.id}`)
            //   .attr('cx', e => e.x)
            //   .attr('cy', e => e.y);
            // this.magnetLabels
            //   .select(`#${d.id}label`)
            //   .attr('x', e => e.x)
            //   .attr('y', e => e.y);
          })
          .on('end', () => {
            this.updateMagnets();
            this.updateDust();
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
      .text(d => d.word);

    this.updateMagnets();
  };

  filterNodes() {
    const filter = this.props.filteredNodes;
    if (
      !this.state.init ||
      this.display !== ZOOM_MODE_NODE ||
      compareArrays(this.state.nodes, filter)
    ) {
      return;
    }

    this.node.attr('class', d => {
      const isPresent =
        filter.filter(nodeE => nodeE.title === d.title).length > 0;

      if (!isPresent) {
        if (!d.prevClass) {
          const prevClass = d3Sel
            .selectAll(`circle.cluster-node#${d.id}`)
            .attr('class');
          d.prevClass = prevClass;
        }

        d.class = `${d.class} node-greyed-out`;
        d.filtered = true;
      } else {
        if (d.prevClass) {
          d.class = d.prevClass;
          d.prevClass = null;
        } else {
          d.class = d.defaultClass;
        }
        d.filtered = false;
      }
      return d.class;
    });
  }

  handleBiggerNode = () => {
    if (this.display === ZOOM_MODE_NODE && this.activeMagnets.length === 0) {
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
            .attr(
              'cx',
              d => this.zoom.translation[0] + this.zoom.scaleFactor * d.x,
            )
            .attr(
              'cy',
              d => this.zoom.translation[1] + this.zoom.scaleFactor * d.y,
            );
        });

      this.simulation.nodes(this.nodes);
      this.simulation.alpha(1).restart();
    }
  };

  handleNewNodes = () => {
    this.nodes = this.props.filteredNodes;
    this.updateNodes();
  };

  handleMagnetClick = () => {
    this.timerMagnet = setTimeout(() => {
      if (!this.preventMagnet) {
        console.info('magnetclick');
      }
      this.preventMagnet = false;
    }, this.delayMagnet);
  };

  handleMagnetDoubleClick = d => {
    clearTimeout(this.timerMagnet);
    this.preventMagnet = true;

    this.activeMagnets = this.activeMagnets.filter(
      magnet => magnet.id !== d.id,
    );

    if (!d.active) this.activeMagnets.push(d);
    d.active = !d.active;

    this.updateDust();
    this.updateMagnets();
  };

  handleNodeClick = d => {
    this.timer = setTimeout(() => {
      if (!this.prevent) {
        this.props.focusNode(d);
        // this.props.focusCluster(d);
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
    this.props.hoverCluster(this.clusterNodes[d.cluster], state, d);
  };

  handleClusterHover = (d, state) => {
    this.props.hoverCluster(d, state);
  };

  handleResize = (newWidth, newHeight, oldWidth, oldHeight) => {
    if (!this.state.init) return;
    if (newWidth === oldWidth && newHeight === oldHeight) return;

    this.svg.attr('width', newWidth).attr('height', newHeight);
    this.simulation
      .force('x', d3Force.forceX(newWidth / 2))
      .force('y', d3Force.forceY(newHeight / 2));
    if (this.display !== ZOOM_MODE_CLUSTER) {
      this.simulation.alphaTarget(0.3).restart();
    }
  };

  createSimulation = (nodes, padding = 0, restart = true) => {
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
      .force(
        'collide',
        d3Force.forceCollide(d => d.radius + this.padding + padding),
      )
      .force('x', d3Force.forceX(width / 2))
      .force('y', d3Force.forceY(height / 2))
      .on('tick', () => {
        this.node
          .attr(
            'cx',
            d => this.zoom.translation[0] + this.zoom.scaleFactor * d.x,
          )
          .attr(
            'cy',
            d => this.zoom.translation[1] + this.zoom.scaleFactor * d.y,
          );
      });

    this.simulation.nodes(nodes);
    if (restart) {
      this.simulation.alpha(1).restart();
    }
  };

  initializeD3 = () => {
    const { width, height } = this.state;
    const mountPoint = this.mountClusterLayout;

    this.zoomFunc = d3Zoom
      .zoom()
      .on('zoom', () => {
        const scaleFactor = d3Sel.event.transform.k;
        const translation = [d3Sel.event.transform.x, d3Sel.event.transform.y];
        this.zoom = {
          scaleFactor,
          translation,
        };

        this.updateMagnets();
        // Don't animate here, becomes clunky
        this.updateDust(0);

        if (this.simulation && !this.activeMagnets.length) {
          this.simulation.restart();
        }

        if (
          scaleFactor <= zoomToCluster &&
          this.display !== ZOOM_MODE_CLUSTER
        ) {
          this.zoomOutToClusters();
        } else if (
          scaleFactor > zoomToCluster &&
          this.display !== ZOOM_MODE_NODE
        ) {
          this.zoomInToNodes();
        }
      })
      .scaleExtent([0.3, 100]);

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
      .call(this.zoomFunc)
      .on('dblclick.zoom', null);

    this.node = this.svg
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle');

    this.magnets = this.svg.append('g').attr('class', 'magnets');
    this.magnetLabels = this.svg.append('g').attr('class', 'magnetLabels');

    this.setState({ ...this.state, init: true }, () => this.updateNodes());
  };

  updateNodes = () => {
    this.svg.select('g.nodes').remove();
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
      .attr('class', d => d.class)
      .attr('r', d => d.radius)
      .attr('id', d => d.id)
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
            if (!d3Sel.event.active && !this.activeMagnets.length) {
              this.simulation.alphaTarget(0.3).restart();
            }
            this.props.hoverNode(d, true);
            this.drag = true;
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', d => {
            const mouseCoords = d3Sel.mouse(this.svg.node());
            d.fx =
              (mouseCoords[0] - this.zoom.translation[0]) /
              this.zoom.scaleFactor;
            d.fy =
              (mouseCoords[1] - this.zoom.translation[1]) /
              this.zoom.scaleFactor;
          })
          .on('end', d => {
            if (!d3Sel.event.active && !this.activeMagnets.length) {
              this.simulation.alphaTarget(0);
            }
            this.drag = false;
            this.props.hoverNode(d, false);
            d.fx = null;
            d.fy = null;
          }),
      );

    this.createSimulation(this.nodes);
  };

  updateMagnets = () => {
    this.magnets
      .selectAll('.magnet-node')
      // .attr('cx', d => (d.x - this.zoom.translation[0]) / this.zoom.scaleFactor)
      // .attr('cy', d => (d.y - this.zoom.translation[1]) / this.zoom.scaleFactor)
      .attr('cx', d => this.zoom.translation[0] + this.zoom.scaleFactor * d.x)
      .attr('cy', d => this.zoom.translation[1] + this.zoom.scaleFactor * d.y)
      .style('fill', d => (d.active ? 'green' : 'black'));

    this.magnetLabels
      .selectAll('.magnet-label')
      // .attr('x', d => (d.x - this.zoom.translation[0]) / this.zoom.scaleFactor)
      // .attr('y', d => (d.y - this.zoom.translation[1]) / this.zoom.scaleFactor);
      .attr('x', d => this.zoom.translation[0] + this.zoom.scaleFactor * d.x)
      .attr('y', d => this.zoom.translation[1] + this.zoom.scaleFactor * d.y);
  };

  updateDust = (transition = 700) => {
    if (!this.activeMagnets.length) {
      this.simulation.alpha(1).restart();
      return;
    }
    this.simulation.alpha(0).stop();
    const t = d3Transition
      .transition()
      .duration(transition)
      .ease(d3Ease.easeCubic);
    d3Sel
      .selectAll('.cluster-node')
      .transition(t)
      .attr('cx', d => {
        // current loc
        let x = d.x;
        this.activeMagnets.forEach(magnet => {
          if (magnet.active === true) {
            const val = this.props.wordDistancesWLabels[magnet.word][d.id];
            // get the difference in distance
            const deltaX = magnet.x - x;
            // get the force scalar
            const scale = d3Scale
              .scaleLinear()
              .domain([magnet.min, magnet.max])
              .range([0.1, 0.9]);
            const force = scale(val);
            x += deltaX * force;
            x = this.zoom.translation[0] + this.zoom.scaleFactor * x;
          }
        });
        return x;
      })
      .attr('cy', d => {
        // current loc
        let y = d.y;
        this.activeMagnets.forEach(magnet => {
          if (magnet.active === true) {
            const val = this.props.wordDistancesWLabels[magnet.word][d.id];
            // get the difference in distance
            const deltaY = magnet.y - y;
            // get the force scalar
            const scale = d3Scale
              .scaleLinear()
              .domain([magnet.min, magnet.max])
              .range([0.1, 0.9]);
            const force = scale(val);
            y += deltaY * force;
            y = this.zoom.translation[1] + this.zoom.scaleFactor * y;
          }
        });
        return y;
      });
  };

  zoomInToNodes = (transitionDuration = 1000) => {
    this.simulation.alpha(0).stop();
    this.display = ZOOM_MODE_NODE;
    this.svg.on('.zoom', null);

    const t = d3Transition
      .transition()
      .duration(transitionDuration)
      .ease(d3Ease.easeCubic);

    let count = this.node.size();
    let done = false;

    this.node
      .transition(t)
      .attr('r', d => this.clusters[d.clusterId].radius)
      .on('end', () => {
        count -= 1;
        if (count === 0) {
          this.updateNodes();

          if (this.activeMagnets.length) {
            this.updateDust();
            this.updateMagnets();
          }

          // this.svg.select('g.nodes').remove();
          // this.node.remove();
          // this.node = this.svg
          //   .append('g')
          //   .attr('class', 'nodes')
          //   .selectAll('circle');

          // this.node = this.node.data(this.nodes, d => d.id);
          // this.node.exit().remove();

          // this.node = this.node
          //   .enter()
          //   .append('circle')
          //   .attr('class', d => d.class)
          //   .attr('r', d => d.radius)
          //   .attr('id', d => d.id)
          //   .attr('cx', d => {
          //     d.x = this.clusters[d.cluster].x;
          //     return this.zoom.translation[0] + this.zoom.scaleFactor * d.x;
          //   })
          //   .attr('cy', d => {
          //     d.y = this.clusters[d.cluster].y;
          //     return this.zoom.translation[1] + this.zoom.scaleFactor * d.y;
          //   });

          // this.createSimulation(this.nodes, 0, true);
          this.svg.call(this.zoomFunc).on('dblclick.zoom', null);
          done = true;
        }
      });
    setTimeout(() => {
      if (!done) {
        this.updateNodes();
        if (this.activeMagnets.length) {
          this.updateDust();
          this.updateMagnets();
        }
        this.svg.call(this.zoomFunc).on('dblclick.zoom', null);
      }
      if (this.props.focusedNode) this.handleBiggerNode();
    }, transitionDuration + 500);
  };

  updateClusters = (transitionDuration = 1000) => {
    const t = d3Transition
      .transition()
      .duration(transitionDuration)
      .ease(d3Ease.easeCubic);

    this.svg.select('g.nodes').remove();
    this.node.remove();
    this.node = this.svg
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle');

    this.node = this.node.data(this.clusterNodes, d => d.id);
    this.node.exit().remove();

    this.node = this.node
      .enter()
      .append('circle')
      .attr('class', d => d.class)
      .attr('r', d => this.clusters[d.clusterId].radius)
      .attr('id', d => d.id)
      .attr('cx', d => {
        d.x = this.clusters[d.clusterId].x;
        return this.clusters[d.clusterId].zx;
      })
      .attr('cy', d => {
        d.y = this.clusters[d.clusterId].y;
        return this.clusters[d.clusterId].zy;
      })
      .on('mouseover', d => {
        if (!this.drag) {
          this.handleClusterHover(d, true);
        }
      })
      .on('mouseout', d => {
        if (!this.drag) {
          this.handleClusterHover(d, false);
        }
      })
      .call(
        d3Drag
          .drag()
          .on('start', d => {
            if (!d3Sel.event.active && !this.activeMagnets.length) {
              this.simulation.alphaTarget(0.3).restart();
            }
            this.handleClusterHover(d, true);
            this.drag = true;
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', d => {
            const mouseCoords = d3Sel.mouse(this.svg.node());
            d.fx =
              (mouseCoords[0] - this.zoom.translation[0]) /
              this.zoom.scaleFactor;
            d.fy =
              (mouseCoords[1] - this.zoom.translation[1]) /
              this.zoom.scaleFactor;
          })
          .on('end', d => {
            if (!d3Sel.event.active && !this.activeMagnets.length) {
              this.simulation.alphaTarget(0);
            }
            this.drag = false;
            this.handleClusterHover(d, false);
            d.fx = null;
            d.fy = null;
          }),
      );

    this.node.transition(t).attr('r', d => d.radius);
    this.createSimulation(this.clusterNodes, 10);
  };

  zoomOutToClusters = (transitionDuration = 1000) => {
    this.simulation.alpha(0).stop();
    this.display = ZOOM_MODE_CLUSTER;
    this.svg.on('.zoom', null);

    const t = d3Transition
      .transition()
      .duration(transitionDuration)
      .ease(d3Ease.easeCubic);

    let count = this.node.size();
    let done = false;

    this.node
      .transition(t)
      .attr('cx', d => {
        this.clusters[d.cluster].zx =
          this.zoom.translation[0] +
          this.zoom.scaleFactor * this.clusters[d.cluster].x;

        return this.clusters[d.cluster].zx;
      })
      .attr('cy', d => {
        this.clusters[d.cluster].zy =
          this.zoom.translation[1] +
          this.zoom.scaleFactor * this.clusters[d.cluster].y;

        return this.clusters[d.cluster].zy;
      })
      .on('end', () => {
        count -= 1;
        if (count === 0) {
          this.updateClusters(transitionDuration);
          this.svg.call(this.zoomFunc).on('dblclick.zoom', null);
          done = true;
        }
      });
    setTimeout(() => {
      if (!done) {
        this.updateClusters(transitionDuration);
        this.svg.call(this.zoomFunc).on('dblclick.zoom', null);
      }
    }, transitionDuration + 500);
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
  hoverCluster: PropTypes.func.isRequired,
  focusNode: PropTypes.func.isRequired,
  // focusCluster: PropTypes.func.isRequired,
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
  focusedNode: PropTypes.shape({
    id: PropTypes.string.isRequired,
    radius: PropTypes.number.isRequired,
  }),
  // because of the JSON object, where property = word
  wordDistances: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  wordDistancesWLabels: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  canDrop: PropTypes.bool.isRequired,
  isOver: PropTypes.bool.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
};

ClusterLayout.defaultProps = {
  focusedNode: null,
};

export default sizeMe({ monitorHeight: true })(dragWrapper);
