import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Menu, Popup } from 'semantic-ui-react';

const getOptions = () => ['Title', 'Date'].map(e => ({ key: e, text: e, value: e }));

class DocumentList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      options: getOptions(),
      value: getOptions()[0].value,
    };
    this._items = new Map();
  }

  handleHover = ({ id }, state) => this.props.handleHover({ id }, state)

  handleChange = (e, { value }) => {
    this.props.sortDocumentsBy(value);
    this.setState({ value });
  }

  fetchOptions = () => {
    this.setState({ isFetching: true });

    setTimeout(() => {
      this.setState({ isFetching: false, options: getOptions() });
      this.selectRandom();
    }, 500);
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
    const { options, value } = this.state;
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
  sortDocumentsBy: PropTypes.func.isRequired,
};

export default DocumentList;
