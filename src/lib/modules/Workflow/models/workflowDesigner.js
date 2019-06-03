import { formatDate, getApplicationContextUrl, formatter, controlMenu } from '@framework/utils/utils';
import { queryWorkflowList, removeWorkflowList, createWorkflow, repositoryWorkflow, queryByProcDefKey, getTreeData, treeListDel, treeListEdit, treeListAdd, changeType } from '../services/workflowDesignerS';

const token = window.localStorage.getItem('proper-auth-login-token');

export default {
  namespace: 'workflowDesigner',

  state: {
    data: {},
    newId: null,
    changeList: [],
    deployData: {},
    treeData: [],
    entity: {}
  },

  effects: {
    *fetch({ payload, callback }, { call, put }) {
      const response = yield call(queryWorkflowList, payload);
      yield put({
        type: 'getList',
        payload: response.result,
      });
      if (callback) callback();
    },
    *fetchList({ payload, callback }, { call }) {
      const response = yield call(queryWorkflowList, payload);
      if (callback) callback(response.result.data);
    },
    *remove({ payload, callback }, { call }) {
      const response = yield call(removeWorkflowList, payload);
      if (callback) callback(response);
    },
    *create({ payload, callback }, { call, put }) {
      const response = yield call(createWorkflow, payload);
      yield put({
        type: 'getCreateId',
        payload: response.result,
      });
      if (callback) callback();
    },
    *checkItem({ payload, callback }, { put }) {
      yield put({
        type: 'getCheckList',
        payload
      });
      if (callback) callback();
    },
    *repository({ payload, callback }, { call, put }) {
      const response = yield call(repositoryWorkflow, payload);
      yield put({
        type: 'getDepoly',
        payload: response.result,
      });
      if (callback) callback(response);
    },
    *fetchByProcDefKey({ payload, callback }, { call, put }) {
      const response = yield call(queryByProcDefKey, payload);
      yield put({
        type: 'saveEntity',
        payload: response.result,
      });
      if (callback) callback(response);
    },
    // 获取分类列表
    *fetchTreeData({ payload, callback }, { call, put }) {
      const response = yield call(getTreeData, payload);
      const treeData = formatter(controlMenu(response.result.data));
      yield put({
        type: 'getTreeData',
        payload: treeData,
      });
      if (callback) callback();
    },
    // 删除分类节点
    *removeTreeById({ payload, callback }, { call }) {
      const response = yield call(treeListDel, payload);
      if (callback) callback(response);
    },
    *editTree({payload, callback}, {call}) {
      const resp = yield call(treeListEdit, payload);
      if (callback) callback(resp)
    },
    *addTree({payload, callback}, {call}) {
      const resp = yield call(treeListAdd, payload);
      if (callback) callback(resp)
    },
    *changeWorkType({payload, callback}, {call}) {
      const resp = yield call(changeType, payload);
      if (callback) callback(resp)
    },
  },

  reducers: {
    getList(state, action) {
      const lists = action.payload;
      for (let i = 0; i < lists.data.length; i++) {
        const url = `${getApplicationContextUrl()}/workflow/service/app/rest/models/${lists.data[i].id}/thumbnail?version=${Date.now()}&access_token=${token}`;
        lists.data[i].sourceExtraUrl = url;
        lists.data[i].isChecked = false;
        lists.data[i].lastUpdated = formatDate(lists.data[i].lastUpdated);
      }
      return {
        ...state,
        data: lists
      };
    },
    getCreateId(state, action) {
      return {
        ...state,
        newId: action.payload.id
      };
    },
    getCheckList(state, action) {
      return {
        ...state,
        changeList: action.payload
      };
    },
    getDepoly(state, action) {
      return {
        ...state,
        deployData: action.payload
      };
    },
    saveEntity(state, action) {
      return {
        ...state,
        entity: action.payload
      };
    },
    getTreeData(state, action) {
      return {
        ...state,
        treeData: action.payload
      };
    },
  }
};
