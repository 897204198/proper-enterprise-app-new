import BasePageService from '../services/basePageS';

export default {
  namespace: 'basePage',
  state: {
    // list: [],
    // entity: {},
  },
  effects: {
    *fetch({ payload = {}, callback, tableName}, { call, put }) {
      const service = new BasePageService(tableName);
      const resp = yield call(service.fetch, payload);
      yield put({
        type: 'saveList',
        payload: resp,
        tableName
      })
      if (callback) callback(resp)
    },
    *fetchById({ payload, callback, tableName }, { call, put }) {
      const service = new BasePageService(tableName);
      const resp = yield call(service.fetchById, payload);
      yield put({
        type: 'saveEntity',
        payload: resp,
        tableName
      })
      if (callback) callback(resp)
    },
    *saveOrUpdate({payload, callback, tableName}, {call, put}) {
      const service = new BasePageService(tableName);
      const resp = yield call(service.saveOrUpdate, payload);
      yield put({
        type: 'saveEntity',
        payload: resp,
        tableName
      })
      if (callback) callback(resp)
    },
    *remove({payload, callback, tableName}, {call}) {
      const service = new BasePageService(tableName);
      const resp = yield call(service.remove, payload);
      if (callback) callback(resp)
    },
    *batchRemove({payload, callback, tableName}, {call}) {
      const service = new BasePageService(tableName);
      const resp = yield call(service.removeAll, payload);
      if (callback) callback(resp)
    },
    *restfulAction({payload, callback, tableName}, {call}) {
      const service = new BasePageService(tableName);
      const resp = yield call(service.sendRestful, {...payload, tableName});
      if (callback) callback(resp)
    },
  },
  reducers: {
    saveList(state, action) {
      const {tableName} = action;
      return {
        ...state,
        [tableName]: {
          ...state[tableName],
          list: action.payload.result
        }
      }
    },
    saveEntity(state, action) {
      const {tableName} = action;
      return {
        ...state,
        [tableName]: {
          ...state[tableName],
          entity: action.payload.result
        }
      }
    },
    clearEntity(state, action) {
      const {tableName} = action;
      return {
        ...state,
        [tableName]: {
          ...state[tableName],
          entity: {}
        }
      }
    },
  }
};
