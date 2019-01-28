import { stringify } from 'querystring';
import request from '@framework/utils/request';

export async function getTreeData() {
  return request('/admin/category');
}
export async function getTableData(param) {
  return request(`/admin/problem?${stringify(param)}`);
}
export async function getEdit(param) {
  return request(`/admin/problem/${param.id}`);
}
export async function treeListAdd(param) {
  return request('/admin/category', {
    method: 'POST',
    body: param
  });
}
export async function treeListEdit(param) {
  return request(`/admin/category/modify/${param.id}`, {
    method: 'PUT',
    body: param
  });
}
export async function treeListDelete(param) {
  return request(`/admin/category/del?id=${param}`, {
    method: 'DELETE',
  });
}
export async function saveTable(param) {
  return request('/admin/problem/add', {
    method: 'POST',
    body: param
  });
}
export async function updateTable(param) {
  return request(`/admin/problem/modify/${param.id}`, {
    method: 'PUT',
    body: param,
  });
}
export async function remove(param) {
  return request(`/admin/problem/del/?id=${param}`, {
    method: 'DELETE'
  });
}
export async function removeAll(param) {
  return request(`/admin/problem/delAll/?ids=${param}`, {
    method: 'DELETE'
  });
}
