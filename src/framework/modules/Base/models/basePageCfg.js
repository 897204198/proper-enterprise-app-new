import {queryPageConfigByCode} from '../services/basePageCfgS';

export default {
  namespace: 'basePageCfg',
  state: {
  },
  effects: {
    *fetchPageCfgByCode({ payload = {}, callback}, { call, put }) {
      const resp = yield call(queryPageConfigByCode, payload);
      let config;
      if (resp.result.length) {
        const result = resp.result[0];
        const {formConfig = '{}', gridConfig = '{}'} = result;
        config = {
          tableName: result.tableName,
          formConfig: JSON.parse(formConfig),
          gridConfig: JSON.parse(gridConfig),
        }
        yield put({
          type: 'saveEntity',
          payload: config,
          code: payload
        })
      }
      if (callback) callback(config);
    },
  },
  reducers: {
    saveEntity(state, action) {
      const {code} = action;
      return {
        ...state,
        [code]: {
          ...state[code],
          ...action.payload
        }
      }
    },
    clearEntity(state, action) {
      const {code} = action;
      return {
        ...state,
        [code]: {}
      }
    },
  }
};
