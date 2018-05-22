/**
 * Created by wengyian on 2017/7/5.
 */

import { request } from '../utils'

export async function getComponentsSummary() {
  return request('/component/summary', {
    method : 'get',
  })
}

export async function getStackService(param) {
  return request('/service/list', {
    method : 'get',
    data : param
  })
}

export async function deleteService(id) {
  return request('/service/delete', {
    method : 'delete',
    data : {
      service_id : id
    }
  })
}

export async function getStackTags() {
  return request('/stack/tag', {
    method : 'get',
  })
}

export async function checkStackUnique(param){
  return request('/stack/unique', {
    method : 'get',
    data : param
  })
}

export async function checkServiceUnique(param){
  return request('/service/unique', {
    method : 'get',
    data : param
  })
}

export async function addStack(param) {
  return request('/stack/add', {
    method : 'post',
    data : param
  })
}

export async function deleteStack(id){
  return request('/stack/delete', {
    method : 'delete',
    data : {
      stack_id : id
    }
  })
}

export async function getStackSummary(params){
  return request('/stack/summary', {
    method : 'get',
    data : params
  })
}

export async function stackUpdate(params) {
  return request('/stack/update', {
    method : 'patch',
    data : params
  })
}

export async function deleteStackService(params) {
  return request('/stack/service/delete', {
    method : 'delete',
    data : params
  })
}

export async function getStackConfig(params) {
  return request('/stack/service/configure', {
    method : 'get',
    data : params
  })
}

export async function updateStackConfig(params) {
  return request('/stack/service/configure', {
    method : 'patch',
    data : params
  })
}

export async function updateStackService(params) {
  return request('/stack/service/add', {
    method : 'post',
    data : params
  })
}

// 新建服务
export async function createService(data) {
  return request('/service/add', {
    method : 'post',
    data : data
  })
}

export async function getServiceInfo(id) {
  return request('/service/info', {
    method : 'get',
    data : {service_id : id}
  })
}

export async function getVersionList() {
  return request('/packages/version/list', {
    method : 'get'
  })
}

export async function updateService(data) {
  return request('/service/update', {
    method : 'patch',
    data : data
  })
}



