import React from 'react';
import PropTypes from 'prop-types';
import { Header } from 'semantic-ui-react';

const VizContainer = props => (
  <div className="drag-wrapper">
    <div className="LayoutHandle handle text-vert-center">
      <Header size="tiny">{props.windowName}</Header>
    </div>
    <div id={props.contentId} className="content no-cursor text-vert-center">
      {props.children}
    </div>
  </div>
);

VizContainer.propTypes = {
  windowName: PropTypes.string.isRequired,
  contentId: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
};

export default VizContainer;
