import { queryGroups } from '../services/authGroupsS';
import { queryUsers } from '../services/authUserS';
import { queryRoles, queryRole, removeRoles, queryRoleUsers, queryRoleGroups, fetchUpdateStatus,
  createOrUpdate, queryParents, queryCheckedMenus, menusAdd, menusDelete,
  userAddRole, userDelRole, GroupAddRole, GroupDelRole, menuResource,
  resourcesAdd, resourcesDelete, queryCheckedResources } from '../services/authRoleS';
import { formatter, controlMenu } from '../../../../framework/utils/utils';

export default {
  namespace: 'authRole',

  state: {
    roleList: [],
    roleInfo: {},
    roleUsers: [],
    allUsers: [],
    roleGroups: [],
    allGroups: [],
    roleParents: [],
    roleMenus: [],
    roleMenusChecked: [],
    roleResourcesChecked: [],
    allCheckedMenu: []
  },

  effects: {
    // 所有的角色信息
    *fetch({ payload, callback }, { call, put }) {
      const response = yield call(queryRoles, payload);
      yield put({
        type: 'saveRoleList',
        payload: Array.isArray(response.result) ? response.result : [],
      });
      if (callback) callback(response.result);
    },
    // 取得指定角色ID详情信息
    *fetchById({ payload, callback }, { call, put }) {
      const response = yield call(queryRole, payload);
      yield put({
        type: 'saveRoleInfo',
        payload: response.result,
      });
      if (callback) callback(response.result);
    },
    // 删除选中的角色信息
    *removeRoles({ payload, callback }, { call }) {
      const response = yield call(removeRoles, payload);
      if (callback) callback(response);
    },
    // 取得指定角色ID的用户列表
    *fetchRoleUsersById({ payload, callback }, { call, put }) {
      const response = yield call(queryRoleUsers, payload);
      yield put({
        type: 'saveRoleUsers',
        payload: response.result,
      });
      if (callback) callback(response.result);
    },
    // 取得指定角色ID的用户组列表
    *fetchRoleGroupsById({ payload, callback }, { call, put }) {
      const response = yield call(queryRoleGroups, payload);
      yield put({
        type: 'saveRoleGroups',
        payload: response.result,
      });
      if (callback) callback(response.result);
    },
    // 更新角色列表的状态信息
    *fetchUpdateStatus({ payload, callback }, { call }) {
      yield call(fetchUpdateStatus, payload);
      if (callback) callback();
    },
    // 新建或者更新角色
    *createOrUpdate({ payload, callback }, { call, put }) {
      const response = yield call(createOrUpdate, payload);
      yield put({
        type: 'saveRoleInfo',
        payload: response.result,
      });
      if (callback) callback(response);
    },
    // 取得能够被继承的父节点列表
    *fetchParents({ payload, callback }, { call, put }) {
      const response = yield call(queryParents, payload);
      yield put({
        type: 'saveRoleParents',
        payload: response.result,
      });
      if (callback) callback(response);
    },
    // 取得指定角色的菜单和资源列表
    *fetchRoleMenusResources({ payload, callback }, { call, put }) {
      const allMenus = yield call(menuResource);
      const menus = formatter(controlMenu(allMenus.result));
      const checkMenus = yield call(queryCheckedMenus, payload);
      const checkResources = yield call(queryCheckedResources, payload);
      const resourcesChecked = checkResources.result;
      const menusChecked = [];
      for (let i = 0; i < checkMenus.result.length; i++) {
        if (checkMenus.result[i].leaf) {
          menusChecked.push(checkMenus.result[i]);
        }
      }
      yield put({
        type: 'saveRoleMenus',
        payload: {menus, menusChecked, resourcesChecked, allCheckedMenu: checkMenus.result},
      });
      if (callback) callback();
    },
    // 菜单添加项
    *menusAdd({ payload, callback }, { call }) {
      const response = yield call(menusAdd, payload);
      if (callback) callback(response);
    },
    // 菜单删除项
    *menusDelete({ payload, callback }, { call }) {
      const response = yield call(menusDelete, payload);
      if (callback) callback(response);
    },
    // 资源添加项
    *resourcesAdd({ payload, callback }, { call }) {
      const response = yield call(resourcesAdd, payload);
      if (callback) callback(response);
    },
    // 资源删除项
    *resourcesDelete({ payload, callback }, { call }) {
      const response = yield call(resourcesDelete, payload);
      if (callback) callback(response);
    },
    // 取得所有用户
    *fetchAllUsers({ payload, callback }, { call, put }) {
      const response = yield call(queryUsers, payload);
      yield put({
        type: 'saveAllUsers',
        payload: response.result.data,
      });
      if (callback) callback(response);
    },
    // 取得所有用户组
    *fetchAllGroups({ payload, callback }, { call, put }) {
      const response = yield call(queryGroups, payload);
      yield put({
        type: 'saveAllGroups',
        payload: response.result,
      });
      if (callback) callback(response);
    },
    // 角色添加用户
    *roleAddUsers({ payload, callback }, { call }) {
      const response = yield call(userAddRole, payload);
      if (callback) callback(response);
    },
    // 角色删除用户
    *roleDelUsers({ payload, callback }, { call }) {
      const response = yield call(userDelRole, payload);
      if (callback) callback(response);
    },
    // 角色添加用户组
    *roleAddGroups({ payload, callback }, { call }) {
      const response = yield call(GroupAddRole, payload);
      if (callback) callback(response);
    },
    // 角色删除用户组
    *userDelGroups({ payload, callback }, { call }) {
      const response = yield call(GroupDelRole, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    saveRoleList(state, action) {
      return {
        ...state,
        roleList: action.payload
      };
    },
    saveRoleInfo(state, action) {
      return {
        ...state,
        roleInfo: action.payload
      };
    },
    saveRoleUsers(state, action) {
      return {
        ...state,
        roleUsers: action.payload
      };
    },
    saveRoleGroups(state, action) {
      return {
        ...state,
        roleGroups: action.payload
      };
    },
    saveRoleParents(state, action) {
      return {
        ...state,
        roleParents: action.payload
      };
    },
    saveRoleMenus(state, action) {
      return {
        ...state,
        roleMenus: action.payload.menus,
        roleMenusChecked: action.payload.menusChecked,
        roleResourcesChecked: action.payload.resourcesChecked,
        allCheckedMenu: action.payload.allCheckedMenu
      };
    },
    saveAllUsers(state, action) {
      const allUsers = action.payload;
      allUsers.map((item) => {
        item.enable === true ? item.enableStatus = '已启用' : item.enableStatus = '已停用'
        return allUsers
      })
      return {
        ...state,
        allUsers
      };
    },
    saveAllGroups(state, action) {
      const allGroups = action.payload;
      allGroups.map((item) => {
        item.enable === true ? item.enableStatus = '已启用' : item.enableStatus = '已停用';
        return allGroups
      })
      return {
        ...state,
        allGroups
      };
    },
    clear(state) {
      return {
        ...state,
        roleInfo: {},
        roleUsers: [],
        roleGroups: [],
        allUsers: [],
        allGroups: [],
        roleMenus: []
      }
    },
  },
};
