import { request } from '../utils'

export async function nodes (params) {
  return request('/nodes/sort', {
    method: 'post',
    data: params,
  })
}

export async function hosts (params) {
  return request('/nodes', {
    method: 'get',
    data: params,
  })
}

export async function trend (params) {
  return request('/nodes/trend', {
    method: 'post',
    data: params,
  })
}

export async function getApplications (params) {
  return request('/monitor/items/application', {
    method: 'get',
    data: params,
  })
}

export async function trendTags (params) {
  return request('/monitor/items/tag', {
    method: 'get',
    data: params,
  })
}

// 获取监控项
export async function getKeys (params) {
  return request('/monitor/items', {
    method: 'get',
    data: params,
  })
}

// 获取磁盘、网卡
export async function getCards (params) {
  return request('/monitor/hosts/info', {
    method: 'get',
    data: params,
  })
}

// 获取业务下的集群、实例组、实例
export async function getBelongings (params) {
  return request('/app/belongings', {
    method: 'get',
    data: params,
  })
}

// 高级搜索获取节点
export async function getNodes (params) {
  return request('/node', {
    method: 'get',
    data: params,
  })
}

// 高级搜索获取节点
export async function getBelongs (params) {
  return request('/deploy/belongs', {
    method: 'get',
    data: params,
  })
}

// 简易搜索获取选中主机
export async function getHosts (params) {
  return request('/monitor/hosts', {
    method: 'get',
    data: params,
  })
}

