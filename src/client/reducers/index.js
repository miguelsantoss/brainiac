import {combineReducers} from 'redux';
import {layout} from './layout';
import {documents} from './documents';

export const rootReducer = combineReducers({
  layout,
  documents,
})