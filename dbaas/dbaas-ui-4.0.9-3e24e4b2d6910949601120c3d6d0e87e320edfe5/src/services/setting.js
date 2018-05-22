import { request } from 'utils'

export async function editSetting (params) {
  return request('/users/self', {
    method: 'patch',
    data: params,
  })
}
