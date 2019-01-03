import { stringify } from 'qs';
import request from '../../../../framework/utils/request';

export async function getDataList(params) {
  return request(`/admin/dev/cache?${stringify(params)}`);
}

export async function getCacheList(params) {
  return request(`/admin/dev/cache/${params.name}`);
}

export async function getListContent(params) {
  return request(`/admin/dev/cache/${params.cacheName}/${params.listName}`);
}

export async function deleteCaches(params) {
  return request(`/admin/dev/cache?${stringify(params)}`, {
    method: 'DELETE'
  });
}

export async function deleteCache(params) {
  if (params.keys) {
    return request(`/admin/dev/cache/${params.name}?${stringify(params.keys)}`, {
      method: 'DELETE'
    });
  } else {
    return request(`/admin/dev/cache/${params.name}`, {
      method: 'DELETE'
    });
  }
}

export async function deleteCacheListItem(params) {
  return request(`/admin/dev/cache/${params.name}/${params.key}`, {
    method: 'DELETE'
  });
}
