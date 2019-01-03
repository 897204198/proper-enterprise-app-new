import request from '../../../../framework/utils/request';

//  JWT token decode
export async function decode(params) {
  return request('/admin/dev/jwt/decode', {
    method: 'POST',
    body: params
  });
}
// 获取header 信息转换成 token
export async function header(params) {
  return request('/admin/dev/jwt/encode/header', {
    method: 'POST',
    body: params
  });
}
