import { stringify } from 'qs';
import request from '../../../../framework/utils/request';

export async function getList(params) {
  return request(`/admin/app/versions?${stringify(params)}`);
}

// 新建或编辑
export async function createOrUpdate(params) {
  return (params.id && params.ver) ? request('/admin/app/versions', {
    method: 'PUT',
    body: params
  }) : request('/admin/app/versions', {
    method: 'POST',
    body: params
  });
}

// 获取最新使用版本
export async function getLastedVer() {
  return request('/app/versions/latest');
}

// 删除
export async function removeItem(params) {
  return request(`/admin/app/versions/${params.ver}`, {
    method: 'DELETE'
  });
}

// 获取单项信息
export async function queryVerInfo(params) {
  return request(`/app/versions/${params}`);
}

// 发布
export async function publishVer(params) {
  return request('/admin/app/versions/latest', {
    method: 'POST',
    body: params
  });
}
