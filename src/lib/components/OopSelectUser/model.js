import { controlMenu } from '@framework/utils/utils';
import * as service from './service';

export default {
  namespace: 'OopSelectUser$model',
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
    *findUser({ payload, callback }, { call, put }) {
      const response = yield call(service.findUser, payload);
      yield put({
        type: 'saveUser',
        payload: response.result.data,
      });
      if (callback) callback();
    },
    *searchUser({ payload, callback }, { call, put }) {
      const res = yield call(service.searchUser, payload);
      yield put({
        type: 'saveSearchUser',
        payload: res.result.data,
      });
      if (callback) callback();
    }
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
    saveSearchUser(state, {payload}) {
      return {
        ...state,
        searchUser: payload,
      };
    },
    delSearchUser(state) {
      return {
        ...state,
        searchUser: [],
      };
    },
    delUser(state) {
      return {
        ...state,
        user: [],
      };
    },
  }
};
