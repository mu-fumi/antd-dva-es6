/**
 * Created by lizzy on 2018/4/26.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { classnames, constant } from 'utils'
import { Badge, Tooltip } from 'antd'

const { ACCOUNT_DATABASE_STATUS_BADGE } = constant

class StatusBadge extends React.Component{

  render() {
    let { type, className = '' } = this.props;

    // 0: WORKING/运行; 1:UPDATING/升级中; 2:SCALING/规模调整中; -2:ABNORMAL/异常; -1: CREATING/创建中; -3:DELETING/删除中
    let prompt = ''
    switch (type){
      default:
      case ACCOUNT_DATABASE_STATUS_BADGE.SCALING:
        type = 'processing'
        prompt = '规模调整中'
        break
      case ACCOUNT_DATABASE_STATUS_BADGE.UPDATING:
        type = 'processing'
        prompt = '升级中...'
        break
      case ACCOUNT_DATABASE_STATUS_BADGE.WORKING:
        type = 'success'
        prompt = '运行中'
        break
      case ACCOUNT_DATABASE_STATUS_BADGE.CREATING:
        type = 'processing'
        prompt = '创建中'
        break
      case ACCOUNT_DATABASE_STATUS_BADGE.ABNORMAL:
        type = 'error'
        prompt = '异常'
        break
      case ACCOUNT_DATABASE_STATUS_BADGE.DELETING:
        type = 'processing'
        prompt = '删除中'
        break
    }

    return (
      <Tooltip title={prompt}>
        <span>
          <Badge status={type} />
        </span>
      </Tooltip>

    )
  }
}

StatusBadge.propTypes = {
  type: PropTypes.number,
}

export default StatusBadge
