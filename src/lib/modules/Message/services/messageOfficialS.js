
import request from '@framework/utils/request';

export async function getOfficial(params) {
  return request(`/templates/${params}`);
}
export async function postOfficial(params) {
  return request('/templates',
    {
      method: 'POST',
      body: params
    }
  )
}
export async function putOfficial(params) {
  return request(`/templates/${params.id}`,
    {
      method: 'PUT',
      body: params
    }
  )
}
export async function delOfficial(params) {
  return request(`/templates?ids=${params}`,
    {
      method: 'DELETE',
    }
  )
}
export async function getFilterList() {
  return request('/sys/datadic/catalog/NOTICE_CATALOG')
}
