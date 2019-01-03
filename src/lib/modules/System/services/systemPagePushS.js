import request from '../../../../framework/utils/request';

export async function getFileInfo(param) {
  return request(`/file/${param}/meta`);
}
export async function saveOrUpdate(param) {
  return param.id ? request('/push/channels', {
    method: 'PUT',
    body: param,
  }) : request('/push/channels', {
    method: 'POST',
    body: param,
  });
}
export async function remove(param) {
  return request(`/push/channels/?ids=${param}`, {
    method: 'DELETE'
  })
}
export async function fetch() {
  return request('/push/channels');
}
