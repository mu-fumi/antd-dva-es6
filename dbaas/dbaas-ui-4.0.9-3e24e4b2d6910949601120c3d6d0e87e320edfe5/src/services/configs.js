/**
 * Created by zhangmm on 2017/10/11.
 */
import { request } from '../utils'

// 获取套件类型
export async function getStackOption(param){
  return request('/stack/summary', {
    method : 'get'
  })
}

//获取配置项
export async function getConfigure(param){
  return request('/configure/list', {
    method : 'get',
    data : param
  })
}

//获取节点的配置
export async function getNodeConfigs(param){
  return request(`/configure/list/${param.id}`, {
    method : 'get',
  })
}

//配置变更
export async function changeConfigure(param){
  return request('/configure/alteration', {
    method : 'post',
    data : param
  })
}

//节点配置变更
export async function changeNodeConfigure(param,id){
  return request(`/configure/alteration/${id}`, {
    method : 'post',
    data : param
  })
}
