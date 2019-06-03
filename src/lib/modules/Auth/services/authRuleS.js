import {stringify} from 'qs';
import request from '@framework/utils/request';
// import MongoService from '@framework/utils/MongoService';

// const authRuleService = new MongoService('PEP_AUTH_RULE');
// const {fetchPagable, update, save, deleteById, batchDelete} = authRuleService;

// export async function fetch(param) {
// return fetchPagable(param)
// return request(`/auth/rule/?${stringify(param)}`);
// }
export async function fetchById(param) {
  // return authRuleService.fetchById(param)
  return request(`/auth/rule/${param}`);
}
export async function saveOrUpdate(param) {
  // return param.id ? update(param) : save(param);
  return param.id ? request('/auth/rule', {
    method: 'PUT',
    body: param,
  }) : request('/auth/rule', {
    method: 'POST',
    body: param,
  });
}
export async function removeAll(param) {
  // return batchDelete(param)
  return request(`/auth/rule?${stringify(param)}`, {
    method: 'DELETE'
  });
}
export async function remove(param) {
  // return deleteById(param);
  return request(`/auth/rule/${param}`, {
    method: 'DELETE'
  });
}
export async function fetchDictionary(param) {
  return request(`/sys/datadic?${stringify(param)}`);
}
