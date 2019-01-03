import { queryGroups, updateUserGroups, removeAllUserGroups,
  removeUserGroups, createOrUpdateUserGroups, queryUserGroupsById,
  queryGroupUsers, groupAddUsers, groupDeleteUsers } from '../services/authGroupsS';
import { queryUsers, queryUserGroups } from '../services/authUserS';

export default {
  namespace: 'authGroups',

  state: {
    groupsData: [],
    groupsBasicInfo: {},
    groupUsers: [],
    allUsers: [],
    userGroups: [],
    pagination: {}
  },

  effects: {
    *fetch({ payload, callback }, { call, put }) {
      // 所有的用户组信息
      const response = yield call(queryGroups, payload);
      yield put({
        type: 'getUserGroups',
        payload: Array.isArray(response.result) ? response.result : [],
      });
      if (callback) callback(response.result);
    },
    *fetchUserGroups({ payload, callback }, { call, put}) {
      // 查找已选中用户的用户组
      const response = yield call(queryUserGroups, payload);
      yield put({
        type: 'saveUserGroups',
        payload: {
          groupUsers: Array.isArray(response.result) ? response.result : [],
        }
      })
      if (callback) callback();
    },
    *fetchById({ payload, callback }, { call, put }) {
      const response = yield call(queryUserGroupsById, payload);
      yield put({
        type: 'getGroupsBasicInfo',
        payload: response.result,
      });
      if (callback) callback();
    },
    *fetchUserAll({ payload, callback }, { call, put}) {
      // 查找所有的用户
      const res = yield call(queryUsers, payload);
      yield put({
        type: 'saveGroupUserAll',
        payload: {
          allUsers: res.result.data
        }
      })
      if (callback) callback();
    },
    *fetchGroupUsers({ payload, callback }, { call, put}) {
      // 查找已选中的用户
      const response = yield call(queryGroupUsers, payload);
      yield put({
        type: 'saveGroupUsers',
        payload: {
          groupUsers: Array.isArray(response.result) ? response.result : [],
        }
      })
      if (callback) callback(response.result);
    },
    *update({ payload, callback }, { call }) {
      const response = yield call(updateUserGroups, payload);
      if (callback) callback(response);
    },
    *removeAll({ payload, callback }, { call }) {
      const response = yield call(removeAllUserGroups, payload);
      if (callback) callback(response);
    },
    *remove({ payload, callback }, { call }) {
      const response = yield call(removeUserGroups, payload);
      if (callback) callback(response);
    },
    *createOrUpdate({ payload, callback }, { call, put }) {
      const response = yield call(createOrUpdateUserGroups, payload);
      let resp = {};
      if (response) {
        resp = response.result;
      }
      yield put({
        type: 'getGroupsBasicInfo',
        payload: resp,
      });
      if (callback) callback(response);
    },
    // 用户组添加用户
    *groupAddUsers({ payload, callback }, { call }) {
      const response = yield call(groupAddUsers, payload);
      if (callback) callback(response);
    },
    // 用户组删除用户
    *groupDeleteUsers({ payload, callback }, { call }) {
      const response = yield call(groupDeleteUsers, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    getUserGroups(state, action) {
      return {
        ...state,
        groupsData: action.payload
      };
    },
    getGroupsBasicInfo(state, action) {
      return {
        ...state,
        groupsBasicInfo: action.payload
      }
    },
    saveGroupUsers(state, { payload }) {
      return {
        ...state,
        groupUsers: payload.groupUsers
      }
    },
    saveUserGroups(state, { payload }) {
      return {
        ...state,
        userGroups: payload.groupUsers
      }
    },
    saveGroupUserAll(state, { payload }) {
      const { allUsers } = payload;
      return {
        ...state,
        allUsers: allUsers.map((it) => {
          it.enable === true ? it.enableStatus = '已启用' : it.enableStatus = '已停用';
          return it
        })
      }
    },
    clear(state) {
      return {
        ...state,
        groupsBasicInfo: {},
        groupUser: []
      }
    },
    changeStatus(state, action) {
      return {
        ...state,
        groupsData: action.payload
      }
    }
  },
};
