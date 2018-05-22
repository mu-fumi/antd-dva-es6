/**
 * Created by wengyian on 2017/10/23.
 */

import { request } from 'utils'

export async function getBusiness(data) {
  return request('/businesses', {
    method : 'get',
    data : {
      ...data,
      paging : 0
    }
  })
}

export async function getApp(data) {
  return request('/applications', {
    method : 'get',
    data : {
      ...data,
      paging : 0
    }
  })
}

export async function getNodeStatus(id) {
  return request(`/deploy/cluster/${id}`, {
    method : 'get',
  })
}


export async function updateStatus(params) {
  return request('/deploy/update/node-status', {
    method : 'post',
    data : params
  })
}

