import React, { Component } from 'react';
import { findDOMNode } from 'react-dom'
import PropTypes from 'prop-types'
import { Menu, Input, Button, Icon, Popup, Header } from 'semantic-ui-react';
import _ from 'lodash';
import keyboardKey from 'lib/keyboardKey';

import 'css/DocumentList.scss';
import pkg from '../../../package.json';

const style = {};

style.popup = {
  borderRadius: 0,
  padding: '2em',
};

class Sidebar extends Component {
  static propTypes = {
    style: PropTypes.object,
  }
  state = { query: '' }
  _items = new Map();

  handleHover = (obj, state) => {
    const { id, i } = obj;
    const item = this._items.get(i);
    if (item) {
      ReactDOM.findDOMNode(item).scrollIntoView({block: 'end', behavior: 'smooth'});
    }
    this.props.handleHover({ id }, state);
  }

  renderPopupItems = () => {
    const { documentList } = this.props;
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
    const item = documentList && documentList.nodes ? documentList.nodes.map((d, i) => {
      const menuItem = (
        <div
          onMouseEnter={() => this.handleHover({ id: d.id, i }, true)}
          onMouseLeave={() => this.handleHover({ id: d.id, i }, false)}
          ref={(element) => { this._items.set(i, element); }}
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

  renderListOfFiles = () => {
    const { documentList } = this.props;
    return (
      <Menu.Item>
        <Menu.Header>List of Documents</Menu.Header>
        <Menu.Menu>
          {this.renderPopupItems()}
        </Menu.Menu>
      </Menu.Item>
    )
  }

  omponentDidMount() {
    document.addEventListener('keydown', this.handleDocumentKeyDown)
    this.setSearchInput();
  }

  componentDidUpdate(prevProps, prevState) {
    this.setSearchInput();
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
  }

  setSearchInput() {
    this._searchInput = findDOMNode(this).querySelector('.ui.input input');
  }

  handleDocumentKeyDown = (e) => {
    const code = keyboardKey.getCode(e);
    const isAZ = code >= 65 && code <= 90;
    const hasModifier = e.altKey || e.ctrlKey || e.metaKey;
    const bodyHasFocus = document.activeElement === document.body;

    if (!hasModifier && isAZ && bodyHasFocus) this._searchInput.focus();
  }

  handleItemClick = () => {
    const { query } = this.state;

    if (query) this.setState({ query: '' });
    if (document.activeElement === this._searchInput) this._searchInput.blur();
  }

  handleSearchChange = e => this.setState({
    selectedItemIndex: 0,
    query: e.target.value,
  })

  handleSearchKeyDown = (e) => {
    const { history } = this.props;
    const { selectedItemIndex } = this.state;
    const code = keyboardKey.getCode(e);

    if (code === keyboardKey.Enter) {
      e.preventDefault();
      this.props.queryDocuments(this.state.query);
      this._searchInput.blur();
      this.setState({ query: '' });
    }

    if (code === keyboardKey.ArrowDown) {
      e.preventDefault();
      const next = _.min([selectedItemIndex + 1, this.filteredComponents.length - 1]);
      this.selectedRoute = getRoute(this.filteredComponents[next]._meta);
      this.setState({ selectedItemIndex: next });
    }

    if (code === keyboardKey.ArrowUp) {
      e.preventDefault();
      const next = _.max([selectedItemIndex - 1, 0]);
      this.selectedRoute = getRoute(this.filteredComponents[next]._meta);
      this.setState({ selectedItemIndex: next });
    }
  }

  render() {
    const { style, buttonVisible, buttonHandle } = this.props;
    const { query } = this.state;
    return (
      <Menu vertical fixed="left" inverted style={style}>
        <Menu.Item>
          <strong>
            Brainiac &nbsp;
            <small><em>{pkg.version}</em></small>
          </strong>
          { buttonVisible ? (<Icon inverted name="arrow left" onClick={buttonHandle} />) : null }
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
        {this.renderListOfFiles()}
      </Menu>
    );
  }
}

export default Sidebar;
