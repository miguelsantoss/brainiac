import React, { Component } from 'react';
import axios from 'axios';

import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import UploadIcon from 'grommet/components/icons/base/Upload';

class UploadFile extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
		var output = document.getElementById('output');

    const config = {
			headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: function(progressEvent) {
        var percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
      }
		};

    let data = new FormData();
    data.append('pdf', this.file.files[0]);

    axios.post('http://localhost:3000/pdf/upload', data, config).then(function (res) {
      output.className = 'container';
      output.innerHTML = res.data;
    }).catch(function (err) {
      output.className = 'container text-danger';
      output.innerHTML = err.message;
    });
  }

  render() {
    return (
      <div>
        <form role="form" className="form">
          <div className="form-group">
            <label htmlFor="file">File</label>
            <input ref={(e) => {this.file = e; }} id="file" type="file" className="form-control"/>
          </div>
          <button onClick={this.onClick}id="upload" type="button" className="btn btn-primary">
            Upload
          </button>
        </form>
        <div id="output" ref={(e) => { this.output = e; }} className="container"></div>
      </div>
    );
  }
}

export default UploadFile;
