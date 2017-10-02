import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Menu, Input, Icon, Loader, Button } from 'semantic-ui-react';
import TopicMagnet from '../TopicMagnet';
import DocumentList from './DocumentList';

import keyboardKey from '../../lib/keyboardKey';
import './index.scss';

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
      topicValue: '',
    };
  }

  handleSearchChange = e =>
    this.setState({ ...this.state, query: e.target.value });

  handleTopicChange = e =>
    this.setState({ ...this.state, topicValue: e.target.value });

  handleSearchKeyDown = e => {
    const code = keyboardKey.getCode(e);
    if (code === keyboardKey.Enter) {
      e.preventDefault();
      this.props.queryDocuments(this.state.query);
    }
  };

  handleTopicKeyDown = e => {
    const code = keyboardKey.getCode(e);
    if (code === keyboardKey.Enter && this.state.topicValue !== '') {
      e.preventDefault();
      this.handleTopicCreate();
    }
  };

  handleTopicCreate = () => {
    const { topicValue } = this.state;
    const { topicWords } = this.props;
    for (let i = 0; i < topicWords.length; i += 1) {
      if (topicValue.toLowerCase() === topicWords[i].toLowerCase()) {
        this.setState({ ...this.state, topicValue: '' });
        return;
      }
    }
    this.props.getWordDistance(topicValue);
    this.setState({ ...this.state, topicValue: '' });
  };

  renderTopicWords = () => {
    const { topicWords, magnetsActive } = this.props;
    // const getImportantWords = d => d.slice(0, 3);
    if (!magnetsActive) return null;

    let icon = (
      <Icon name="plus" link onClick={() => this.handleTopicCreate()} />
    );
    if (this.props.wordLoading) {
      icon = <Loader size="mini" inverted active inline />;
    }

    let inputPlaceholder = 'Create Topic';
    if (this.props.wordLoading) {
      inputPlaceholder = 'Loading magnet';
    }

    return (
      <Menu.Item>
        {magnetsActive ? (
          <Menu.Menu>
            <Menu.Item>
              <Input
                transparent
                inverted
                fluid
                icon={icon}
                disabled={this.props.wordLoading}
                placeholder={inputPlaceholder}
                value={this.state.topicValue}
                onChange={this.handleTopicChange}
                onKeyDown={this.handleTopicKeyDown}
              />
            </Menu.Item>
            {topicWords &&
              // topicWords.map((topic, topicIndex) =>
              //   getImportantWords(topic).map((word, wordIndex) => (
              //     <Box key={`${word}${topicIndex}${wordIndex}`} name={word} /> // eslint-disable-line react/no-array-index-key
              //   )),
              // )
              topicWords.map(topic => <TopicMagnet key={topic} name={topic} />)}
          </Menu.Menu>
        ) : null}
      </Menu.Item>
    );
  };

  render() {
    const {
      closeSidebarButtonVisible,
      closeSidebarButtonHandle,
      queryLoading,
    } = this.props;

    const { query } = this.state;
    const { magnetsActive } = this.props;

    return (
      <Menu vertical fixed="left" inverted style={this.props.style}>
        <Menu.Item>
          <strong>Brainiac &nbsp;</strong>
          {closeSidebarButtonVisible &&
            (!queryLoading ? (
              <Icon
                inverted
                name="arrow left"
                onClick={closeSidebarButtonHandle}
              />
            ) : (
              <Loader active inverted inline size="tiny" as={Icon} />
            ))}
        </Menu.Item>
        <Menu.Item>
          <Input
            transparent
            inverted
            fluid
            icon={
              <Icon
                name="search"
                link
                onClick={() => this.props.queryDocuments(this.state.query)}
              />
            }
            placeholder="Search Pubmed"
            value={query}
            onChange={this.handleSearchChange}
            onKeyDown={this.handleSearchKeyDown}
          />
          <br />
          <Button positive compact fluid onClick={this.props.toggleFileModal}>
            <Icon name="upload" />
            <span>Add files</span>
          </Button>
        </Menu.Item>
        <Menu.Item>
          <span>Topic Magnets</span>
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
          filterDocuments={this.props.filterDocuments}
          focusNode={this.props.focusNode}
          documentList={this.props.dbDocumentList}
          handleHover={this.props.handleHover}
          sortDocumentsBy={this.props.sortDocumentsBy}
          tooltipRef={this.props.tooltipRef}
          ref={element => {
            this.docListSidebar = element;
          }}
        />
      </Menu>
    );
  }
}

SidebarFixed.propTypes = {
  queryDocuments: PropTypes.func.isRequired,
  sortDocumentsBy: PropTypes.func.isRequired,
  filterDocuments: PropTypes.func.isRequired,
  handleHover: PropTypes.func.isRequired,
  changeMagnetVizState: PropTypes.func.isRequired,
  closeSidebarButtonHandle: PropTypes.func.isRequired,
  closeSidebarButtonVisible: PropTypes.bool.isRequired,
  dbDocumentList: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  topicWords: PropTypes.arrayOf(PropTypes.string).isRequired,
  queryLoading: PropTypes.bool.isRequired,
  magnetsActive: PropTypes.bool.isRequired,
  focusNode: PropTypes.func.isRequired,
  toggleFileModal: PropTypes.func.isRequired,
  getWordDistance: PropTypes.func.isRequired,
  wordLoading: PropTypes.bool.isRequired,
  tooltipRef: PropTypes.any, // eslint-disable-line react/forbid-prop-types
  style: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

SidebarFixed.defaultProps = {
  tooltipRef: null,
};

export default SidebarFixed;
