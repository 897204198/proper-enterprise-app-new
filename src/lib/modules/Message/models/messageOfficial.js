import { getOfficial, putOfficial, delOfficial, postOfficial, getFilterList } from '../services/messageOfficialS';

export default {
  namespace: 'messageOfficial',
  state: {
    editItem: {},
    filterList: []
  },
  effects: {
    *getInfo({ payload = {}, callback }, { call, put }) {
      const resp = yield call(getOfficial, payload);
      yield put({
        type: 'saveitem',
        payload: {
          editItem: resp.result
        }
      })
      if (callback) callback(resp.result);
    },
    *postInfo({ payload = {}, callback}, { call}) {
      const resp = yield call(postOfficial, payload);
      if (callback) callback(resp);
    },
    *putInfo({ payload = {}, callback}, { call}) {
      const resp = yield call(putOfficial, payload);
      if (callback) callback(resp);
    },
    *delInfo({ payload = {}, callback}, { call}) {
      const resp = yield call(delOfficial, payload);
      if (callback) callback(resp);
    },
    *filterList({ payload = {}}, {call, put}) {
      const resp = yield call(getFilterList, payload)
      yield put({
        type: 'saveFilterList',
        payload: resp.result
      })
    }
  },
  reducers: {
    saveitem(state, {payload}) {
      return {
        ...state,
        editItem: payload.editItem
      };
    },
    clear(state) {
      return {
        ...state,
        editItem: {}
      }
    },
    saveFilterList(state, {payload}) {
      return {
        ...state,
        filterList: payload
      }
    }
  }
};