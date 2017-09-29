import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Dropdown, Menu, Input, Icon } from 'semantic-ui-react';

import * as d3Select from 'd3-selection';
import * as d3Transition from 'd3-transition';

import keyboardKey from '../../lib/keyboardKey';

const getOptions = () =>
  ['Title', 'Date'].map(e => ({ key: e, text: e, value: e }));

const maxAuthors = 10;
const authorsToString = d => {
  let authors = '';
  for (let i = 0; i < maxAuthors && i < d.length; i += 1) {
    authors += `${d[i].name}; `;
  }
  authors = authors.slice(0, -1);
  authors = d.length > maxAuthors ? `${authors.slice(0, -1)}...` : authors;
  return authors;
};

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
    this.items = new Map();
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleSearchKeyDown = this.handleSearchKeyDown.bind(this);
    this.timer = null;
    this.timeoutTime = 500;
  }

  handleClick = node => {
    this.props.focusNode(node);
  };

  handleDoubleClick = id => {
    this.props.openDocument(id);
  };

  handleHover = (node, state) => {
    this.props.handleHover(node, state, false, false);
    if (!this.props.tooltipRef) return;

    const removeChildren = tooltip => {
      tooltip.selectAll('b').remove();
      tooltip.selectAll('span').remove();
      tooltip.selectAll('br').remove();
      tooltip.selectAll('a').remove();
    };

    const tooltip = d3Select.select(this.props.tooltipRef.div);
    const hoverTransition = d3Transition.transition().duration(200);
    const item = ReactDOM.findDOMNode(this.items.get(node.id));
    const box = item.getBoundingClientRect();
    const x = box.right + 20;
    const y = box.y;

    if (state) {
      tooltip
        .style('left', `${x}px`) // eslint-disable-line no-undef
        .style('top', `${y}px`) // eslint-disable-line no-undef
        .style('opacity', 0)
        .style('display', 'inline-block');

      removeChildren(tooltip);
      tooltip.append('b').text('Title: ');
      tooltip.append('br');
      tooltip.append('span').text(node.title);
      tooltip.append('br');
      tooltip.append('br');
      tooltip.append('b').text('Date: ');
      tooltip.append('span').text(node.date);
      tooltip.append('br');
      tooltip.append('br');
      tooltip.append('b').text('Authors: ');
      tooltip.append('br');
      tooltip.append('span').text(authorsToString(node.authors));
      tooltip.append('br');
      tooltip.append('br');
      tooltip.append('b').text('Abstract: ');
      tooltip.append('br');
      tooltip.append('span').text(node.abstract);
      tooltip.append('br');
      tooltip.append('br');

      const a = tooltip.append('a').text('Open document in new tab');
      a
        .attr('href', `http://localhost:4000/api/pdf/${node.id}`)
        .attr('target', '_blank');

      const tt = ReactDOM.findDOMNode(this.props.tooltipRef.div);
      const boxTT = tt.getBoundingClientRect();
      if (boxTT.bottom > window.innerHeight) {
        let newTop = boxTT.top - (boxTT.bottom - window.innerHeight) - 10;
        if (newTop < 0) newTop = 0;
        tooltip.style('top', `${newTop}px`);
      }
      tooltip.transition(hoverTransition).style('opacity', 1);
      clearTimeout(this.timer);
    } else {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        if (!this.props.tooltipRef.hover) {
          tooltip
            .transition(hoverTransition)
            .style('opacity', 0)
            .on('end', () => {
              tooltip.style('display', 'none');
              removeChildren(tooltip);
              clearTimeout(this.timer);
            });
        }
      }, this.timeoutTime);
    }
  };

  handleChange = (e, { value }) => {
    this.props.sortDocumentsBy(value);
    this.setState({ value });
  };

  fetchOptions = () => {
    this.setState({ isFetching: true });

    setTimeout(() => {
      this.setState({ isFetching: false, options: getOptions() });
      this.selectRandom();
    }, 500);
  };

  handleSearchChange = e => {
    this.setState({ query: e.target.value }, () => {
      this.props.filterDocuments(this.state.query.toLowerCase());
    });
  };

  handleSearchKeyDown = e => {
    const code = keyboardKey.getCode(e);
    if (code === keyboardKey.Enter) {
      e.preventDefault();
      this.props.filterDocuments(this.state.query.toLowerCase());
    }
  };

  renderPopupItems = () => {
    const { documentList } = this.props;
    const item =
      documentList && documentList.filteredNodes
        ? documentList.filteredNodes.map(d => (
            <div
              key={d.id}
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
                ref={element => this.items.set(d.id, element)}
              />
            </div>
          ))
        : null;
    return item;
  };

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
        <Menu.Menu> {this.renderPopupItems()} </Menu.Menu>
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
