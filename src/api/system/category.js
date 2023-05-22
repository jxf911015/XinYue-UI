import request from '@/utils/request'

// 查询分类列表
export function listCategory(query) {
  return request({
    url: '/system/category/list',
    method: 'get',
    params: query
  })
}

// 查询分类详细
export function getCategory(id) {
  return request({
    url: '/system/category/' + id,
    method: 'get'
  })
}

// 查询部门列表（排除节点）
export function listCategoryExcludeChild(id) {
  return request({
    url: '/system/category/list/exclude/' + id,
    method: 'get'
  })
}

// 新增分类
export function addCategory(data) {
  return request({
    url: '/system/category',
    method: 'post',
    data: data
  })
}
// 新增分类
export function createCategory(data) {
  return request({
    url: '/system/category',
    method: 'post',
    data: data
  })
}
// 修改分类
export function updateCategory(data) {
  return request({
    url: '/system/category',
    method: 'put',
    data: data
  })
}

// 删除分类
export function delCategory(id) {
  return request({
    url: '/system/category/' + id,
    method: 'delete'
  })
}
// 删除分类
export function removeCategory(id) {
  console.log(id)
  return request({
    url: '/system/category/' + id,
    method: 'delete'
  })
}
// 删除分类
export function delCategoryByid(id) {
  console.log(id)
  return request({
    url: '/system/category/removeByid/'+id,
    method: 'delete',
    id: id
  })
}
/**
 * 分类数据tree数据
 * @param pram
 */
export function treeCategroy(pram) {
  const data = {
    type: pram.type,
    status: pram.status,
    name: pram.name
  }
  return request({
    url: '/system/category/treeList',
    method: 'GET',
    params: data
  })
}

/**
 * 分类列表
 * @param pram
 */
export function listCategroy(pram) {
  const data = {
    limit: pram.limit,
    name: pram.name,
    page: pram.page,
    pid: pram.pid,
    status: pram.status,
    type: pram.type
  }
  return request({
    url: '/system/category/list',
    method: 'GET',
    params: data
  })
}

// 查询分类下拉树结构
export function treeselect() {
  return request({
    url: '/system/category/treeselect',
    method: 'get'
  })
}
// 查询分类下拉树结构
export function getCategoryList(pram) {
  const data = {
    name: pram.name,
  }
  return request({
    url: '/system/category/treeselect',
    method: 'get',
    params: data
  })
}

