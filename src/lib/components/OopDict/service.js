import {stringify} from 'qs';
import request from '@framework/utils/request';

// 查询数据字典
export async function fetchDictionary(param) {
  return request(`/sys/datadic?${stringify(param)}`);
}
