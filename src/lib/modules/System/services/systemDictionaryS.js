import { stringify } from 'querystring';
import request from '@framework/utils/request';

export async function fetchById(param) {
  return request(`/sys/datadic/${param}`);
}
export async function saveOrUpdate(param) {
  return param.id ? request(`/sys/datadic/${param.id}`, {
    method: 'PUT',
    body: param,
  }) : request('/sys/datadic', {
    method: 'POST',
    body: param,
  });
}
export async function remove(param) {
  return request(`/sys/datadic/?ids=${param}`, {
    method: 'DELETE'
  });
}
export async function getTreeData() {
  return request('/sys/datadic/catalog', {
  });
}
export async function treeListAdd(param) {
  return request('/sys/datadic/catalog', {
    method: 'POST',
    body: param
  });
}
export async function treeListEdit(param) {
  return request(`/sys/datadic/catalog/${param[1]}`, {
    method: 'PUT',
    body: param[0]
  });
}
export async function treeListDelete(param) {
  return request(`/sys/datadic/catalog?ids=${param}`, {
    method: 'DELETE',
  });
}
export async function getTableData(param) {
  return request(`/sys/datadic?${stringify(param)}`);
}
export async function getTableValue(param) {
  return request(`/sys/datadic/catalog/${param}`);
}