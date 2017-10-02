import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';

import AppLayout from '../AppLayout';
import './styles.scss';

const Root = ({ store }) => (
  <Provider store={store}>
    <AppLayout />
  </Provider>
);

Root.propTypes = {
  store: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default Root;
