import { stringify } from 'qs';
import request from '../../../../framework/utils/request';

// 取得roles列表
export async function queryRoles() {
  const p = {
    roleEnable: 'ALL'
  }
  return request(`/auth/roles?${stringify(p)}`);
}

// 取得指定角色ID详情信息
export async function queryRole(params) {
  return request(`/auth/roles/${params}`);
}

// 删除选定的roles
export async function removeRoles(params) {
  return request(`/auth/roles?${stringify(params)}`, {
    method: 'DELETE'
  });
}

// 取得指定角色ID的用户列表
export async function queryRoleUsers(params) {
  return request(`/auth/roles/${params}/users`);
}

// 取得指定角色ID的用户列表
export async function queryRoleGroups(params) {
  return request(`/auth/roles/${params}/user-groups`);
}

// 更新角色列表的状态信息
export async function fetchUpdateStatus(params) {
  return request('/auth/roles', {
    method: 'PUT',
    body: params
  });
}

// 新建或者更新角色
export async function createOrUpdate(params) {
  return params.id ? request(`/auth/roles/${params.id}`, {
    method: 'PUT',
    body: params,
  }) : request('/auth/roles', {
    method: 'POST',
    body: params,
  });
}

// 取得能够被继承的父节点列表
export async function queryParents(params) {
  return params.roleId ? request(`/auth/roles/${params.roleId}/parents`)
    : request('/auth/roles/parents');
}

// 取得指定角色的资源列表
export async function queryCheckedResources(params) {
  return request(`/auth/roles/${params.roleId}/resources`);
}

// 取得指定角色的菜单列表
export async function queryCheckedMenus(params) {
  return request(`/auth/roles/${params.roleId}/menus`);
}

// 菜单添加项
export async function menusAdd(params) {
  return request(`/auth/roles/${params.roleId}/menus`, {
    method: 'POST',
    body: params
  });
}

// 菜单删除项
export async function menusDelete(params) {
  return request(`/auth/roles/${params.roleId}/menus?${stringify(params.ids)}`, {
    method: 'DELETE'
  });
}

// 资源添加项
export async function resourcesAdd(params) {
  return request(`/auth/roles/${params.roleId}/resources`, {
    method: 'POST',
    body: params
  });
}

// 资源删除项
export async function resourcesDelete(params) {
  return request(`/auth/roles/${params.roleId}/resources?${stringify(params.ids)}`, {
    method: 'DELETE'
  });
}

// 角色添加用户
export async function userAddRole(params) {
  return request(`/auth/users/${params.userOrGroupId}/role/${params.roleId}`, {
    method: 'POST'
  });
}

// 角色删除用户
export async function userDelRole(params) {
  return request(`/auth/users/${params.userOrGroupId}/role/${params.roleId}`, {
    method: 'DELETE'
  });
}

// 角色添加用户组
export async function GroupAddRole(params) {
  return request(`/auth/user-groups/${params.userOrGroupId}/role/${params.roleId}`, {
    method: 'POST'
  });
}

// 角色删除用户组
export async function GroupDelRole(params) {
  return request(`/auth/user-groups/${params.userOrGroupId}/role/${params.roleId}`, {
    method: 'DELETE'
  });
}

// 获取菜单资源
export async function menuResource() {
  return request('/auth/menus/resources');
}
