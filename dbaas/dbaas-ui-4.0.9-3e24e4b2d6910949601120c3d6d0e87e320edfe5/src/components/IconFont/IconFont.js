/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-04-11 17:07 $
 */
import React from 'react'
import PropTypes from 'prop-types'
import { classnames, Logger } from 'utils'
import { Icon } from 'antd'

class IconFont extends React.Component{
  constructor(props) {
    super(props);

  }
  render() {
    const { type, className = '' } = this.props;
    const flag = 'iconfont-'

    Logger.debug('IconFont ===>', type, type.indexOf(flag))
    if(type.indexOf(flag) < 0){
      return <Icon {...this.props} type={type} />
    }
    const href = '#icon-' + type.split(flag)[1]
    return (
      <svg {...this.props} className={classnames('anticon', 'iconfont', className)} aria-hidden="true">
        <use xlinkHref={href}/>
      </svg>
    )

  }
}

IconFont.propTypes = {
  type: PropTypes.string,
  className: PropTypes.string
}

export default IconFont
