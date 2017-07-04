import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Menu, Input, Icon, Popup, Loader } from 'semantic-ui-react';
import Box from 'components/test/Box';

import keyboardKey from 'lib/keyboardKey';

import 'css/DocumentList.scss';
import pkg from '../../../package.json';

const style = {};

style.popup = {
  borderRadius: 0,
  padding: '2em',
};

class SidebarFixed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
    };
    this._items = new Map();
  }

  handleHover = (obj, state) => {
    const { id } = obj;
    this.props.handleHover({ id }, state);
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
    const { topicWords } = this.props;
    const getImportantWords = d => d.slice(0, 3);

    return (
      <Menu.Item>
        <Menu.Header>Words per Topic</Menu.Header>
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
      </Menu.Item>
    );
  }

  renderListOfFiles = () => (
    <Menu.Item>
      <Menu.Header>List of Documents</Menu.Header>
      <Menu.Menu>
        {this.renderPopupItems()}
      </Menu.Menu>
    </Menu.Item>
  );

  renderPopupItems = () => {
    const { dbDocumentList } = this.props;
    const maxAuthors = 10;
    const authorsToString = (d) => {
      let authors = '';
      for (let i = 0; i < maxAuthors && i < d.length; i += 1) {
        authors += `${d[i].name}; `;
      }
      authors = authors.slice(0, -1);
      authors = d.length > maxAuthors ? `${authors.slice(0, -1)}...` : authors;
      return authors;
    };
    const item = dbDocumentList && dbDocumentList.nodes ? dbDocumentList.nodes.map((d, i) => {
      const menuItem = (
        <div
          onMouseEnter={() => this.handleHover({ id: d.id, i }, true)}
          onMouseLeave={() => this.handleHover({ id: d.id, i }, false)}
        >
          <Menu.Item
            name={d.title}
            id={d.id}
            ref={(element) => { this._items.set(d.id, element); }}
          />
        </div>
      );
      const popup = (
        <div>
          <span><b>Title: </b>{d.title}</span>
          <br /><br />
          <span><b>Date: </b>{d.date}</span>
          <br /><br />
          <span><b>Authors: </b>{authorsToString(d.authors)}</span>
        </div>
      );
      return (
        <Popup
          trigger={menuItem}
          content={popup}
          key={d.id}
          position="right center"
          wide
        />
      );
    }) : null;
    return item;
  }


  render() {
    const { style, closeSidebarButtonVisible, closeSidebarButtonHandle, queryLoading } = this.props;
    const { query } = this.state;
    const loaderStyle = {

    };
    return (
      <Menu vertical fixed="left" inverted style={style}>
        <Menu.Item>
          <strong>
            Brainiac &nbsp;
            <small><em>{pkg.version}</em></small>
          </strong>
          {
            closeSidebarButtonVisible && (!queryLoading ?
            (<Icon inverted name="arrow left" onClick={closeSidebarButtonHandle} />)
            : (<Loader active inline size="tiny" as={Icon} />))
          }
        </Menu.Item>
        <Menu.Item>
          <Input
            className="transparent inverted icon"
            icon="search"
            placeholder="Start typing..."
            value={query}
            onChange={this.handleSearchChange}
            onKeyDown={this.handleSearchKeyDown}
          />
        </Menu.Item>
        {this.renderTopicWords()}
        {this.renderListOfFiles()}
      </Menu>
    );
  }
}

SidebarFixed.propTypes = {
  queryDocuments: PropTypes.func.isRequired,
  handleHover: PropTypes.func.isRequired,
  closeSidebarButtonHandle: PropTypes.func.isRequired,
  closeSidebarButtonVisible: PropTypes.bool.isRequired,
  dbDocumentList: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  topicWords: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
  queryLoading: PropTypes.bool.isRequired,
};

export default SidebarFixed;
