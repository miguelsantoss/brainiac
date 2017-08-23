import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { connect } from 'react-redux';
import { Dimmer, Loader, Modal, Button, Icon, Header } from 'semantic-ui-react';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';

import * as d3Select from 'd3-selection';
import * as d3Transition from 'd3-transition';

import { CLOSE_SIDEBAR, OPEN_SIDEBAR } from '../../actions/layout';
import {
  FETCH_DOCUMENTS,
  QUERY_DOCUMENTS_PUBMED,
  QUERY_DOCUMENT_INFO_PUBMED,
  QUERY_DOCUMENT_ABSTRACT_PUBMED,
  FILTER_BY_DATE,
  CLEAR_FILTER_BY_DATE,
  UPDATE_VISUALIZATION_WITH_DOCS,
  SORT_DOCUMENTS_BY,
  FILTER_DOCUMENTS,
} from '../../actions/documents';

import SidebarFixed from '../../components/SidebarFixed';
import SidebarPushable from '../../components/SidebarPushable';
import GridLayout from '../../containers/GridLayout';

import Network from '../../components/viz/Network';
import Timeline from '../../components/viz/Timeline';
import ClusterLayout from '../../components/viz/ClusterLayout';
import VizContainer from '../../containers/VizContainer';

import style from './style';

class AppLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      magnets: false,
      focusedNode: null,
      modelOpen: false,
    };
  }

  componentWillMount() {
    this.props.fetchDocuments();
  }

  openDocument = (id) => {
    console.log(id);
  }

  handleOpen = () => this.setState({ ...this.state, modelOpen: true })
  handleClose = () => this.setState({ ...this.state, modelOpen: false })

  toggleVisibility = () => {
    if (this.props.sidebarOpened) this.props.closeSidebar();
    else this.props.openSidebar();
  }

  scrollToNode(d) {
    const docListItem = this.fixedSidebar.docListSidebar._items.get(d.id);
    ReactDOM.findDOMNode(docListItem).scrollIntoViewIfNeeded(); // eslint-disable-line react/no-find-dom-node
  }

  hoverNode = (d, state, scrollToNode = false) => {
    if (!d) return;
    if (this.state.focusedNode && this.state.focusedNode.id === d.id) {
      return;
    }
    const hoverTransition = d3Transition.transition().duration(140);
    d3Select.selectAll(`#${d.id}`).classed('hover-node', state);
    d3Select.selectAll(`.line-network.${d.id}`).classed('hover-line-network', state);
    if (d.links) {
      d.links.forEach((link) => {
        d3Select.selectAll(`#${link.id}`).classed('secondary-hover-node', state);
      });
    }
    // On Hover
    if (state) {
      if (scrollToNode) this.scrollToNode(d);
      d3Select.selectAll(`circle#${d.id}`)
        .transition(hoverTransition)
        .attr('r', n => n.radius + 10)
        .delay(20)
        .transition(hoverTransition)
        .attr('r', n => n.radius + 5);
      d.radius += 5;

      // Show the tooltip
      // d3Select.select(this.tooltip)
      //   .style('left', `${event.x + 10}px`) // eslint-disable-line no-undef
      //   .style('top', `${event.y + 10}px`) // eslint-disable-line no-undef
      //   .style('display', 'inline-block')
      //   .html((d.title));
    } else {
      d3Select.selectAll(`circle#${d.id}`)
        .transition(hoverTransition)
        .attr('r', n => n.defaultRadius);
      d.radius = d.defaultRadius;

      // Hide tooltip
      // d3Select.select(this.tooltip).style('display', 'none');
    }
  }

  focusNode = (d, state = true, scrollToNode = true) => {
    if (!d) return;
    if (this.state.focusedNode && this.state.focusedNode === d.id && state !== false) {
      this.focusNode({ id: this.state.focusedNode }, false, false);
      return;
    }
    if (state) {
      if (this.state.focusedNode) this.focusNode({ id: this.state.focusedNode }, false, false);
      d.radius += 5;
      this.setState({ ...this.state, focusedNode: d.id });
    } else {
      d.radius = d.defaultRadius;
      this.setState({ ...this.state, focusedNode: null });
    }
    const hoverTransition = d3Transition.transition().duration(140);
    d3Select.selectAll(`#${d.id}`).classed('focus-node', state);
    d3Select.selectAll(`.line-network.${d.id}`).classed('focus-line-network', state);
    if (d.links) {
      d.links.forEach((link) => {
        d3Select.selectAll(`#${link.id}`).classed('secondary-focus-node', state);
      });
    }
    // On Focus
    if (state) {
      if (scrollToNode) this.scrollToNode(d);
      d3Select.selectAll(`circle#${d.id}`)
        .transition(hoverTransition)
        .attr('r', n => n.radius + 5)
        .delay(20)
        .transition(hoverTransition)
        .attr('r', n => n.radius);

      // Show the tooltip
      // d3Select.select(this.tooltip)
      //   .style('left', `${event.x + 10}px`) // eslint-disable-line no-undef
      //   .style('top', `${event.y + 10}px`) // eslint-disable-line no-undef
      //   .style('display', 'inline-block')
      //   .html((d.title));
    } else {
      d3Select.selectAll(`circle#${d.id}`)
        .transition(hoverTransition)
        .attr('r', n => n.defaultRadius);

      // Hide tooltip
      // d3Select.select(this.tooltip).style('display', 'none');
    }
  }

  vizLayout = () => {
    const { documents } = this.props.db;
    if (documents.nodes && documents.nodes.length > 0) {
      const vizProps = {
        hoverNode: this.hoverNode,
        focusNode: this.focusNode,
        scrollToNode: this.scrollToNode,
      };
      const vizArray = [
        (<VizContainer
          windowName="Network"
          contentId="window-network-content"
          key="network"
          gridKey="network"
          gridData={{ x: 0, y: 0, w: 5, h: 8, static: false }}
        >
          <Network
            queryResult={this.props.db.queryResult}
            nodes={_.cloneDeep(documents.nodes)}
            links={_.cloneDeep(documents.links)}
            filteredNodes={_.cloneDeep(documents.filteredNodes)}
            magnets={this.state.magnets}
            focusedNode={this.state.focusedNode}
            ref={(element) => { this.networkViz = element; }}
            {...vizProps}
          />
        </VizContainer>),
        (<VizContainer
          windowName="Cluster Layout"
          contentId="window-cluster-content"
          key="clusterLayout"
          gridKey="clusterLayout"
          gridData={{ x: 5, y: 0, w: 5, h: 8, static: false }}
        >
          <ClusterLayout
            queryResult={this.props.db.queryResult}
            nodes={_.cloneDeep(documents.nodes)}
            filteredNodes={_.cloneDeep(documents.filteredNodes)}
            ref={(element) => { this.clusterViz = element; }}
            focusedNode={this.state.focusedNode}
            {...vizProps}
          />
        </VizContainer>),
        (<VizContainer
          queryResult={this.props.db.queryResult}
          windowName="Timeline"
          contentId="window-timeline-content"
          key="timeline"
          gridKey="timeline"
          gridData={{ x: 0, y: 0, w: 12, h: 8, static: false }}
        >
          <Timeline
            queryResult={this.props.db.queryResult}
            nodes={_.cloneDeep(documents.nodes)}
            filteredNodes={_.cloneDeep(documents.filteredNodes)}
            filterByDate={this.props.filterByDate}
            clearFilterByDate={this.props.clearFilterByDate}
            ref={(element) => { this.timelineViz = element; }}
            {...vizProps}
          />
        </VizContainer>),
      ];
      return (<GridLayout>{vizArray}</GridLayout>);
    }
    return (<GridLayout>{[]}</GridLayout>);
  }

  handleSave = (res, newViz) => {
    if (res && res.length > 0) {
      const docs = { docIds: res };
      this.props.updateVisualizationWithDocs(docs, newViz);
    }
  }

  changeMagnetVizState = () => {
    this.handleOpen();
    // console.error('not finished yet');
    // this.setState({ ...this.state, magnets: !this.state.magnets });
  }

  render() {
    const { modelOpen } = this.state;
    const query = this.props.query.pubmed;
    const children = (
      <div>
        <Modal
          open={modelOpen}
          onClose={this.handleClose}
        >
          <Header icon='archive' content='Archive Old Messages' />
          <Modal.Content>
            <p>Your inbox is getting full, would you like us to enable automatic archiving of old messages?</p>
          </Modal.Content>
          <Modal.Actions>
            <Button color='red'>
              <Icon name='remove' /> No
            </Button>
            <Button color='green'>
              <Icon name='checkmark' /> Yes
            </Button>
          </Modal.Actions>
        </Modal>
        {this.props.db.loading ? (
          <Dimmer active inverted>
            <Loader indeterminate>Preparing Files</Loader>
          </Dimmer>
        ) : null}
        {this.vizLayout()}
      </div>
    );
    const { db } = this.props;
    const { documents } = db;
    const clusterWordsTfidf = documents.cluster_words_tfidf;
    return (
      <div>
        <SidebarFixed
          style={style.menu}
          closeSidebarButtonVisible={this.props.sidebarOpened}
          closeSidebarButtonHandle={this.toggleVisibility}
          magnetsActive={this.state.magnets}
          changeMagnetVizState={this.changeMagnetVizState}
          queryLoading={query.loading}
          dbDocumentList={documents}
          handleHover={this.hoverNode}
          openDocument={this.openDocument}
          focusNode={this.focusNode}
          topicWords={clusterWordsTfidf}
          queryDocuments={(documentQuery) => {
            this.props.queryPubmed(documentQuery);
            this.props.openSidebar();
          }}
          sortDocumentsBy={this.props.sortDocumentsBy}
          filterDocuments={this.props.filterDocuments}
          ref={(element) => { this.fixedSidebar = element; }}
        />
        <div style={style.main}>
          <SidebarPushable
            visible={this.props.sidebarOpened}
            closeSidebar={this.toggleVisibility}
            saveResults={this.handleSave}
            results={query.results}
            queryLoading={query.loading}
            queryError={query.errorLoading}
          >
            <Button onClick={this.handleOpen}>TEST</Button>
            {children}
          </SidebarPushable>
        </div>
      </div>
    );
  }
}

AppLayout.propTypes = {
  openSidebar: PropTypes.func.isRequired,
  closeSidebar: PropTypes.func.isRequired,
  fetchDocuments: PropTypes.func.isRequired,
  queryPubmed: PropTypes.func.isRequired,
  filterByDate: PropTypes.func.isRequired,
  clearFilterByDate: PropTypes.func.isRequired,
  sortDocumentsBy: PropTypes.func.isRequired,
  filterDocuments: PropTypes.func.isRequired,
  updateVisualizationWithDocs: PropTypes.func.isRequired,
  sidebarOpened: PropTypes.bool.isRequired,
  query: PropTypes.shape({
    pubmed: PropTypes.shape({
      loading: PropTypes.bool.isRequired,
      errorLoading: PropTypes.bool.isRequired,
      results: PropTypes.arrayOf(PropTypes.shape({
        abstract: PropTypes.string.isRequired,
        authors: PropTypes.string.isRequired,
        pmid: PropTypes.number.isRequired,
        pubDate: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
      })).isRequired,
    }),
  }).isRequired,
  db: PropTypes.shape({
    errorLoading: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    queryResult: PropTypes.bool.isRequired,
    documents: PropTypes.shape({
      cluster_words_lsa: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
      cluster_words_tfidf: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
      filter: PropTypes.string.isRequired,
      nodes: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        authors: PropTypes.arrayOf(PropTypes.shape({
          name: PropTypes.string,
        })),
        date: PropTypes.string,
        value: PropTypes.number,
      })).isRequired,
      filteredNodes: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        authors: PropTypes.arrayOf(PropTypes.shape({
          name: PropTypes.string,
        })),
        date: PropTypes.string,
        value: PropTypes.number,
      })).isRequired,
      links: PropTypes.arrayOf(PropTypes.shape({
        source: PropTypes.any,
        target: PropTypes.any,
        value: PropTypes.number,
      })).isRequired,
      topics_lda: PropTypes.arrayOf(PropTypes.shape({
        index: PropTypes.number.isRequired,
        top_words: PropTypes.arrayOf(PropTypes.string).isRequired,
      }).isRequired),
      topics_nmf: PropTypes.arrayOf(PropTypes.shape({
        index: PropTypes.number.isRequired,
        top_words: PropTypes.arrayOf(PropTypes.string).isRequired,
      })).isRequired,
    }),
  }).isRequired,
};

const mapDispatchToProps = dispatch => ({
  openSidebar: () => dispatch(OPEN_SIDEBAR()),
  closeSidebar: () => dispatch(CLOSE_SIDEBAR()),
  fetchDocuments: () => dispatch(FETCH_DOCUMENTS()),
  queryPubmed: query => dispatch(QUERY_DOCUMENTS_PUBMED(query)),
  queryDocInfoPubmed: pmid => dispatch(QUERY_DOCUMENT_INFO_PUBMED(pmid)),
  queryDocAbstractPubmed: pmid => dispatch(QUERY_DOCUMENT_ABSTRACT_PUBMED(pmid)),
  filterByDate: date => dispatch(FILTER_BY_DATE(date)),
  clearFilterByDate: () => dispatch(CLEAR_FILTER_BY_DATE()),
  updateVisualizationWithDocs: (docs, newViz) => dispatch(UPDATE_VISUALIZATION_WITH_DOCS(docs, newViz)), // eslint-disable-line max-len
  sortDocumentsBy: sortKey => dispatch(SORT_DOCUMENTS_BY(sortKey)),
  filterDocuments: query => dispatch(FILTER_DOCUMENTS(query)),
});

const mapStateToProps = state => ({
  sidebarOpened: state.layout.sidebarOpened,
  query: state.documentDb.query,
  db: {
    documents: state.documentDb.db.documents,
    loading: state.documentDb.db.loading,
    errorLoading: state.documentDb.db.errorLoading,
    queryResult: state.documentDb.db.queryResult,
  },
  docFetch: state.documentDb.docFetch,
});

const DragWrapper = DragDropContext(HTML5Backend)(AppLayout);
export default connect(mapStateToProps, mapDispatchToProps)(DragWrapper);
