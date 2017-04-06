import React, { Component } from 'react';

import Search from 'grommet/components/Search';

class SearchBox extends Component {
  static propTypes = {
    searchFunc: React.PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      query: '',
    };

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
          value={this.state.query}
          onDOMChange={this.handleSearch}
        />
      </div>
    );
  }
}

export default SearchBox;
