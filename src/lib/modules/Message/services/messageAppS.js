// import { stringify } from 'qs';
import request from '../../../../framework/utils/request';

export async function validateToken() {
  return request()
}
export async function getAppInfo() {
  // return request('/notice/server/push/config?access_token=testAppServerToken3')
  return request('/notice/server/app/appKey', {
    method: 'GET',
    // body: param,
    headers: {
      'X-PEP-TOKEN': 'testAppServerToken3'
    }
  });
}
export async function getPushInfo() {
  // return request('/notice/server/push/config?access_token=testAppServerToken3')
  return request('/notice/server/push/config', {
    method: 'GET',
    // body: param,
    headers: {
      'X-PEP-TOKEN': 'testAppServerToken3'
    }
  });
}
export async function getMailInfo() {
  // return request('/notice/server/push/config?access_token=testAppServerToken3')
  return request('/notice/server/config/EMAIL', {
    method: 'GET',
    // body: param,
    headers: {
      'X-PEP-TOKEN': 'testAppServerToken3'
    }
  });
}
export async function getSmsInfo() {
  // return request('/notice/server/push/config?access_token=testAppServerToken3')
  return request('/notice/server/config/SMS', {
    method: 'GET',
    // body: param,
    headers: {
      'X-PEP-TOKEN': 'testAppServerToken3'
    }
  });
}