import React, { Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { Dimmer, Loader } from 'semantic-ui-react';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext, DragDropContextProvider } from 'react-dnd';

import * as d3Transition from 'd3-transition';
import * as d3Ease from 'd3-ease';
import { selectAll, select } from 'd3-selection';

import { CLOSE_SIDEBAR, OPEN_SIDEBAR } from 'actions/layout';
import { FETCH_DOCUMENTS, QUERY_DOCUMENTS_PUBMED, QUERY_DOCUMENT_INFO_PUBMED } from 'actions/documents';

import SidebarFixed from 'components/SidebarFixed';
import SidebarPushable from 'components/SidebarPushable';
import GridLayout from 'containers/GridLayout';

import Network from 'components/Network.1';
import Timeline from 'components/Timeline';
import ClusterLayout from 'components/ClusterLayout';

import style from './style';

class AppLayout extends Component {
  componentWillMount = () => this.props.fetchDocuments()
  toggleVisibility = () => this.props.sidebarOpened ? this.props.closeSidebar() : this.props.openSidebar()
  hoverNode = (d, state, radius=4, bigRadius=14) => {
    const hoverTransition = d3Transition.transition().duration(90);
    selectAll(`#${d.id}`).classed('hover-node', state);

    if (state) {
      selectAll(`#${d.id}`)
        .transition(hoverTransition)
        .attr('r', bigRadius)
        .delay(20)
        .transition(hoverTransition)
        .attr('r', radius);
    }

    selectAll(`.line-network.${d.id}`).classed('hover-line-network', state);
    if (state) {
      select(this.tooltip)
        .style('left', event.x + 10 + 'px')
        .style('top', event.y + 10 + 'px')
        .style('display', 'inline-block')
        .html((d.title));
    } else {
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
    //const t = this.vizLayout();
    const { db } = this.props;
    const { documents } = db;
    const clusterWordsTfidf = documents.cluster_words_tfidf;
    return (
      <div>
        <SidebarFixed
          style={style.menu}
          closeSidebarButtonVisible={this.props.sidebarOpened}
          closeSidebarButtonHandle ={this.toggleVisibility}
          dbDocumentList={documents || {}}
          handleHover={this.hoverNode}
          topicWords={clusterWordsTfidf || []}
          queryDocuments={(query) => { this.props.queryPubmed(query); this.props.openSidebar(); }}
        />
        <div style={style.main}>
          <SidebarPushable
            children={children}
            visible={this.props.sidebarOpened}
            closeSidebar={this.toggleVisibility}
            saveResults={this.handleSave}
            results={query.results}
            loading={query.loading}
            queryError={query.errorLoading}
          />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  openSidebar: () => dispatch(OPEN_SIDEBAR()),
  closeSidebar: () => dispatch(CLOSE_SIDEBAR()),
  fetchDocuments: () => dispatch(FETCH_DOCUMENTS()),
  queryPubmed: query => dispatch(QUERY_DOCUMENTS_PUBMED(query)),
  queryDocInfoPubmed: pmid => dispatch(QUERY_DOCUMENT_INFO_PUBMED(pmid)),
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
