/**
 * Created by wengyian on 2018/4/3.
 */
import React from 'react'
// import io from 'socket.io-client'
import {Logger} from 'utils'
import Json from 'utils/json'
import PropTypes from 'prop-types'
import {notification} from 'antd'
// import io from 'socket.io-client'

// const SockJs = require('sockjs-client')
// const websocket = require('isomorphic-ws')
const WebSocket = require('ws')

class SockComponent extends React.Component {
  constructor(props) {
    super(props)
    const ws = null
    this.state = {
      ws: ws,
    }

    this.handleMsg = this.handleMsg.bind(this)
  }

  componentWillMount() {
    let {ws} = this.state

    if (!ws) {
      ws = new WebSocket('ws://' + window.location.host + this.props.url)
    }

    const _this = this

    ws.onopen = function () {
      Logger.info('WebSocket open...')
    }
    ws.onmessage = function (event) {
      // Logger.info('WebSocket message... msg===>', msg)
      let msg = Json.loads(event.data)
      _this.handleMsg(msg)
    }
    ws.onclose = function () {
      Logger.info('WebSocket close...')
    }
    ws.onerror = function (error) {
      Logger.info('WebSocket error ===>', error)
    }

    this.setState({
      ws: ws
    })
  }

  handleMsg(msg) {
    if (typeof msg !== 'object') {
      return;
    }
    const { dispatch, location } = this.props
    // Logger.info('msg===>', msg)
    switch (msg.type) {
      case 'task':
        let type = msg.data.type === -1 ? 'error' :
          (msg.data.type === 0 ? 'info' : (msg.data.type === 1 ? 'success' : 'warn'));
        notification[type]({
          message: msg.data.title,
          description: msg.data.content
        });
        // todo 如果要与页面交互 可以直接使用 dispatch 来触发页面的一些行为
        // 可以根据 location.pathname 来判断是否在某些页面 来决定是否执行操作
        // 具体操作看后期交互情况决定
        // if(location.pathname === '/checkup/quick') {
        //   dispatch({
        //     type: 'quickCheck/setModalVisible',
        //     payload: true
        //   })
        // }
        break
      case 'message':
        break
      default:
        break;
    }
  }

  componentDidMount() {
    // Logger.info('didMount===>', this.state.ws)
    this.wsInterval = setInterval(() => {
      if (this.state.ws && this.props.user && this.state.ws.readyState === this.state.ws.OPEN) {
        const {name, email, uid} = this.props.user
        const data = {
          uid,
          email,
          user_name: name,
          loggedIn: this.props.loggedIn
        }
        // Logger.info('data===>', data)
        this.state.ws.send(JSON.stringify({
          'type': 'who',
          'data': data
        }))
      }
    }, 8000)
  }

  componentWillUnmount() {
    Logger.info('WebSocket componentWIllUnmount')
    this.state.ws.close()
    clearInterval(this.wsInterval)
  }

  render() {
    return <div></div>
  }
}

SockComponent.propTypes = {
  user: PropTypes.object,
  loggedIn: PropTypes.bool,
  url: PropTypes.string,
  dispatch: PropTypes.func,
}

export default SockComponent
