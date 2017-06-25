import { combineReducers } from 'redux';
import { layout } from './layout';
import { documents } from './documents';

const rootReducer = combineReducers({
  layout,
  documents,
});

export default rootReducer;
