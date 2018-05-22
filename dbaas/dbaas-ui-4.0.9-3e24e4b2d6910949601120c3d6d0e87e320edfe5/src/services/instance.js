/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-04-19 18:25 $
 */

import { request } from 'utils'

export async function list (params) {
  return request('/instances', {
    method: 'get',
    data: params,
  })
}