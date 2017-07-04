import React from 'react';
import ReactDOM from 'react-dom';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import rootReducer from 'reducers';
import { createStore, applyMiddleware, compose } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import Root from 'containers/Root';
import 'semantic-ui-css/semantic.min.css';

import './polyfill';

const configureStore = (initialState) => {
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

const preloadedState = window.__PRELOADED_STATE__ || {};
delete window.__PRELOADED_STATE__;
const store = configureStore(preloadedState);

const mountNode = document.getElementById('root');
const render = NewApp => ReactDOM.render(<NewApp store={store} />, mountNode);

render(Root);
