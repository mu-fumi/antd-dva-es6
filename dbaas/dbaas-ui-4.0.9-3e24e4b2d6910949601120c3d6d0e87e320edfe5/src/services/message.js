import { request } from '../utils'

export async function getNewMessage (params) {
  return request('/api/v1/messages/latest', {
    method: 'get',
    data: params,
  })
}

export async function message (id) {
  return request(`/jobs/${id}`, {
    method: 'get',
    data: [],
  })
}

export async function retry (id) {
  return request(`/jobs/${id}/retry`, {
    method: 'post',
    data: [],
  })
}

//将消息列表中标记为未读的数据修改成已读
export async function read (params) {
  return request(`/messages/mark/read`, {
    method: 'patch',
    data: params,
  })
}
