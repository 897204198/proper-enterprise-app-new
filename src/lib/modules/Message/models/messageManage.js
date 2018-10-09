import {
  toggleApp,
  changeToken,
  getAppKey,
  addApp,
  queryAppById,
  editAppById,
  deleteAppById,
  queryAppConfById,
  deleteAppConfById,
  editAppConfById,
  pushAppConfById,
  pushMailConfById,
  editMailConfById,
  queryMailConfById,
  deleteMailConfById,
  pushSMSConfById,
  editSMSConfById,
  querySMSConfById,
  deleteSMSConfById,
} from '../services/messageManageS';

export default {
  namespace: 'messageManage',
  state: {
    data: {
      list: [],
      pagination: {},
    },
    appBasicInfo: {},
    userRoles: [],
    userRolesAll: [],
    userGroups: [],
    userGroupsAll: [],
    size: 'default'
  },
  effects: {
    *addApp({payload, callback}, {call}) {
      const resp = yield call(addApp, payload);
      if (callback) callback(resp)
    },
    *editAppById({payload, callback}, {call}) {
      const resp = yield call(editAppById, payload);
      if (callback) callback(resp)
    },
    *deleteAppById({payload, callback}, {call}) {
      const resp = yield call(deleteAppById, payload);
      if (callback) callback(resp)
    },
    *fetchApp({ payload, callback }, { call, put }) {
      const resp = yield call(queryAppById, payload);
      yield put({
        type: 'saveappBasicInfo',
        payload: resp.result
      })
      if (callback) callback()
    },
    *toggleApp({payload, callback}, {call}) {
      const resp = yield call(toggleApp, payload);
      if (callback) callback(resp)
    },
    *getAppKey({ payload = {}, callback}, {call}) {
      const resp = yield call(getAppKey, payload);
      if (callback) callback(resp.result)
    },
    *changeToken({ payload = {}, callback}, {call}) {
      const resp = yield call(changeToken, payload);
      if (callback) callback(resp.result)
    },
    *pushAppConf({payload, callback}, {call}) {
      const resp = yield call(pushAppConfById, payload);
      if (callback) callback(resp)
    },
    *editAppConf({payload, callback}, {call}) {
      const resp = yield call(editAppConfById, payload);
      if (callback) callback(resp)
    },
    *fetchAppConf({payload, callback}, {call, put}) {
      const resp = yield call(queryAppConfById, payload);
      yield put({
        type: 'saveappBasicInfo',
        payload: resp.result
      })
      if (callback) callback(resp)
    },
    *deleteAppConf({payload, callback}, {call}) {
      const resp = yield call(deleteAppConfById, payload);
      if (callback) callback(resp)
    },
    *pushMailConf({payload, callback}, {call}) {
      const resp = yield call(pushMailConfById, payload);
      if (callback) callback(resp)
    },
    *editMailConf({payload, callback}, {call}) {
      const resp = yield call(editMailConfById, payload);
      if (callback) callback(resp)
    },
    *fetchMailConf({payload, callback}, {call, put}) {
      const resp = yield call(queryMailConfById, payload);
      yield put({
        type: 'saveappBasicInfo',
        payload: resp.result
      })
      if (callback) callback(resp)
    },
    *deleteMailConf({payload, callback}, {call}) {
      const resp = yield call(deleteMailConfById, payload);
      if (callback) callback(resp)
    },
    *pushSMSConf({payload, callback}, {call}) {
      const resp = yield call(pushSMSConfById, payload);
      if (callback) callback(resp)
    },
    *editSMSConf({payload, callback}, {call}) {
      const resp = yield call(editSMSConfById, payload);
      if (callback) callback(resp)
    },
    *fetchSMSConf({payload, callback}, {call, put}) {
      const resp = yield call(querySMSConfById, payload);
      yield put({
        type: 'saveappBasicInfo',
        payload: resp.result
      })
      if (callback) callback(resp)
    },
    *deleteSMSConf({payload, callback}, {call}) {
      const resp = yield call(deleteSMSConfById, payload);
      if (callback) callback(resp)
    }
  },

  reducers: {
    saveList(state, action) {
      // console.log(action)
      return {
        ...state,
        data: {
          list: action.payload.list,
          pagination: {
            extraParams: action.payload.extraParams
          },
        }
      }
    },
    saveappBasicInfo(state, action) {
      return {
        ...state,
        appBasicInfo: action.payload
      }
    },
    saveAll(state, { payload: { appBasicInfo } }) {
      return {
        ...state,
        appBasicInfo
      }
    },
    clear(state) {
      return {
        ...state,
        appBasicInfo: {}
      }
    }
  }
};
