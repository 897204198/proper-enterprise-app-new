import { stringify } from 'qs';
import request from '../../../../framework/utils/request';

export async function getOfficial(params) {
  return request(`/message/officialList?${stringify(params)}`);
}