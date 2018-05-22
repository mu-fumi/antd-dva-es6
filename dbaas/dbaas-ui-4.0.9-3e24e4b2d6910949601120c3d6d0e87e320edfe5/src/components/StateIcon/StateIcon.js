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
import styles from './StateIcon.less'

const { CLUSTER_STATE } = constant

class StateIcon extends React.Component{

  render() {
    let { status = '', type = 0 } = this.props;
    // 0：运行中， 1：升级中， 2：规模调整中， -2：异常， -2：创建中， -3：删除中
    //
    let prompt = ''
    switch (type){
      default:
      case CLUSTER_STATE.RUNNING :
        status = 'success'
        prompt = '运行中'
        break
      case CLUSTER_STATE.UPDATING :
        prompt = '升级中'
        status = 'processing'
        break
      case CLUSTER_STATE.ADJUSTING :
        prompt = '规模调整中'
        status = 'processing'
        break
      case CLUSTER_STATE.ABNORMAL :
        prompt = '异常'
        status = 'error'
        break
      case CLUSTER_STATE.CREATING :
        prompt = '创建中'
        status = 'processing'
        break
      case CLUSTER_STATE.DELETING :
        prompt = '删除中'
        status = 'warning'
        break
    }

    return (
    <Tooltip title={prompt}>
      <span className={styles['state-icon']}>
        <Badge status={status}></Badge>
      </span>
    </Tooltip>

    )
  }
}

StateIcon.propTypes = {
  type: PropTypes.number,
}

export default StateIcon
