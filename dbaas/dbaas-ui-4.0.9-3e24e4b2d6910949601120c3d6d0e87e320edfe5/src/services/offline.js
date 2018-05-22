/**
 * Created by wengyian on 2017/9/4.
 */

import { request } from '../utils'

export async function offline(data) {
  return request('/deploy/delete', {
    method : 'delete',
    data : data
  })
}
