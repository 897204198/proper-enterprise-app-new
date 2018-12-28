
import request from '@framework/utils/request';

// 添加注册应用
export async function addApp(params) {
  return request('/notice/server/app', {
    method: 'post',
    body: params
  });
}
// 生成appKey
export async function getAppKey() {
  return request('/notice/server/app/appKey/init');
}
// 生成token
export async function changeToken() {
  return request('/notice/server/app/token/init');
}
// APP启停开关
export async function toggleApp(params) {
  const { id, enable } = params
  return request(`/notice/server/app?appIds=${id}&enable=${enable}`, {
    method: 'put'
  });
}

// 查询APP信息
export async function queryAppById(params) {
  const { appKey } = params
  return request(`/notice/server/app/appKey/${appKey}`);
}
// 删除PP信息
export async function deleteAppById(params) {
  const { ids } = params
  return request(`/notice/server/app?appIds=${ids}`, {
    method: 'delete'
  });
}
// 编辑APP信息
export async function editAppById(params) {
  const { id } = params
  return request(`/notice/server/app/${id}`, {
    method: 'put',
    body: params
  });
}

// 新增APP配置信息
export async function pushAppConfById(params) {
  const { appKey } = params
  return request(`/notice/server/push/config/${appKey}`, {
    method: 'post',
    body: params
  });
}
// 查询APP配置信息
export async function queryAppConfById(params) {
  const { appKey } = params
  return request(`/notice/server/push/config/${appKey}`);
}
// 编辑APP配置信息
export async function editAppConfById(params) {
  const { appKey } = params
  return request(`/notice/server/push/config/${appKey}`, {
    method: 'put',
    body: params
  });
}
// 删除APP配置信息
export async function deleteAppConfById(params) {
  const { appKey } = params
  return request(`/notice/server/push/config/${appKey}`, {
    method: 'delete'
  })
}
// 新增Mail配置信息
export async function pushMailConfById(params) {
  const { appKey } = params
  return request(`/notice/server/config/EMAIL/${appKey}`, {
    method: 'post',
    body: params
  });
}
// 查询Mail配置信息
export async function queryMailConfById(params) {
  const { appKey } = params
  return request(`/notice/server/config/EMAIL/${appKey}`);
}
// 编辑Mail配置信息
export async function editMailConfById(params) {
  const { appKey } = params
  return request(`/notice/server/config/EMAIL/${appKey}`, {
    method: 'put',
    body: params
  });
}
// 删除Mail配置信息
export async function deleteMailConfById(params) {
  const { appKey } = params
  return request(`/notice/server/config/EMAIL/${appKey}`, {
    method: 'delete'
  })
}

// 新增SMS配置信息
export async function pushSMSConfById(params) {
  const { appKey } = params
  return request(`/notice/server/config/SMS/${appKey}`, {
    method: 'post',
    body: params
  });
}
// 查询SMS配置信息
export async function querySMSConfById(params) {
  const { appKey } = params
  return request(`/notice/server/config/SMS/${appKey}`);
}
// 编辑SMS配置信息
export async function editSMSConfById(params) {
  const { appKey } = params
  return request(`/notice/server/config/SMS/${appKey}`, {
    method: 'put',
    body: params
  });
}
// 删除SMS配置信息
export async function deleteSMSConfById(params) {
  const { appKey } = params
  return request(`/notice/server/config/SMS/${appKey}`, {
    method: 'delete'
  })
}
