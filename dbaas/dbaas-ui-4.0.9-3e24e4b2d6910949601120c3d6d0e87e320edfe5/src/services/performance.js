/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-05-11 12:22 $
 */

import { request } from 'utils'

// 第一个版本的当前负载的接口
export async function currentLoad (params) {
  const { key } = params
  delete params['key']
  return request('/performance/currentLoad', {
    method: 'get',
    data: params,
  })
}

// 第二个版本的当前负载的接口
export async function graph (params) {
  const { key } = params
  delete params['key']
  return request('/performance/query/' + key, {
    method: 'get',
    data: params,
  })
}

export async function session (params) {
  const { key } = params
  delete params['key']
  return request('/performance/session/' + key, {
    method: 'get',
    data: params,
  })
}

export async function processlist (params) {
  return request('/performance/session/process', {
    method: 'get',
    data: params,
  })
}

export async function queryAnalysis (params) {
  return request('/performance/chart/statmenet', {
    method: 'get',
    data: params,
  })
}

export async function blockingWait (params) {
  return request('/performance/block/chart', {
    method: 'get',
    data: params,
  })
}

export async function IOBytes (params) {
  return request('/performance/iochart/bytes', {
    method: 'get',
    data: params,
  })
}

export async function IOLatency (params) {
  return request('/performance/iochart/latency', {
    method: 'get',
    data: params,
  })
}


export async function getSetting (params) {
  const { node } = params
  delete params['node']
  return request(`/performance/${node}/setting`, {
    method: 'get',
    data: params,
  })
}

export async function updateSetting (params) {
  const { hostname } = params
  delete params['hostname']
  return request(`/performance/${hostname}/setting`, {
    method: 'patch',
    data: params,
  })
}

export async function getDigest(params) {
  return request('/performance/top/digest', {
    method : 'get',
    data : params
  })
}

// 概览图
export async function getSummary(params){
  return request('/performance/summary', {
    method : 'get',
    data : params
  })
}
