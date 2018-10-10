import { getOfficial, putOfficial } from '../services/messageOfficialS';

export default {
  namespace: 'messageOfficial',
  state: {
    data: {
      list: [],
      pagination: {}
    }
  },
  effects: {
    *fetch({ payload = {} }, { call, put }) {
      const resp = yield call(getOfficial, payload);
      yield put({
        type: 'saveList',
        payload: {list: resp.result.data, extraParams: payload.extraParams}
      })
    },
    *putInfo({ payload = {}, callback}, { call}) {
      const resp = yield call(putOfficial, payload);
      if (callback) callback(resp);
    }
  },
  reducers: {
    saveList(state, action) {
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