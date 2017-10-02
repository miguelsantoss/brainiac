import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3Select from 'd3-selection';
import * as d3Transition from 'd3-transition';

class Tooltip extends Component {
  render() {
    return (
      <div
        ref={r => {
          this.div = r;
        }}
        onMouseEnter={() => {
          this.hover = true;
        }}
        onMouseLeave={() => {
          this.hover = false;
          const tooltip = d3Select.select(this.div);
          const hoverTransition = d3Transition.transition().duration(200);
          tooltip
            .transition(hoverTransition)
            .style('opacity', 0)
            .on('end', () => {
              tooltip.style('display', 'none');
            });
        }}
        style={this.props.style}
        id="tooltip-doc-list"
      />
    );
  }
}

Tooltip.propTypes = {
  style: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default Tooltip;
