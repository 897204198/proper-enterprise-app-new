import * as service from './service';

export default {
  namespace: 'OopDict$model',
  state: {

  },
  effects: {
    *findDictData({ payload = {}, callback}, {call, put}) {
      const {catalog} = payload;
      const response = yield call(service.fetchDictionary, {catalog});
      const {result} = response;
      if (result && result.data && result.data.length) {
        const data = result.data.map(it=>({
          ...it,
          label: it.name,
          value: `${JSON.stringify({catalog: it.catalog, code: it.code})}`,
        }));
        yield put({
          type: 'saveDictData',
          payload: {
            catalog,
            data
          }
        })
        if (callback) callback(data);
      }
    },
  },
  reducers: {
    saveDictData(state, action) {
      return {
        ...state,
        [action.payload.catalog]: action.payload.data
      }
    },
  }
};
