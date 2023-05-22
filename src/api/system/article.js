import request from '@/utils/request'

// 查询文章管理列表
export function listArticle(query) {
  return request({
    url: '/system/article/list',
    method: 'get',
    params: query
  })
}

// 查询文章管理详细
export function getArticle(id) {
  return request({
    url: '/system/article/' + id,
    method: 'get'
  })
}

// 新增文章管理
export function addArticle(data) {
  return request({
    url: '/system/article',
    method: 'post',
    data: data
  })
}

// 修改文章管理
export function updateArticle(data) {
  return request({
    url: '/system/article',
    method: 'put',
    data: data
  })
}

// 删除文章管理
export function delArticle(id) {
  return request({
    url: '/system/article/' + id,
    method: 'delete'
  })
}

// 区域分类列表
export function listTree() {
  return request({
    url: '/system/categorytitle/listTree',
    method: 'get'
  })
}

// 查询分类列表
export function listCategory(query) {
  return request({
    url: '/system/category/list',
    method: 'get',
    params: query
  })
}
// 下架
export function downwards(id) {
  const data = {
    id:id,
    status:1
  }
  return request({
    url: '/system/article',
    method: 'put',
    data: data
  })
}
// 上架
export function upwards(id) {
  const data = {
    id:id,
    status:0
  }
  return request({
    url: '/system/article',
    method: 'put',
    data: data
  })
}
// 置顶
export function toppings(id) {
  const data = {
    id:id,
    sort:1
  }
  return request({
    url: '/system/article',
    method: 'put',
    data: data
  })
}
