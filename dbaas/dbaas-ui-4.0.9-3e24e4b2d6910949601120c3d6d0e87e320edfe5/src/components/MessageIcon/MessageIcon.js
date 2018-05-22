/**
 *
 * @copyright(c) 2017
 * @created by Lizzy
 * @package dbaas-ui
 * @version :  2017-04-11 17:07 $
 */
import React from 'react'
import PropTypes from 'prop-types'
import { classnames, constant } from 'utils'
import { Icon } from 'antd'

const { MESSAGE_STATUS } = constant

class MessageIcon extends React.Component{

  render() {
    let { type, className = '' } = this.props;

    //  'INFO': 0, 'SUCCESS': 1, 'WARNING': 2, 'ERROR': -1
    switch (type){
      default:
      case MESSAGE_STATUS.INFO:
        type = 'info-circle-o'
        className = classnames('text-info', 'text-bold', className)
        break
      case MESSAGE_STATUS.SUCCESS:
        type = 'check-circle-o'
        className = classnames('text-success', 'text-bold', className)
        break
      case MESSAGE_STATUS.WARNING:
        type = 'exclamation-circle-o'
        className = classnames('text-warning', 'text-bold', className)
        break
      case MESSAGE_STATUS.ERROR:
        type = 'close-circle-o'
        className = classnames('text-error', 'text-bold', className)
        break
    }

    return (
        <Icon {...this.props} className={className} type={type} />
    )
  }
}

MessageIcon.propTypes = {
  type: PropTypes.number,
  className: PropTypes.string
}

export default MessageIcon
