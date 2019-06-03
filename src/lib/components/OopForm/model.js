import * as service from './service';

export default {
  namespace: 'OopForm$model',
  state: {},
  effects: {
    *findDictData({ payload = {}, callback}, {call, put}) {
      const {catalog} = payload;
      const response = yield call(service.fetchDictionary, {catalog});
      yield put({
        type: 'saveDictData',
        payload: {response, catalog}
      })
      if (callback) callback({response, catalog});
    },
    *findUrlData({payload = {}, callback}, {call, put}) {
      const response = yield call(service.findUrlData, payload);
      yield put({
        type: 'saveUrlData',
        payload: {response, dataUrl: payload}
      })
      if (callback) callback({response, dataUrl: payload});
    }
  },
  reducers: {
    saveDictData(state, action) {
      return {
        ...state,
        [action.payload.catalog]: action.payload.response.result.data.map(it=>({
          label: it.name,
          value: JSON.stringify({catalog: it.catalog, code: it.code}),
          disabled: !it.enable
        }))
      }
    },
    saveUrlData(state, action) {
      const {dataUrl, response: {result = []}} = action.payload;
      const {value, labelPropName, valuePropName, disabledPropName} = dataUrl;
      let list = [];
      if (result.length) {
        list = result;
      } else {
        list = (result.data && result.data.length) ? result.data : [];
      }
      return {
        ...state,
        [value]: list.map(it=>({
          ...it,
          label: it[labelPropName],
          value: it[valuePropName],
          // TODO 约定 如果你用自定义的字段代表disabled 那么必须取反
          disabled: it[disabledPropName] === undefined ? false : !it[disabledPropName],
        }))
      }
    },
    clearData() {
      return {}
    }
  }
};
