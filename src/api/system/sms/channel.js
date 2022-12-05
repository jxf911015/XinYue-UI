import request from '@/utils/request'

// 查询短信渠道列表
export function listChannel(query) {
  return request({
    url: '/system/channel/list',
    method: 'get',
    params: query
  })
}

// 查询短信渠道详细
export function getChannel(id) {
  return request({
    url: '/system/channel/' + id,
    method: 'get'
  })
}

// 新增短信渠道
export function addChannel(data) {
  return request({
    url: '/system/channel',
    method: 'post',
    data: data
  })
}

// 修改短信渠道
export function updateChannel(data) {
  return request({
    url: '/system/channel',
    method: 'put',
    data: data
  })
}

// 删除短信渠道
export function delChannel(id) {
  return request({
    url: '/system/channel/' + id,
    method: 'delete'
  })
}

// 根据数据类型查询下拉数据信息（来源-渠道）
export function getDatas() {
  return request({
    url: 'system/configData/selectByDataKey?dataValue=sms_value',
    method: 'get'
  })
}
