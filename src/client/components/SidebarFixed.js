import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Menu, Input, Icon, Popup } from 'semantic-ui-react';
import _ from 'lodash';

import keyboardKey from 'lib/keyboardKey';

import Box from 'components/test/Box';
import SidebarItem from 'components/MenuItem';

import 'css/DocumentList.scss';
import pkg from '../../../package.json';

const style = {};

style.popup = {
  borderRadius: 0,
  padding: '2em',
};

class SidebarFixed extends Component {
  state = { query: '' }
  _items = new Map();

  handleHover = (obj, state) => {
    const { id, i } = obj;
    // const item = this._items.get(i);
    // if (item) {
    //   ReactDOM.findDOMNode(item).scrollIntoView({block: 'end', behavior: 'smooth'});
    // }
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
    const getImportantWords = d => `${d[0]}, ${d[1]}, ${d[2]}`;

    return (
      <Menu.Item>
        <Menu.Header>Words per Topic</Menu.Header>
        <Menu.Menu>
          {
            topicWords && topicWords.map((d, i) => (
              <Box key={i} name={getImportantWords(d)} />
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
    const { style, closeSidebarButtonVisible, closeSidebarButtonHandle } = this.props;
    const { query } = this.state;
    return (
      <Menu vertical fixed="left" inverted style={style}>
        <Menu.Item>
          <strong>
            Brainiac &nbsp;
            <small><em>{pkg.version}</em></small>
          </strong>
          { closeSidebarButtonVisible ? (<Icon inverted name="arrow left" onClick={closeSidebarButtonHandle} />) : null }
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
  dbDocumentList: PropTypes.object.isRequired,
  topicWords: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
};

export default SidebarFixed;
