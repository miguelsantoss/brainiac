import React from 'react';

import ListItem from 'grommet/components/ListItem';

class DocumentEntry extends React.Component {
  static propTypes = {
    title: React.PropTypes.string.isRequired,
    id: React.PropTypes.string.isRequired,
    handleClick: React.PropTypes.func.isRequired,
    handleHover: React.PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.handleMouseEnter = this.handleMouseEnter.bind(this, props.id);
    this.handleMouseLeave = this.handleMouseLeave.bind(this, props.id);
    this.handleClick = this.handleClick.bind(this, props.id);
  }

  handleClick() {
    const { id } = this.props;
    this.props.handleClick(id);
  }

  handleMouseEnter(id) {
    this.props.handleHover(id, true);
  }

  handleMouseLeave(id) {
    this.props.handleHover(id, false);
  }

  render() {
    const { id, title } = this.props;
    return (
      <div
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <ListItem
          className="item"
          id={id}
          onClick={this.handleClick}
        >
          <span>
            {title}
          </span>
        </ListItem>
      </div>
    );
  }
}

export default DocumentEntry;
