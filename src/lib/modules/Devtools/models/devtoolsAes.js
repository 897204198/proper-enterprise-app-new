import { decrypt, encrypt } from '../services/devtoolsAesS';

export default {
  namespace: 'devtoolsAes',
  state: {
    decryptCode: '',
    encryptCode: ''
  },
  effects: {
    // AES 解密
    *decrypt({ payload, callback }, { call, put }) {
      const response = yield call(decrypt, payload);
      yield put({
        type: 'saveDecrypt',
        payload: response,
      });
      if (callback) callback(response);
    },
    // AES 加密
    *encrypt({ payload, callback }, { call, put }) {
      const response = yield call(encrypt, payload);
      yield put({
        type: 'saveEncrypt',
        payload: response,
      });
      if (callback) callback(response);
    }
  },
  reducers: {
    saveDecrypt(state, action) {
      return {
        ...state,
        decryptCode: action.payload
      };
    },
    saveEncrypt(state, action) {
      return {
        ...state,
        encryptCode: action.payload
      };
    }
  }
}
