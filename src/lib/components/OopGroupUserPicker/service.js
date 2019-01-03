import {stringify} from 'qs';
import request from '@framework/utils/request';

export async function findGroup(params) {
  return request(`/auth/user-groups?${stringify(params)}`);
}

export async function findUser(params) {
  const p = {
    userGroupEnable: 'ALL',
    userEnable: 'ALL'
  }
  return request(`/auth/user-groups/${params}/users?${stringify(p)}`);
}
