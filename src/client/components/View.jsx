import React, { Component } from 'react';
import _ from 'lodash';
import axios from 'axios';

import Split from 'grommet/components/Split';
import Sidebar from 'grommet/components/Sidebar';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Box from 'grommet/components/Box';
import Heading from 'grommet/components/Heading';
import Layer from 'grommet/components/Layer';

import Layout from './Layout.jsx';
import SearchBox from './SearchBox.jsx';
import DocViewer from './DocViewer.jsx';
import DocumentList from './DocumentList.jsx';

class View extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'Brainiac',
      search: '',
      nodes: [],
      links: [],
      filteredNodes: [],
      filteredLinks: [],
      pdf: false,
    };

    this.searchFunc = this.searchFunc.bind(this);
    this.renderTitle = this.renderTitle.bind(this);
    this.renderSidebar = this.renderSidebar.bind(this);
    this.renderLayout = this.renderLayout.bind(this);
    this.openDocumentFile = this.openDocumentFile.bind(this);
    this.renderDocViewers = this.renderDocViewers.bind(this);
    this.fetchPdf = this.fetchPdf.bind(this);
  }

  componentDidMount() {
    axios({
      method: 'get',
      url: 'http://localhost:3000/pdf',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    })
      .then(response => response.data)
       .then(data =>
         this.setState({
           ...this.state,
           nodes: data.nodes,
           links: data.links,
           filteredNodes: data.nodes,
           filteredLinks: data.links,
         })
       );
  }

  searchFunc(event) {
    const query = event.target.value;
    const filtered = _.cloneDeep(this.state.nodes).filter(
      node => node.title.includes(query)
      // node => node.title.includes(query) || node.author.includes(query)
    );
    // console.log(filtered);
    this.setState({ ...this.state, search: query, filteredNodes: filtered });
    this.forceUpdate();
  }

  openDocumentFile(id) {
    // this.fetchPdf(id);
    this.setState({ ...this.state, pdf: id });
  }

  fetchPdf(id) {
    axios({
      method: 'get',
      url: `http://localhost:3000/pdf/${id}`,
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    }).then(response => this.setState({
      ...this.state,
      pdfFile: response.data,
    }, () => { console.log(response); this.renderDocViewers(); }));
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
          <SearchBox value={this.state.search} searchFunc={this.searchFunc} />
          <DocumentList
            openDocumentFile={this.openDocumentFile}
            nodes={this.state.filteredNodes}
          />
        </Box>
      </Sidebar>
    );
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

  renderDocViewers() {
    if (this.state.pdf) {
      return (
        <div>
          <Layer
            onClose={() => this.setState({ ...this.state, pdf: false })}
          >
            <DocViewer file={`http://localhost:3000/pdf/${this.state.pdf}.pdf`} />;
          </Layer>
        </div>
      );
    }
    return null;
  }

  renderLayout() {
    if (this.state.nodes.length > 0) {
      return (
        <div>
          <Layout
            nodes={this.state.nodes}
            links={this.state.links}
            filteredNodes={this.state.filteredNodes}
          />
        </div>
      );
    }
    return null;
  }

  render() {
    return (
      <div>
        <Split
          fixed={true}
          flex="right"
          priority="right"
        >
          {this.renderSidebar()}
          {this.renderLayout()}
        </Split>
        {this.renderDocViewers()}
      </div>
    );
  }
}

export default View;
