import React, { Component } from 'react';
import _ from 'lodash';

import Split from 'grommet/components/Split';
import Sidebar from 'grommet/components/Sidebar';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Box from 'grommet/components/Box';
import Heading from 'grommet/components/Heading';

import Layout from './Layout.jsx';
import SearchBox from './SearchBox.jsx';

import docSim from '../cosine-sample.json';

class View extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'Brainiac',
      search: '',
      nodes: docSim.nodes,
      links: docSim.links,
      filteredNodes: docSim.nodes,
      filteredLinks: docSim.links,
    };

    this.searchFunc = this.searchFunc.bind(this);
  }

  searchFunc(query) {
    const filtered = _.cloneDeep(this.state.nodes).filter(
      node => node.name.includes(query) || node.author.includes(query)
    );
    this.setState({ ...this.state, search: query, filteredNodes: filtered });
    this.forceUpdate();
  }

  renderTitle() {
    const title = this.state.name;
    return (
      <Title responsive={false}>
        <Box align="center" direction="row">
          <Heading
            strong={false}
            uppercase={false}
            truncate={false}
            align="start"
            margin="none"
          >
            {title}
          </Heading>
        </Box>
      </Title>
    );
  }

  renderSidebar() {
    const title = this.renderTitle();
    return (
      <Sidebar
        fixed={true}
        size="small"
        full={true}
        separator="right"
        ref={(r) => { this.sidebar = r; }}
        colorIndex="brand"
      >
        <Header justify="between" size="large" pad={{ horizontal: 'medium' }}>
          {title}
        </Header>
        <Box
          full={true}
          pad={{ horizontal: 'medium' }}
        >
          <SearchBox searchFunc={this.searchFunc} />
        </Box>
      </Sidebar>
    );
  }

  render() {
    return (
      <Split
        fixed={true}
        flex="right"
        priority="right"
      >
        {this.renderSidebar()}
        <Layout
          nodes={this.state.nodes}
          links={this.state.links}
          filterNodes={this.state.filteredNodes}
        />
      </Split>
    );
  }
}

export default View;
