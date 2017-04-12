// Import React stuff
import React, { Component } from 'react';
import _ from 'lodash';
import { Responsive, WidthProvider } from 'react-grid-layout';

import { selectAll } from 'd3-selection';

import Network from './Network.jsx';
import Timeline from './Timeline.jsx';

import '../css/layout.scss';
import '../css/d3viz.scss';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

class Layout extends Component {
  static propTypes = {
    // searchQuery: React.PropTypes.string.isRequired,
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
  }

  static hoverNode(d, state) {
    // selectAll(`#${d.author}`).style('fill', state ? '#ff0000' : '#111111');
    selectAll(`#${d.author}`).classed('hover-node', state);
  }

  constructor(props) {
    super(props);
    this.state = {
      currentBreakpoint: 'lg',
      mounted: false,
      layoutProps: {
        rowHeight: 30,
        cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
      },
      nodes: props.nodes,
      links: props.links,
      filterNodes: props.filterNodes,
    };

    this.onBreakpointChange = this.onBreakpointChange.bind(this);
  }

  componentDidMount() {
    this.setState({
      mounted: true,
    });
  }

  onBreakpointChange(breakpoint) {
    this.setState({
      currentBreakpoint: breakpoint
    });
  }

  render() {
    return (
      <div>
        <ResponsiveReactGridLayout
          {...this.state.layoutProps}
          onBreakpointChange={this.onBreakpointChange}
          onLayoutChange={this.onLayoutChange}
          measureBeforeMount={true}
        >
          <div key="network" data-grid={{ x: 0, y: 0, w: 12, h: 8, static: false }}>
            <Network
              hoverNode={Layout.hoverNode}
              nodes={_.cloneDeep(this.props.nodes)}
              filterNodes={_.cloneDeep(this.props.filterNodes)}
              links={_.cloneDeep(this.props.links)}
            />
          </div>
          <div key="timeline" data-grid={{ x: 0, y: 0, w: 12, h: 8, static: false }}>
            <Timeline
              hoverNode={Layout.hoverNode}
              nodes={_.cloneDeep(this.props.nodes)}
              filterNodes={_.cloneDeep(this.props.filterNodes)}
            />
          </div>
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

export default Layout;
