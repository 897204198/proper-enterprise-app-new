import request from '../../../../framework/utils/request';

export async function saveOrUpdate(param) {
  return param.id ? request(`/oopsearch/config/${param.id}`, {
    method: 'PUT',
    body: param
  }) : request('/oopsearch/config', {
    method: 'POST',
    body: param
  });
}
export async function remove(param) {
  return request(`/oopsearch/config/?ids=${param}`, {
    method: 'DELETE'
  });
}
