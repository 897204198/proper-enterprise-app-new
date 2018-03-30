import { queryTreeData, queryParentTreeData, saveOrUpdateFunc, deleteFunc, queryFuncById,
  queryResourceList, saveResource, updateResource, deleteResource } from '../services/authFuncS';
import { controlMenu } from '../../../utils/utils';

const formatTreeNode = (data)=>{
  data.forEach((d)=>{
    const item = d
    if (item) {
      item.title = item.name
      item.key = item.id
      item.isLeaf = false
      item.value = item.id
      delete item.root
      if (item.children && item.children.length) {
        formatTreeNode(item.children)
      }
    }
  })
}

export default {
  namespace: 'authFunc',
  state: {
    treeData: [],
    funcBasicInfo: {},
    parentTreeData: [],
    resourceList: []
  },
  effects: {
    *fetchTreeData({ payload = {}, callback}, { call, put }) {
      const resp = yield call(queryTreeData, payload);
      const treeData = controlMenu(resp);
      formatTreeNode(treeData)
      yield put({
        type: 'saveTreeData',
        payload: treeData
      })
      if (callback) callback(resp)
    },
    *fetchParentTreeData({ payload = {}, callback}, { call, put }) {
      const resp = yield call(queryParentTreeData, payload);
      const treeData = controlMenu(resp);
      formatTreeNode(treeData)
      yield put({
        type: 'saveParentTreeData',
        payload: treeData
      })
      if (callback) callback(treeData)
    },
    *saveOrUpdateFunc({payload, callback}, {call, put}) {
      const resp = yield call(saveOrUpdateFunc, payload);
      yield put({
        type: 'saveFuncBasicInfo',
        payload: resp || {}
      })
      if (callback) callback(resp)
    },
    *deleteFunc({payload, callback}, {call}) {
      yield call(deleteFunc, payload);
      if (callback) callback()
    },
    *fetchById({ payload, callback }, { call, put }) {
      const resp = yield call(queryFuncById, payload);
      yield put({
        type: 'saveFuncBasicInfo',
        payload: resp
      })
      if (callback) callback()
    },
    *fetchResourceList({payload, callback}, {call, put}) {
      const resp = yield call(queryResourceList, payload);
      yield put({
        type: 'saveResourceList',
        payload: resp
      })
      if (callback) callback(resp)
    },
    *saveResource({payload, callback}, {call}) {
      const resp = yield call(saveResource, payload);
      if (callback) callback(resp)
    },
    *updateResource({payload, callback}, {call}) {
      const resp = yield call(updateResource, payload);
      if (callback) callback(resp)
    },
    *deleteResource({payload, callback}, {call}) {
      const resp = yield call(deleteResource, payload);
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
    saveParentTreeData(state, action) {
      return {
        ...state,
        parentTreeData: action.payload
      }
    },
    saveFuncBasicInfo(state, action) {
      const item = action.payload;
      return {
        ...state,
        funcBasicInfo: {
          ...item,
          menuCode: item.menuType.code
        }
      }
    },
    saveResourceList(state, action) {
      return {
        ...state,
        resourceList: action.payload
      }
    },
    clear(state) {
      return {
        ...state,
        funcBasicInfo: {},
        parentTreeData: [],
        resourceList: []
      }
    }
  }
};