import request from '@/utils/request'

// 查询短信模板列表
export function listTemplate(query) {
  return request({
    url: '/system/template/list',
    method: 'get',
    params: query
  })
}

// 查询短信模板详细
export function getTemplate(id) {
  return request({
    url: '/system/template/' + id,
    method: 'get'
  })
}

// 新增短信模板
export function addTemplate(data) {
  return request({
    url: '/system/template',
    method: 'post',
    data: data
  })
}

// 修改短信模板
export function updateTemplate(data) {
  return request({
    url: '/system/template',
    method: 'put',
    data: data
  })
}

// 删除短信模板
export function delTemplate(id) {
  return request({
    url: '/system/template/' + id,
    method: 'delete'
  })
}
