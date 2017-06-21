// Import React stuff
import React, { Component } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';

import 'css/layout.scss';
import 'css/d3viz.scss';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

class Layout extends Component {
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
        {
          this.props.children.map((viz) => {
            const { gridKey, gridData } = viz.props;
            return (
              <div key={gridKey} data-grid={gridData}>{viz}</div>
            )
          })
        }
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

export default Layout;