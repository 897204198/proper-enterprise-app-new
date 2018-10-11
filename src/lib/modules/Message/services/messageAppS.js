// import { stringify } from 'qs';
import request from '../../../../framework/utils/request';

export const serverUrl = 'http://119.23.31.109:8081/pep'

export async function getTokenCode() {
  // return request('/notice/server/push/config?access_token=testAppServerToken3')
  return request('/notice/token');
}
export async function setTokenCode(param) {
  return request(`/notice/token?accessToken=${param}`, {
    method: 'PUT'
  })
}
export async function getAppInfo(param) {
  // return request('/notice/server/push/config?access_token=testAppServerToken3')
  return request(`${serverUrl}/notice/server/app/appKey?access_token=${param}`, {
    method: 'GET',
    // body: param,
    headers: {
      // 'X-PEP-TOKEN': param
      'X-PEP-TOKEN': 'testAppServerToken'
    }
  });
}
export async function getPushInfo(param) {
  // return request('/notice/server/push/config?access_token=testAppServerToken3')
  return request(`${serverUrl}/notice/server/push/config?access_token=${param}`, {
    method: 'GET',
    // body: param,
    headers: {
      // 'X-PEP-TOKEN': param
      'X-PEP-TOKEN': 'testAppServerToken'
    }
  });
}
export async function getMailInfo(param) {
  // return request('/notice/server/push/config?access_token=testAppServerToken3')
  return request(`${serverUrl}/notice/server/config/EMAIL?access_token=${param}`, {
    method: 'GET',
    // body: param,
    headers: {
      // 'X-PEP-TOKEN': param
      'X-PEP-TOKEN': 'testAppServerToken'
    }
  });
}
export async function getSmsInfo(param) {
  // return request('/notice/server/push/config?access_token=testAppServerToken3')
  return request(`${serverUrl}/notice/server/config/SMS?access_token=${param}`, {
    method: 'GET',
    // body: param,
    headers: {
      // 'X-PEP-TOKEN': param
      'X-PEP-TOKEN': 'testAppServerToken'
    }
  });
}
// 编辑APP配置信息
export async function editAppConfById(params) {
  return request(`${serverUrl}/notice/server/push/config?access_token=${params.token}`, {
    method: 'PUT',
    body: params.data,
    headers: {
      'X-PEP-TOKEN': 'testAppServerToken'
    }
  });
}
export async function editMailConfById(params) {
  return request(`${serverUrl}/notice/server/config/EMAIL?access_token=${params.token}`, {
    method: 'PUT',
    body: params.data,
    headers: {
      'X-PEP-TOKEN': 'testAppServerToken'
    }
  });
}
export async function editSmsConfById(params) {
  return request(`${serverUrl}/notice/server/config/SMS?access_token=${params.token}`, {
    method: 'PUT',
    body: params.data,
    headers: {
      'X-PEP-TOKEN': 'testAppServerToken'
    }
  });
}
export async function delAppConfById(params) {
  return request(`${serverUrl}/notice/server/push/config?access_token=${params.token}`, {
    method: 'DELETE',
    headers: {
      'X-PEP-TOKEN': 'testAppServerToken'
    }
  });
}
export async function delMailConfById(params) {
  return request(`${serverUrl}/notice/server/config/EMAIL?access_token=${params.token}`, {
    method: 'DELETE',
    headers: {
      'X-PEP-TOKEN': 'testAppServerToken'
    }
  });
}
export async function delSmsConfById(params) {
  return request(`${serverUrl}/notice/server/config/SMS?access_token=${params.token}`, {
    method: 'DELETE',
    headers: {
      'X-PEP-TOKEN': 'testAppServerToken'
    }
  });
}