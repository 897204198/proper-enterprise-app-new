import { controlMenu } from '@framework/utils/utils';
import * as service from './service';

export default {
  namespace: 'OopSelectOrg$model',
  state: {
    group: [],
    user: [],
    searchUser: []
  },
  effects: {
    *findGroup({ payload, callback }, { call, put }) {
      const response = yield call(service.findGroup, payload);
      const menus = (controlMenu(response.result));
      yield put({
        type: 'saveGroup',
        payload: menus,
      });
      if (callback) callback();
    },
  },
  reducers: {
    saveGroup(state, {payload}) {
      return {
        ...state,
        group: payload,
      };
    }
  }
};
