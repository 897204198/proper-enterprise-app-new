import { formatDate } from '../../../../framework/utils/utils';
import * as managerService from '../services/workflowManagerS';

function pave(dataObject, prefix) {
  let paveObject = {};
  for (const key in dataObject) {
    if (key === 'pepProcInstVO' && dataObject[key] && dataObject[key].constructor === Object) {
      paveObject = {
        ...paveObject,
        ...pave(dataObject[key], prefix ? prefix + key : key)
      }
    } else {
      paveObject[prefix ? prefix + key : key] = dataObject[key];
    }
  }
  return paveObject;
}

export default {
  namespace: 'workflowManager',
  state: {
    task: {},
    pagination: {
      pageNo: 2,
      pageSize: 10,
      showSizeChanger: true,
      showQuickJumper: true,
      count: 0
    },
    businessObj: {},
    process: {}
  },
  effects: {
    *findTask({ payload, callback }, { call, put }) {
      const response = yield call(managerService.findTask, payload);
      const data = response.result.data.map(item => pave(item));
      yield put({
        type: 'saveTask',
        payload: {data, total: response.result.count},
      });
      if (callback) callback();
    },
    *findDesign({ payload, callback }, { call, put }) {
      const response = yield call(managerService.findDesign, payload);
      yield put({
        type: 'saveDesign',
        payload: response.result,
      });
      if (callback) callback();
    },
    *findProcess({ payload, callback }, { call, put }) {
      const response = yield call(managerService.findProcess, payload);
      yield put({
        type: 'saveProcess',
        payload: response.result,
      });
      if (callback) callback();
    },
    *findBusinessObjByTaskId({ payload, callback }, { call }) {
      const response = yield call(managerService.findBusinessObjByTaskId, payload);
      if (callback) callback(response.result);
    },
    *findBusinessObjByProcInstId({ payload, callback }, { call }) {
      const response = yield call(managerService.findBusinessObjByProcInstId, payload);
      if (callback) callback(response.result);
    },
  },

  reducers: {
    saveTask(state, {payload}) {
      return {
        ...state,
        task: payload,
      };
    },
    saveDesign(state, action) {
      const lists = action.payload;
      for (let i = 0; i < lists.data.length; i++) {
        const url = `/workflow/service/app/rest/models/${lists.data[i].id}/thumbnail?version=${Date.now()}`;
        lists.data[i].sourceExtraUrl = `${location.protocol}//${location.host}${url}`;
        lists.data[i].isChecked = false;
        lists.data[i].lastUpdated = formatDate(lists.data[i].lastUpdated);
      }
      return {
        ...state,
        design: lists
      };
    },
    saveProcess(state, {payload}) {
      return {
        ...state,
        process: payload,
      };
    },
  }
};
