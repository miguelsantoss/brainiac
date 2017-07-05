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
    const style = {
      textOverflow: 'ellipsis',
    };
    const styleLi = {
      wordWrap: 'break-word',
      padding: 0,
      paddingTop: 2,
      paddingBottom: 2,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    };
    return (
      <div
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <li
          style={styleLi}
          className="item"
          id={id}
          onClick={this.handleClick}
        >
          <span style={style}>
            {title}
          </span>
        </li>
      </div>
    );
  }
}

export default DocumentEntry;
