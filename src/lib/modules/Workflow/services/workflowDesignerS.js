import { stringify } from 'qs';
import request from '../../../../framework/utils/request';

export async function queryWorkflowList(params) {
  // 拼装模糊查询
  if (params && params.filter) {
    params = {
      ...params,
      filter: `%${params.filter}%`
    }
  }
  return request(`/repository/models?${stringify(params)}`);
}

export async function createWorkflow(params) {
  return request('/workflow/service/app/rest/models', {
    method: 'POST',
    body: params,
  });
}

export async function removeWorkflowList(params) {
  return request(`/workflow/service/app/rest/models/${params}`, {
    method: 'DELETE'
  });
}

export async function repositoryWorkflow(params) {
  return request(`/repository/models/${params}/deployment`, {
    method: 'POST'
  });
}

export async function queryByProcDefKey(params) {
  // hack url bug
  let arg = params;
  if (params.includes('?')) {
    const [first] = [...params.split('?')];
    arg = first;
  }
  return request(`/repository/process-definitions/${arg}/latest`);
}
