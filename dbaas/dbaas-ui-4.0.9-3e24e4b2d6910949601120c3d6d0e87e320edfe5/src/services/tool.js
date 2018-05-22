import { request } from '../utils'

export async function getToolTags (params) {
  return request(`/toolTags`, {
    method: 'get',
    data: params,
  })
}

export async function getTools (params) {
  return request(`/tools`, {
    method: 'get',
    data: params,
  })
}

export async function deleteTag (params) {
  const { id } = params
  delete params['id']
  return request(`/toolTags/${id}`, {
    method: 'delete',
    data: params,
  })
}

export async function createTool (params) {
  return request(`/tools`, {
    method: 'post',
    data: params,
  })
}

export async function startDebugging (params) {
  return request(`/tools/debug`, {
    method: 'post',
    data: params,
  })
}

export async function executeDebugging (params) {
  const { id } = params
  delete params['id']
  return request(`/tools/${id}/execute`, {
    method: 'post',
    data: params,
  })
}

export async function getToolDetail (params) {
  const { id } = params
  delete params['id']
  return request(`/tools/${id}`, {
    method: 'get',
    data: params,
  })
}

export async function updateTool (params) {
  const { id } = params
  delete params['id']
  return request(`/tools/${id}`, {
    method: 'patch',
    data: params,
  })
}

export async function deleteTool (params) {
  const { id } = params
  delete params['id']
  return request(`/tools/${id}`, {
    method: 'delete',
    data: params,
  })
}
