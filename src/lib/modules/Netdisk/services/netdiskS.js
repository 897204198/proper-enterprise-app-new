import request from '@/framework/utils/request';

// 查询当前网盘权限信息
export async function queryOwner(params) {
  const { type } = params
  return request(`/netdisk/owner/${type}`)
}

// 新建文件夹
export async function addDir(params) {
  const { path, fileName } = params
  return request('/file/dir', {
    method: 'POST',
    body: {
      path,
      fileName
    }
  })
}

// 修改文件夹
export async function editDir(params) {
  const { path, fileName, id } = params
  return request(`/file/dir/${id}`, {
    method: 'PUT',
    body: {
      path,
      fileName
    }
  });
}

// 删除文件夹
export async function deleteFile(params) {
  const { ids } = params
  return request(`/file?ids=${ids}`, {
    method: 'DELETE'
  })
}

// 删除文件夹
export async function deleteDir(params) {
  const { ids } = params
  return request(`/file/dir?ids=${ids}`, {
    method: 'DELETE'
  })
}

// 查询文件夹、文件列表
export async function queryFileList(params) {
  const { path, direction, property} = params
  return direction && property ? request(`/netdisk?path=${path}&orders=${encodeURI(JSON.stringify([{direction: 'DESC', property: 'isDir'}, {direction, property}]))}`) : request(`/netdisk?path=${path}`)
}

// 查询面包屑
export async function queryBreadcrumb(params) {
  const { path } = params
  return request(decodeURI(`/netdisk/dir?path=${path}`))
}