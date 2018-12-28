import { stringify } from 'qs';
import request from '@framework/utils/request';

// 取得应用类别列表
export async function fetchTreeData() {
  return request('/admin/app/applications/catalogs');
}
// 保存或者修改应用
export async function saveOrUpdate(params) {
  const { appId } = params;
  // delete params.id;
  return appId ? request(`/admin/app/applications/${appId}`, {
    method: 'PUT',
    body: params
  }) : request('/admin/app/applications', {
    method: 'POST',
    body: params
  });
}
// 删除应用
export async function deleteApp(params) {
  return request(`/admin/app/applications?${stringify(params)}`, {
    method: 'DELETE'
  });
}
export async function treeListEdit(params) {
  return request(`/admin/app/applications/catalogs/${params[0].code}?typeName=${params[1].typeName}`, {
    method: 'PUT',
  });
}
export async function treeListAdd(params) {
  return request('/admin/app/applications/catalogs', {
    method: 'POST',
    body: params
  });
}
export async function treeListDelete(params) {
  return request(`/admin/app/applications/catalogs/${params.dataRef.code}`, {
    method: 'DELETE',
  });
}
