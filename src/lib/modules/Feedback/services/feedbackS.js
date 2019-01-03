import { stringify } from 'qs';
import request from '../../../../framework/utils/request';

export async function queryOpinions(params) {
  return request(`/admin/feedback?${stringify(params)}`);
}

export async function queryById(params) {
  return request(`/admin/feedback/${params.userId}`);
}

export async function updateFeedback(params) {
  return request(`/admin/feedback/${params.userId}`, {
    method: 'POST',
    body: params
  });
}

export async function closeFeedback(params) {
  return request(`/admin/feedback/${params.userId}/close`, {
    method: 'PUT',
  });
}
