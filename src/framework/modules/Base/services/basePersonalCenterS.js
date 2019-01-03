import request from '@framework/utils/request';

export async function changePassword(param) {
  const url = '/auth/users/password';
  const headers = {}
  // 兼容邮件重置密码的请求
  if (param.token) {
    headers['X-PEP-TOKEN'] = param.token
  }
  return request(url, {
    method: 'PUT',
    body: param,
    headers
  });
}
