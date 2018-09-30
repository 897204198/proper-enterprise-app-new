// import { stringify } from 'qs';
import request from '../../../../framework/utils/request';

export async function getAppInfo() {
  return request('/message/app')
}