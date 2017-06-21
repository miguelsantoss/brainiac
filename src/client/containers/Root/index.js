import React from 'react';
import AppLayout from 'containers/AppLayout';
import {Provider} from 'react-redux';

const Root = (props) => (
  <Provider {...props}>
    <AppLayout />
  </Provider>
);

export default Root;