import { stringify } from 'qs';
import request from '../../../../framework/utils/request';

// 取得菜单列表
export async function queryTreeData(params) {
  return request(`/auth/menus?${stringify(params)}`);
}
// 保存或者修改菜单
export async function saveOrUpdateFunc(params) {
  const funcId = params.id;
  return funcId ? request(`/auth/menus/${funcId}`, {
    method: 'PUT',
    body: params
  }) : request('/auth/menus', {
    method: 'POST',
    body: params
  });
}
// 取得可选的父节点菜单树
export async function queryParentTreeData() {
  return request('/auth/menus/parents');
}
// 删除
export async function deleteFunc(params) {
  return request(`/auth/menus?${stringify(params)}`, {
    method: 'delete'
  });
}
// 根据id查询menu
export async function queryFuncById(params) {
  return request(`/auth/menus/${params}`);
}
// 取得指定菜单ID的资源列表信息
export async function queryResourceList(params) {
  return request(`/auth/menus/${params}/resources`);
}
// 菜单添加资源
export async function saveResource(params) {
  return request(`/auth/menus/${params.funcId}/resources`, {
    method: 'POST',
    body: params.resources
  });
}
// 修改资源
export async function updateResource(params) {
  return request(`/auth/resources/${params.id}`, {
    method: 'PUT',
    body: params
  });
}
// 删除资源
export async function deleteResource(params) {
  return request(`/auth/resources/${params}`, {
    method: 'DELETE'
  });
}
