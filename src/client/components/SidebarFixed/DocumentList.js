import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Menu, Popup, Input, Icon } from 'semantic-ui-react';
import keyboardKey from '../../lib/keyboardKey';

const getOptions = () => ['Title', 'Date'].map(e => ({ key: e, text: e, value: e }));

class DocumentList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      options: getOptions(),
      value: getOptions()[0].value,
      query: '',
    };
    this.prevent = false;
    this.timer = 0;
    this.delay = 200;
    this._items = new Map();
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleSearchKeyDown = this.handleSearchKeyDown.bind(this);
  }

  handleClick(node) {
    this.props.focusNode(node);
  }

  handleDoubleClick(id) {
    this.props.openDocument(id);
  }

  handleHover(node, state) {
    this.props.handleHover(node, state);
  }

  handleChange(e, { value }) {
    this.props.sortDocumentsBy(value);
    this.setState({ value });
  }

  fetchOptions() {
    this.setState({ isFetching: true });

    setTimeout(() => {
      this.setState({ isFetching: false, options: getOptions() });
      this.selectRandom();
    }, 500);
  }

  handleSearchChange(e) {
    this.setState({ query: e.target.value }, () => {
      this.props.filterDocuments(this.state.query.toLowerCase());
    });
  }

  handleSearchKeyDown(e) {
    const code = keyboardKey.getCode(e);
    if (code === keyboardKey.Enter) {
      e.preventDefault();
      this.props.filterDocuments(this.state.query.toLowerCase());
    }
  }

  renderPopupItems() {
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
    const item = documentList && documentList.filteredNodes ? documentList.filteredNodes.map((d, i) => {
      const menuItem = (
        <div
          onMouseEnter={() => this.handleHover(d, true)}
          onMouseLeave={() => this.handleHover(d, false)}
          onClick={() => {
            this.timer = setTimeout(() => {
              if (!this.prevent) this.handleClick(d);
              this.prevent = false;
            }, this.delay);
          }}
          onDoubleClick={() => {
            clearTimeout(this.timer);
            this.prevent = true;
            this.handleDoubleClick(d);
          }}
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
          { d.abstract && (<span><b>Abstract: </b>{d.abstract}</span>)}
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
    const { options, value, query } = this.state;
    return (
      <Menu.Item>
        <Menu.Header>
          <span>List of Documents</span>
          <br />
          <span>Sort by: </span>
          <Dropdown
            inline
            options={options}
            header="Sort by:"
            defaultValue={value}
            onChange={this.handleChange}
            onSearchChange={this.handleSearchChange}
          />
        </Menu.Header>
        <Input
          transparent
          inverted
          fluid
          icon={<Icon name="search" />}
          placeholder="Filter Documents"
          value={query}
          onChange={this.handleSearchChange}
          onKeyDown={this.handleSearchKeyDown}
        />
        <Menu.Menu>
          {this.renderPopupItems()}
        </Menu.Menu>
      </Menu.Item>
    );
  }
}

DocumentList.propTypes = {
  documentList: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  handleHover: PropTypes.func.isRequired,
  focusNode: PropTypes.func.isRequired,
  openDocument: PropTypes.func.isRequired,
  sortDocumentsBy: PropTypes.func.isRequired,
  filterDocuments: PropTypes.func.isRequired,
};

export default DocumentList;
