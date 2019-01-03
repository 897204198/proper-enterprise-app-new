import { fetchTreeData, saveOrUpdate, deleteApp, treeListEdit, treeListAdd, treeListDelete } from '../services/systemAppConfigS';

export default {
  namespace: 'systemAppConfig',
  state: {
    treeData: []
  },
  effects: {
    *fetchTreeData({ payload = {}, callback}, { call, put }) {
      const resp = yield call(fetchTreeData, payload);
      yield put({
        type: 'saveTreeData',
        payload: resp.result
      })
      if (callback) callback(resp.result)
    },
    *saveOrUpdate({payload, callback}, {call}) {
      const resp = yield call(saveOrUpdate, payload);
      if (callback) callback(resp)
    },
    *deleteApp({payload, callback}, {call}) {
      const resp = yield call(deleteApp, payload);
      if (callback) callback(resp)
    },
    *treeListEdit({payload, callback}, {call}) {
      const resp = yield call(treeListEdit, payload);
      if (callback) callback(resp)
    },
    *treeListAdd({payload, callback}, {call}) {
      const resp = yield call(treeListAdd, payload);
      if (callback) callback(resp)
    },
    *treeListDelete({payload, callback}, {call}) {
      const resp = yield call(treeListDelete, payload);
      if (callback) callback(resp)
    },
  },

  reducers: {
    saveTreeData(state, action) {
      return {
        ...state,
        treeData: action.payload
      }
    },
  }
};
