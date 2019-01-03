import { getList, getLastedVer, removeItem, queryVerInfo, publishVer, createOrUpdate } from '../services/devtoolsAppverS';

export default {
  namespace: 'devtoolsAppver',
  state: {
    verInfo: {},
    list: []
  },
  effects: {
    *fetch({ payload, callback }, { call, put }) {
      const response = yield call(getList, payload);
      yield put({
        type: 'saveList',
        payload: response.result,
      });
      if (callback) callback(response ? response.result : []);
    },
    // 取得最新使用的版本信息
    *getLastedVer({ payload, callback }, { call }) {
      const response = yield call(getLastedVer, payload);
      if (callback) callback(response ? response.result : '');
    },
    // 删除
    *remove({ payload, callback }, { call }) {
      const response = yield call(removeItem, payload);
      if (callback) callback(response);
    },
    // 发布
    *publish({ payload, callback }, { call }) {
      const response = yield call(publishVer, payload);
      if (callback) callback(response);
    },
    // 取得每条信息
    *fetchByVer({ payload, callback }, { call, put }) {
      const response = yield call(queryVerInfo, payload);
      yield put({
        type: 'saveVerInfo',
        payload: response.result,
      });
      if (callback) callback(response.result);
    },
    // 新建或者更新
    *createOrUpdate({ payload, callback }, { call, put }) {
      const response = yield call(createOrUpdate, payload);
      yield put({
        type: 'saveVerInfo',
        payload: response.result,
      });
      if (callback) callback(response);
    },
  },
  reducers: {
    saveList(state, action) {
      return {
        ...state,
        list: action.payload
      };
    },
    saveVerInfo(state, action) {
      return {
        ...state,
        verInfo: action.payload
      };
    },
    clear(state) {
      return {
        ...state,
        verInfo: {},
      }
    },
  }
}
