import {
  UI_OPEN_SIDEBAR,
  UI_CLOSE_SIDEBAR,
} from '../../actions/layout';

import { APP_INIT } from '../../actions/common';

export const initialState = {
  sidebarOpened: true,
  id: '',
};

export function layout(state = initialState, action) {
  switch (action.type) {
    case APP_INIT:
      return {
        ...state,
      };
    case UI_OPEN_SIDEBAR:
      return {
        ...state,
        sidebarOpened: true,
      };
    case UI_CLOSE_SIDEBAR:
      return {
        ...state,
        sidebarOpened: false,
      };
    default:
      return state;
  }
}
