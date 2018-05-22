import { request } from '../utils'

//---------获取job详情----------
export async function getJob (params) {
  return request(`/jobs/${params.id}`, {
    method: 'get'
  })
}

//---------获取job进度----------
export async function getJobProgress (params) {
  return request(`/jobs/${params.id}/progress`, {
    method: 'get'
  })
}

//---------重试任务----------
export async function retryJob (params) {
  const { id } = params
  delete params['id']
  return request(`/jobs/${id}/retry`, {
    method: 'post',
    data: params,
  })
}
