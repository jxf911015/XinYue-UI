import request from '@/utils/request'

// 查询附件资源库列表
export function listAttachment(query) {
  return request({
    url: '/system/attachment/list',
    method: 'get',
    params: query
  })
}

// 查询附件资源库详细
export function getAttachment(id) {
  return request({
    url: '/system/attachment/' + id,
    method: 'get'
  })
}

// 新增附件资源库
export function addAttachment(data) {
  return request({
    url: '/system/attachment',
    method: 'post',
    data: data
  })
}

// 修改附件资源库
export function updateAttachment(data) {
  return request({
    url: '/system/attachment',
    method: 'put',
    data: data
  })
}

// 删除附件资源库
export function delAttachment(id) {
  return request({
    url: '/system/attachment/' + id,
    method: 'delete'
  })
}


/**
 * 图片列表
 * @param data
 */
export function fileListApi(params) {
  return request({
    // url: '/admin/system/attachment/list',
    // method: 'get',
    // params
  })
}
/**
 * 图片上传
 * @param data
 */
export function fileImageApi(data, params) {
  return request({
    // url: '/admin/upload/image',
    // method: 'POST',
    // params,
    // data
  })
}
