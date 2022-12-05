import request from '@/utils/request'

// 查询配置分类
export function listDataValue(query) {
  return request({
    url: '/system/type/allDataValue',
    method: 'post',
    params: query
  })
}

// 查询配置分类数据详细
export function allData(query) {
  return request({
    url: '/system/configData/allData',
    method: 'post',
    params: query
  })
}

// 新增/编辑数据
export function submitConfig(query) {
  return request({
    url: '/system/configData/updateValues',
    method: 'post',
    data: query
  })
}
