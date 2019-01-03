import { fetch, fetchById, remove, saveOrUpdate, removeAll} from '../services/formCurrentComponentSettingS';

export default {
  namespace: 'formCurrentComponentSetting',
  state: {
    list: [],
    entity: {},
  },
  effects: {
    *fetch({ payload = {}, callback }, { call, put }) {
      const resp = yield call(fetch, payload);
      yield put({
        type: 'saveList',
        payload: resp
      })
      if (callback) callback(resp)
    },
    *fetchById({ payload, callback }, { call, put }) {
      const resp = yield call(fetchById, payload);
      yield put({
        type: 'saveEntity',
        payload: resp
      })
      if (callback) callback(resp)
    },
    *saveOrUpdate({payload, callback}, {call, put}) {
      const resp = yield call(saveOrUpdate, payload);
      yield put({
        type: 'saveEntity',
        payload: resp
      })
      if (callback) callback(resp)
    },
    *remove({payload, callback}, {call}) {
      const resp = yield call(remove, payload);
      if (callback) callback(resp)
    },
    *batchRemove({payload, callback}, {call}) {
      const resp = yield call(removeAll, payload);
      if (callback) callback(resp)
    },
  },
  reducers: {
    saveList(state, action) {
      return {
        ...state,
        list: action.payload.result
      }
    },
    saveEntity(state, action) {
      return {
        ...state,
        entity: action.payload.result
      }
    },
    clearEntity(state) {
      return {
        ...state,
        entity: {}
      }
    },
  }
};
