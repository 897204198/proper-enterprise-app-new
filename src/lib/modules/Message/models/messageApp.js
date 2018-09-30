import { getAppInfo } from '../services/messageAppS'

export default {
  namespace: 'messageApp',
  state: {
    appInfo: {},
    isSucess: ''
  },
  effects: {
    *fetch({ payload = {} }, { call, put }) {
      const resp = yield call(getAppInfo, payload);
      yield put({
        type: 'saveAppInfo',
        payload: resp.result
      })
    }
  },
  reducers: {
    saveAppInfo(state, action) {
      return {
        ...state,
        appInfo: action.payload
      }
    }
  }
}