
// Import React stuff
import React, { Component } from 'react';
import _ from 'lodash';

import {Responsive, WidthProvider} from 'react-grid-layout';
const ResponsiveReactGridLayout = WidthProvider(Responsive);

import '../css/demo.css';
import '../css/base-style.css';

export default class View extends Component {

	constructor(props) {
    super(props);
    const { vizArray } = this.props;

    const viz = _.map(vizArray, (d, i) => {
      return (
        <div key={d.id}>
          {d.d3}
        </div>
      );
    });

    const layout = {
      'lg': _.map(vizArray, (d, i) => {
        return {
          x: d.lg.x,
          y: d.lg.y,
          w: d.lg.w,
          h: d.lg.h,
          i: d.id,
          static: false
        }
      })
    }

    this.state = {
      currentBreakpoint: 'lg',
      mounted: false,
      layouts: {lg: layout.lg},
      viz: this.props.viz,
      vizChildren: viz,
      layoutProps: {
        rowHeight: 30,
        cols: {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2},
      }
    };

    this.onBreakpointChange = this.onBreakpointChange.bind(this);
    this.onLayoutChange = this.onLayoutChange.bind(this);
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

  onLayoutChange(layout, layouts) { }

  render() {
		return (
      <div>
        <ResponsiveReactGridLayout
          {...this.state.layoutProps}
          layouts={this.state.layouts}
          onBreakpointChange={this.onBreakpointChange}
          onLayoutChange={this.onLayoutChange}
          measureBeforeMount={true}>
          {this.state.vizChildren}
        </ResponsiveReactGridLayout>
      </div>
    );
  }

}
