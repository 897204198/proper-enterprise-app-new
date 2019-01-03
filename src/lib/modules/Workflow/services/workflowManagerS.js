import {stringify} from 'qs';
import request from '../../../../framework/utils/request';

export async function findTask(params) {
  return request(`/workflow/task?${stringify(params)}`);
}

export async function findDesign(params) {
  return request(`/repository/models?${stringify(params)}`);
}

export async function findProcess(params) {
  return request(`/workflow/process?${stringify(params)}`);
}

export async function findBusinessObjByTaskId(params) {
  return request(`/workflow/task/${params}/page`);
}

export async function findBusinessObjByProcInstId(params) {
  return request(`/workflow/process/${params}/page`);
}
