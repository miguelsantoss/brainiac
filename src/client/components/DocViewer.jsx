import React from 'react';
import spdf from 'simple-react-pdf';

import Box from 'grommet/components/Box';

import '../css/DocViewer.scss';

class DocViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { };
  }

  render() {
    return (
      <Box
        size={'large'}
      >
        <spdf.SimplePDF {...this.props} />
      </Box>
    );
  }
}

export default DocViewer;
