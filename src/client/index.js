import React from 'react';
import ReactDOM from 'react-dom';
import thunk from 'redux-thunk'
import rootReducer from 'reducers';
import { createStore, applyMiddleware, compose } from 'redux';

import Root from 'containers/Root';
import 'semantic-ui-css/semantic.min.css';

const configureStore = (initialState) => {
  const thunkApplied = applyMiddleware(thunk);
  let middlewares = null;

  if (process.env.NODE_ENV === 'development') {
    middlewares = composeWithDevTools(thunkApplied);
  } else {
    middlewares = compose(thunkApplied);
  }

  return createStore(rootReducer, initialState, middlewares);
};

const preloadedState = window.__PRELOADED_STATE__ || {};
delete window.__PRELOADED_STATE__;
const store = configureStore(preloadedState);

const mountNode = document.getElementById('root');
const render = NewApp => ReactDOM.render(<NewApp store={store} />, mountNode);

render(Root);
