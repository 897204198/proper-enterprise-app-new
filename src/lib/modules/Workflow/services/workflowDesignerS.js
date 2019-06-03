import { stringify } from 'qs';
import request from '@framework/utils/request';

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
    defaultErrTipsWhenSystemException: false,
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

// 获取分类列表
export async function getTreeData() {
  return request('/repository/wfCategory');
}

export async function treeListAdd(params) {
  return request('/repository/wfCategory', {
    method: 'POST',
    body: params,
  });
}

export async function treeListEdit(params) {
  return request(`/repository/wfCategory/${params.id}`, {
    method: 'PUT',
    body: params,
  });
}

export async function treeListDel(params) {
  return request(`/repository/wfCategory?ids=${params}`, {
    method: 'DELETE'
  });
}

export async function changeType(params) {
  return request(`/repository/models/${params.modelId}/wfCategory?workflowCategoryCode=${params.workflowCategory}`, {
    method: 'PUT',
  });
}

