import { request } from 'utils'

export async function login (params) {
  return request('/login', {
    method: 'post',
    data: params,
  })
}

export async function logout (params) {
  return request('/logout', {
    method: 'post',
    data: params,
  })
}

export async function getlatestMsgs (params) {
  return request('/messages/latest', {
    method: 'get',
    data: params,
  })
}

export async function editSetting (params) {
  return request('/users/self', {
    method: 'patch',
    data: params,
  })
}

export async function clearMsg (params) {
  return request('/messages/mark/read', {
    method: 'patch',
    data: params,
  })
}

