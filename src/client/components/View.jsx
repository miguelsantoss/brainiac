import React, { Component } from 'react';
import _ from 'lodash';
import axios from 'axios';
import Dropzone from 'react-dropzone'

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
import UploadFile from './UploadFile.jsx';

import Network from './Network_2.jsx';
import Timeline from './Timeline.jsx';
import ClusterLayout from './ClusterLayout.jsx';

import { selectAll, select } from 'd3-selection';

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
			dropzone: {
		    accept: '',
        files: [],
        dropzoneActive: false,
      }
    };

    this.searchFunc = this.searchFunc.bind(this);
    this.renderTitle = this.renderTitle.bind(this);
    this.renderSidebar = this.renderSidebar.bind(this);
    this.renderLayout = this.renderLayout.bind(this);
    this.openDocumentFile = this.openDocumentFile.bind(this);
    this.renderDocViewers = this.renderDocViewers.bind(this);
    this.fetchPdf = this.fetchPdf.bind(this);
    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDrop = this.onDrop.bind(this);
  }

  componentDidMount() {
    axios({
      method: 'get',
      url: 'http://localhost:4000/pdf',
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
      url: `http://localhost:4000/pdf/${id}`,
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    }).then(response => this.setState({
      ...this.state,
      pdfFile: response.data,
    }, () => { console.log(response); this.renderDocViewers(); }));
  }

	onDragEnter() {
    let { dropzone } = this.state;
	  dropzone.dropzoneActive = true;
    this.setState({
			...this.state,
			dropzone: dropzone,
    });
  }

  onDragLeave() {
    let { dropzone } = this.state;
	  dropzone.dropzoneActive = false;
    this.setState({
			...this.state,
			dropzone,
    });
  }

  onDrop(files) {
    let { dropzone } = this.state;
	  dropzone.dropzoneActive = false;
    dropzone.files = files;

    this.setState({
			...this.state,
			dropzone,
    });

    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
    let data = new FormData();
    data.append('pdf',files[0])

    axios.post('http://localhost:4000/pdf/upload', data, config).then((response) => {
      window.URL.revokeObjectURL(files[0].preview);
    })
  }

  renderSidebar() {
    const title = this.renderTitle();
    const labelStyle = {
      marginLeft: 5
    }
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
          <UploadFile />
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
            <DocViewer file={`http://localhost:4000/pdf/${this.state.pdf}.pdf`} />;
          </Layer>
        </div>
      );
    }
    return null;
  }

  renderLayout() {
    if (this.state.nodes.length > 0) {
      const vizProps = {
        nodes: this.state.nodes,
        links: this.state.links,
        hoverNode: (d, state) => {
          selectAll(`#${d.id}`).classed('hover-node', state);
          selectAll(`.line-network.${d.id}`).classed('hover-line-network', state);
          if(state) {
            select(this.tooltip)
              .style('left', event.x + 10 + 'px')
              .style('top', event.y + 10 + 'px')
              .style('display', 'inline-block')
              .html((d.title));
          }
          else {
            select(this.tooltip).style('display', 'none');
          }
        },
      }

      const vizArray = [
        // (<Network
        //   gridKey='network'
        //   gridData={{ x: 0, y: 0, w: 5, h: 8, static: false }}
        //   filteredNodes={_.cloneDeep(this.state.filteredNodes)}
        //   {...vizProps}
        // />),
        (<ClusterLayout
          gridKey='clusterLayout'
          gridData={{ x: 5, y: 0, w: 5, h: 8, static: false }}
          filteredNodes={_.cloneDeep(this.state.filteredNodes)}
          {...vizProps}
        />),
        // (<Timeline
        //   gridKey='timeline'
        //   gridData={{ x: 0, y: 0, w: 12, h: 8, static: false }}
        //   filteredNodes={_.cloneDeep(this.state.filteredNodes)}
        //   {...vizProps}
        // />),
      ]

      return (
        <div>
          <Layout children={vizArray} />
        </div>
      );
    }
    return null;
  }

  render() {
		const { accept, files, dropzoneActive } = this.state.dropzone;
    const overlayStyle = {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      padding: '2.5em 0',
      background: 'rgba(0,0,0,0.5)',
      textAlign: 'center',
      color: '#fff',
      verticalAlign: 'middle',
      zIndex: 1000,
    };
    const tooltipStyle = {
      position: 'absolute',
      display: 'none',
      minWidth: 'px',
      height: 'auto',
      background: 'none repeat scroll 0 0 #ffffff',
      border: '1px solid #6F257F',
      padding: '2px',
      textAlign: 'center',
    }
    return (
      <Dropzone
        disableClick
        style={{}}
        accept={accept}
        onDrop={this.onDrop}
        onDragEnter={this.onDragEnter}
        onDragLeave={this.onDragLeave}
      >
				{ dropzoneActive &&  <div style={overlayStyle}>Drop files...</div> }
        <Split
          fixed={true}
          flex="right"
          priority="right"
        >
          {this.renderSidebar()}
          {this.renderLayout()}
        </Split>
        <div style={tooltipStyle} ref={(r) => { this.tooltip = r; }} id='tooltip'/>
        {this.renderDocViewers()}
      </Dropzone>
    );
  }
}

export default View;
