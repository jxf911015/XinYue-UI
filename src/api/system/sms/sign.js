import request from '@/utils/request'

// 查询短信签名列表
export function listSign(query) {
  return request({
    url: '/system/sign/list',
    method: 'get',
    params: query
  })
}

// 查询短信签名详细
export function getSign(id) {
  return request({
    url: '/system/sign/' + id,
    method: 'get'
  })
}

// 新增短信签名
export function addSign(data) {
  return request({
    url: '/system/sign',
    method: 'post',
    data: data
  })
}

// 修改短信签名
export function updateSign(data) {
  return request({
    url: '/system/sign',
    method: 'put',
    data: data
  })
}

// 删除短信签名
export function delSign(id) {
  return request({
    url: '/system/sign/' + id,
    method: 'delete'
  })
}
