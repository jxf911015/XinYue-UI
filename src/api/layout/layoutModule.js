import request from '@/utils/request'

//查询所有布局模块
export function allLayoutModule(query) {
  return request({
    url: '/layout/module/all',
    method: 'get',
    params: query
  })
}

// 查询布局模块列表
export function listLayoutModule(query) {
  return request({
    url: '/layout/module/list',
    method: 'get',
    params: query
  })
}

// 查询布局模块详细
export function getLayoutModule(id) {
  return request({
    url: '/layout/module/' + id,
    method: 'get'
  })
}

// 新增布局模块
export function addLayoutModule(data) {
  return request({
    url: '/layout/module',
    method: 'post',
    data: data
  })
}

// 修改布局模块
export function updateLayoutModule(data) {
  return request({
    url: '/layout/module',
    method: 'put',
    data: data
  })
}

// 删除布局模块
export function delLayoutModule(id) {
  return request({
    url: '/layout/module/' + id,
    method: 'delete'
  })
}

// 导出布局模块
export function exportLayoutModule(query) {
  return request({
    url: '/layout/module/export',
    method: 'get',
    params: query
  })
}
