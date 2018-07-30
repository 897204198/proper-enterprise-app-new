import { routerRedux } from 'dva/router';
import { login } from '../services/baseS';
import { devMode } from '../../../../config/config';

export default {
  namespace: 'baseLogin',

  state: {
    status: undefined,
    showError: false,
    modalVisible: false,
    address: localStorage.getItem('pea_dynamic_request_prefix')
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(login, payload);
      // Login successfully
      if (response && response.status === 'ok') {
        window.localStorage.setItem('proper-auth-login-token', response.result);
        // yield put(routerRedux.push('/main'));
        window.location.href = `${window.location.origin}${window.location.pathname}`;
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
    *setAddress({ payload, callback }, { put }) {
      window.localStorage.setItem('pea_dynamic_request_prefix', payload);
      yield put({
        type: 'saveAddressCache',
        payload
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
        address: payload,
      };
    }
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
