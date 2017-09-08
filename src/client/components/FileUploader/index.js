import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import axios from 'axios';
import _map from 'lodash/map';
import _clone from 'lodash/cloneDeep';
import { connect } from 'react-redux';
import {
  Modal,
  Button,
  Icon,
  Header,
  Table,
  Segment,
  TextArea,
  Form,
  Divider,
} from 'semantic-ui-react';
import './index.css';

class FileUploader extends Component {
  state = {
    selected: null,
    files: [],
    filesInfo: [],
  };

  handleInputChange = (e, fileInfo, index, property, index2 = 0) => {
    const filesInfo = _clone(this.state.filesInfo);
    if (property !== 'authors') {
      filesInfo[index][property] = e.target.value;
    } else {
      filesInfo[index][property][index2].name = e.target.value;
    }
    this.setState({
      ...this.state,
      filesInfo,
    });
  };

  handleUploadButton = () => {
    const files = this.inputUpload.files;
    if (!files.length > 0) {
      return;
    }

    for (let i = 0; i < files.length; i += 1) {
      const data = new FormData();
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: progressEvent => {
          // eslint-disable-next-line no-unused-vars
          const percentCompleted = Math.round(
            progressEvent.loaded * 100 / progressEvent.total,
          );
        },
      };

      data.append('pdf', files[i]);
      data.append('title', JSON.stringify(this.state.filesInfo[i].title));
      data.append('abstract', JSON.stringify(this.state.filesInfo[i].abstract));
      data.append('authors', JSON.stringify(this.state.filesInfo[i].authors));

      axios
        .post('http://localhost:4000/api/pdf/upload', data, config)
        .then(res => {
          const output = {};
          output.className = 'container';
          output.innerHTML = res.data;
        })
        .catch(err => {
          const output = {};
          output.className = 'container text-danger';
          output.innerHTML = err.message;
        });
    }
    this.inputUpload.value = '';
    this.props.handleClose();
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
    const authorList = authors => {
      if (!authors.length > 1) {
        return 'No author info.';
      }
      let str = authors[0].name;
      for (let i = 1; i < authors.length; i += 1) {
        str = `${str}; ${authors[i].name}`;
      }
      return str;
    };
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
            <Segment>
              <span className="ui header">Abstract: </span>
              <br />
              <span>abstract</span>
              <br />
              <br />
              <span className="ui header">Document Summary: </span>
              <br />
              <span>{this.state.selected.summary}</span>
              <br />
              <br />
              <span className="ui header highlight">Author List:</span>
              <span>{authorList(this.state.selected.authors)}</span>
              <br />
              <br />
              <span className="ui header highlight">Publication Year:</span>
              <span>{this.state.selected.date.substring(0, 4)}</span>
            </Segment>
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

  renderFileUploadList = () => {
    const list = [];
    for (let i = 0; i < this.state.files.length; i += 1) {
      list.push(
        <Segment key={`${i}${this.state.files[i].name}`}>
          <span>
            <strong>File: </strong>
            {this.state.files[i].name}
          </span>
          <br />
          <strong>Confirm document details:</strong>
          <Divider horizontal />
          <Form>
            <Form.Field>
              <label>Title</label>
              <input
                placeholder="Document title"
                value={this.state.filesInfo[i].title}
                onChange={e =>
                  this.handleInputChange(
                    e,
                    this.state.filesInfo[i],
                    i,
                    'title',
                  )}
              />
            </Form.Field>
            {this.renderAuthorConfirmList(
              this.state.filesInfo[i].authors,
              this.state.filesInfo[i],
              i,
            )}
            <Form.Field>
              <label>Abstract:</label>
              <TextArea
                placeholder=""
                value={this.state.filesInfo[i].abstract}
                onChange={e =>
                  this.handleInputChange(
                    e,
                    this.state.filesInfo[i],
                    i,
                    'abstract',
                  )}
              />
            </Form.Field>
          </Form>
        </Segment>,
      );
    }
    return list;
  };

  renderAuthorConfirmList = (authors, fileInfo, index) => {
    if (!authors) return null;

    const list = [];
    for (let i = 0; i < authors.length; i += 1) {
      list.push(
        <Form.Group key={`${index}formauthors${i}`}>
          <Form.Field>
            {i === 0 && <label>Author list</label>}
            <input
              key={`${index}inputauthor${i}`}
              placeholder="Author Name"
              value={authors[i].name}
              onChange={e =>
                this.handleInputChange(
                  e,
                  this.state.filesInfo[index],
                  index,
                  'authors',
                  i,
                )}
            />
          </Form.Field>
          {i === authors.length - 1 && (
            <Form.Field>
              {i === 0 && <label style={{ opacity: 0 }}>Add</label>}
              <Button
                primary
                onClick={e => {
                  e.preventDefault();
                  const filesInfo = _clone(this.state.filesInfo);
                  filesInfo[index].authors.push({ name: '' });
                  this.setState({
                    ...this.state,
                    filesInfo,
                  });
                }}
              >
                Add new author
              </Button>
            </Form.Field>
          )}
        </Form.Group>,
      );
    }
    return list;
  };

  render = () => {
    const { visible, handleClose } = this.props;
    return (
      <Modal open={visible} onClose={handleClose} size="fullscreen">
        <Header as="h4" icon="upload" content="Add new documents" />
        <Modal.Content>
          <input
            type="file"
            name="file"
            id="file"
            multiple
            data-multiple-caption={'{count} files selected'}
            className={classnames('inputfile', 'inputfile-1')}
            ref={element => {
              this.inputUpload = element;
            }}
            onChange={e => {
              let filename = '';
              if (this.inputUpload.files && this.inputUpload.files.length > 1) {
                filename = (this.inputUpload.getAttribute(
                  'data-multiple-caption',
                ) || '')
                  .replace('{count}', this.inputUpload.files.length);
              } else {
                filename = e.target.value.split('\\').pop();
              }
              const filesInfo = [];
              if (this.inputUpload.files) {
                for (let i = 0; i < this.inputUpload.files.length; i += 1) {
                  filesInfo.push({
                    title: '',
                    authors: [{ name: '' }],
                    abstract: '',
                    date: '',
                  });
                }
              }
              this.setState({
                ...this.state,
                files: this.inputUpload.files,
                filesInfo,
              });
              const labelVal = this.labelUpload.innerHTML;
              if (filename) {
                this.labelUpload.querySelector('span').innerHTML = filename;
              } else {
                this.labelUpload.innerHTML = labelVal;
              }
            }}
          />
          <label
            htmlFor="file"
            className={classnames('inputfile-1', 'ui', 'button')}
            ref={element => {
              this.labelUpload = element;
            }}
          >
            <Icon name="upload" />
            <span>Choose a file&hellip;</span>
          </label>
          <Button onClick={() => this.handleUploadButton()}>
            <span>Upload All</span>
          </Button>
          <br />
          {this.renderFileUploadList()}
          <Header>Document List:</Header>
          <Segment> {this.renderDocumentTable()} </Segment>
        </Modal.Content>
      </Modal>
    );
  };
}

FileUploader.propTypes = {
  visible: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  db: PropTypes.shape({
    documents: PropTypes.shape({
      nodes: PropTypes.arrayOf(
        PropTypes.shape({
          authors: PropTypes.arrayOf(
            PropTypes.shape({
              name: PropTypes.string.isRequired,
            }).isRequired,
          ).isRequired,
          summary: PropTypes.string.isRequired,
          id: PropTypes.string.isRequired,
          date: PropTypes.string.isRequired,
        }).isRequired,
      ).isRequired,
    }).isRequired,
  }).isRequired,
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
