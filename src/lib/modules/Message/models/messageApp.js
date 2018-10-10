import { getAppInfo, getPushInfo, getMailInfo, getSmsInfo} from '../services/messageAppS'

export default {
  namespace: 'messageApp',
  state: {
    appInfo: {},
    pushInfo: {},
    mailInfo: {},
    smsInfo: {},
    isSucess: ''
  },
  effects: {
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
    }
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
    }
  }
}