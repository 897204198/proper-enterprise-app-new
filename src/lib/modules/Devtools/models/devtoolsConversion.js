import { decode, header } from '../services/devtoolsConversionS';

export default {
  namespace: 'devtoolsConversion',
  state: {
    tokenVal: '',
    headerVal: ''
  },
  effects: {
    // 取得转换结果JWT token decode
    *postDecode({ payload, callback }, { call, put }) {
      const response = yield call(decode, payload);
      yield put({
        type: 'saveToken',
        payload: response,
      });
      if (callback) callback(response);
    },
    // JWT header 信息转换成 token
    *postHeader({ payload, callback }, { call, put }) {
      const response = yield call(header, payload);
      yield put({
        type: 'saveHeader',
        payload: response,
      });
      if (callback) callback(response);
    }
  },
  reducers: {
    saveToken(state, action) {
      return {
        ...state,
        tokenVal: action.payload
      };
    },
    saveHeader(state, action) {
      return {
        ...state,
        headerVal: action.payload
      };
    }
  }
}