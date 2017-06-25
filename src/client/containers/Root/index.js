import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';

import AppLayout from 'containers/AppLayout';
import 'css/styles';

const Root = ({ store }) => (
  <Provider store={store} >
    <AppLayout />
  </Provider>
);

Root.propTypes = {
  store: PropTypes.object.isRequired,
};

export default Root;
