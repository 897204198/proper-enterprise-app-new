import { queryOpinions, queryById, updateFeedback, closeFeedback } from '../services/feedbackS';

export default {
  namespace: 'feedback',

  state: {
    list: []
  },

  effects: {
    *fetch({ payload, callback }, { call, put }) {
      const response = yield call(queryOpinions, payload);
      yield put({
        type: 'save',
        payload: response.result.data
      });
      if (callback) callback(response.result.data)
    },
    *fetchByUserId({ payload, callback }, { call }) {
      const response = yield call(queryById, payload);
      if (callback) callback(response.result)
    },
    *update({ payload, callback }, { call }) {
      const response = yield call(updateFeedback, payload);
      if (callback) callback(response)
    },
    *close({ payload, callback }, { call }) {
      const response = yield call(closeFeedback, payload);
      if (callback) callback(response)
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        list: payload,
      }
    },
  },
};
