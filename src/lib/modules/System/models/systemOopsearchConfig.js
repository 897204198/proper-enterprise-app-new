import { remove, saveOrUpdate } from '../services/systemOopsearchConfigS';

export default {
  namespace: 'systemOopsearchConfig',
  state: {},
  effects: {
    *saveOrUpdate({payload, callback}, {call}) {
      const resp = yield call(saveOrUpdate, payload);
      if (callback) callback(resp)
    },
    *remove({payload, callback}, {call}) {
      const resp = yield call(remove, payload);
      if (callback) callback(resp)
    }
  }
};
