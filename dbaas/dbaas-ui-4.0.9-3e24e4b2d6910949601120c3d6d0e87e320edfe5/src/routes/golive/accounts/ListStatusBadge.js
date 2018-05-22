/**
 * Created by lizzy on 2018/4/26.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { classnames, constant } from 'utils'
import { Badge, Tooltip } from 'antd'

const { ACCOUNT_LIST_STATUS_BADGE } = constant

class ListStatusBadge extends React.Component{

  render() {
    let { type, className = '' } = this.props;

    // 1:SUCCESS/成功; 2:PROCESSING/进行中; 3:ERROR/失败
    let prompt = ''
    switch (type){
      default:
      case ACCOUNT_LIST_STATUS_BADGE.SUCCESS:
        type = 'success'
        prompt = '成功'
        break
      case ACCOUNT_LIST_STATUS_BADGE.PROCESSING:
        type = 'processing'
        prompt = '进行中...'
        break
      case ACCOUNT_LIST_STATUS_BADGE.ERROR:
        type = 'error'
        prompt = '失败'
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

ListStatusBadge.propTypes = {
  type: PropTypes.number,
}

export default ListStatusBadge
