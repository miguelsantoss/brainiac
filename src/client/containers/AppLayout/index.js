import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { connect } from 'react-redux';
import { Dimmer, Loader } from 'semantic-ui-react';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext, DragDropContextProvider } from 'react-dnd';

import * as d3Transition from 'd3-transition';
import * as d3Ease from 'd3-ease';
import { selectAll, select } from 'd3-selection';

import { CLOSE_SIDEBAR, OPEN_SIDEBAR } from 'actions/layout';
import { FETCH_DOCUMENTS, QUERY_DOCUMENTS_PUBMED, QUERY_DOCUMENT_INFO_PUBMED, QUERY_DOCUMENT_ABSTRACT_PUBMED, FILTER_BY_DATE } from 'actions/documents';

import SidebarFixed from 'components/SidebarFixed';
import SidebarPushable from 'components/SidebarPushable';
import GridLayout from 'containers/GridLayout';

import Network from 'components/Network.1';
import Timeline from 'components/Timeline';
import ClusterLayout from 'components/ClusterLayout';

import style from './style';

class AppLayout extends Component {
  componentWillMount = () => this.props.fetchDocuments()
  toggleVisibility = () => (this.props.sidebarOpened ?
    this.props.closeSidebar() :
    this.props.openSidebar())

  filterByDate = (date) => {
    const min = date[0];
    const max = date[1];
    this.props.filterByDate(min, max);
    // console.log(filtered);
    // this.setState({ ...this.state, search: query, filteredNodes: filtered });
    // this.forceUpdate();
  }

  hoverNode = (d, state, radius = 4, bigRadius = 14) => {
    const hoverTransition = d3Transition.transition().duration(140);
    selectAll(`#${d.id}`).classed('hover-node', state);
    selectAll(`.line-network.${d.id}`).classed('hover-line-network', state);
    const docListItem = this.docListSidebar._items.get(d.id);
    ReactDOM.findDOMNode(docListItem).scrollIntoViewIfNeeded();

    // On Hover
    if (state) {
      // Animate size on hover, keep bigger than normal at the end
      selectAll(`#${d.id}`)
        .transition(hoverTransition)
        .attr('r', bigRadius)
        .delay(20)
        .transition(hoverTransition)
        .attr('r', radius + 5);

      // Show the tooltip
      select(this.tooltip)
        .style('left', `${event.x + 10}px`) // eslint-disable-line no-undef
        .style('top', `${event.y + 10}px`) // eslint-disable-line no-undef
        .style('display', 'inline-block')
        .html((d.title));
    } else {
      // On mouseout, animate size back to normal
      selectAll(`#${d.id}`)
        .transition(hoverTransition)
        .attr('r', radius);

      // Hide tooltip
      select(this.tooltip).style('display', 'none');
    }
  }

  vizLayout = () => {
    const { documents } = this.props.db;
    if (documents.nodes && documents.nodes.length > 0) {
      const vizProps = {
        nodes: _.cloneDeep(documents.nodes),
        links: _.cloneDeep(documents.links),
        hoverNode: this.hoverNode,
      };
      const vizArray = [
        (<Network
          key="network"
          gridKey="network"
          gridData={{ x: 0, y: 0, w: 5, h: 8, static: false }}
          filteredNodes={_.cloneDeep(documents.filteredNodes)}
          {...vizProps}
        />),
        (<ClusterLayout
          key="clusterLayout"
          gridKey="clusterLayout"
          gridData={{ x: 5, y: 0, w: 5, h: 8, static: false }}
          filteredNodes={_.cloneDeep(documents.filteredNodes)}
          {...vizProps}
        />),
        (<Timeline
          key="timeline"
          gridKey="timeline"
          gridData={{ x: 0, y: 0, w: 12, h: 8, static: false }}
          filteredNodes={_.cloneDeep(documents.filteredNodes)}
          filterByDate={this.filterByDate}
          {...vizProps}
        />),
      ];
      return (<GridLayout>{vizArray}</GridLayout>);
    }
    return (<GridLayout>{[]}</GridLayout>);
  }

  handleSave = (res) => {
    if (res && res.length > 0) {
      res.forEach(d => this.props.queryDocInfoPubmed(d));
    }
  }

  render = () => {
    const query = this.props.query.pubmed;
    const children = (
      <div>
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
          queryLoading={query.loading}
          dbDocumentList={documents || {}}
          handleHover={this.hoverNode}
          topicWords={clusterWordsTfidf || []}
          queryDocuments={(documentQuery) => { this.props.queryPubmed(documentQuery); this.props.openSidebar(); }}
          ref={(element) => { this.docListSidebar = element; }}
        />
        <div style={style.main}>
          <SidebarPushable
            visible={this.props.sidebarOpened}
            closeSidebar={this.toggleVisibility}
            saveResults={this.handleSave}
            results={query.results}
            queryLoading={query.loading}
            queryError={query.errorLoading}
            getAbstract={this.props.queryDocAbstractPubmed}
          >
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
  queryDocInfoPubmed: PropTypes.func.isRequired,
  queryDocAbstractPubmed: PropTypes.func.isRequired,
  filterByDate: PropTypes.func.isRequired,
  sidebarOpened: PropTypes.bool.isRequired,
};

const mapDispatchToProps = dispatch => ({
  openSidebar: () => dispatch(OPEN_SIDEBAR()),
  closeSidebar: () => dispatch(CLOSE_SIDEBAR()),
  fetchDocuments: () => dispatch(FETCH_DOCUMENTS()),
  queryPubmed: query => dispatch(QUERY_DOCUMENTS_PUBMED(query)),
  queryDocInfoPubmed: pmid => dispatch(QUERY_DOCUMENT_INFO_PUBMED(pmid)),
  queryDocAbstractPubmed: pmid => dispatch(QUERY_DOCUMENT_ABSTRACT_PUBMED(pmid)),
  filterByDate: (min, max) => dispatch(FILTER_BY_DATE(min, max)),
});

const mapStateToProps = state => ({
  sidebarOpened: state.layout.sidebarOpened,
  query: state.documents.query,
  db: {
    documents: state.documents.db.documents,
    loading: state.documents.db.loading,
    errorLoading: state.documents.db.errorLoading,
  },
  docFetch: state.documents.docFetch,
});

const DragWrapper = DragDropContext(HTML5Backend)(AppLayout);
export default connect(mapStateToProps, mapDispatchToProps)(DragWrapper);
