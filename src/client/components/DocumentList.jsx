import React from 'react';
import ReactDOM from 'react-dom';

import Box from 'grommet/components/Box';
import List from 'grommet/components/List';
import Label from 'grommet/components/Label';

import { selectAll } from 'd3-selection';

import DocumentEntry from './DocumentEntry.jsx';

import '../css/DocumentList.scss';

class DocumentList extends React.Component {
  static propTypes = {
    nodes: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string,
      author: React.PropTypes.string,
      year: React.PropTypes.string,
      value: React.PropTypes.number,
    })).isRequired,
    openDocumentFile: React.PropTypes.func.isRequired,
  }

  hover(id, state) {
    selectAll(`#${id}`).classed('hover-node', state);
    if (state && DocumentList.isHidden(this.entries[id])) {
      const node = ReactDOM.findDOMNode(this.entries[id]);
      node.scrollIntoView({behavior: "smooth"});
    }
  }

  constructor(props) {
    super(props);
    this.entries = {}
    this.hover = this.hover.bind(this)
  }

  static isHidden(el) {
    const style = window.getComputedStyle(document.getElementById(el.props.id), "");
    return (style.display === 'none')
    return (el.offsetParent === null)
  }

  render() {
    const listStyle = {
      listStyleType: 'none',
      listStyle: 'none',
      display: 'inline-block',
      padding: 0,
      margin: 0,
    }

    const docList = this.props.nodes.map(doc =>
      <DocumentEntry
        key={doc.id}
        id={doc.id}
        title={doc.title}
        handleHover={this.hover}
        handleClick={this.props.openDocumentFile}
        ref={el => this.entries[doc.id] = el}
      />
    );
    return (
      <div>
        <Label>
          List of Files:
        </Label>
        <ul style={listStyle}>
          {docList}
        </ul>
      </div>
    );
  }
}

export default DocumentList;
