// import { stringify } from 'qs';
import request from '@framework/utils/request';

export async function getMesList() {
  // const params = {pageNo: 1, pageSize: 999, userEnable: 'ALL'};
  return request('/notice/set');
}
export async function upMesList(params) {
  return request('/notice/set', {
    method: 'POST',
    body: params
  })
}