
// Import React stuff
import React, { Component } from 'react';
import _ from 'lodash';

import {Responsive, WidthProvider} from 'react-grid-layout';
const ResponsiveReactGridLayout = WidthProvider(Responsive);

import './demo.css';
import './base-style.css';

import Network from './Network.jsx';
import Timeline from './Timeline.jsx';

export default class View extends Component {

	constructor(props) {
    super(props);

    const viz = _.map(this.props.viz, (d, i) => {
      return (
        <div key={d.id}>
          {d.d3}
        </div>
      );
    });

    this.state = {
      currentBreakpoint: 'lg',
      mounted: false,
      layouts: {lg: this.props.initialLayout},
      viz: this.props.viz,
      vizChildren: viz
    };

    this.onBreakpointChange = this.onBreakpointChange.bind(this);
    this.onLayoutChange = this.onLayoutChange.bind(this);
    this.onNewLayout = this.onNewLayout.bind(this);
  }

  componentDidMount() {
    this.setState({
      mounted: true,
    });
  }

  generateDOM() {
    return _.map(this.state.layouts.lg, function (l, i) {
      return (
        <div key={i}>
        	<span className="text">{i}</span>
        </div>);
    });
  }

  onBreakpointChange(breakpoint) {
    this.setState({
      currentBreakpoint: breakpoint
    });
  }

  onLayoutChange(layout, layouts) { }

  onResize() {
  }

  onNewLayout() {
    this.setState({
      layouts: {lg: generateLayout()}
    });
  }

  render() {
		return (
      <div>
        <div>Current Breakpoint: {this.state.currentBreakpoint} ({this.props.cols[this.state.currentBreakpoint]} columns)
        </div>
        <button onClick={this.onNewLayout}>Generate New Layout</button>
        <ResponsiveReactGridLayout
          {...this.props}
          layouts={this.state.layouts}
          onBreakpointChange={this.onBreakpointChange}
          onLayoutChange={this.onLayoutChange}
          onResize={this.onResize}
          measureBeforeMount={true}>
          <div key='network' data-grid={{x: 0, y: 0, w: 12, h: 8}}>
            <Network />
          </div>
          <div key='timeline' data-grid={{x: 0, y: 1, w: 12, h: 6}}>
            <Timeline />
          </div>
        </ResponsiveReactGridLayout>
      </div>
    );
  }

}

View.defaultProps = {
  className: "layout",
  rowHeight: 30,
  cols: {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2},
  initialLayout: generateLayout()
};

function generateLayout() {
  return _.map(_.range(0, 2), function (item, i) {
    var y = Math.ceil(Math.random() * 4) + 1;
    return {
      x: _.random(0, 5) * 2 % 12,
      y: Math.floor(i / 6) * y,
      w: 2,
      h: y,
      i: i.toString(),
      static: false
    };
  });
}
