/**
 * Created by wengyian on 2017/10/23.
 */
/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-04-11 17:07 $
 */
import React from 'react'
import PropTypes from 'prop-types'
import { classnames, constant } from 'utils'
import { Tooltip, Badge, Row } from 'antd'
import styles from './NodeRunBadge.less'
import _ from 'lodash'

const { NODE_STATE } = constant

class NodeRunBadge extends React.Component{

  render() {
    let { status = '', type = 0 } = this.props;
    // 0：运行中， 1：启动中， -2：异常， -1：创建中， -3：删除中
    //
    let prompt = ''
    let isObject =false
    let message = ''

    if(_.isPlainObject(type)){
      isObject = true
      message = type.message
      type = type.status
    }

    switch (type){
      default:
      case NODE_STATE.RUNNING :
        status = 'success'
        prompt = '运行中'
        break
      case NODE_STATE.RESTARTING :
        prompt = '启动中'
        status = 'processing'
        break
      case NODE_STATE.CREATING :
        prompt = '创建中'
        status = 'processing'
        break
      case NODE_STATE.ABNORMAL :
        prompt = '异常'
        status = 'error'
        isObject && (prompt = message)
        break
      case NODE_STATE.DELETING :
        prompt = '删除中'
        status = 'warning'
        break
    }

    return (
      <Tooltip title={prompt}>
        <span style={{cursor : 'pointer'}} className={styles["badge-container"]}>
          <Badge status={status}></Badge>
        </span>
      </Tooltip>
    )
  }
}

NodeRunBadge.propTypes = {
  type: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.number,
    PropTypes.object
  ]),
}

export default NodeRunBadge
