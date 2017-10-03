import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import 'semantic-ui-css/semantic.min.css';

import rootReducer from './reducers';
import Root from './containers/Root';
import './polyfill';
// import registerServiceWorker from './registerServiceWorker';

const configureStore = initialState => {
  const thunkApplied = applyMiddleware(thunk);
  const loggerRedux = applyMiddleware(logger);
  let middlewares = null;

  if (process.env.NODE_ENV === 'production') {
    middlewares = compose(thunkApplied);
  } else {
    middlewares = composeWithDevTools(thunkApplied, loggerRedux);
  }

  return createStore(rootReducer, initialState, middlewares);
};

const preloadedState = window.__PRELOADED_STATE__ || {}; // eslint-disable-line no-undef, no-underscore-dangle
delete window.__PRELOADED_STATE__; // eslint-disable-line no-undef, no-underscore-dangle
const store = configureStore(preloadedState);

const mountNode = document.getElementById('root'); // eslint-disable-line no-undef
// eslint-disable-next-line react/no-render-return-value
const render = NewApp => ReactDOM.render(<NewApp store={store} />, mountNode);

render(Root);
// registerServiceWorker();
