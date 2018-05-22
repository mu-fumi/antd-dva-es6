/**
 * Created by wengyian on 2018/3/30.
 */
import { request, Logger } from 'utils'
import Json from 'utils/json'
import io from 'socket.io-client'

// const WebSocket = require('ws')


let ws = null
let timer = ''


export function socketService(url, action) {
  const path = 'ws://' + window.location.host + url
  // const path = 'ws://' + '172.16.17.30:8002' + url
  // Logger.info('path===>', path)

  ws = ws || io(path)
  Logger.info('ws===>', ws)
  ws.on('connect', () => {
    Logger.info('socket connect...')
  })
  ws.on('error', (error) => {
    Logger.info('socket error...', error)
  })
  ws.on('message', (data) => {
    Logger.info('socket message...', data)
  })
  ws.on('disconnect', () => {
    Logger.info('socket disconnect...')
  })
  // ws.on('open', function open() {
  //   Logger.info('WebSocket open ...')
  // })
  // ws.on('message', function incoming(data) {
  //   Logger.info('WebSocket incoming data')
  //   Logger.info('data===>', data)
  // })
  // ws.on('close', function close() {
  //   Logger.info('WebSocket close ...')
  // })
  // ws.on('error', function error() {
  //   Logger.info('WebSocket error ...')
  // })
}
