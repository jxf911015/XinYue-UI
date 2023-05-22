import request from '@/utils/request'

// 查询链接管理列表
export function listLink(query) {
  return request({
    url: '/system/link/list',
    method: 'get',
    params: query
  })
}

// 查询链接管理详细
export function getLink(id) {
  return request({
    url: '/system/link/' + id,
    method: 'get'
  })
}

// 新增链接管理
export function addLink(data) {
  return request({
    url: '/system/link',
    method: 'post',
    data: data
  })
}

// 修改链接管理
export function updateLink(data) {
  return request({
    url: '/system/link',
    method: 'put',
    data: data
  })
}

// 删除链接管理
export function delLink(id) {
  return request({
    url: '/system/link/' + id,
    method: 'delete'
  })
}
