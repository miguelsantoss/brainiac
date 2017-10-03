import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import * as d3Select from 'd3-selection';
import * as d3Transition from 'd3-transition';

import './index.scss';

class Tooltip extends Component {
  render() {
    return (
      <div
        className="resizeOnHover"
        ref={r => {
          this.div = r;
        }}
        onMouseEnter={() => {
          this.hover = true;
          this.props.handleHover(this.node, true, false, false);
          setTimeout(() => {
            const tooltip = d3Select.select(this.div);
            const tt = ReactDOM.findDOMNode(this.div);
            const hoverTransition = d3Transition.transition().duration(200);
            const boxTT = tt.getBoundingClientRect();
            if (boxTT.bottom > window.innerHeight) {
              let newTop = boxTT.top - (boxTT.bottom - window.innerHeight) - 10;
              if (newTop < 0) newTop = 0;
              tooltip.transition(hoverTransition).style('top', `${newTop}px`);
            } else {
              let newTop = this.y + 10 - boxTT.height / 2 - 10;
              if (newTop < 0) newTop = 10;
              tooltip.transition(hoverTransition).style('top', `${newTop}px`);
            }
          }, 250);
        }}
        onMouseLeave={() => {
          this.hover = false;
          this.props.handleHover(this.node, false, false, false);
          const tooltip = d3Select.select(this.div);
          const hoverTransition = d3Transition.transition().duration(200);
          tooltip
            .transition(hoverTransition)
            .style('opacity', 0)
            .on('end', () => {
              tooltip.style('display', 'none');
            });
        }}
        id="tooltip-doc-list"
      />
    );
  }
}

Tooltip.propTypes = {
  handleHover: PropTypes.func.isRequired,
};

export default Tooltip;
