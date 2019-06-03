import { controlMenu } from '@framework/utils/utils';
import { fetchById, remove, saveOrUpdate, getTreeData, treeListDelete, treeListEdit, treeListAdd, getTableData, getTableValue } from '../services/systemDictionaryS';

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
      // resp.result.data.forEach((item)=>{
      //   item.parentId = null;
      // })
      const treeData = controlMenu(resp.result.data);
      yield put({
        type: 'treeList',
        payload: treeData
      })
      if (callback) callback(treeData)
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
      if (callback) callback(resp.data)
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
      if (typeof payload === 'string') {
        const resp = yield call(getTableValue, payload);
        if (callback) callback(resp.result)
      } else {
        const resp = yield call(getTableData, payload);
        if (callback) callback(resp.result.data)
      }
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
        treeData: action.payload
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
