/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-05-05 18:04 $
 */

import { request } from 'utils'

export async function list (params) {
  return request('/nodes', {
    method: 'get',
    data: params,
  })
}