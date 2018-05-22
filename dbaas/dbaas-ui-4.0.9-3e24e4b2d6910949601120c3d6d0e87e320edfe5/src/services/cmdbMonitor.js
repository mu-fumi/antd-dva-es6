/**
 * Created by wengyian on 2017/9/7.
 */

import { request } from 'utils'

export async function getCluster(id) {
  return request(`/deploy/cluster/${id}`, {
    method : 'get',
  })
}
export async function getInstance(id) {
  return request(`/deploy/instance/${id}`, {
    method : 'get',
  })
}

export async function getPwd(data) {
  return request(`/instances/${data.id}/password`, {
    method : 'post',
    data : {
      user_password : data.pwd
    }
  })
}

export async function switchMaster(data) {
  return request(`/instance/${data.id}/switch_master`, {
    method : 'post',
    data : {
      cur_id : data.cur_id,
      next_id : data.next_id
    }
  })
}

export async function getSet(id) {
  return request(`/deploy/set/${id}`, {
    method : 'get'
  })
}
