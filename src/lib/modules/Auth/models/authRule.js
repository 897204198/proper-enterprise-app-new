import { fetchDictionary, fetchById, remove, saveOrUpdate, removeAll} from '../services/authRuleS';

export default {
  namespace: 'authRule',
  state: {
    list: [],
    entity: {},
  },
  effects: {
    *findDictData({ payload = {}, callback}, {call, put}) {
      const {catalog} = payload;
      const response = yield call(fetchDictionary, {catalog});
      yield put({
        type: 'saveDictData',
        payload: {response, catalog}
      })
      if (callback) callback({response, catalog});
    },
    *fetch({ payload = {} }, { call, put }) {
      const resp = yield call(fetch, payload);
      yield put({
        type: 'saveList',
        payload: resp
      })
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
        list: action.payload.result.data
      }
    },
    saveEntity(state, action) {
      const type = JSON.stringify(action.payload.result.type);
      action.payload.result.type = type;
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
    saveDictData(state, action) {
      return {
        ...state,
        [action.payload.catalog]: action.payload.response.result.data.map(it=>({
          text: it.name,
          label: it.name,
          value: JSON.stringify({catalog: it.catalog, code: it.code}),
        }))
      }
    },
  }
};
