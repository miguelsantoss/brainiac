import React from 'react';

import ListItem from 'grommet/components/ListItem';

class DocumentEntry extends React.Component {
  static propTypes = {
    title: React.PropTypes.string.isRequired,
    id: React.PropTypes.string.isRequired,
    handleClick: React.PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleClick() {
    const { id } = this.props;
    this.props.handleClick(id);
  }

  render() {
    const { id, title } = this.props;
    return (
      <ListItem
        onClick={this.handleClick.bind(this, id)}
      >
        <span>
          {title}
        </span>
      </ListItem>
    );
  }
}

export default DocumentEntry;
