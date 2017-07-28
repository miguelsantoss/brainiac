import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Menu, Input, Icon, Loader } from 'semantic-ui-react';
import Box from '../test/Box';
import DocumentList from './DocumentList';

import keyboardKey from '../../lib/keyboardKey';

import './DocumentList.scss';
import pkg from '../../../../package.json';

const style = {};

style.popup = {
  borderRadius: 0,
  padding: '2em',
};

class SidebarFixed extends Component {
  constructor(props) {
    super(props);

    const sortOptions = [
      {
        key: 'name',
        text: '',
        value: 'name',
        content: 'Name',
      },
      {
        key: 'date',
        text: '',
        value: 'date',
        content: 'Date',
      },
    ];

    this.state = {
      query: '',
      sortOptions,
      sortBy: sortOptions[0].value,
    };
  }

  handleSearchChange = e => this.setState({
    query: e.target.value,
  })

  handleSearchKeyDown = (e) => {
    const code = keyboardKey.getCode(e);

    if (code === keyboardKey.Enter) {
      e.preventDefault();
      this.props.queryDocuments(this.state.query);
      this.setState({ query: '' });
    }
  }

  renderTopicWords = () => {
    const { topicWords, magnetsActive } = this.props;
    const getImportantWords = d => d.slice(0, 3);
    if (!magnetsActive) return null;
    return (
      <Menu.Item>
        {
          magnetsActive ? (
            <Menu.Menu>
              {
                topicWords && topicWords.map((topic, topicIndex) =>
                getImportantWords(topic).map((word, wordIndex) => (
                  (
                    <Box key={`${word}${topicIndex}${wordIndex}`} name={word} /> // eslint-disable-line react/no-array-index-key
                  )),
                ))
              }
            </Menu.Menu>
          ) : null
        }
      </Menu.Item>
    );
  }

  render() {
    const { closeSidebarButtonVisible, closeSidebarButtonHandle, queryLoading } = this.props;
    const { query } = this.state;
    const { magnetsActive } = this.props;
    return (
      <Menu vertical fixed="left" inverted style={this.props.style}>
        <Menu.Item>
          <strong>
            Brainiac &nbsp;
            <small><em>{pkg.version}</em></small>
          </strong>
          {
            closeSidebarButtonVisible && (!queryLoading ?
            (<Icon inverted name="arrow left" onClick={closeSidebarButtonHandle} />)
            : (<Loader active inverted inline size="tiny" as={Icon} />))
          }
        </Menu.Item>
        <Menu.Item>
          <Input
            className="transparent inverted icon"
            icon="search"
            placeholder="Search Pubmed"
            value={query}
            onChange={this.handleSearchChange}
            onKeyDown={this.handleSearchKeyDown}
          />
        </Menu.Item>
        <Menu.Item>
          <span>Words per Topic</span>
          <Icon
            inverted
            name={magnetsActive ? 'toggle on' : 'toggle off'}
            size="large"
            disabled={!magnetsActive}
            link={magnetsActive}
            onClick={() => this.props.changeMagnetVizState()}
          />
        </Menu.Item>
        {this.renderTopicWords()}
        <DocumentList
          focusNode={this.props.focusNode}
          openDocument={this.props.openDocument}
          documentList={this.props.dbDocumentList}
          handleHover={this.props.handleHover}
          sortDocumentsBy={this.props.sortDocumentsBy}
          ref={(element) => { this.docListSidebar = element; }}
        />
      </Menu>
    );
  }
}

SidebarFixed.propTypes = {
  queryDocuments: PropTypes.func.isRequired,
  sortDocumentsBy: PropTypes.func.isRequired,
  handleHover: PropTypes.func.isRequired,
  changeMagnetVizState: PropTypes.func.isRequired,
  closeSidebarButtonHandle: PropTypes.func.isRequired,
  closeSidebarButtonVisible: PropTypes.bool.isRequired,
  dbDocumentList: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  topicWords: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
  queryLoading: PropTypes.bool.isRequired,
  magnetsActive: PropTypes.bool.isRequired,
  focusNode: PropTypes.func.isRequired,
  openDocument: PropTypes.func.isRequired,
};

export default SidebarFixed;
