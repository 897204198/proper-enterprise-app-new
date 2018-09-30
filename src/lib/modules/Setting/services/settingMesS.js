import { stringify } from 'qs';
import request from '../../../../framework/utils/request';

export async function getMesList() {
  const params = {pageNo: 1, pageSize: 999, userEnable: 'ALL'};
  return request(`/setting/mesList?${stringify(params)}`);
}