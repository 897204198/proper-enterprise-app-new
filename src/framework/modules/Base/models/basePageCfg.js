import {queryPageConfigByCode, queryPageConfigByWfKey} from '../services/basePageCfgS';
import BasePageService from '../services/basePageS';

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
        const {formConfig = '{}', gridConfig = '{}', modalConfig = '{}', relaWf, wfKey, enable} = result;
        config = {
          tableName: result.tableName,
          formConfig: JSON.parse(formConfig),
          gridConfig: JSON.parse(gridConfig),
          modalConfig: JSON.parse(modalConfig),
          relaWf: (relaWf === true && wfKey !== undefined) ? wfKey : undefined,
          enable
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
    // 归档 ws 的回调
    *filed({ payload = {}, callback}, { call }) {
      const {procInstId, processDefinitionId} = payload;
      if (procInstId && processDefinitionId) {
        const wfKey = processDefinitionId.split(':')[0];
        const cfgResp = yield call(queryPageConfigByWfKey, {wfKey, relaWf: true});
        if (cfgResp.result.length) {
          const result = cfgResp.result[0];
          const {tableName} = result;
          const service = new BasePageService(tableName);
          const pupaResp = yield service.fetchByEqual({procInstId});
          if (pupaResp.result.length) {
            const pupaEntity = pupaResp.result[0];
            pupaEntity.Pupa__filed = 1;
            const saveResp = yield service.saveOrUpdate(pupaEntity);
            callback && callback(saveResp);
          }
        }
      }
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
