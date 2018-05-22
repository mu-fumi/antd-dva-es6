/**
 * Created by zhangmm on 2017/10/30.
 */
import { request } from '../utils'

// 删除数据库
export async function deleteDatabase(params){
  return request(`/instances/${params.id}/databases/${params.uid}`, {
    method : 'delete'
  })
}

// 获取节点
export async function getNodes(params){
  return request(`/instances/${params.id}`, {
    method : 'get'
  })
}

// 获取url
export async function getUrl(params){
  return request(`/redirect/phpmyadmin?id=${params.id}&node=${params.node}`, {
    method : 'get'
  })
}

// 是否存在数据库名
export async function dbExists(id,value){
  return request(`/instances/${id}/databases/exists?db_name=${value}`, {
    method : 'get'
  })
}

// 是否存在数据库账户
export async function accountExists(id,value){
  return request(`instances/${id}/accounts/exists?account_name=${value}`, {
    method : 'get'
  })
}

// 获取字符集
export async function getCharset(params){
  return request(`/instances/${params.id}/databases/charset`, {
    method : 'get'
  })
}

// 获取绑定账号
export async function getAccounts(params){
  return request(`/instances/${params.id}/databases/accounts`, {
    method : 'get'
  })
}

// 添加数据库
export async function addDatabase(params){
  return request(`/instances/${params.id}/databases`, {
    method : 'post',
    data:params.data
  })
}
