import * as service from './service';

export default {
  namespace: 'OopSystemCurrent$model',
  state: {
  },
  effects: {
    *fetch({payload, callback}, {put}) {
      const resp = yield service.fetch(payload);
      yield put({
        type: 'saveEntity',
        payload: {resp, url: payload }
      })
      if (callback) { callback(resp) }
    }
  },
  reducers: {
    saveEntity(state, action) {
      return {
        ...state,
        [action.payload.url]: action.payload.resp.result
      }
    }
  }
};
