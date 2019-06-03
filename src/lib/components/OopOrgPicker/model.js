import { formatter, controlMenu } from '@framework/utils/utils';
import * as service from './service';

export default {
  namespace: 'OopOrgPicker$model',
  state: {
    group: [],
    user: [],
    orgTreeData: []
  },
  effects: {
    // 获得所有部门
    *fetchOrgTree({ payload, callback }, { call, put }) {
      const response = yield call(service.getOrgData, payload);
      response.result.forEach((item)=> {
        const data = item
        data.title = data.name
        data.key = data.id
        data.value = data.id
      })
      const menus = formatter(controlMenu(response.result));
      yield put({
        type: 'saveOrgTree',
        payload: menus,
      });
      if (callback) callback(menus);
    },
    *findGroup({ payload, callback }, { call, put }) {
      const response = yield call(service.findGroup, payload);
      const menus = (controlMenu(response.result));
      yield put({
        type: 'saveGroup',
        payload: menus,
      });
      if (callback) callback();
    },
    *findUser({ payload, callback }, { call, put }) {
      const response = yield call(service.findUser, payload);
      yield put({
        type: 'saveUser',
        payload: response.result.data,
      });
      if (callback) callback();
    },
  },
  reducers: {
    saveGroup(state, {payload}) {
      return {
        ...state,
        group: payload,
      };
    },
    saveOrgTree(state, action) {
      return {
        ...state,
        orgTreeData: action.payload
      };
    },
    saveUser(state, {payload}) {
      return {
        ...state,
        user: payload,
      };
    },
  }
};
