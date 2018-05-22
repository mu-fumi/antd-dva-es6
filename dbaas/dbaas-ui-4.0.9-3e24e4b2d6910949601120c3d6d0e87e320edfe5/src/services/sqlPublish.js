import { request, constant } from '../utils'
import { message } from 'antd'

const { RESPONSE_STATUS } = constant

const keyword = 'sql-audit'

/** 列表页 **/

// 提交人
export async function getUsers (params) {
  return request(`/public/users`, {
    method: 'get',
    data: params,
  })
}

// 关闭
export async function closeSql (params) {
  const { id } = params
  delete params['id']
  return request(`/${keyword}/${id}/close`, {
    method: 'post',
    data: params,
  })
}

/** 检查页 **/

// 获取实例
export async function getInstances (params) {
  return request('/public/instances', {
    method: 'get',
    data: params,
  })
}

// 获取待选备份库或者表
export async function getBackupTables (params) {
  const { node_id } = params
  delete params['node_id']
  return request(`/node/${node_id}/tables`, {
    method: 'get',
    data: params,
  })
}

// 检查
export async function checkSql (params) {
  return request(`/${keyword}/check`, {
    method: 'post',
    data: params,
  })
}

// 新建或编辑检查页
export async function saveSql (params) {
  return request(`/${keyword}`, {
    method: 'post',
    data: params,
  }).then( (response) => {
    if (response.code === 504) {
      const msg = '请求超时，请稍后重试！'
      message.error(msg)
      window.location.href = '/${keyword}'
      return
    } else if(response.code >= RESPONSE_STATUS['start'] && response.code <= RESPONSE_STATUS['end']){
      const msg = `服务器异常，响应码${response.code}！`
      message.error(msg)
      return
    }
    return response
  })
}

// 更新
export async function updateSql (params) {
  const { id } = params
  delete params['id']
  return request(`/${keyword}/${id}`, {
    method: 'put',
    data: params,
  })
}

/** 发布页 **/

// 回滚
export async function rollbackSql (params) {
  const { id } = params
  delete params['id']
  return request(`/${keyword}/${id}/rollback`, {
    method: 'post',
    data: params,
  })
}

// 发布进度
export async function getSqlPublishProgress (params) {
  const { id } = params
  delete params['id']
  return request(`/${keyword}/${id}/progress`, {
    method: 'get',
    data: params,
  })
}

// 发布
export async function publishSql (params) {
  const { id } = params
  delete params['id']
  return request(`/${keyword}/${id}/publish`, {
    method: 'post',
    data: params,
  }).then( (response) => {
    if (response.code === 504) {
      const msg = '请求超时，请稍后重试！'
      message.error(msg)
      window.location.href = '/${keyword}'
      return
    } else if(response.code >= RESPONSE_STATUS['start'] && response.code <= RESPONSE_STATUS['end']){
      const msg = `服务器异常，响应码${response.code}！`
      message.error(msg)
      return
    }
    return response
  })
}

// 编辑页信息
export async function sqlDetail (params) {
  const { id } = params
  delete params['id']
  return request(`/${keyword}/${id}`, {
    method: 'get',
    data: params,
  })
}

/** 详情页 **/
export async function getSqlHistory (params) {
  const { id } = params
  delete params['id']
  return request(`/${keyword}/${id}/history`, {
    method: 'get',
    data: params,
  })
}

