import React from 'react';

import Split from 'grommet/components/Split';
import Sidebar from 'grommet/components/Sidebar';
import Search from 'grommet/components/Search';

import Layout from './Layout.jsx';
import Network from './Network.jsx';
import Timeline from './Timeline.jsx';

const vizArray = [
  {
    id: 'network',
    d3: <Network />,
    lg: { x: 0, y: 0, w: 12, h: 8 }
  },
  {
    id: 'timeline',
    d3: <Timeline />,
    lg: { x: 0, y: 1, w: 12, h: 8 }
  }
];

class View extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viz: vizArray
    };
  }

  render() {
    return (
      <Split
        fixed={true}
        flex={'right'}
      >
        <Sidebar
          fixed={true}
          size={'small'}
          full={true}
        >
          <Search
            placeHolder={'Search'}
            inline={true}
            value={''}
          />
        </Sidebar>
        <Layout vizArray={this.state.viz} />
      </Split>
    );
  }
}

export default View;
