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
        const {formConfig = '{}', gridConfig = '{}', modalConfig = '{}', relaWf, wfKey} = result;
        config = {
          tableName: result.tableName,
          formConfig: JSON.parse(formConfig),
          gridConfig: JSON.parse(gridConfig),
          modalConfig: JSON.parse(modalConfig),
          relaWf: (relaWf === true && wfKey !== undefined) ? wfKey : undefined
        }
        yield put({
          type: 'saveEntity',
          payload: config,
          code: payload
        })
      }
      if (callback) callback(config);
    },
    *fetchPageCfgByCodeForWf({ payload = {}, callback}, { call }) {
      const resp = yield call(queryPageConfigByCode, payload);
      let config;
      if (resp.result.length) {
        const result = resp.result[0];
        const {formConfig} = result;
        config = formConfig
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
