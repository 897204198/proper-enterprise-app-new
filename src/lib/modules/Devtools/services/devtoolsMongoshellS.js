import { stringify } from 'qs';
import request from '../../../../framework/utils/request';

export async function queryData(params) {
  if (params.id) {
    return request(`/msc/${params.tableName}/${params.id}?${stringify(params)}`);
  } else {
    return request(`/msc/${params.tableName}?${stringify(params)}`);
  }
}
