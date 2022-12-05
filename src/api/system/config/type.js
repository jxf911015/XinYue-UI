import request from '@/utils/request'

// 查询配置分类列表
export function listType(query) {
  return request({
    url: '/system/type/list',
    method: 'get',
    params: query
  })
}

// 查询配置分类详细
export function getType(id) {
  return request({
    url: '/system/type/' + id,
    method: 'get'
  })
}

// 新增配置分类
export function addType(data) {
  return request({
    url: '/system/type',
    method: 'post',
    data: data
  })
}

// 修改配置分类
export function updateType(data) {
  return request({
    url: '/system/type',
    method: 'put',
    data: data
  })
}

// 删除配置分类
export function delType(id) {
  return request({
    url: '/system/type/' + id,
    method: 'delete'
  })
}
