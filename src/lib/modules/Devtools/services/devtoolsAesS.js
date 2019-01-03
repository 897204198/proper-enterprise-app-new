import request from '../../../../framework/utils/request';

// AES 解密
export async function decrypt(params) {
  return request('/admin/dev/aes/decrypt', {
    method: 'POST',
    body: params
  });
}
// AES 加密
export async function encrypt(params) {
  return request('/admin/dev/aes/encrypt', {
    method: 'POST',
    body: params
  });
}
