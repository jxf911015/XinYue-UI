import request from '@/utils/request'

// 查询配置分类数据列表
export function listConfigData(query) {
  return request({
    url: '/system/configData/list',
    method: 'get',
    params: query
  })
}

// 查询配置分类数据详细
export function getConfigData(id) {
  return request({
    url: '/system/configData/' + id,
    method: 'get'
  })
}

// 新增配置分类数据
export function addConfigData(data) {
  return request({
    url: '/system/configData',
    method: 'post',
    data: data
  })
}

// 修改配置分类数据
export function updateConfigData(data) {
  return request({
    url: '/system/configData',
    method: 'put',
    data: data
  })
}

// 删除配置分类数据
export function delConfigData(id) {
  return request({
    url: '/system/configData/' + id,
    method: 'delete'
  })
}
