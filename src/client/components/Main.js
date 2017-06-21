import 'grommet/scss/hpe/index.scss';

import React from 'react';
import App from 'grommet/components/App';

import View from './View';

const Main = function () {
  return (
    <App centered={false}>
      <View />
    </App>
  );
};

export default Main;

