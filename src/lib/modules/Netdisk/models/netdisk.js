import { addDir, editDir, deleteDir, queryFileList, queryBreadcrumb, queryOwner, deleteFile } from '../services/netdiskS';

export default {
  namespace: 'netdisk',
  state: {
    curUser: {
      id: 'my'
    },
    fileList: [],
    breadcrumb: []
  },
  effects: {
    // *queryCurrentUser({payload, callback}, { call, put }) {
    //   const resp = yield call(queryCurrentUser, payload);
    //   yield put({
    //     type: 'saveCurrentUser',
    //     payload: resp
    //   })
    //   if (callback) callback(resp)
    // },
    *addDir({ payload, callback }, { call }) {
      const resp = yield call(addDir, payload)
      if (callback) callback(resp)
    },
    *editDir({ payload, callback }, { call }) {
      const resp = yield call(editDir, payload)
      if (callback) callback(resp)
    },
    *deleteDir({payload, callback}, { call }) {
      const resp = yield call(deleteDir, payload)
      if (callback) callback(resp)
    },
    *deleteFile({payload, callback}, { call }) {
      const resp = yield call(deleteFile, payload)
      if (callback) callback(resp)
    },
    *queryFileList({payload, callback}, { call, put }) {
      const resp = yield call(queryFileList, payload)
      yield put({
        type: 'saveFileList',
        payload: resp
      })
      if (callback) callback(resp)
    },
    *queryBreadcrumb({payload, callback}, { call, put }) {
      const resp = yield call(queryBreadcrumb, payload)
      yield put({
        type: 'saveBreadcrumb',
        payload: resp
      })
      if (callback) callback(resp)
    },
    *queryOwner({payload, callback}, { call }) {
      const resp = yield call(queryOwner, payload)
      if (callback) callback(resp)
    },
  },

  reducers: {
    saveFileList(state, { payload }) {
      return {
        ...state,
        fileList: payload.result,
        mounted: true
      }
    },
    saveBreadcrumb(state, { payload }) {
      return {
        ...state,
        breadcrumb: payload.result
      }
    },
    saveCurrentUser(state, { payload }) {
      return {
        ...state,
        curUser: payload.result
      }
    },
    clearEntity(state) {
      return {
        ...state,
        entity: {}
      }
    }
  }
};