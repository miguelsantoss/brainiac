import React, { Component } from 'react';
import PropTypes from 'prop-types';
import sizeMe from 'react-sizeme';
import { Icon, Label } from 'semantic-ui-react';

import * as d3Force from 'd3-force';
import * as d3Sel from 'd3-selection';
import * as d3Drag from 'd3-drag';
import * as d3Zoom from 'd3-zoom';
import * as d3Transition from 'd3-transition';
import * as d3Timer from 'd3-timer';

import compareArrays from '../../../lib/arrays';
import './network.scss';

const r = [{ r: 75 }, { r: 150 }, { r: 225 }, { r: 300 }];

class Network extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodes: props.nodes,
      links: props.links,
      init: false,
      centered: false,
    };

    // d3 and viz stuff
    this.centered = false;
    this.drag = false;
    this.magnetNodes = [];
    this.zoom = {
      scaleFactor: 1,
      translation: [0, 0],
    };
    this.centerTransition = false;

    // click and dblclick stuff
    this.prevent = false;
    this.timer = 0;
    this.delay = 200;
  }

  componentWillMount() {
    const width = document.getElementById('window-network-content').clientWidth; // eslint-disable-line no-undef
    const height = document.getElementById('window-network-content').clientHeight; // eslint-disable-line no-undef prettier/prettier
    this.nodes = this.props.nodes;
    this.links = this.props.links;

    this.nodes.forEach(d => {
      const classN = `network-node cluster${d.cluster}`;
      d.class = classN;
      d.defaultClass = classN;
    });

    this.setState({ ...this.state, width, height }, () => this.initializeD3());
  }

  componentWillReceiveProps(nextProps) {// eslint-disable-line prettier/prettier, no-unused-vars
    // if (!this.props.focusedNode && nextProps.focusedNode) {
    //   console.log('new focus node');
    //   this.nodes.forEach((n) => {
    //     if (n.id === nextProps.focusedNode.id) {
    //       n.radius = nextProps.focusedNode.radius;
    //     }
    //   });
    //   this.handleBiggerNode();
    // } else if (this.props.focusedNode && !nextProps.focusedNode) {
    //   console.log('clear focus node');
    //   this.nodes.forEach((n) => {
    //     if (n.id === this.props.focusedNode.id) {
    //       n.radius = this.props.focusedNode.radius;
    //     }
    //   });
    //   this.handleBiggerNode();
    // }
    const width = document.getElementById('window-network-content').clientWidth; // eslint-disable-line no-undef
    const height = document.getElementById('window-network-content').clientHeight; // eslint-disable-line no-undef
    this.handleResize(width, height, this.state.width, this.state.height);
    this.setState({ ...this.state, width, height }, () => {
      if (!this.props.queryResult) this.filterNodes();
      else this.handleNewNodes();
    });
  }

  handleNodeClick = d => {
    this.timer = setTimeout(() => {
      if (!this.prevent) this.props.focusNode(d);
      this.prevent = false;
    }, this.delay);
  };

  handleNodeDoubleClick = d => {
    clearTimeout(this.timer);
    this.prevent = true;
    this.centerNode(d);
  };

  centerNode = d => {
    if (d3Sel.event.defaultPrevented) return;
    if (this.centerTransition) return;
    const nodes = this.nodes;
    const centerTransition = d3Transition.transition().duration(500);

    this.centered = d;
    this.centerTransition = true;
    d.centered = true;
    d.newfx = this.state.width / 2;
    d.newfy = this.state.height / 2;
    d.radius = 15;

    const dataOrg = [[], [], [], []];
    const dTest = [];

    for (let i = 0; i < nodes.length; i += 1) {
      if (nodes[i].id !== d.id) {
        if (d.similarity_values[i] >= 0.25) {
          const daux = 3 - Math.floor(d.similarity_values[i] / 0.25);
          const dist = daux > 0 ? daux : 0;
          dTest.push(dist);
          const rad = Math.random() * 2 * Math.PI;
          nodes[i].rad = rad;
          nodes[i].r = r[dist].r;
          nodes[i].dist = dist;
          dataOrg[dist].push(0);
        } else {
          const dist = 3;
          const rad = Math.random() * 2 * Math.PI;
          nodes[i].rad = rad;
          nodes[i].r = r[dist].r;
          nodes[i].dist = dist;
          dataOrg[dist].push(0);
        }
        nodes[i].fixed = true;
      }
    }

    const dataOrgI = [0, 0, 0, 0];
    for (let i = 0; i < dataOrg.length; i += 1) {
      dataOrg[i] = dataOrg[i].length;
      dataOrg[i] = 360 / dataOrg[i];
    }

    for (let i = 0; i < nodes.length; i += 1) {
      const distI = nodes[i].dist;
      if (nodes[i].id !== d.id) {
        nodes[i].newfx = d.newfx + (nodes[i].r * Math.cos(dataOrg[distI] * dataOrgI[distI] * (Math.PI / 180)));
        nodes[i].newfy = d.newfy + (nodes[i].r * Math.sin(dataOrg[distI] * dataOrgI[distI] * (Math.PI / 180)));
        nodes[i].radius = nodes[i].defaultRadius;
        dataOrgI[distI] += 1;
      }
    }

    this.node
      .transition(centerTransition)
      .attr('r', e => e.radius)
      .attr('cx', e => this.zoom.translation[0] + this.zoom.scaleFactor * e.newfx)
      .attr('cy', e => this.zoom.translation[1] + this.zoom.scaleFactor * e.newfy)
      .on('end', (el) => {
        el.fx = el.newfx;
        el.fy = el.newfy;
      });

    this.link
      .transition(centerTransition)
      .attr('x1', link => this.zoom.translation[0] + this.zoom.scaleFactor * link.source.newfx)
      .attr('y1', link => this.zoom.translation[1] + this.zoom.scaleFactor * link.source.newfy)
      .attr('x2', link => this.zoom.translation[0] + this.zoom.scaleFactor * link.target.newfx)
      .attr('y2', link => this.zoom.translation[1] + this.zoom.scaleFactor * link.target.newfy);

    if (!this.orbits) {
      this.orbits = this.svg.select('g.orbits').selectAll('circle')
        .data(r)
        .enter()
        .append('circle')
        .attr('r', e => e.r * this.zoom.scaleFactor)
        .attr('fill', 'none')
        .attr('stroke', 'grey')
        .attr('opacity', 0.3)
        .attr(
          'cx',
          () => this.zoom.translation[0] + this.zoom.scaleFactor * d.newfx,
        )
        .attr(
          'cy',
          () => this.zoom.translation[1] + this.zoom.scaleFactor * d.newfy,
        );

      this.orbits
        .transition(centerTransition)
        .attr('r', e => e.r * this.zoom.scaleFactor);
    } else {
      this.orbits
        .attr('r', element => element.r * this.zoom.scaleFactor)
        .attr(
          'cx',
          () =>
            this.zoom.translation[0] +
            this.zoom.scaleFactor * this.centered.newfx,
        )
        .attr(
          'cy',
          () =>
            this.zoom.translation[1] +
            this.zoom.scaleFactor * this.centered.newfy,
        );
    }
    this.testTransition = this.svg
      .transition(centerTransition)
      .delay(550)
      .call(
        this.zoomd3.transform,
        d3Zoom.zoomIdentity.translate(160, 76).scale(0.45),
      )
      .on('end', () => {
        this.centerTransition = false;
      });

    // sometimes centerFransition isn't set to false
    // hackky way to make it false and allow hover and other centering
    d3Timer.timeout(() => {
      this.centerTransition = false;
      this.setState({ ...this.state, centered: true });
    }, 1200);
  };

  createMagnet(word) {
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
            if (!d3Sel.event.active) {
              this.simulationMagnets.alphaTarget(0.3).restart();
            }
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
            if (!d3Sel.event.active) this.simulationMagnets.alphaTarget(0);
            d.fx = null;
            d.fy = null;
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
      .style('font-size', '12px')
      .text(d => d.text);

    this.simulationMagnets.on('tick', () => {
      this.magnets
        .selectAll('.magnet-node')
        .attr('cx', d => this.zoom.translation[0] + this.zoom.scaleFactor * d.x)
        .attr('cy', d => this.zoom.translation[1] + this.zoom.scaleFactor * d.y);

      this.magnetLabels
        .selectAll('.magnet-label')
        .attr('x', d => this.zoom.translation[0] + this.zoom.scaleFactor * d.x)
        .attr('y', d => this.zoom.translation[1] + this.zoom.scaleFactor * d.y);
    });

    this.simulationMagnets.nodes(this.magnetNodes);
    this.simulationMagnets.restart();
  }

  filterNodes() {
    const node = this.node;
    const link = this.link;
    const filter = this.props.filteredNodes;
    if (!this.state.init || compareArrays(this.state.nodes, filter)) return;

    node.attr('class', d => {
      const isPresent =
        filter.filter(nodeE => nodeE.title === d.title).length > 0;
      if (!isPresent) {
        d.class = `${d.class} node-greyed-out`;
      } else {
        d.class = d.defaultClass;
      }
      return d.class;
    });

    link.attr('class', d => {
      const filterLength = filter.length;
      for (let i = 0; i < filterLength; i += 1) {
        if (filter[i].title === d.source.title) {
          for (let j = 0; j < filterLength; j += 1) {
            if (filter[j].title === d.target.title && i !== j) {
              return `line-network ${d.source.id} ${d.target.id}`;
            }
          }
        }
      }
      return 'line-network line-greyed-out';
    });
  }

  handleNewNodes = () => {
    this.nodes = this.props.filteredNodes;
    this.links = this.props.links;

    this.nodes.forEach(d => {
      const classN = `network-node cluster${d.cluster}`;
      d.class = classN;
      d.defaultClass = classN;
    });

    this.updateNodes();
  };

  handleNodeHover = (d, state) => {
    if (!this.centerTransition) this.props.hoverNode(d, state);
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
    const linkDistanceMult = this.state.height / 2;
    const mountPoint = this.mountNetwork;

    this.zoomd3 = d3Zoom
      .zoom()
      .on('zoom', () => {
        const scaleFactor = d3Sel.event.transform.k;
        const translation = [d3Sel.event.transform.x, d3Sel.event.transform.y];
        this.zoom = {
          scaleFactor,
          translation,
        };
        if (this.simulation) this.simulation.restart();
        if (this.orbits) {
          this.orbits
            .attr('r', d => d.r * scaleFactor)
            .attr(
              'cx',
              () => translation[0] + scaleFactor * this.centered.newfx,
            )
            .attr(
              'cy',
              () => translation[1] + scaleFactor * this.centered.newfy,
            );
        }
        if (scaleFactor <= 0.15) {
          console.info('new');
        }
      })
      .scaleExtent([0.01, 100]);

    this.svg = d3Sel
      .select(mountPoint)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('overflow', 'hidden')
      .attr('class', 'cluster-sel')
      .attr('id', 'network-svg-element')
      .on('click', () => {
        // Moved to the cluster layout instead of network
        // if (d3Sel.event.detail.name) {
        //   const mouseCoords = d3Sel.mouse(this.svg.node()); // eslint-disable-line no-unused-vars, max-len
        //   this.createMagnet(d3Sel.event.detail.name);
        // }
        // if (event.ctrlKey) {
        //   console.log('Ctrl+click has just happened!');
        //   this.state.d3Viz.node.attr('fx', null).attr('fy', null).attr('r', 5);
        // } else if (event.altKey) {
        //   console.log('Alt+click has just happened!');
        // }
      })
      .call(this.zoomd3)
      .on('dblclick.zoom', null);

    this.svg.append('g').attr('class', 'orbits');

    this.simulation = d3Force
      .forceSimulation()
      .force(
        'link',
        d3Force
          .forceLink()
          .distance(linkDistanceMult)
          .strength(0.00001),
      )
      // .force('collide', d3Force.forceCollide((d) => d.r + 10).iterations(16))
      // .force('attract', forceAttract().target([width / 2, height / 2]).strength(1))
      .force('charge', d3Force.forceManyBody().strength(-100))
      .force('x', d3Force.forceX(width / 2))
      .force('y', d3Force.forceY(height / 2));

    this.simulationMagnets = d3Force
      .forceSimulation()
      .force('charge', d3Force.forceManyBody().strength(-100));

    this.link = this.svg
      .append('g')
      .attr('class', 'links')
      .selectAll('line');

    this.node = this.svg
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle');

    this.simulation.on('tick', () => {
      this.node
        .attr('cx', d => this.zoom.translation[0] + this.zoom.scaleFactor * d.x)
        .attr('cy', d => this.zoom.translation[1] + this.zoom.scaleFactor * d.y);

      this.link
        .attr(
          'x1',
          d => this.zoom.translation[0] + this.zoom.scaleFactor * d.source.x,
        )
        .attr(
          'y1',
          d => this.zoom.translation[1] + this.zoom.scaleFactor * d.source.y,
        )
        .attr(
          'x2',
          d => this.zoom.translation[0] + this.zoom.scaleFactor * d.target.x,
        )
        .attr(
          'y2',
          d => this.zoom.translation[1] + this.zoom.scaleFactor * d.target.y,
        );
    });

    this.setState({ ...this.state, init: true }, () => this.updateNodes());
  };

  updateNodes = () => {
    this.node = this.node.data(this.nodes, d => d.id);
    this.node.exit().remove();
    this.node = this.node
      .enter()
      .append('circle')
      .attr('class', d => `network-node cluster${d.cluster}`)
      .attr('r', d => d.radius)
      .attr('id', d => d.id)
      .on('mouseover', d => {
        if (!this.drag) this.handleNodeHover(d, true);
      })
      .on('mouseout', d => {
        if (!this.drag) this.handleNodeHover(d, false);
      })
      .on('click', d => this.handleNodeClick(d))
      .on('dblclick', d => this.handleNodeDoubleClick(d))
      .call(
        d3Drag
          .drag()
          .on('start', d => {
            if (!d3Sel.event.active) this.simulation.alphaTarget(0.3).restart();
            this.props.hoverNode(d, true, d.radius, d.radius + 10);
            this.drag = true;
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', d => {
            if (this.centered) return;
            const mouseCoords = d3Sel.mouse(this.svg.node());
            d.fx = (mouseCoords[0] - this.zoom.translation[0]) / this.zoom.scaleFactor;
            d.fy = (mouseCoords[1] - this.zoom.translation[1]) / this.zoom.scaleFactor;
          })
          .on('end', d => {
            if (!d3Sel.event.active) this.simulation.alphaTarget(0);
            this.props.hoverNode(d, false, d.radius, d.radius + 10);
            this.drag = false;
            if (!d.centered && !d.fixed) {
              d.fx = null;
              d.fy = null;
            }
          }),
      )
      .merge(this.node);

    this.link = this.link.data(this.links, d => `{d.source.id}-${d.target.id}`);
    this.link.exit().remove();
    this.link = this.link
      .enter()
      .append('line')
      .attr('class', d => {
        let classN = 'line-network';
        const source = this.nodes[d.source];
        const target = this.nodes[d.target];
        classN = `${classN} ${source.id} ${target.id}`;
        classN = `${classN} cluster${source.cluster} cluster${target.cluster}`;
        return classN;
      })
      .attr('id', d => {
        if (this.nodes[d.source].links) {
          this.nodes[d.source].links.push(this.nodes[d.target]);
        } else {
          this.nodes[d.source].links = [this.nodes[d.target]];
        }
        if (this.nodes[d.target].links) {
          this.nodes[d.target].links.push(this.nodes[d.source]);
        } else {
          this.nodes[d.target].links = [this.nodes[d.source]];
        }
        return this.nodes[d.source].id;
      })
      .attr('stroke-width', 1.5)
      .merge(this.link);

    this.simulation.nodes(this.nodes);
    this.simulation.force('link').links(this.state.links);
    this.simulation.alpha(1).restart();
    this.svg
      .transition()
      .duration(1500)
      .call(
        this.zoomd3.transform,
        d3Zoom.zoomIdentity.translate(50, 30).scale(0.8),
      );
  };

  resetCentering = () => {
    const nodes = this.nodes;
    const centerTransition = d3Transition.transition().duration(500);

    this.node.transition(centerTransition).attr('r', el => {
      el.radius = el.defaultRadius;
      return el.radius;
    });

    this.orbits.remove();
    this.orbits = undefined;

    this.centered.centered = false;
    this.centered = false;

    for (let i = 0; i < nodes.length; i += 1) {
      nodes[i].fx = null;
      nodes[i].fy = null;
      nodes[i].newfx = null;
      nodes[i].newfy = null;
      nodes[i].fixed = false;
    }

    this.svg
      .transition()
      .duration(1500)
      .delay(500)
      .call(
        this.zoomd3.transform,
        d3Zoom.zoomIdentity.translate(50, 30).scale(0.8),
      );

    this.simulation.alphaTarget(1).restart();
    this.setState({ ...this.state, centered: false });
  };

  render() {
    const iconStyle = {
      position: 'fixed',
      marginLeft: this.state.width - 77,
    };

    return (
      <div>
        {this.state.centered && (
          <Label
            basic
            style={iconStyle}
            as="a"
            size="tiny"
            onClick={() => this.resetCentering()}
          >
            <Icon name="cancel" />
            Cancel
          </Label>
        )}
        <div
          className="mount"
          ref={element => {
            this.mountNetwork = element;
          }}
        />
      </div>
    );
  }
}

Network.propTypes = {
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
  links: PropTypes.arrayOf(
    PropTypes.shape({
      source: PropTypes.any,
      target: PropTypes.any,
      value: PropTypes.number,
    }),
  ).isRequired,
  hoverNode: PropTypes.func.isRequired,
  focusedNode: PropTypes.shape({ // eslint-disable-line react/require-default-props, react/no-unused-prop-types, prettier/prettier
    id: PropTypes.string.isRequired,
  }),
  focusNode: PropTypes.func.isRequired,
  queryResult: PropTypes.bool.isRequired,
};

export default sizeMe({ monitorHeight: true })(Network);
