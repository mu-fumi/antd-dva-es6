import { request } from '../utils'

//添加程序包
export async function addPackage (params) {
  return request('/packages', {
    method: 'post',
    data: params,
  })
}
//获取程序包信息
export async function getPackageInfo (id) {
  return request(`/packages/${id}`, {
    method: 'get'
  })
}
//上传文件
export async function upload (params) {
  return request(`/packages/${params.pkgid}/uploads`, {
    method: 'upload',
    data:params.file
  })
}
//更改程序包版本号备注
export async function updateMemoInfo (params) {
  return request(`/packages/${params.id}/${params.version}`, {
    method: 'patch',
    data:params.memo
  })
}
//删除版本
export async function deleteVersionInfo (params) {
  return request(`/packages/${params.id}/${params.version}`, {
    method: 'delete'
  })
}
//新建版本
export async function commit (params) {
  return request(`/packages/${params.id}/version`, {
    method: 'post',
    data:params.formData
  })
}
//修改的程序包信息
export async function editPackageInfo (params) {
  return request(`/packages/${params.id}`, {
    method: 'patch',
    data:params.formData
  })
}
//删除程序包
export async function deletePackage (params) {
  return request(`/packages/${params.id}`, {
    method: 'delete'
  })
}
//获取版本列表
export async function getVersion (params) {
  return request(`/packages/${params.id}/version`, {
    method: 'get'
  })
}
//删除文件夹下的所有文件
export async function deleteAllFile (params) {
  return request(`/packages/${params.id}/file`, {
    method: 'delete',
    data:{
      filepath:params.filepath
    }
  })
}
//删除指定文件
export async function deleteFile (params) {
  return request(`/packages/file/${params.id}/info`, {
    method: 'delete',
    data:{
      filepath:params.name
    }
  })
}
//获取指定文件列表信息，防止提交重复的文件夹或文件
export async function getAllFile (params) {
  return request(`/packages/file/${params.id}/info`, {
    method: 'get',
    data:{
      filepath:params.filepath,
      page:0//不为0则是不分页的列表数据
    }
  })
}
//获取指定文件信息
export async function getFileInfo (params) {
  return request(`/packages/file/${params.id}/info`, {
    method: 'get',
    data:{
      filepath:params.name
    }
  })
}
//获取指定文件信息(版本文件)
export async function getVersionFileInfo (params) {
  return request(`/packages/file/${params.id}/${params.version}/info`, {
    method: 'get',
    data:{
      filepath:params.name
    }
  })
}
//修改指定文件
export async function editFileInfo (params) {
  return request(`/packages/file/${params.id}/info`, {
    method: 'patch',
    data:{
      filepath:params.name,
      content:params.content,
      originName: params.originName,
      binary:params.binary
    }
  })
}
//获取版本变更列表
export async function changedList (params) {
  return request(`/packages/${params.id}/version/list`, {
    method: 'get',
    data:{
      page:0
    }
  })
}
//新增文件
export async function addFileInfo (params) {
  return request(`/packages/${params.id}/add`, {
    method: 'post',
    data:{
      filepath:params.filepath,
      content:params.content,
      name:params.name,
      type:params.type
    }
  })
}
//新增路径
export async function createPath (params) {
  return request(`/packages/${params.id}/add`, {
    method: 'post',
    data:{
      filepath:params.filepath,
      name:params.name,
      type:params.type
    }
  })
}
//压缩程序包
export async function compressPackage (params) {
  return request(`/packages/${params.id}/${params.version}/compress`, {
    method: 'post'
  })
}

//导入
export async function importPackage (params) {
  return request(`/packages/${params.id}/import`, {
    method: 'post',
    data:{
      filepath:params.path
    }
  })
}

//获取的程序包版本信息
export async function getVersionInfo (params) {
  return request(`/packages/version/${params.id}/info`, {
    method: 'get'
  })
}
//修改的程序包版本信息
export async function editVersion (params) {
  return request(`/packages/${params.pkgid}/${params.id}`, {
    method: 'patch',
    data:params.values
  })
}
