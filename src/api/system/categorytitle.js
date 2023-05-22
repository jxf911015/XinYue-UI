import request from '@/utils/request'

// 查询标题分类列表
export function listCategorytitle(query) {
  return request({
    url: '/system/categorytitle/list',
    method: 'get',
    params: query
  })
}

// 查询标题分类详细
export function getCategorytitle(id) {
  return request({
    url: '/system/categorytitle/' + id,
    method: 'get'
  })
}

// 新增标题分类
export function addCategorytitle(data) {
  return request({
    url: '/system/categorytitle',
    method: 'post',
    data: data
  })
}

// 修改标题分类
export function updateCategorytitle(data) {
  return request({
    url: '/system/categorytitle',
    method: 'put',
    data: data
  })
}

// 删除标题分类
export function delCategorytitle(id) {
  return request({
    url: '/system/categorytitle/' + id,
    method: 'delete'
  })
}

// 用户状态修改
export function changeTabStatus(id, status) {
  const data = {
    id,
    status
  }
  console.log("data:"+data)
  return request({
    url: '/system/categorytitle/changeStatus',
    method: 'put',
    data: data
  })
}
