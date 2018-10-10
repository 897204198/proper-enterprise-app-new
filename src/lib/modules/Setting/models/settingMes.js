import {getMesList, upMesList} from '../services/settingMesS'

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
        payload: {list: resp.result}
      })
    },
    *update({ payload = {}, callback}, { call}) {
      const resp = yield call(upMesList, payload);
      // console.log(resp)
      if (callback) callback(resp)
      // yield put({
      //   type: 'saveList',
      //   payload: {list: resp.result}
      // })
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