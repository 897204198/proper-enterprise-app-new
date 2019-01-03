import { fetchById, remove, saveOrUpdate, getTreeData, treeListDelete, treeListEdit, treeListAdd, getTableData } from '../services/systemDictionaryS';

export default {
  namespace: 'systemDictionary',
  state: {
    entity: {},
    treeData: [],
    tableData: [],
    tableInitData: [],
  },
  effects: {
    *fetchById({ payload, callback }, { call, put }) {
      const resp = yield call(fetchById, payload);
      yield put({
        type: 'saveEntity',
        payload: resp
      })
      if (callback) callback(resp)
    },
    *getTreeData({ payload, callback }, { call, put }) {
      const resp = yield call(getTreeData, payload);
      resp.result.forEach((item)=>{
        item.parentId = null;
      })
      yield put({
        type: 'treeList',
        payload: resp
      })
      if (callback) callback(resp)
    },
    *saveOrUpdate({payload, callback}, {call, put}) {
      const resp = yield call(saveOrUpdate, payload);
      yield put({
        type: 'saveEntity',
        payload: resp
      })
      if (callback) callback(resp)
    },
    *remove({payload, callback}, {call}) {
      const resp = yield call(remove, payload);
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
    },
    *getTableData({payload, callback}, {call}) {
      const resp = yield call(getTableData, payload);
      if (callback) callback(resp)
    }
  },
  reducers: {
    saveEntity(state, action) {
      return {
        ...state,
        entity: action.payload.result
      }
    },
    tableInitData(state, action) {
      return {
        ...state,
        tableInitData: action.payload.result
      }
    },
    tableData(state, action) {
      return {
        ...state,
        tableData: action.payload.result
      }
    },
    treeList(state, action) {
      return {
        ...state,
        treeData: action.payload.result
      }
    },
    clearEntity(state) {
      return {
        ...state,
        entity: {}
      }
    },
  }
};
