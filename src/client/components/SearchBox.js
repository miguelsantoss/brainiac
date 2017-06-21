import React, { Component } from 'react';

import Search from 'grommet/components/Search';

class SearchBox extends Component {
  static propTypes = {
    searchFunc: React.PropTypes.func.isRequired,
    value: React.PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    this.handleSearch = this.handleSearch.bind(this);
  }

  handleSearch(event) {
    const query = event.target.value;
    this.setState({ ...this.state, query });
    this.props.searchFunc(query);
  }

  render() {
    return (
      <div>
        <Search
          inline={true}
          size="small"
          value={this.props.value}
          onDOMChange={this.props.searchFunc}
        />
      </div>
    );
  }
}

export default SearchBox;
