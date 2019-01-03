import { controlMenu } from '@framework/utils/utils';
import * as service from './service';

export default {
  namespace: 'OopOrgEmpPicker$model',
  state: {
    group: [],
    user: []
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
    *findUser({ payload, callback }, { call, put }) {
      const response = yield call(service.findUser, payload);
      yield put({
        type: 'saveUser',
        payload: response.result.data,
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
    },
    saveUser(state, {payload}) {
      return {
        ...state,
        user: payload,
      };
    },
  }
};
