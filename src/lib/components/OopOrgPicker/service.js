import {stringify} from 'qs';
import request from '@framework/utils/request';

export async function findGroup(params) {
  return request(`/hr/organization?${stringify(params)}`);
}

export async function findUser(params) {
  return request(`/search/query?${stringify(params)}`);
}

// 取得所有部门
export async function getOrgData() {
  return request('/hr/organization');
}
