import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Dimmer, Loader, Image, Segment } from 'semantic-ui-react'
import { StickyContainer, Sticky } from 'react-sticky';
import _ from 'lodash';


import * as d3Transition from 'd3-transition';
import * as d3Ease from 'd3-ease';
import { selectAll, select } from 'd3-selection';

import { CLOSE_SIDEBAR, OPEN_SIDEBAR } from 'actions/layout'
import { FETCH_DOCUMENTS, QUERY_DOCUMENTS_PUBMED } from 'actions/documents'

import SidebarFixed from 'components/SidebarFixed';
import SidebarPushable from 'components/SidebarPushable';
import GridLayout from 'containers/GridLayout';

import Network from 'components/Network';
import Timeline from 'components/Timeline';
import ClusterLayout from 'components/ClusterLayout';

import style from './style';

class AppLayout extends Component {
    toggleVisibility = () => this.props.sidebarOpened ? this.props.closeSidebar() : this.props.openSidebar()
    componentWillMount = () => this.props.fetchDocuments()

    vizLayout = () => {
        const { documents } = this.props;
        if(documents.nodes && documents.nodes.length > 0) {
            const vizProps = {
                nodes: _.cloneDeep(this.props.documents.nodes),
                links: _.cloneDeep(this.props.documents.links),
                hoverNode: (d, state, radius=4, bigRadius=14) => {
                    const hoverTransition = d3Transition.transition().duration(90);
                    selectAll(`#${d.id}`).classed('hover-node', state);

                    if(state)
                        selectAll(`#${d.id}`)
                        .transition(hoverTransition)
                        .attr('r', bigRadius)
                        .delay(20)
                        .transition(hoverTransition)
                        .attr('r', radius);

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
                }
            };
            const vizArray = [
                (<Network
                    gridKey='network'
                    gridData={{ x: 0, y: 0, w: 5, h: 8, static: false }}
                    filteredNodes={_.cloneDeep(this.props.documents.filteredNodes)}
                    {...vizProps}
                />),
                (<ClusterLayout
                    gridKey='clusterLayout'
                    gridData={{ x: 5, y: 0, w: 5, h: 8, static: false }}
                    filteredNodes={_.cloneDeep(this.props.documents.filteredNodes)}
                    {...vizProps}
                />),
                (<Timeline
                    gridKey='timeline'
                    gridData={{ x: 0, y: 0, w: 12, h: 8, static: false }}
                    filteredNodes={_.cloneDeep(this.props.documents.filteredNodes)}
                    {...vizProps}
                />),
            ];
            return (<GridLayout children={vizArray}/>);
        }
        return (<GridLayout children={[]}/>);
    }

    render = () => {
        const children = (
            <div>
                {this.props.documentDbLoading ? (
                    <Dimmer active inverted>
                        <Loader indeterminate>Preparing Files</Loader>
                    </Dimmer>    
                ) : null}
                {this.vizLayout()}
            </div>
        );
        return (
            <div>
                <SidebarFixed
                    style={style.menu}
                    buttonVisible={this.props.sidebarOpened}
                    buttonHandle={this.toggleVisibility}
                    documentList={this.props.documents}
                    queryDocuments={query => { this.props.queryPubmed(query); this.props.openSidebar(); }}
                />
                <div style={style.main}>
                    <SidebarPushable
                        children={children}
                        queryRequest={this.props.queryRequest}
                        visible={this.props.sidebarOpened}
                        results={this.props.queryResult}
                        loading={this.props.queryLoading}
                        closeSidebar={this.toggleVisibility}
                    />
                </div>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
    openSidebar: () => dispatch(OPEN_SIDEBAR()),
    closeSidebar: () => dispatch(CLOSE_SIDEBAR()),
    fetchDocuments: () => dispatch(FETCH_DOCUMENTS()),
    queryPubmed: query => dispatch(QUERY_DOCUMENTS_PUBMED(query)),
});

const mapStateToProps = (state) => ({
    sidebarOpened: state.layout.sidebarOpened,
    queryResult: state.documents.queryResult,
    queryLoading: state.documents.queryLoading,
    queryRequest: state.documents.queryRequest,
    documents: state.documents.documents,
    documentDbLoading: state.documents.documentDbLoading,
});

export default connect(mapStateToProps, mapDispatchToProps)(AppLayout);