import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { connect } from 'react-redux';
import { Dimmer, Loader } from 'semantic-ui-react';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';

import * as d3Select from 'd3-selection';
import * as d3Transition from 'd3-transition';

import { CLOSE_SIDEBAR, OPEN_SIDEBAR } from '../../actions/layout';
import {
  FETCH_DOCUMENTS,
  QUERY_DOCUMENTS_PUBMED,
  QUERY_DOCUMENT_INFO_PUBMED,
  FILTER_BY_DATE,
  CLEAR_FILTER_BY_DATE,
  UPDATE_VISUALIZATION_WITH_DOCS,
  SORT_DOCUMENTS_BY,
  FILTER_DOCUMENTS,
  GET_WORD_DISTANCE,
} from '../../actions/documents';

import SidebarFixed from '../../components/SidebarFixed';
import SidebarPushable from '../../components/SidebarPushable';
import GridLayout from '../../containers/GridLayout';
import FileUploader from '../../components/FileUploader';
import VizContainer from '../../containers/VizContainer';
import Tooltip from '../../components/Tooltip';

// Idioms
import Network from '../../components/Idioms/Network';
import Timeline from '../../components/Idioms/Timeline';
import ClusterLayout from '../../components/Idioms/ClusterLayout';

import style from './style';

const MODE_FOCUS_NODE = 'secondary-focus-node';
const MODE_FOCUS_LINK = 'focus-line-network';

const MODE_HOVER_NODE = 'secondary-hover-node';
const MODE_HOVER_LINK = 'hover-line-network';

// const MODE_HOVER_CLUSTER_NODE = 'secondary-hover-node-cluster';
// const MODE_HOVER_CLUSTER_LINK = 'cluster-line-hover';

class AppLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      magnets: false,
      hoverNode: null,
      focusedNode: null,
      focusedCluster: null,
      modelOpen: false,
    };
  }

  componentWillMount() {
    this.props.fetchDocuments();
  }

  toggleFileModal = () =>
    this.state.modalOpen ? this.handleClose() : this.handleOpen();

  handleOpen = () => this.setState({ ...this.state, modelOpen: true });
  handleClose = () => this.setState({ ...this.state, modelOpen: false });

  toggleVisibility = () => {
    if (this.props.sidebarOpened) this.props.closeSidebar();
    else this.props.openSidebar();
  };

  scrollToNode = d => {
    const docListItem = this.fixedSidebar.docListSidebar.items.get(d.id); // eslint-disable-line no-underscore-dangle
    ReactDOM.findDOMNode(docListItem).scrollIntoViewIfNeeded(); // eslint-disable-line react/no-find-dom-node
  };

  highlightLinks = (d, state, nodeClass, linkClass) => {
    const { documents } = this.props.db;

    d3Select.selectAll(`.line-network.${d.id}`).classed(linkClass, state);

    // If origin of the focus is the network, we have links to iterate
    // else, we need to do it manually
    if (d.links) {
      d.links.forEach(link => {
        d3Select.selectAll(`#${link.id}`).classed(nodeClass, state);
      });
    } else {
      let nodeI = 0;
      const links = [];
      for (let i = 0; i < documents.nodes.length; i += 1) {
        if (documents.nodes[i].id === d.id) {
          nodeI = i;
          break;
        }
      }
      for (let i = 0; i < documents.links.length; i += 1) {
        if (documents.links[i].source === nodeI) {
          const index = documents.links[i].target;
          links.push(documents.nodes[index].id);
        }
      }
      for (let i = 0; i < links.length; i += 1) {
        d3Select.selectAll(`#${links[i]}`).classed(nodeClass, state);
      }
    }
  };

  hoverNode = (d, state, scrollToNode = false, displayPopup = true) => {
    if (!d) return;
    const hoverTransition = d3Transition.transition().duration(200);
    if (this.state.focusedNode && this.state.focusedNode.id === d.id) {
      if (state) {
        if (displayPopup) {
          // Show the tooltip
          const mouseCoords = d3Select.mouse(d3Select.select(this.view).node());
          let xOffset = mouseCoords[0] + 36;
          let yOffset = mouseCoords[1] + 60;
          const tooltip = d3Select.select(this.tooltip);

          tooltip
            .style('left', `${xOffset}px`) // eslint-disable-line no-undef
            .style('top', `${yOffset}px`) // eslint-disable-line no-undef
            .style('opacity', 0)
            .style('display', 'inline-block')
            .html(`<b>Title:</b><br />${d.title}`);

          tooltip.transition(hoverTransition).style('opacity', 1);

          /* 
            Check if it is off the screen
            if drawing on the right leaves the screen, then change it
            to the left of the cursor
          */
          const tooltipNode = ReactDOM.findDOMNode(this.tooltip);
          const boxTT = tooltipNode.getBoundingClientRect();

          if (boxTT.bottom > window.innerHeight) {
            yOffset = yOffset - (boxTT.bottom - window.innerHeight) - 10;
            tooltip.style('top', `${yOffset}px`);
          }

          if (boxTT.right > window.innerWidth - 20) {
            if (boxTT.width < 300) {
              xOffset -= 200;
            } else {
              xOffset -= 100;
            }
            tooltip.style('left', `${xOffset}px`);
          } else if (boxTT.left < style.main.marginLeft + 20) {
            xOffset = style.main.marginLeft + 20;
            tooltip.style('left', `${xOffset}px`);
          }
        }
      } else {
        const tooltip = d3Select.select(this.tooltip);
        tooltip
          .transition(hoverTransition)
          .style('opacity', 0)
          .on('end', () => {
            tooltip.style('display', 'none');
          });
      }
      return;
    }

    d3Select.selectAll(`#${d.id}`).classed('hover-node', state);
    this.highlightLinks(d, state, MODE_HOVER_NODE, MODE_HOVER_LINK);

    // On Hover
    if (state) {
      if (scrollToNode) this.scrollToNode(d);
      d3Select
        .selectAll(`circle#${d.id}`)
        .transition(hoverTransition)
        .attr('r', n => n.radius + 10)
        .delay(20)
        .transition(hoverTransition)
        .attr('r', n => n.radius + 5);

      d.radius += 5;

      if (displayPopup) {
        // Show the tooltip
        const mouseCoords = d3Select.mouse(d3Select.select(this.view).node());
        let xOffset = mouseCoords[0] + 36;
        let yOffset = mouseCoords[1] + 60;
        const tooltip = d3Select.select(this.tooltip);

        tooltip
          .style('left', `${xOffset}px`) // eslint-disable-line no-undef
          .style('top', `${yOffset}px`) // eslint-disable-line no-undef
          .style('opacity', 0)
          .style('display', 'inline-block')
          .html(`<b>Title:</b><br />${d.title}`);

        tooltip.transition(hoverTransition).style('opacity', 1);

        /* 
          Check if it is off the screen
          if drawing on the right leaves the screen, then change it
          to the left of the cursor
        */
        const tooltipNode = ReactDOM.findDOMNode(this.tooltip);
        const boxTT = tooltipNode.getBoundingClientRect();

        if (boxTT.bottom > window.innerHeight) {
          yOffset = yOffset - (boxTT.bottom - window.innerHeight) - 10;
          tooltip.style('top', `${yOffset}px`);
        }

        if (boxTT.right > window.innerWidth - 20) {
          if (boxTT.width < 300) {
            xOffset -= 200;
          } else {
            xOffset -= 100;
          }
          tooltip.style('left', `${xOffset}px`);
        } else if (boxTT.left < style.main.marginLeft + 20) {
          xOffset = style.main.marginLeft + 20;
          tooltip.style('left', `${xOffset}px`);
        }

        // let el = tooltipNode;
        // let left = el.offsetLeft;
        // const width = el.offsetWidth;

        // while (el.offsetParent) {
        //   el = el.offsetParent;
        //   left += el.offsetLeft;
        // }

        // if (left + width >= window.pageXOffset + window.innerWidth) {
        //   xOffset = d3Select.event.x - 500;
        //   yOffset = d3Select.event.y - 80;
        //   tooltip
        //     .style('left', `${xOffset}px`) // eslint-disable-line no-undef
        //     .style('top', `${yOffset}px`) // eslint-disable-line no-undef
        //     .style('display', 'inline-block')
        //     .html(d.title);
        // }
      }
    } else {
      d3Select
        .selectAll(`circle#${d.id}`)
        .transition(hoverTransition)
        .attr('r', n => n.defaultRadius);

      d.radius = d.defaultRadius;

      // Hide tooltip
      const tooltip = d3Select.select(this.tooltip);
      tooltip
        .transition(hoverTransition)
        .style('opacity', 0)
        .on('end', () => {
          tooltip.style('display', 'none');
        });
    }
  };

  hoverCluster = (d, state) => {
    if (!d) return;
    const hoverTransition = d3Transition.transition().duration(140);
    const nodesFromCluster = d3Select
      .selectAll('svg.cluster-sel')
      .selectAll(`.cluster${d.clusterId}`);

    nodesFromCluster.classed('cluster-hover', state);
    nodesFromCluster
      .transition(hoverTransition)
      .attr('r', n => (state ? n.radius + 2 : n.radius));

    d3Select
      .selectAll(`line.cluster${d.clusterId}`)
      .classed('cluster-line-hover', state);

    // On Hover
    if (state) {
      d3Select
        .selectAll(`circle#${d.id}`)
        .transition(hoverTransition)
        .attr('r', n => n.radius + 10)
        .delay(20)
        .transition(hoverTransition)
        .attr('r', n => n.radius + 5);

      d.radius += 5;
    } else {
      d3Select
        .selectAll(`circle#${d.id}`)
        .transition(hoverTransition)
        .attr('r', n => n.defaultRadius);

      d.radius = d.defaultRadius;

      // Sometimes doens't undo the hover
      setTimeout(() => {
        d3Select
          .selectAll(`.cluster${d.clusterId}`)
          .style('fill', null)
          .attr('r', n => n.radius);
        d3Select
          .selectAll(`.line-network.cluster${d.clusterId}`)
          .style('stroke', null);
      }, 200);
    }
  };

  focusCluster = (d, state = true) => {
    if (!d) return;
    if (
      this.state.focusedCluster &&
      this.state.focusedCluster.clusterId === d.clsterId &&
      state !== false
    ) {
      this.focusCluster(d, false);
      return;
    }
    if (state) {
      if (this.state.focusedCluster) {
        this.focusCluster(this.state.focusedCluster, false);
      }
      this.hoverCluster(d, true);
      this.setState({ ...this.state, focusedCluster: d });
    } else {
      this.hoverCluster(d, false);
      this.setState({ ...this.state, focusedCluster: null });
    }
  };

  focusNode = (d, state = true, scrollToNode = true) => {
    if (!d) return;
    if (
      this.state.focusedNode &&
      this.state.focusedNode.id === d.id &&
      state !== false
    ) {
      this.focusNode(this.state.focusedNode, false, false);
      return;
    }
    if (state) {
      if (this.state.focusedNode) {
        this.focusNode(this.state.focusedNode, false, false);
      }
      d.radius += 5;
      this.setState({ ...this.state, focusedNode: d });
    } else {
      d.radius = d.defaultRadius;
      this.setState({ ...this.state, focusedNode: null });
    }

    const hoverTransition = d3Transition.transition().duration(140);
    d3Select.selectAll(`#${d.id}`).classed('focus-node', state);
    this.highlightLinks(d, state, MODE_FOCUS_NODE, MODE_FOCUS_LINK);

    // On Focus
    if (state) {
      if (scrollToNode) this.scrollToNode(d);
      d3Select
        .selectAll(`circle#${d.id}`)
        .transition(hoverTransition)
        .attr('r', n => n.radius + 5)
        .delay(20)
        .transition(hoverTransition)
        .attr('r', n => n.radius);
    } else {
      d3Select
        .selectAll(`circle#${d.id}`)
        .transition(hoverTransition)
        .attr('r', n => n.defaultRadius);
    }
  };

  vizLayout = () => {
    const { documents } = this.props.db;
    if (documents.nodes && documents.nodes.length > 0) {
      const vizProps = {
        hoverNode: this.hoverNode,
        hoverCluster: this.hoverCluster,
        focusCluster: this.focusCluster,
        focusNode: this.focusNode,
        scrollToNode: this.scrollToNode,
      };
      const vizArray = [
        <VizContainer
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
            ref={element => {
              this.networkViz = element;
            }}
            {...vizProps}
          />
        </VizContainer>,
        <VizContainer
          windowName="Cluster Layout"
          contentId="window-cluster-content"
          key="clusterLayout"
          gridKey="clusterLayout"
          gridData={{ x: 5, y: 0, w: 5, h: 8, static: false }}
        >
          <ClusterLayout
            queryResult={this.props.db.queryResult}
            nodes={_.cloneDeep(documents.nodes)}
            wordDistances={documents.wordDistances}
            wordDistancesWLabels={documents.wordDistancesWLabels}
            filteredNodes={_.cloneDeep(documents.filteredNodes)}
            focusedNode={this.state.focusedNode}
            ref={element => {
              this.clusterViz = element;
            }}
            {...vizProps}
          />
        </VizContainer>,
        <VizContainer
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
            focusedNode={this.state.focusedNode}
            ref={element => {
              this.timelineViz = element;
            }}
            {...vizProps}
          />
        </VizContainer>,
      ];
      return <GridLayout>{vizArray}</GridLayout>;
    }
    return <GridLayout>{[]}</GridLayout>;
  };

  handleSave = (res, newViz) => {
    if (res && res.length > 0) {
      const docs = { docIds: res };
      this.props.updateVisualizationWithDocs(docs, newViz);
    }
  };

  changeMagnetVizState = () => {
    // console.error('not finished yet');
    this.setState({ ...this.state, magnets: !this.state.magnets });
  };

  handleDismiss = () => {
    this.setState({ ...this.state, visible: false });

    setTimeout(() => {
      this.setState({ ...this.state, visible: true });
    }, 2000);
  };

  render() {
    const query = this.props.query.pubmed;
    const children = (
      <div
        ref={e => {
          this.view = e;
        }}
      >
        <FileUploader
          visible={this.state.modelOpen}
          handleClose={this.handleClose}
        />
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
    const wordMagnets = documents.wordMagnets;
    const wordLoading = documents.wordLoading;
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
          topicWords={wordMagnets}
          wordLoading={wordLoading}
          queryDocuments={documentQuery => {
            this.props.queryPubmed(documentQuery);
            this.props.openSidebar();
          }}
          toggleFileModal={this.toggleFileModal}
          sortDocumentsBy={this.props.sortDocumentsBy}
          filterDocuments={this.props.filterDocuments}
          getWordDistance={this.props.getWordDistance}
          tooltipRef={this.tooltipDocList}
          ref={element => {
            this.fixedSidebar = element;
          }}
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
            {children}
          </SidebarPushable>
          <div
            style={style.tooltip}
            className="tooltipviz"
            ref={r => {
              this.tooltip = r;
            }}
            id="tooltip"
          />
          <Tooltip
            handleHover={this.hoverNode}
            ref={r => {
              this.tooltipDocList = r;
            }}
          />
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
  getWordDistance: PropTypes.func.isRequired,
  sidebarOpened: PropTypes.bool.isRequired,
  query: PropTypes.shape({
    pubmed: PropTypes.shape({
      loading: PropTypes.bool.isRequired,
      errorLoading: PropTypes.bool.isRequired,
      results: PropTypes.arrayOf(
        PropTypes.shape({
          abstract: PropTypes.string.isRequired,
          authors: PropTypes.string.isRequired,
          pmid: PropTypes.number.isRequired,
          pubDate: PropTypes.string.isRequired,
          title: PropTypes.string.isRequired,
        }),
      ).isRequired,
    }),
  }).isRequired,
  db: PropTypes.shape({
    errorLoading: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    queryResult: PropTypes.bool.isRequired,
    documents: PropTypes.shape({
      cluster_words_lsa: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string))
        .isRequired,
      cluster_words_tfidf: PropTypes.arrayOf(
        PropTypes.arrayOf(PropTypes.string),
      ).isRequired,
      filter: PropTypes.string.isRequired,
      nodes: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
          title: PropTypes.string,
          authors: PropTypes.arrayOf(
            PropTypes.shape({
              name: PropTypes.string,
            }),
          ),
          date: PropTypes.string,
          value: PropTypes.number,
        }),
      ).isRequired,
      filteredNodes: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
          title: PropTypes.string,
          authors: PropTypes.arrayOf(
            PropTypes.shape({
              name: PropTypes.string,
            }),
          ),
          date: PropTypes.string,
          value: PropTypes.number,
        }),
      ).isRequired,
      links: PropTypes.arrayOf(
        PropTypes.shape({
          source: PropTypes.any,
          target: PropTypes.any,
          value: PropTypes.number,
        }),
      ).isRequired,
      topics_lda: PropTypes.arrayOf(
        PropTypes.shape({
          index: PropTypes.number.isRequired,
          top_words: PropTypes.arrayOf(PropTypes.string).isRequired,
        }).isRequired,
      ),
      topics_nmf: PropTypes.arrayOf(
        PropTypes.shape({
          index: PropTypes.number.isRequired,
          top_words: PropTypes.arrayOf(PropTypes.string).isRequired,
        }),
      ).isRequired,
      wordDistancesWLabels: PropTypes.object.isRequired,
      wordMagnets: PropTypes.arrayOf(PropTypes.string).isRequired,
    }),
  }).isRequired,
};

const mapDispatchToProps = dispatch => ({
  openSidebar: () => dispatch(OPEN_SIDEBAR()),
  closeSidebar: () => dispatch(CLOSE_SIDEBAR()),
  fetchDocuments: () => dispatch(FETCH_DOCUMENTS()),
  queryPubmed: query => dispatch(QUERY_DOCUMENTS_PUBMED(query)),
  queryDocInfoPubmed: pmid => dispatch(QUERY_DOCUMENT_INFO_PUBMED(pmid)),
  // queryDocAbstractPubmed: pmid =>
  //   dispatch(QUERY_DOCUMENT_ABSTRACT_PUBMED(pmid)),
  filterByDate: date => dispatch(FILTER_BY_DATE(date)),
  clearFilterByDate: () => dispatch(CLEAR_FILTER_BY_DATE()),
  updateVisualizationWithDocs: (docs, newViz) =>
    dispatch(UPDATE_VISUALIZATION_WITH_DOCS(docs, newViz)), // eslint-disable-line max-len
  sortDocumentsBy: sortKey => dispatch(SORT_DOCUMENTS_BY(sortKey)),
  filterDocuments: query => dispatch(FILTER_DOCUMENTS(query)),
  getWordDistance: word => dispatch(GET_WORD_DISTANCE(word)),
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
