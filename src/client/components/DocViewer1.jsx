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
      <div>
        <Box
          size={'large'}
          alignContent={'center'}
          alignSelf={'center'}
        >
          <spdf.SimplePDF {...this.props} />
        </Box>
      </div>
    );
  }
}

export default DocViewer;
