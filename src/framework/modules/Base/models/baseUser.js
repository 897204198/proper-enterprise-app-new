import { formatter, controlMenu } from '@framework/utils/utils';
import { getRouterDataFromMenuData, addRoutersData, addMenuData } from '@framework/common/frameHelper';
import { query as queryUsers, queryCurrent, queryCurrentMenus } from '../services/baseS';


export default {
  namespace: 'baseUser',
  state: {
    list: [],
    currentUser: {},
    menus: [],
    routerData: {}
  },
  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response.result,
      });
    },
    *fetchCurrent(_, { call, put }) {
      const response = yield call(queryCurrent);
      yield put({
        type: 'saveCurrentUser',
        payload: response.result,
      });
    },
    *fetchMenus({ callback }, { call, put }) {
      const response = yield call(queryCurrentMenus);
      const menus = formatter(controlMenu(response.result.data));
      addMenuData(response.result.data);
      yield put({
        type: 'saveMenus',
        payload: menus
      });
      yield put({
        type: 'saveRouters',
        payload: getRouterDataFromMenuData(menus),
      });
      if (callback) callback();
    }
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveCurrentUser(state, action) {
      const {data} = action.payload;
      if (data.name == null) {
        data.name = 'Error';
      }
      return {
        ...state,
        currentUser: data,
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload,
        },
      };
    },
    saveMenus(state, action) {
      return {
        ...state,
        menus: action.payload
      }
    },
    saveRouters(state, action) {
      // console.log('bad',action.payload)
      // console.log('ok',getRouterData(getApp()))
      const routerData = addRoutersData(action.payload)
      return {
        ...state,
        routerData
      }
    }
  },
};
