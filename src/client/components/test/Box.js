import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import { Menu } from 'semantic-ui-react';

const style = {
  cursor: 'move',
};

const boxSource = {
  beginDrag(props) {
    return {
      name: props.name,
    };
  },

  endDrag(props, monitor) {
    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();

    if (dropResult) {
      window.alert( // eslint-disable-line no-alert
        `You dropped ${item.name} into ${dropResult.name}!`,
      );
    }
  },
};

class Box extends Component {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
  };

  render() {
    const { isDragging, connectDragSource } = this.props;
    const { name } = this.props;
    const opacity = isDragging ? 0.4 : 1;

    return (
      connectDragSource(
        <div style={{ ...style, opacity }}>
          <Menu.Item
            name={name}
          />
        </div>,
      )
    );
  }
}

export default DragSource('box', boxSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
}))(Box);
