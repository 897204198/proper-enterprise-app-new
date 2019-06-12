import {stringify} from 'qs';
import request from '@framework/utils/request';

export async function findGroup(params) {
  return request(`/hr/organization?${stringify(params)}`);
}

export async function findUser(params) {
  return request(`/search/query?${stringify(params)}`);
}
export async function searchUser(params) {
  return request(`/hr/employee/condition?${stringify(params)}`);
}
// organizationId
