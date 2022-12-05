import request from '@/utils/request'

// 查询图片库列表
export function listPicture(query) {
  return request({
    url: '/system/picture/list',
    method: 'get',
    params: query
  })
}

// 查询图片库详细
export function getPicture(id) {
  return request({
    url: '/system/picture/' + id,
    method: 'get'
  })
}

// 新增图片库
export function addPicture(data) {
  return request({
    url: '/system/picture',
    method: 'post',
    data: data
  })
}

// 修改图片库
export function updatePicture(data) {
  return request({
    url: '/system/picture',
    method: 'put',
    data: data
  })
}

// 删除图片库
export function delPicture(id) {
  return request({
    url: '/system/picture/' + id,
    method: 'delete'
  })
}

// 删除图片库
export function uploadPicture(data) {
  return request({
    url: '/common/upload',
    method: 'post',
    data: data
  })
}
