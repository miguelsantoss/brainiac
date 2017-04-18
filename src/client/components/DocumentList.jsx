
import React from 'react';

import Box from 'grommet/components/Box';
import List from 'grommet/components/List';
import ListItem from 'grommet/components/ListItem';

import DocumentEntry from './DocumentEntry.jsx';

class DocumentList extends React.Component {
  static propTypes = {
    nodes: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string,
      author: React.PropTypes.string,
      year: React.PropTypes.string,
      value: React.PropTypes.number,
    })).isRequired,
    filteredNodes: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string,
      author: React.PropTypes.string,
      year: React.PropTypes.string,
      value: React.PropTypes.number,
    })).isRequired,
    openDocumentFile: React.PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    // fixme distinguish onclick in different entries
    const docList = this.props.filteredNodes.map((doc) => {
      return (
        <DocumentEntry
          key={doc.id}
          id={doc.id}
          title={doc.title}
          handleClick={this.props.openDocumentFile}
        />
      );
    });
    return (
      <Box>
        <List>
          {docList}
        </List>
      </Box>
    );
  }
}

export default DocumentList;
