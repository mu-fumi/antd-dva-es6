/**
 *
 * @copyright(c) 2017
 * @created by  zhangmm
 * @package dbaas-ui
 * @version :  2017-08-09 18:04 $
 */

import { request } from 'utils'

//新增客户
export async function addClient (params) {
  return request(`/client`, {
    method: 'post',
    data:params
  })
}

//删除客户
export async function deleteClient (params) {
  return request(`/client/${params.id}`, {
    method: 'delete'
  })
}

//修改客户
export async function editClient (params, id) {
  return request(`/client/${id}`, {
    method: 'patch',
    data:params
  })
}

//获取指定客户信息
export async function getClient (params) {
  return request(`/client/${params.id}`, {
    method: 'get'
  })
}

//获取权限信息
export async function getPermissions (params) {
  return request(`/permissions`, {
    method: 'get',
    data: params
  })
}

//-------角色管理--------
//新增角色
export async function addRole (params) {
  return request(`/roles`, {
    method: 'post',
    data:params
  })
}

//删除角色
export async function deleteRole (params) {
  return request(`/roles/${params.id}`, {
    method: 'delete'
  })
}

//修改角色
export async function editRole (params, id) {
  return request(`/roles/${id}`, {
    method: 'patch',
    data:params
  })
}

//获取指定权限信息
export async function getRole (params) {
  return request(`/roles/${params.id}`, {
    method: 'get'
  })
}

//-------主机管理--------
//修改主机(已改)
export async function editHost (params,id) {
  return request(`/hosts/${id}`, {
    method: 'patch',
    data:params
  })
}

//修改主机IP(已改)
export async function editHostIP (params,name) {
  return request(`/hosts/names/${name}`, {
    method: 'patch',
    data:params
  })
}

//删除主机(已改)
export async function deleteHost (params) {
  return request(`/hosts/${params.id}`, {
    method: 'delete'
  })
}

//批量删除主机(已改)
export async function deleteAllHost (params) {
  return request(`/hosts`, {
    method: 'delete',
    data:params
  })
}

//导入机器(已改)
export async function importHost (params) {
  return request(`/hosts/import`, {
    method: 'upload',
    data:params
  })
}

//获取指定主机IP信息(已改)
export async function getHostIP (params) {
  return request(`/hosts/names/${params.name}`, {
    method: 'get'
  })
}

//获取指定主机信息(已改)
export async function getHost (params) {
  return request(`/hosts/${params.id}`, {
    method: 'get'
  })
}

//获取指定主机基本信息(已改，改成fetch)
export async function getHostBasic (params) {
  return request(`/hosts/basic/${params.id}`, {
    method: 'get'
  })
}

//获取指定主机基本信息(已改，改成fetch)
export async function getHostExtend (params) {
  return request(`/hosts/extend/${params.id}`, {
    method: 'get'
  })
}

//获取城市(已改)
export async function getCity (params) {
  return request(`/hosts/config/city`, {
    method: 'get'
  })
}

//获取数据中心(已改)
export async function getIdc (params) {
  return request(`/hosts/config/idc`, {
    method: 'get'
  })
}

//获取类型(已改)
export async function getType (params) {
  return request(`/hosts/config/type`, {
    method: 'get'
  })
}

//获取连接方式(已改)
export async function getConnectType (params) {
  return request(`/hosts/config/connect_type`, {
    method: 'get'
  })
}

//获取主机配置(已改)
export async function getSetting (params) {
  return request(`/hosts/keys`, {
    method: 'get',
    data:params
  })
}

//修改主机展示字段(已改)
export async function changeShowSettings (params) {
  return request(`/hosts/keys/update`, {
    method: 'patch',
    data:params
  })
}

//默认恢复主机展示字段(已改)
/*export async function resetSettings (params) {
  return request(``, {
    method: 'post',
    data:params
  })
}*/

//-------用户管理--------
//新增用户
export async function addUser (params) {
  return request(`/users`, {
    method: 'post',
    data:params
  })
}

//删除用户
export async function deleteUser (params) {
  return request(`/users/${params.id}`, {
    method: 'delete'
  })
}

//修改用户
export async function editUser (params, id) {
  return request(`/users/${id}`, {
    method: 'patch',
    data:params
  })
}

//获取用户信息
export async function getUser (params) {
  return request(`/users/${params.id}`, {
    method: 'get'
  })
}

//获取角色
export async function getRoles (params) {
  return request(`/roles`, {
    method: 'get',
    data:params
  })
}

//-------实例组管理--------
//删除实例组
export async function deleteInstanceGroup (params) {
  return request(`/instanceGroup/${params.id}`, {
    method: 'delete'
  })
}

//-------应用管理--------
//新增应用(已改)
export async function addApp (params) {
  return request(`/applications`, {
    method: 'post',
    data:params
  })
}

//删除应用(已改)
export async function deleteApp (params) {
  return request(`/applications/${params.id}`, {
    method: 'delete'
  })
}

//修改应用(已改)
export async function editApp (params, id) {
  return request(`/applications/${id}`, {
    method: 'patch',
    data:params
  })
}

//获取应用信息(已改)
export async function getApp (params) {
  return request(`/applications/${params.id}`, {
    method: 'get'
  })
}

//获取用户列表(在用户管理列表、集群、业务、主机和应用管理Select中用到)（已改）
export async function getUsers (params) {
  return request(`/users/cmdb`, {
    method: 'get'
  })
}

//获取业务列表(应用管理Select中用到)（已改）
export async function getBusinesses (params) {
  return request(`/businesses`, {
    method: 'get',
    data:params
  })
}

//-------业务管理--------
//新增业务（已改）
export async function addBusiness (params) {
  return request(`/businesses`, {
    method: 'post',
    data:params
  })
}

//删除应用（已改）
export async function deleteBusiness (params) {
  return request(`/businesses/${params.id}`, {
    method: 'delete'
  })
}

//修改业务(已改)
export async function editBusiness(params , id){
  return request(`/businesses/${id}`, {
    method: 'patch',
    data: params
  })
}

//获取业务信息(已改)
export async function getBusiness (params) {
  return request(`/businesses/${params.id}`, {
    method: 'get'
  })
}

//-------集群管理--------
//新增集群（已改）
export async function addCluster (params) {
  return request(`/clusters`, {
    method: 'post',
    data:params
  })
}

//删除集群（已改）
export async function deleteCluster (params) {
  return request(`/clusters/${params.id}`, {
    method: 'delete'
  })
}

//修改集群(已改)
export async function editCluster(params , id){
  return request(`/clusters/${id}`, {
    method: 'patch',
    data: params
  })
}

//获取应用列表(集群管理Select中用到)(已改)
export async function getApplications (params) {
  return request(`/applications`, {
    method: 'get'
  })
}

//获取业务信息(已改)
export async function getCluster (params) {
  return request(`/clusters/${params.id}`, {
    method: 'get'
  })
}

//-------实例管理--------
//新增实例（已改）
export async function addInstance (params) {
  return request(`/instance`, {
    method: 'post',
    data:params
  })
}

//删除实例（已改）
export async function deleteInstance (params) {
  return request(`/instance/${params.id}`, {
    method: 'delete'
  })
}

//修改实例(已改)
export async function editInstance(params , id){
  return request(`/instance/${id}`, {
    method: 'patch',
    data: params
  })
}

//获取实例信息(已改)
export async function getInstance (params) {
  return request(`/instance/${params.id}`, {
    method: 'get'
  })
}

