import { stringify } from 'qs';
import request from '@framework/utils/request';

// 左菜单数据
export async function noticeType() {
  return request('/sys/announcement/types', {
    method: 'GET'
  });
}
// 公告列表
export async function noticeList(params) {
  return request(`/admin/announcement?${stringify(params)}`, {
    method: 'GET'
  });
}
// 新建或编辑
export async function submitOrUpdate(params) {
  return params.id ? request(`/admin/announcement/${params.id}`, {
    method: 'PUT',
    body: params
  }) : request('/admin/announcement', {
    method: 'POST',
    body: params
  });
}
// 删除
export async function removeNoticeInfo(params) {
  return request(`/admin/announcement/${params.id}`, {
    method: 'DELETE'
  });
}

