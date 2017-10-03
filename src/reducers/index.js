import { combineReducers } from 'redux';
import { layout } from './layout';
import { documentDb } from './documents';

const rootReducer = combineReducers({
  layout,
  documentDb,
});

export default rootReducer;
