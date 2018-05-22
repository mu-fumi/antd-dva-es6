import { request } from '../utils'


export async function generateReport (params) {
  return request('/reports', {
    method: 'post',
    data: params,
  })
}

// 获取报告错误信息
export async function getReportError (id) {
  return request(`/reports/${id}`, {
    method: 'get'
  })
}

/*// 获取节点信息
export async function getNodes () {
  return request('/node/report/list', {
    method: 'get'
  })
}*/

// 获取MySQL节点信息
export async function getMysqlNodes () {
  return request('/node/report/list', {
    method: 'get'
  }).then( (response) => {
    // console.log(response)
    if (response.code === 0) {
      response.data = response.data['MySQL/Nodeguard'] || response.data['MySQL']
    }
    return response
  })
}

// 获取灰度列表
export async function getGrayList() {
  return request('/node/belong/names', {
    method: 'get'
  })
}

// 获取或者提交配置信息列表 获取get 提交post
export async function settingReport({method = 'get', data = undefined}) {
  return request('/reports/healthcheck/setting', {
    method,
    data,
  })
}

// 获取或者提交配置信息列表 获取get 提交post
export async function settingDailyReport({method = 'get', data = undefined}) {
  return request('/reports/dailycheck/setting', {
    method,
    data,
  })
}
// 获取所属套件信息
export async function getStack(data) {
  return request('/stack/summary', {
    method : 'get',
    data : data
  })
}

// 获取业务信息  所属
export async function getBusinesses(data) {
  return request('/businesses', {
    method : 'get',
    data : {
      ...data,
      paging : 0
    }
  })
}

// 获取应用信息
export async function getApps(data) {
  return request('/applications', {
    method : 'get',
    data : {
      business_id : data,
      paging : 0
    }
  })
}

// 获取集群信息  其他功能页面
export async function getClusters(data) {
  return request('/deploy/app/clusters', {
    method : 'get',
    data : data
  })
}

// 获取集群信息   节前巡检
export async function getCluster(data) {
  return request('/deploy/cluster/list', {
    method : 'get',
    data : data
  })
}

// 获取实例组信息
export async function getSets(data) {
  return request('/deploy/app/sets', {
    method : 'get',
    data : data
  })
}

// 获取实例组信息
export async function getSet(data) {
  return request('/deploy/set/list', {
    method : 'get',
    data : data
  })
}

// 获取实例信息
export async function getInstance(data) {
  return request('/deploy/app/instances', {
    method : 'get',
    data : data
  })
}
// 获取实例信息 节前巡检
export async function getInstance1(data) {
  return request('/deploy/instance/list', {
    method : 'get',
    data : data
  })
}

export async function getNodes(data) {
  return request('/node', {
    method : 'get',
    data : data
  })
}
//一键检查 获取节点
export async function getNodesQuick(data) {
  return request('/node/report/list', {
    method : 'get',
    data : data
  })
}

