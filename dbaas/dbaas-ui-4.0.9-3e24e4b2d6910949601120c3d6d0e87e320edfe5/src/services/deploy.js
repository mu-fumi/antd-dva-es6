/**
 * Created by wengyian on 2017/8/16.
 */
import { request } from '../utils'


// 获取套件列表
export async function getStack(data){
  return request('/stack/summary', {
    method : 'get',
    data : data
  })
}


// 获取某套件服务列表
export async function getService(id){
  return request('/service/list', {
    method : 'get',
    data : {
      stack_id : id
    }
  })
}

// 获取服务的配置信息
export async function getConfig(params){
  return request('/stack/service/configure', {
    method : 'get',
    data : params
  })
}

// 获取套件标签
export async function getStackTags() {
  return request('/stack/tag', {
    method : 'get',
  })
}

// 提交部署信息
export async function deploy(data){
  return request('/stack-deploy', {
    method : 'post',
    data : data
  })
}

// 验证部署名字重名
export async function existDeployName(name, stack_id, app_id) {
  return request('/deploy/duplicate', {
    method : 'get',
    data : {
      name,
      stack_id,
      app_id
    }
  })
}

// 获取业务信息 不分页
export async function getBusinesses(data) {
  return request('/businesses', {
    method : 'get',
    data : {
      ...data,
      paging : 0
    }
  })
}

// 获取应用信息 不分页
export async function getApps(data) {
  return request('/applications', {
    method : 'get',
    data : {
      business_id : data,
      paging : 0
    }
  })
}


// 获取数据库内存范围
export async function getMemoryRange(id) {
  return request('/stack/memory/range', {
    method : 'get',
    data : {
      stack_id : id,
    }
  })
}


// 部署第二步使用模板
export async function getTemplate(id) {
  return request('/template', {
    method : 'get',
    data : {
      stack_id : id
    }
  })
}

// 获取 chunkkeeper zookeeper 列表
export async function getQuorum(data) {
  return request('/quorum', {
    method : 'get',
    data : data
  })
}


// 验证 chunk 名是否重复
export async function validateChunkName(data) {
  return request('/deploy/duplicate-chunk', {
    method: 'post',
    data: data
  })
}
