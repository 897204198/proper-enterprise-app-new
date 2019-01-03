import { remove, saveOrUpdate, getFileInfo, fetch } from '../services/systemPagePushS';

export default {
  namespace: 'systemPagePush',
  state: { pageList: []},
  effects: {
    *getFileInfo({payload, callback}, {call}) {
      const resp = yield call(getFileInfo, payload);
      if (callback) callback(resp)
    },
    *saveOrUpdate({payload, callback}, {call}) {
      const resp = yield call(saveOrUpdate, payload);
      if (callback) callback(resp)
    },
    *remove({payload, callback}, {call}) {
      const resp = yield call(remove, payload);
      if (callback) callback(resp)
    },
    *fetch({ payload, callback }, { call, put }) {
      const resp = yield call(fetch, payload);
      if (callback) callback(resp)
      yield put({
        type: 'saveList',
        payload: resp.result.data
      })
    },
  },
  reducers: {
    saveList(state, action) {
      return {
        ...state,
        pageList: action.payload
      }
    },
  }
}