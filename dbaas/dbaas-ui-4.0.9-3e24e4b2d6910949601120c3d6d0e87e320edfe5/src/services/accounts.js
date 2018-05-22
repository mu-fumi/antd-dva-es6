import { request } from 'utils'

export async function submit (params) {
  return request('/db-account/manage', {
    method: 'post',
    data: params,
  })
}
