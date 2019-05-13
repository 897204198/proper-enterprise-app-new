import { routerRedux } from 'dva/router';
import cookie from 'react-cookies';
import { devMode } from '@/config/config';
import MongoService from '@framework/utils/MongoService';
import { login } from '../services/baseS';

export default {
  namespace: 'baseLogin',

  state: {
    status: undefined,
    showError: false,
    modalVisible: false,
    address: localStorage.getItem('pea_dynamic_request_prefix'),
    addressCache: JSON.parse(localStorage.getItem('pea_dynamic_request_prefix_cache')),
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(login, payload);
      // console.log(response)
      // Login successfully
      if (response && response.status === 'ok') {
        const {localStorage, sessionStorage, location} = window;
        const {origin, pathname} = location;
        let url = `${origin}${pathname}`;
        localStorage.setItem('proper-auth-login-token', response.result);
        MongoService.setToken(response.result)
        const returnPage = sessionStorage.getItem('proper-route-noAuthPage');
        if (returnPage) {
          url += returnPage;
        }
        sessionStorage.removeItem('proper-route-noAuthPage');
        cookie.remove('X-PEP-TOKEN', { path: '/' });
        window.location.href = url;
        // document.cookie = `X-PEP-TOKEN=${response.result};path=/`;
        yield put({
          type: 'toggleShowError',
          payload: false
        });
      } else {
        yield put({
          type: 'toggleShowError',
          payload: true
        });
      }
    },
    *logout(_, { put }) {
      window.localStorage.removeItem('proper-auth-login-token');
      yield put(routerRedux.push('/base/login'));
    },
    *setAddressCache({ payload, callback }, { put }) {
      const arr = Object.values(payload); //eslint-disable-line
      window.localStorage.setItem('pea_dynamic_request_prefix_cache', JSON.stringify(arr));
      yield put({
        type: 'saveAddressCache',
        payload: arr
      });
      setTimeout(()=>{
        callback && callback()
      }, 200)
    },
    *addAddress({ payload, callback }, { put }) {
      window.localStorage.setItem('pea_dynamic_request_prefix', payload);
      yield put({
        type: 'saveAddress',
        payload
      });
      setTimeout(()=>{
        callback && callback()
      }, 200)
    },
    *clearAddress({ callback }, { put }) {
      window.localStorage.setItem('pea_dynamic_request_prefix', '');
      yield put({
        type: 'saveAddress',
        payload: ''
      });
      setTimeout(()=>{
        callback && callback()
      }, 200)
    }
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
    toggleShowError(state, { payload }) {
      return {
        ...state,
        showError: payload,
      };
    },
    toggleShowModal(state, { payload }) {
      return {
        ...state,
        modalVisible: payload,
      };
    },
    saveAddressCache(state, { payload }) {
      return {
        ...state,
        addressCache: payload
      };
    },
    saveAddress(state, { payload }) {
      return {
        ...state,
        address: payload
      };
    },
  },
  subscriptions: {
    setup({dispatch}) {
      if (devMode === 'development') {
        let tid;
        let total = 0;
        let isOK = false;
        window.onkeydown = (e)=>{
          clearTimeout(tid);
          tid = setTimeout(()=>{
            const { keyCode } = e;
            if (total !== 0) {
              if ((total + keyCode) === 35) {
                isOK = true;
                total = 0;
              } else {
                isOK = false;
              }
            } else {
              (keyCode === 17 || keyCode === 18) && (total = keyCode)
            }
          }, 0)
        }
        window.onclick = ()=>{
          if (isOK) {
            dispatch({
              type: 'toggleShowModal',
              payload: true
            })
            isOK = false;
          }
        }
      }
    },
  },
};
