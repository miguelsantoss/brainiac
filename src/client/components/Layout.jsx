// Import React stuff
import React from 'react';
import _ from 'lodash';

import { Responsive, WidthProvider } from 'react-grid-layout';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

class Layout extends React.Component {
  static propTypes = {
    vizArray: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.string,
      d3: React.PropTypes.element,
      lg: React.PropTypes.shape({
        x: React.PropTypes.number,
        y: React.PropTypes.number,
        w: React.PropTypes.number,
        h: React.PropTypes.number,
      }),
    })).isRequired,
  }

  constructor(props) {
    super(props);
    // console.log(this.props.vizArray);
    const { vizArray } = this.props;

    const viz = _.map(vizArray, d =>
      <div key={d.id}>
        {d.d3}
      </div>
    );

    const layout = {
      lg: _.map(vizArray, (d) => {
        const { x, y, w, h } = d.lg;
        return { x, y, w, h, i: d.id, static: false };
      })
    };

    this.state = {
      currentBreakpoint: 'lg',
      mounted: false,
      layouts: { lg: layout.lg },
      viz: this.props.vizArray,
      vizChildren: viz,
      layoutProps: {
        rowHeight: 30,
        cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
      }
    };

    this.onBreakpointChange = this.onBreakpointChange.bind(this);
    // this.onLayoutChange = this.onLayoutChange.bind(this);
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
          layouts={this.state.layouts}
          onBreakpointChange={this.onBreakpointChange}
          onLayoutChange={this.onLayoutChange}
          measureBeforeMount={true}
        >
          {this.state.vizChildren}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

export default Layout;
