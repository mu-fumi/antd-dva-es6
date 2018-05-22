/**
 * Created by wengyian on 2017/6/26.
 */
import { request } from '../utils'

// 获取最后修改者
export async function getUsers() {
  return request('/users', {
    method : 'get',
    data : {
      all : 1
    }
  })
}

// 删除定时任务
export async function deleteSchedule(id){
  return request(`/crontab/${id}`, {
    method : 'delete'
  })
}

// 修改定时任务运行状态
export async function changeScheduleStatus(params) {
  return request(`/crontab/${params.id}`, {
    method : 'patch',
    data : {
      pause : params.pause
    }
  })
}

// 获取全部工具
export async function getTools() {
  return request('/tools', {
    method : 'get',
    data : {
      all : 1
    }
  })
}

// 新建定时任务
export async function submitAddSchedule(params) {
  return request('/crontab', {
    method : 'post',
    data : params
  })
}

// 编辑定时任务
export async function submitEditSchedule(params){
  return request(`/crontab/${params.id}`, {
    method : 'patch',
    data : params.data
  })
}

// 获取单项定时任务
export async function getSchedule(id) {
  return request(`/crontab/${id}`, {
    method : 'get'
  })
}
