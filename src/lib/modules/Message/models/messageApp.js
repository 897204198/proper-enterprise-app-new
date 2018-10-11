import {
  getAppInfo,
  getPushInfo,
  getMailInfo,
  getSmsInfo,
  editAppConfById,
  editMailConfById,
  editSmsConfById,
  delAppConfById,
  delMailConfById,
  delSmsConfById,
  getTokenCode,
  setTokenCode,
  getServeTOken,
} from '../services/messageAppS'

export default {
  namespace: 'messageApp',
  state: {
    appInfo: {},
    pushInfo: {},
    mailInfo: {},
    smsInfo: {},
    sUrl: '',
    clientToken: '',
    isSuccess: ''
  },
  effects: {
    *getToken({ payload = {}, callback}, { call, put}) {
      const resp = yield call(getTokenCode, payload)
      if (resp.status !== 'err') {
        const respt = yield call(getServeTOken)
        yield put({
          type: 'saveToken',
          payload: {
            token: resp.result,
            url: respt.result
          }
        })
        if (callback) callback(resp.result, respt.result)
      }
    },
    *setToken({payload = {}, callback}, {call, put}) {
      const resp = yield call(setTokenCode, payload)
      yield put({
        type: 'saveToken',
        payload: resp.result
      })
      if (callback) callback(resp)
    },
    *getAppInfo({ payload = {} }, { call, put }) {
      const resp = yield call(getAppInfo, payload);
      const push = yield call(getPushInfo, payload);
      const mail = yield call(getMailInfo, payload);
      const sms = yield call(getSmsInfo, payload);
      yield put({
        type: 'saveAppInfo',
        payload: {
          appInfo: resp.result,
          pushInfo: push.result,
          mailInfo: mail.result,
          smsInfo: sms.result
        }
      })
    },
    // *editAppConf({payload, callback}, {call}) {
    //   const resp = yield call(editAppConfById, payload);
    //   if (callback) callback(resp)
    // },
    *fetchAppConf({payload = {}, callback}, {call}) {
      const resp = yield call(editAppConfById, payload);
      if (callback) callback(resp)
    },
    *fetchMailConf({payload = {}, callback}, {call}) {
      const resp = yield call(editMailConfById, payload);
      if (callback) callback(resp)
    },
    *fetchSmsConf({payload = {}, callback}, {call}) {
      const resp = yield call(editSmsConfById, payload);
      if (callback) callback(resp)
    },
    *delAppConf({payload = {}, callback}, {call}) {
      const resp = yield call(delAppConfById, payload);
      if (callback) callback(resp)
    },
    *delMailConf({payload = {}, callback}, {call}) {
      const resp = yield call(delMailConfById, payload);
      if (callback) callback(resp)
    },
    *delSmsConf({payload = {}, callback}, {call}) {
      const resp = yield call(delSmsConfById, payload);
      if (callback) callback(resp)
    },
  },
  reducers: {
    saveAppInfo(state, { payload: {appInfo, pushInfo, mailInfo, smsInfo} }) {
      return {
        ...state,
        appInfo,
        pushInfo,
        mailInfo,
        smsInfo
      }
    },
    saveToken(state, {payload}) {
      return {
        ...state,
        isSuccess: payload.token,
        sUrl: payload.url
      }
    }
  }
}