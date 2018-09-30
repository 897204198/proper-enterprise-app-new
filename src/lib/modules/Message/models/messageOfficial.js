import { getOfficial } from '../services/messageOfficialS';

export default {
  namespace: 'messageOfficial',
  state: {
    data: {
      list: [],
      pagination: {}
    }
  },
  effect: {
    *fetch({ payload = {} }, { call, put }) {
      const resp = yield call(getOfficial, payload);
      console.log(resp);
      yield put({
        type: 'saveList',
        payload: {list: resp.result.data, extraParams: payload.extraParams}
      })
    }
  },
  reducers: {
    saveList(state, action) {
      console.log(state);
      return {
        ...state,
        data: {
          list: action.payload.list,
          pagination: {
            extraParams: action.payload.extraParams
          }
        }
      };
    }
  }
};