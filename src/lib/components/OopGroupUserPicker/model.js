import * as service from './service';

export default {
  namespace: 'OopGroupUserPicker$model',
  state: {
    group: [],
    user: []
  },
  effects: {
    *findGroup({ payload, callback }, { call, put }) {
      const response = yield call(service.findGroup, payload);
      yield put({
        type: 'saveGroup',
        payload: response.result.data,
      });
      if (callback) callback();
    },
    *findUser({ payload, callback }, { call, put }) {
      const response = yield call(service.findUser, payload);
      yield put({
        type: 'saveUser',
        payload: response.result,
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
