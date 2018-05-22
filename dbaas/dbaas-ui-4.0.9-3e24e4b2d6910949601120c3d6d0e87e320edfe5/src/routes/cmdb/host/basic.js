/**
 *
 * @copyright(c) 2017
 * @created by  zhangmm
 * @package dbaas-ui
 * @version :  2017-09-15 10:41 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Tooltip, Badge } from 'antd'
import { DataTable, Layout, Search, ProgressIcon, IconFont, Filter, TablePanel } from 'components'
import { routerRedux, Link } from 'dva/router'
import styles from './detail.less'
import { constant } from 'utils'
import Json from 'utils/json'

const { HOST_BASIC, HOST_STATUS } = constant

class Basic extends React.Component {

  render() {
    const { basic } = this.props

    const host_name_var =
      <span>{basic.host_name}
        <Link to={`/graphs?host_id=${basic.id}`} target="_blank">
            <Tooltip title="查看监控">
              <IconFont type='iconfont-trend' className='trend-icon'>
              </IconFont>
            </Tooltip>
        </Link>
      </span>

    const agent_status_func = (value) =>{
      let text = ''
      switch(Number(value)){
        case HOST_STATUS.HOST_NOT_INIT:
          text = '环境未初始化'
          break
        case HOST_STATUS.HOST_RUNNING:
          text = '运行中'
          break
        case HOST_STATUS.HOST_AGENT_ABNORMAL:
          text = 'Agent 异常'
          break
      }
      return (<span>{text}</span>)
    }

    const agent_status_var = agent_status_func(basic.agent_status)

    const connect_status_func = (value) =>{
      let text = ''
      switch(Number(value)){
        case HOST_STATUS.HOST_NOT_INIT:
          text = '环境未初始化'
          break
        case HOST_STATUS.HOST_RUNNING:
          text = '运行中'
          break
        case HOST_STATUS.HOST_AGENT_ABNORMAL:
          text = 'Agent 异常'
          break
        case HOST_STATUS.HOST_SSH_ABNORMAL:
          text = 'SSH 连接异常'
          break
      }
      return (<span>{text}</span>)
    }

    const connect_status_var = connect_status_func(basic.connect_status)

    const type_var = basic.type === 0 ? '普通主机' :
        (basic.type === 1 ? 'RHCS 主机' : 'RHCS 备机')


    const real_memory_var = basic && basic.real_memory ? basic.real_memory + ' MB' : ''

    const processor_var = basic.processor

    const render = {
      host_name:host_name_var,
      agent_status:agent_status_var,
      connect_status:connect_status_var,
      type:type_var,
      processor:processor_var,
      real_memory:real_memory_var
    }
    return (
      <Row className={styles.basic}>
        {
          Object.keys(HOST_BASIC).map((v,k) =>{
            if( (k + 1) % 2 === 0 ){
              return (
                <Col key={k} span={15} className="right-col" style={{wordWrap:'break-word'}}>
                  <span>{HOST_BASIC[v]}：</span>
                  <span style={{color:'black'}}>{render[v] || basic && basic[v] || '无'}</span>
                </Col>
              )
            }else{
              return (
                <Col key={k} span={9} className="left-col" style={{wordWrap:'break-word'}}>
                  <span>{HOST_BASIC[v]}：</span>
                  <span style={{color:'black'}}>{render[v] || basic && basic[v] || '无'}</span>
                </Col>
              )
            }
          })
        }
      </Row>
    )
  }
}

Basic.propTypes = {
  basic: PropTypes.object,
}

export default Basic
