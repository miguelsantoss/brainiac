import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _map from 'lodash/map';
import { connect } from 'react-redux';
import { Modal, Button, Icon, Header, Table, Segment } from 'semantic-ui-react';

class FileUploader extends Component {
  state = {
    selected: null,
  };

  toggleSelect = doc => {
    if (!this.state.selected || this.state.selected.id !== doc.id) {
      this.setState({ ...this.state, selected: doc });
    } else {
      this.setState({ ...this.state, selected: null });
    }
  };

  renderDocumentTable = () => (
    <Table
      // toggle selectable only when scan is not loading
      selectable
      compact
      basic="very"
      size="small"
    >
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Title</Table.HeaderCell>
          <Table.HeaderCell>Authors</Table.HeaderCell>
          <Table.HeaderCell>Pub date</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>{this.renderDocumentEntries()}</Table.Body>
    </Table>
  );

  renderTestTable = () => {};

  renderDocumentEntries = () => {
    const documents = this.props.db.documents.nodes;
    const entries = _map(documents, doc => {
      const active = this.state.selected && doc.id === this.state.selected.id;
      return (
        <Table.Row
          key={doc.id}
          onClick={() => this.toggleSelect(doc)}
          active={active}
        >
          <Table.Cell>{doc.title}</Table.Cell>
          <Table.Cell />
          <Table.Cell>{doc.date.substring(0, 4)}</Table.Cell>
        </Table.Row>
      );
    });
    if (this.state.selected) {
      const infoRow = (
        <Table.Row key={`${this.state.selected.id}selected`}>
          <Table.Cell colSpan="3">
            <Segment>{this.state.selected.summary}</Segment>
          </Table.Cell>
        </Table.Row>
      );
      for (let i = 0; i < entries.length; i += 1) {
        if (entries[i].key === this.state.selected.id) {
          entries.splice(i + 1, 0, infoRow);
          break;
        }
      }
    }
    return entries;
  };

  render = () => {
    const { visible, handleClose } = this.props;
    return (
      <Modal open={visible} onClose={handleClose} size="fullscreen">
        <Header as="h4" icon="upload" content="Add new documents" />
        <Modal.Content>{this.renderDocumentTable()}</Modal.Content>
        <Modal.Actions>
          <Button color="red">
            <Icon name="remove" /> No
          </Button>
          <Button color="green">
            <Icon name="checkmark" /> Yes
          </Button>
        </Modal.Actions>
      </Modal>
    );
  };
}

FileUploader.propTypes = {
  visible: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  sidebarOpened: state.layout.sidebarOpened,
  query: state.documentDb.query,
  db: {
    documents: state.documentDb.db.documents,
    loading: state.documentDb.db.loading,
    errorLoading: state.documentDb.db.errorLoading,
    queryResult: state.documentDb.db.queryResult,
  },
  docFetch: state.documentDb.docFetch,
});

export default connect(mapStateToProps)(FileUploader);
