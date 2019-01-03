import { fetchByFormCode, launchWorkflow, submitWorkflow, fetchProcessProgress} from '../services/baseWorkflowS';

export default {
  namespace: 'baseWorkflow',
  state: {
    formEntity: {},
    processProgress: []
  },
  effects: {
    *fetchByFormCode({ callback, payload }, { call, put }) {
      const response = yield call(fetchByFormCode, payload);
      yield put({
        type: 'saveFormEntity',
        payload: response,
      });
      if (callback) callback(response);
    },
    *launchWorkflow({ callback, payload }, { call }) {
      const response = yield call(launchWorkflow, payload);
      if (callback) callback(response);
    },
    *submitWorkflow({ callback, payload }, { call }) {
      const response = yield call(submitWorkflow, payload);
      if (callback) callback(response);
    },
    *fetchProcessProgress({ payload }, { call, put }) {
      const response = yield call(fetchProcessProgress, payload);
      yield put({
        type: 'saveProcessProgress',
        payload: response,
      });
    },
  },
  reducers: {
    saveFormEntity(state, action) {
      return {
        ...state,
        formEntity: action.payload.result[0],
      };
    },
    clear() {
      return {
        formEntity: {},
        processProgress: []
      };
    },
    saveProcessProgress(state, action) {
      return {
        ...state,
        processProgress: action.payload.result,
      };
    }
  }
};
