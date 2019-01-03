import { noticeType, noticeList, submitOrUpdate, removeNoticeInfo } from '../services/otherNoticeS';

export default {
  namespace: 'otherNotice',
  state: {
    menusType: {},
    noticeList: []
  },
  effects: {
    *noticeType({ payload, callback }, { call, put }) {
      const response = yield call(noticeType, payload);
      yield put({
        type: 'getMenusType',
        payload: response.result,
      });
      if (callback) callback(response);
    },
    *noticeList({ payload, callback }, { call, put }) {
      const response = yield call(noticeList, payload);
      yield put({
        type: 'getNoticeList',
        payload: response.result.data,
      });
      if (callback) callback(response);
    },
    *removeNoticeInfo({ payload, callback }, { call }) {
      const response = yield call(removeNoticeInfo, payload);
      if (callback) callback(response);
    },
    *submitOrUpdate({ payload, callback }, { call }) {
      const response = yield call(submitOrUpdate, payload);
      if (callback) callback(response);
    }
  },
  reducers: {
    getMenusType(state, action) {
      return {
        ...state,
        menusType: action.payload
      }
    },
    getNoticeList(state, action) {
      return {
        ...state,
        noticeList: action.payload
      }
    }
  }
}
