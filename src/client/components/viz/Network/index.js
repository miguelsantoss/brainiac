import React, { Component } from 'react';
import PropTypes from 'prop-types';
import sizeMe from 'react-sizeme';
import { DropTarget } from 'react-dnd';

import * as d3Force from 'd3-force';
import { select, event, mouse } from 'd3-selection';
import { drag } from 'd3-drag';
import * as d3Zoom from 'd3-zoom';
import * as d3Transition from 'd3-transition';
import * as d3Ease from 'd3-ease';

import './Network.scss';

const boxTarget = {
  drop(props, monitor, component) {
    const item = monitor.getItem();
    component.state.d3Viz.svg.dispatch('click', { detail: item });
  },
};

const r = [{ r: 75 }, { r: 150 }, { r: 225 }, { r: 300 }];

class Network extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodes: props.nodes,
      links: props.links,
      init: false,
      centered: false,
      drag: false,
      zoom: {
        scaleFactor: 1,
        translation: [0, 0],
      },
      magnetNodes: [],
    };

    this.initializeD3 = this.initializeD3.bind(this);
    this.setupNetwork = this.setupNetwork.bind(this);
    this.filterNodes = this.filterNodes.bind(this);
  }

  componentWillMount() {
    // eslint-disable-next-line no-undef
    const height = document.getElementById('window-network-content').clientHeight;
    // eslint-disable-next-line no-undef
    const width = document.getElementById('window-network-content').clientWidth;

    this.setState({
      ...this.state,
      width,
      height,
    }, () => {
      this.initializeD3();
    });
  }

  componentWillReceiveProps() {
    this.setState({ ...this.state }, () => { this.filterNodes(); });
    this.handleResize();
  }

  setupNetwork() {
    const nodes = this.props.filteredNodes;
    const { svg, simulation } = this.state.d3Viz;

    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(this.state.links)
      .enter()
      .append('line')
      .attr('class', d => `line-network ${nodes[d.source].id} ${nodes[d.source].id}`)
      .attr('id', d => d.source.id)
      .attr('stroke-width', 1.5);

    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes, d => d.id)
      .enter()
      .append('circle')
      .attr('class', 'network-node')
      .attr('r', d => d.radius)
      .attr('id', d => d.id)
      .on('mouseover', (d) => {
        if (!this.state.drag) {
          this.props.hoverNode(d, true, d.radius, d.radius + 10);
        }
      })
      .on('mouseout', (d) => {
        if (!this.state.drag) {
          this.props.hoverNode(d, false, d.radius, d.radius + 10);
        }
      })
      .on('click', (d) => {
        if (event.defaultPrevented) return;
        this.setState({ ...this.state, centered: d }, () => {
          const centerTransition = d3Transition.transition().duration(200).ease(d3Ease.easeExp);

          this.state.d3Viz.node.transition(centerTransition).attr('r', (element) => {
            element.radius = 4;
            element.defaultRadius = 4;
            return element.radius;
          });

          d.centered = true;
          d.fx = this.state.width / 2;
          d.fy = this.state.height / 2;
          select(`circle#${d.id}`).transition(centerTransition).attr('r', (element) => {
            element.radius = 15;
            element.bigRadius = 15;
            return element.radius;
          });

          const dataOrg = [[], [], [], []];
          const dTest = [];

          for (let i = 0; i < nodes.length; i += 1) {
            if (nodes[i].id !== d.id) {
              if (d.similarity_values[i] >= 0.25) {
                const dist = 3 - Math.floor(d.similarity_values[i] / 0.25);
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
              // eslint-disable-next-line max-len
              nodes[i].fx = d.fx + (nodes[i].r * Math.cos(dataOrg[distI] * dataOrgI[distI] * (Math.PI / 180)));
              // eslint-disable-next-line max-len
              nodes[i].fy = d.fy + (nodes[i].r * Math.sin(dataOrg[distI] * dataOrgI[distI] * (Math.PI / 180)));
              dataOrgI[distI] += 1;
            }
          }

          if (!this.state.d3Viz.orbits) {
            const orbits = svg.select('g.orbits').selectAll('circle')
              .data(r)
              .enter()
              .append('circle')
              .attr('r', element => element.r * this.state.zoom.scaleFactor)
              .attr('fill', 'none')
              .attr('stroke', 'grey')
              .attr('opacity', 0.3)
              .attr('cx', this.state.zoom.translation[0] + (this.state.zoom.scaleFactor * d.fx))
              .attr('cy', this.state.zoom.translation[1] + (this.state.zoom.scaleFactor * d.fy));

            this.setState({
              ...this.state,
              d3Viz: {
                ...this.state.d3Viz,
                orbits,
              },
            });
          } else {
            this.state.d3Viz.orbits
              .attr('r', element => element.r * this.state.zoom.scaleFactor)
              .attr('cx', this.state.zoom.translation[0] + (this.state.zoom.scaleFactor * this.state.centered.fx))
              .attr('cy', this.state.zoom.translation[1] + (this.state.zoom.scaleFactor * this.state.centered.fy));
          }
        });
      })
      .call(drag()
        .on('start', (d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          this.props.hoverNode(d, true, d.radius, d.radius + 10);
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
          this.props.hoverNode(d, false, d.radius, d.radius + 10);
          this.state.drag = false;
          if (!d.centered && !d.fixed) {
            d.fx = null;
            d.fy = null;
          }
        }));

    const magnets = svg.append('g')
      .attr('class', 'magnets');

    const magnetLabels = svg.append('g')
      .attr('class', 'magnetLabels');

    simulation.nodes(nodes)
      .on('tick', () => {
        link
          .attr('x1', d => this.state.zoom.translation[0] + (this.state.zoom.scaleFactor * d.source.x))
          .attr('y1', d => this.state.zoom.translation[1] + (this.state.zoom.scaleFactor * d.source.y))
          .attr('x2', d => this.state.zoom.translation[0] + (this.state.zoom.scaleFactor * d.target.x))
          .attr('y2', d => this.state.zoom.translation[1] + (this.state.zoom.scaleFactor * d.target.y));
        node
          .attr('cx', d => this.state.zoom.translation[0] + (this.state.zoom.scaleFactor * d.x))
          .attr('cy', d => this.state.zoom.translation[1] + (this.state.zoom.scaleFactor * d.y));
      });
    simulation.force('link').links(this.state.links);
    simulation.restart();

    const d3Viz = { ...this.state.d3Viz, svg, link, node, simulation, magnets, magnetLabels };
    this.setState({ ...this.state, d3Viz, init: true });
  }

  createMagnet(word) {
    const randomNumber = (min, max) => Math.floor(Math.random() * ((max - min) + 1)) + min;
    let id = `m${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}`;
    const { magnetNodes } = this.state;
    for (let i = 0; i < magnetNodes.length; i += 1) {
      if (magnetNodes[i] === id) {
        id = `m${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}`;
        i = 0;
      }
    }

    const { svg, simulationMagnets, magnets, magnetLabels } = this.state.d3Viz;

    magnetNodes.push({
      id,
      text: word,
    });

    magnets.selectAll('.magnet-node')
      .data(magnetNodes, d => d.id)
      .enter()
      .append('circle')
      .attr('class', 'magnet-node')
      .attr('r', 10)
      .style('fill', 'green')
      .attr('id', d => d.id)
      .call(drag()
        .on('start', (d) => {
          if (!event.active) simulationMagnets.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (d) => {
          const mouseCoords = mouse(svg.node());
          d.fx = (mouseCoords[0] - this.state.zoom.translation[0]) / this.state.zoom.scaleFactor;
          d.fy = (mouseCoords[1] - this.state.zoom.translation[1]) / this.state.zoom.scaleFactor;
        })
        .on('end', (d) => {
          if (!event.active) simulationMagnets.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    magnetLabels.selectAll('.magnet-label')
      .data(magnetNodes, d => d.id)
      .enter()
      .append('text')
      .attr('dx', 13)
      .attr('dy', 2)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('class', 'magnet-label')
      .style('font-size', '12px')
      .text(d => d.text);

    simulationMagnets.on('tick', () => {
      magnets.selectAll('.magnet-node')
        .attr('cx', d => this.state.zoom.translation[0] + (this.state.zoom.scaleFactor * d.x))
        .attr('cy', d => this.state.zoom.translation[1] + (this.state.zoom.scaleFactor * d.y));
      magnetLabels.selectAll('.magnet-label')
        .attr('x', d => this.state.zoom.translation[0] + (this.state.zoom.scaleFactor * d.x))
        .attr('y', d => this.state.zoom.translation[1] + (this.state.zoom.scaleFactor * d.y));
    });


    simulationMagnets.nodes(magnetNodes);
    simulationMagnets.restart();
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
              return `line-network ${d.source.id} ${d.target.id}`;
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
      .attr('id', 'network2-svg-element')
      .on('click', () => {
        if (event.detail.name) {
          const mouseCoords = mouse(this.state.d3Viz.svg.node()); // eslint-disable-line no-unused-vars, max-len
          this.createMagnet(event.detail.name);
        }
        // if (event.ctrlKey) {
        //   console.log('Ctrl+click has just happened!');
        //   this.state.d3Viz.node.attr('fx', null).attr('fy', null).attr('r', 5);
        // } else if (event.altKey) {
        //   console.log('Alt+click has just happened!');
        // }
      })
      .call(d3Zoom.zoom().on('zoom', () => {
        const scaleFactor = event.transform.k;
        const translation = [event.transform.x, event.transform.y];
        this.setState({
          ...this.state,
          zoom: {
            scaleFactor, translation,
          },
        }, () => {
          this.state.d3Viz.simulation.restart();
          if (this.state.d3Viz.orbits) {
            this.state.d3Viz.orbits
              .attr('r', d => d.r * scaleFactor)
              .attr('cx', translation[0] + (scaleFactor * this.state.centered.fx))
              .attr('cy', translation[1] + (scaleFactor * this.state.centered.fy));
          }
        });
      }).scaleExtent([0.1, 10]))
      .on('dblclick.zoom', null);

    svg.append('g').attr('class', 'orbits');

    const simulation = d3Force.forceSimulation()
      .force('link', d3Force.forceLink().distance(linkDistanceMult).strength(0.00001))
      // .force('collide', d3Force.forceCollide((d) => d.r + 10).iterations(16))
      // .force('attract', forceAttract().target([width / 2, height / 2]).strength(1))
      .force('charge', d3Force.forceManyBody().strength(-100))
      .force('x', d3Force.forceX(width / 2))
      .force('y', d3Force.forceY(height / 2));

    const simulationMagnets = d3Force.forceSimulation()
      .force('charge', d3Force.forceManyBody().strength(-100));

    const d3Viz = { svg, simulation, simulationMagnets };
    this.setState({ ...this.state, d3Viz }, () => {
      this.setupNetwork();
    });
  }

  handleResize() {
    // eslint-disable-next-line no-undef
    const height = document.getElementById('window-network-content').clientHeight;
    // eslint-disable-next-line no-undef
    const width = document.getElementById('window-network-content').clientWidth;

    this.setState({ ...this.state, width, height });

    if (!this.state.init) return;

    this.state.d3Viz.svg.attr('width', width).attr('height', height);

    this.state.d3Viz.simulation.force('x', d3Force.forceX(width / 2)).force('y', d3Force.forceY(height / 2));
    this.state.d3Viz.simulation.alphaTarget(0.3).restart();
  }

  render() {
    const { canDrop, isOver, connectDropTarget } = this.props;
    const isActive = canDrop && isOver;

    const activeStyle = {};
    activeStyle.backgroundColor = isActive ? 'darkgreen' : '';
    activeStyle.opacity = isActive ? '0.8' : '1';

    return connectDropTarget(
      <div className="mount" ref={(element) => { this.mountNetwork = element; }} />,
    );
  }
}

const dragWrapper = DropTarget('box', boxTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
}))(Network);

Network.propTypes = {
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
  links: PropTypes.arrayOf(PropTypes.shape({
    source: PropTypes.any,
    target: PropTypes.any,
    value: PropTypes.number,
  })).isRequired,
  hoverNode: PropTypes.func.isRequired,
  canDrop: PropTypes.bool.isRequired,
  isOver: PropTypes.bool.isRequired,
  connectDropTarget: PropTypes.func.isRequired,

};

export default sizeMe({ monitorHeight: true })(dragWrapper);
