import fetch from 'dva/fetch';
import Cache from './cache'
import Logger from './logger'
import Json from './json'
import { browserHistory } from 'dva/router';
import constant  from './constant'

const parseJSON = (response) => {
  Logger.debug('utils.request get response ===>', response)
  return response.json()
}

const checkStatus = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(Json.dumps({status: response.status, statusText: response.statusText}));
  error.response = response;

  Logger.error('utils.request get error ===>', error)

  throw error;
}

const checkRedirect = (response) => {
  //判断token是否过期
  if (response.code && [1401].includes(response.code)) {
    const error = new Error('token 已过期, 请重新登录')
    error.response = response;

    Logger.error('utils.request checkToken error ===>', error)

    window.location.href = '/login'
    throw error
  }
  //判断有没有访问权限
  if (response.code && [1403, 1405].includes(response.code)) {
    const error = new Error('没有权限访问')
    error.response = response;

    Logger.error('utils.request permission error ===>', error)

    window.location.href = '/exception/403'
    throw error
  }
  return response
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} uri       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(uri, options) {
  const method = (options.method).toUpperCase()
  const data = options.data
  let url = '/api/v2' + uri
  const cookie = new Cache('cookie')

  let defaults = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  };
  let token = cookie.get('token')
  if (token) {
    defaults['headers']['Authorization'] = 'Bearer ' + token
  }
  let reg = /(\/\w*)?\/login$/
  let href = window.location.href
  if(reg.test(href)){
    let ClientName = href.match(reg)[1] ? href.match(reg)[1] : constant.DEFAULT_NAME
    defaults['headers']['ClientName'] = ClientName
  }

  if (method === 'GET' && typeof data === 'object') {
    let params = Object.keys(data).map((v, k)=> {
      if(data[v] !== undefined){
        return encodeURIComponent(v) + '=' + encodeURIComponent(data[v])
      }
    }).filter((v) => { return v }).join('&')
    if(params.length > 0) url += '?' + params
  }

  if (method === 'POST' || method === 'PATCH' || method === 'PUT' || method === 'DELETE') {
    defaults['body'] = JSON.stringify(data);
  }
  if (method === 'UPLOAD'){
    defaults['body'] = data;
    //defaults['headers']['Content-Type'] = 'multipart/form-data'
    defaults['method'] = 'POST'
    defaults['headers']['Accept'] = '*/*'
    defaults['headers']['x-provider'] = 'set'
    delete defaults['headers']['Content-Type']
  }

  Logger.debug('utils.request start ===>', [url, defaults])

  return fetch(url, defaults)
    .then(checkStatus)
    .then(parseJSON)
    .then(checkRedirect)
    .catch(error => {

      Logger.error('utils.request catch ===>', error, error.message )

      const message = Json.loads(error.message)

      let res = {error: error.message || '请求错误'}

      if (message instanceof Object) {
        message.status && (res['code'] =  message.status)
        message.statusText && (res['error'] =  message.statusText)
      }

      return res
    })
}
