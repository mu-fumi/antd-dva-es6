/**
 * Created by wengyian on 2017/10/26.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { classnames, constant } from 'utils'
import { Badge, Tooltip } from 'antd'

const { PROGRESS } = constant

class ProgressBadge extends React.Component{

  render() {
    let { type, className = '' } = this.props;

    //-1:not start,0:pedding,1:finish,2:fatal,3:timeout, -2 : not pass
    let prompt = ''
    switch (type){
      default:
      case PROGRESS.NOT_START:
        type = 'default'
        prompt = '未开始'
        break
      case PROGRESS.PEDDING:
        type = 'processing'
        prompt = '执行中...'
        break
      case PROGRESS.FINISH:
        type = 'success'
        prompt = '完成'
        break
      case PROGRESS.FATAL:
        type = 'error'
        prompt = '失败'
        break
      case PROGRESS.TIMEOUT:
        type = 'warning'
        prompt = '超时'
        break
      case PROGRESS.NOT_PASS:
        type = 'default'
        prompt = '未投递'
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

ProgressBadge.propTypes = {
  type: PropTypes.number,
}

export default ProgressBadge
