import { getDataList, deleteCaches, deleteCache,
  getCacheList, getListContent, deleteCacheListItem } from '../services/devtoolsCacheS';

export default {
  namespace: 'devtoolsCache',
  state: {
    oriCacheList: [],
    oriList: [],
    changeList: [],
  },
  effects: {
    *fetch({ payload, callback }, { call, put }) {
      const response = yield call(getDataList, payload);
      const res = response ? response.result : [];
      const list = []
      for (let i = 0; i < res.length; i++) {
        list.push({name: res[i], id: i, list: []});
      }
      yield put({
        type: 'save',
        payload: list,
      });
      if (callback) callback(list);
    },
    *fetchByCacheNameArray({ payload, callback }, { call }) {
      const response = yield call(getCacheList, payload);
      const res = response ? response.result : [];
      if (callback) callback(res);
    },
    *fetchByCacheName({ payload, callback }, { call, put }) {
      const response = yield call(getCacheList, payload);
      const res = response ? response.result : [];
      const list = []
      for (let i = 0; i < res.length; i++) {
        list.push({name: res[i], id: i});
      }
      yield put({
        type: 'saveList',
        payload: list,
      });
      if (callback) callback(list);
    },
    *fetchByCacheNameListName({ payload, callback }, { call }) {
      const response = yield call(getListContent, payload);
      if (callback) callback(response.result);
    },
    *deleteCaches({ payload, callback }, { call }) {
      const response = yield call(deleteCaches, payload);
      if (callback) callback(response);
    },
    *deleteCache({ payload, callback }, { call }) {
      const response = yield call(deleteCache, payload);
      if (callback) callback(response);
    },
    *deleteCacheListItem({ payload, callback }, { call }) {
      const response = yield call(deleteCacheListItem, payload);
      if (callback) callback(response);
    },
    *checkAll({ payload, callback }, { put }) {
      yield put({
        type: 'getCheckList',
        payload
      });
      if (callback) callback(payload);
    },
    *checkItem({ payload, callback }, { put }) {
      yield put({
        type: 'getCheckList',
        payload
      });
      if (callback) callback(payload);
    },
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        oriCacheList: action.payload
      };
    },
    saveList(state, action) {
      return {
        ...state,
        oriList: action.payload
      };
    },
    getCheckList(state, action) {
      return {
        ...state,
        changeList: action.payload
      };
    },
  }
}
