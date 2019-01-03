import { queryData } from '../services/devtoolsMongoshellS';

export default {
  namespace: 'devtoolsMongoshell',
  state: {
  },
  effects: {
    *fetch({ payload, callback }, { call }) {
      const response = yield call(queryData, payload);
      const data = response ? (response.result ? response.result : []) : [];
      let array = [];
      if (data.data && data.data instanceof Array) {
        array = [...data.data];
      } else if (data instanceof Array) {
        array = [];
      } else {
        array = [data]
      }
      if (callback) callback(array);
    }
  },
  reducers: {
  }
}
