import {getMesList} from '../services/settingMesS'

export default {
  namespace: 'settingMes',
  state: {
    mesList: []
  },
  effects: {
    *fetch({ payload = {} }, { call, put }) {
      const resp = yield call(getMesList, payload);
      yield put({
        type: 'saveList',
        payload: {list: resp.result.data}
      })
    }
  },
  reducers: {
    saveList(state, action) {
      return {
        ...state,
        mesList: action.payload.list
      }
    }
  }
}