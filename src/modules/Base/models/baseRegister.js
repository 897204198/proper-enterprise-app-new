import { fakeRegister } from '../services/base';

export default {
  namespace: 'baseRegister',

  state: {
    status: undefined,
  },

  effects: {
    *submit(_, { call, put }) {
      const response = yield call(fakeRegister);
      yield put({
        type: 'registerHandle',
        payload: response,
      });
    },
  },

  reducers: {
    registerHandle(state, { payload }) {
      return {
        ...state,
        status: payload.status,
      };
    },
  },
};
