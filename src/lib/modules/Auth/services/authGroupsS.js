import { stringify } from 'qs';
import request from '../../../../framework/utils/request';

export async function queryGroups(params) {
  const p = {
    ...params,
    userGroupEnable: 'ALL',
  }
  return request(`/auth/user-groups?${stringify(p)}`);
}

export async function updateUserGroups(params) {
  return request('/auth/user-groups', {
    method: 'PUT',
    body: params,
  });
}

export async function removeAllUserGroups(params) {
  return request(`/auth/user-groups?${stringify(params)}`, {
    method: 'DELETE'
  });
}

export async function removeUserGroups(params) {
  return request(`/auth/user-groups/${params.ids}`, {
    method: 'DELETE'
  });
}

export async function createOrUpdateUserGroups(params) {
  return params.id ? request(`/auth/user-groups/${params.id}`, {
    method: 'PUT',
    body: params,
  }) : request('/auth/user-groups', {
    method: 'POST',
    body: params,
  });
}

export async function queryUserGroupsById(params) {
  return request(`/auth/user-groups/${params}`);
}

export async function queryGroupUsers(params) {
  const p = {
    userGroupEnable: 'ALL',
    userEnable: 'ALL'
  }
  return request(`/auth/user-groups/${params}/users?${stringify(p)}`);
}

export async function groupAddUsers(params) {
  return request(`/auth/user-groups/${params.id}/users`, {
    method: 'PUT',
    body: params,
  });
}

export async function groupDeleteUsers(params) {
  return request(`/auth/user-groups/${params.id}/users?${stringify(params)}`, {
    method: 'DELETE',
  });
}
