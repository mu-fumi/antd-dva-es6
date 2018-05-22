/**
 * Created by wengyian on 2017/10/24.
 */
import React from 'react'
import PropTypes from 'prop-types'
import { classnames, constant } from 'utils'
import { Tooltip, Badge, Row } from 'antd'
import { Link } from 'dva/router'

const { HISTORY_OPTIONS } = constant

export default class TaskState extends React.Component{


  render(){
    let { type , id, sync_val } = this.props
   /*  PEDDING : 0, //运行中
    FINISH : 1, // 完成
    FATAL : 2, // 失败
    TIMEOUT : 3, // 超时*/
    let prompt = '', status = ''
    switch (type){
      default:
      case HISTORY_OPTIONS.PEDDING:
        status = 'processing'
        prompt = '运行中...'
        break
      case HISTORY_OPTIONS.FINISH:
        status = 'success'
        prompt = '完成'
        break
      case HISTORY_OPTIONS.FATAL:
        status = 'error'
        prompt = '失败'
        break
      case HISTORY_OPTIONS.TIMEOUT:
        status = 'warning'
        prompt = '超时'
        break
    }

    if(sync_val !== 1){
      return  <Tooltip title="同步任务暂无任务详情">
        <span><Badge status={status}/></span>
      </Tooltip>
    }else{
      return (
        <Link to={`/job/${id}`}>
          <Tooltip title="异步任务查看任务详情">
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
