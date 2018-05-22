/**
 * Created by wengyian on 2017/9/8.
 */

import { request } from 'utils'

// 删除节点
export async function deleteNode(data) {
  return request('/nodes ', {
    method : 'delete',
    data : data
  })
}

// 启停节点
// export async function switchNode(id) {
//   return request('', {
//     method : 'post'
//   })
// }

// 启动节点
export async function upNode(params) {
  const id = params.id
  delete params.id
  return request(`/nodes/${id}/up`, {
    method : 'post',
    data : params
  })
}

// 停止节点
export async function downNode(id){
  return request(`/nodes/${id}/down`, {
    method : 'post'
  })
}

// // 获取 业务/应用/集群 信息
// export async function getBaseInfo() {
//   return request('', {
//     method : 'get'
//   })
// }

// 获取服务列表
export async function getService(id, type) {
  return request(`/deploy/${id}/services`, {
    method : 'get',
    data: {
      type: type
    }
  })
}

// 获取配置信息
export async function getConfig(data) {
  return request('/deploy/using/config', {
    method : 'get',
    data : data
  })
}

// 新增节点
export async function addNode(data) {
  return request('/nodes', {
    method : 'patch',
    data : data
  })
}

// 获取业务信息
export async function getBusinesses(data) {
  return request('/businesses', {
    method : 'get',
    data : {
      ...data,
      paging : 0
    }
  })
}

// 获取应用信息
export async function getApps(data) {
  return request('/applications', {
    method : 'get',
    data : {
      business_id : data,
      paging : 0
    }
  })
}

// 获取集群信息
export async function getClusters(data) {
  return request('/deploy/app/clusters', {
    method : 'get',
    data : data
  })
}
// 获取实例组信息
export async function getSets(data) {
  return request('/deploy/app/sets', {
    method : 'get',
    data : data
  })
}

// 获取套件信息
export async function getStack(data) {
  return request('/stack/summary', {
    method : 'get',
    data : data
  })
}

// 判断节点应不应该删除
export async function judgeDelete(data) {
  return request('/nodes/min/counts', {
    method : 'get',
    data : data
  })
}
