import { queryUsersById, saveOrUpdateUser } from '@pea/modules/Auth/services/authUserS';
import { changePassword } from '../services/basePersonalCenterS';
import { queryCurrent } from '../services/baseS';

export default {
  namespace: 'basePersonalCenter',
  state: {
    entity: {}
  },
  effects: {
    *fetch({ callback }, { call }) {
      const resp = yield call(queryCurrent);
      if (callback) callback(resp);
    },
    *fetchById({ payload, callback }, { call, put }) {
      const resp = yield call(queryUsersById, payload);
      yield put({
        type: 'saveEntity',
        payload: resp
      });
      if (callback) callback(resp);
    },
    *update({payload, callback}, {call, put}) {
      const resp = yield call(saveOrUpdateUser, payload);
      yield put({
        type: 'saveEntity',
        payload: resp
      });
      if (callback) callback(resp);
    },
    *changePassword({payload, callback}, {call}) {
      const resp = yield call(changePassword, payload);
      if (callback) callback(resp);
    },
  },
  reducers: {
    saveEntity(state, action) {
      return {
        ...state,
        entity: action.payload.result
      }
    },
  }
};
