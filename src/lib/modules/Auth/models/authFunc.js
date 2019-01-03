import { queryParentTreeData, saveOrUpdateFunc, deleteFunc, queryFuncById,
  queryResourceList, saveResource, updateResource, deleteResource } from '../services/authFuncS';
import { controlMenu } from '../../../../framework/utils/utils';

export function formatTreeNode(data) {
  data.forEach((d)=>{
    const item = d
    if (item) {
      item.title = item.name
      item.key = item.id
      item.isLeaf = false
      item.value = item.id
      item.disabled = false
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
      const resp = yield call(queryParentTreeData, payload);
      const treeData = controlMenu(resp.result);
      formatTreeNode(treeData)
      yield put({
        type: 'saveTreeData',
        payload: treeData
      })
      if (callback) callback(resp.result)
    },
    *fetchParentTreeData({ payload = {}, callback}, { call, put }) {
      const resp = yield call(queryParentTreeData, payload);
      const treeData = controlMenu(resp.result);
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
        payload: resp
      })
      if (callback) callback(resp)
    },
    *deleteFunc({payload, callback}, {call}) {
      const resp = yield call(deleteFunc, payload);
      if (callback) callback(resp)
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
        payload: resp.result
      })
      if (callback) callback(resp.result)
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
      const parentData = [{
        id: '-1',
        key: '-1',
        value: '-1',
        title: '菜单',
        children: action.payload
      }];

      return {
        ...state,
        parentTreeData: parentData
      }
    },
    saveFuncBasicInfo(state, action) {
      const item = action.payload.result;
      const {parentId} = item;
      if (parentId === null) {
        item.parentId = '-1'
      }
      return {
        ...state,
        funcBasicInfo: {
          ...item
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
