/**
 * Created by wengyian on 2017/10/24.
 */
import React from 'react'
import PropTypes from 'prop-types'
import { classnames, constant } from 'utils'
import { Tooltip, Badge, Row } from 'antd'
import { Link } from 'dva/router'

const { PROGRESS } = constant

export default class TaskState extends React.Component{


  render(){
    let { type , id } = this.props
    // 'NOT_START': -1, 'PEDDING': 0, 'FINISH': 1, 'FATAL': 2, 'TIMEOUT': 3, 'NOT_PASS' : -2,

    let prompt = '', status = ''
    switch (type){
      default:
      case PROGRESS.NOT_START:
        status = 'default'
        prompt = '未开始'
        break
      case PROGRESS.PEDDING:
        status = 'processing'
        prompt = '执行中...'
        break
      case PROGRESS.FINISH:
        status = 'success'
        prompt = '完成'
        break
      case PROGRESS.FATAL:
        status = 'error'
        prompt = '失败'
        break
      case PROGRESS.TIMEOUT:
        status = 'warning'
        prompt = '超时'
        break
      case PROGRESS.NOT_PASS:
        status = 'progress'
        prompt = '未投递'
        break
    }

    if(id === 0){
      return  <Tooltip title={prompt}>
        <span><Badge status={status}/></span>
      </Tooltip>
    }else{
      return (
        <Link to={`/job/${id}`}>
          <Tooltip title={prompt}>
            <span><Badge status={status}/></span>
          </Tooltip>
        </Link>
      )
    }
  }
}

TaskState.propTypes = {
  id : PropTypes.number,
  type : PropTypes.number
}
