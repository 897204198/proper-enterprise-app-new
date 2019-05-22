import * as service from './service';

export default {
  namespace: 'OopDict$model',
  state: {
    listData: []
  },
  effects: {
    *findDictData({ payload = {}, callback}, {call, put}) {
      const {catalog} = payload;
      const response = yield call(service.fetchDictionary, {catalog});
      yield put({
        type: 'saveDictData',
        payload: response.result.data
      })
      if (callback) callback(response.result.data);
    },
  },
  reducers: {
    saveDictData(state, action) {
      return {
        ...state,
        listData: action.payload
      }
    },
  }
};
