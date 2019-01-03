import { queryWorkflowList, removeWorkflowList, createWorkflow, repositoryWorkflow, queryByProcDefKey } from '../services/workflowDesignerS';
import { formatDate, getApplicationContextUrl } from '../../../../framework/utils/utils';

const token = window.localStorage.getItem('proper-auth-login-token');

export default {
  namespace: 'workflowDesigner',

  state: {
    data: {},
    newId: null,
    changeList: [],
    deployData: {},
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
    *checkAll({ payload, callback }, { put }) {
      yield put({
        type: 'getCheckList',
        payload
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
  }
};
