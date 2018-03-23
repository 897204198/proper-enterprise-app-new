import { stringify } from 'qs';
import request from '../../../utils/request';

// 取得roles列表
export async function queryRoles(params) {
  return request(`/auth/roles?${stringify(params)}`);
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