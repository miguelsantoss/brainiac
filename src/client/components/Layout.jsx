// Import React stuff
import React, { Component } from 'react';
import _ from 'lodash';
import { Responsive, WidthProvider } from 'react-grid-layout';

import { selectAll } from 'd3-selection';

import Network from './Network.jsx';
import Timeline from './Timeline.jsx';
import ClusterLayout from './ClusterLayout.jsx';

import '../css/layout.scss';
import '../css/d3viz.scss';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

class Layout extends Component {
  static propTypes = {
    // searchQuery: React.PropTypes.string.isRequired,
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
      source: React.PropTypes.number,
      target: React.PropTypes.number,
      value: React.PropTypes.number,
    })).isRequired,
  }

  static hoverNode(d, state) {
    // selectAll(`#${d.author}`).style('fill', state ? '#ff0000' : '#111111');
    // fixme ids start with letter
    selectAll(`#${d.id}`).classed('hover-node', state);
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
      filterNodes: props.filteredNodes,
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
          draggableHandle={'.LayoutHandle'}
        >
          <div key="network" data-grid={{ x: 0, y: 0, w: 6, h: 8, static: false }}>
            <Network
              hoverNode={Layout.hoverNode}
              nodes={_.cloneDeep(this.props.nodes)}
              filteredNodes={_.cloneDeep(this.props.filteredNodes)}
              links={_.cloneDeep(this.props.links)}
            />
          </div>
          <div key="timeline" data-grid={{ x: 0, y: 0, w: 12, h: 8, static: false }}>
            <Timeline
              hoverNode={Layout.hoverNode}
              nodes={_.cloneDeep(this.props.nodes)}
              filteredNodes={_.cloneDeep(this.props.filteredNodes)}
            />
          </div>
          <div key="clusterlayout" data-grid={{ x: 0, y: 0, w: 12, h: 8, static: false }}>
            <ClusterLayout
              hoverNode={Layout.hoverNode}
              nodes={_.cloneDeep(this.props.nodes)}
              filteredNodes={_.cloneDeep(this.props.filteredNodes)}
              links={_.cloneDeep(this.props.links)}
            />
          </div>
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

export default Layout;
