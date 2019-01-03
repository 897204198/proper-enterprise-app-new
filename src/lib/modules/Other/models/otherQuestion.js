import {
  getTreeData,
  treeListAdd,
  treeListEdit,
  treeListDelete,
  getTableData,
  remove,
  removeAll,
  saveTable,
  updateTable,
  getEdit,
} from '../services/otherQuestionS';

export default {
  namespace: 'otherQuestion',
  state: {
    treeData: [],
    tableData: [],
    editem: {}
  },
  effects: {
    *treeData({ callback }, { call, put }) {
      const resp = yield call(getTreeData);
      yield put({
        type: 'treeList',
        payload: resp.result
      })
      if (callback) callback(resp)
    },
    *getEdit({ payload = {}, callback }, { call, put }) {
      const resp = yield call(getEdit, payload);
      yield put({
        type: 'saveEditem',
        payload: resp.result
      })
      if (callback) callback(resp.result)
    },
    *tableData({ payload = {}, callback}, {call, put}) {
      const resp = yield call(getTableData, payload);
      yield put({
        type: 'tableList',
        payload: resp.result
      })
      if (callback) callback(resp)
    },
    *remove({payload, callback}, {call}) {
      const resp = yield call(remove, payload);
      if (callback) callback(resp)
    },
    *putTable({payload, callback}, {call}) {
      const resp = yield call(updateTable, payload);
      if (callback) callback(resp)
    },
    *postTable({payload, callback}, {call}) {
      const resp = yield call(saveTable, payload);
      if (callback) callback(resp)
    },
    *removeAll({payload, callback}, {call}) {
      const resp = yield call(removeAll, payload.ids);
      if (callback) callback(resp)
    },
    *treeListAdd({payload, callback}, {call}) {
      const resp = yield call(treeListAdd, payload);
      if (callback) callback(resp)
    },
    *treeListEdit({payload, callback}, {call}) {
      const resp = yield call(treeListEdit, payload);
      if (callback) callback(resp)
    },
    *treeListDelete({payload, callback}, {call}) {
      const resp = yield call(treeListDelete, payload);
      if (callback) callback(resp)
    }
  },
  reducers: {
    tableList(state, action) {
      return {
        ...state,
        tableData: action.payload
      }
    },
    treeList(state, action) {
      return {
        ...state,
        treeData: action.payload
      }
    },
    saveEditem(state, action) {
      return {
        ...state,
        editem: action.payload
      }
    },
  }
};
