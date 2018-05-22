/**
 * Created by wengyian on 2018/2/26.
 */
import { request } from 'utils'

export async function uploadQuorum(data) {
  return request('/quorum/import', {
    method : 'upload',
    data : data
  })
}
