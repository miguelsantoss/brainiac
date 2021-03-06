import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Responsive, WidthProvider } from 'react-grid-layout';
import _ from 'lodash';

import './d3viz.scss';
import './layout.scss';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

class GridLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentBreakpoint: 'lg',
      mounted: false,
      layoutProps: {
        rowHeight: 30,
        cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
      },
    };

    this.onBreakpointChange = this.onBreakpointChange.bind(this);
  }

  onBreakpointChange(breakpoint) {
    this.setState({
      currentBreakpoint: breakpoint,
    });
  }

  render() {
    const { children } = this.props;
    return (
      <ResponsiveReactGridLayout
        {...this.state.layoutProps}
        onBreakpointChange={this.onBreakpointChange}
        onLayoutChange={this.onLayoutChange}
        draggableHandle={'.LayoutHandle'}
        measureBeforeMount
      >
        {children.length
          ? _.map(children, viz => {
              const { gridKey, gridData } = viz.props;
              return (
                <div key={gridKey} data-grid={gridData}>
                  {viz}
                </div>
              );
            })
          : null}
      </ResponsiveReactGridLayout>
    );
  }
}

GridLayout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
  ]),
};

GridLayout.defaultProps = {
  children: [],
};

export default GridLayout;
