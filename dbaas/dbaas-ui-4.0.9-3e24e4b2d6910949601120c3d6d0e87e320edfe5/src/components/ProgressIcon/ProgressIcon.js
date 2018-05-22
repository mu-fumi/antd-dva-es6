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
import { Icon, Tooltip } from 'antd'

const { PROGRESS } = constant

class ProgressIcon extends React.Component{

  render() {
    let { type, className = '' } = this.props;

    //-1:not start,0:pedding,1:finish,2:fatal,3:timeout, -2 : not pass
    let prompt = ''
    switch (type){
      default:
      case PROGRESS.NOT_START:
        type = 'minus-circle-o'
        className = classnames('text-muted', 'text-bold', className)
        prompt = '未开始'
        break
      case PROGRESS.PEDDING:
        type = 'clock-circle-o'
        className = classnames('text-warning', 'text-bold', className)
        prompt = '执行中...'
        break
      case PROGRESS.FINISH:
        type = 'check-circle-o'
        className = classnames('text-success', 'text-bold', className)
        prompt = '完成'
        break
      case PROGRESS.FATAL:
        type = 'close-circle-o'
        className = classnames('text-error', 'text-bold', className)
        prompt = '失败'
        break
      case PROGRESS.TIMEOUT:
        type = 'exclamation-circle-o'
        className = classnames('text-warning', 'text-bold', className)
        prompt = '超时'
        break
      case PROGRESS.NOT_PASS:
        type = 'question-circle-o'
        className = classnames('text-muted', 'text-bold', className)
        prompt = '未投递'
        break
    }

    return (
    <Tooltip title={prompt}>
      <Icon {...this.props} className={className} type={type} />
    </Tooltip>

    )
  }
}

ProgressIcon.propTypes = {
  type: PropTypes.number,
  className: PropTypes.string
}

export default ProgressIcon
