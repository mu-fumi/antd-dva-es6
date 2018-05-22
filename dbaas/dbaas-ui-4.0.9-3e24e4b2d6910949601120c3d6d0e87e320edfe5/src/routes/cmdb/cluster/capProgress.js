/**
 * Created by wengyian on 2017/10/23.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { classnames, constant } from 'utils'
import { Tooltip, Badge, Row, Progress } from 'antd'
import styles from './capProgress.less'

export default class CapProgress extends React.Component{


  render(){
    let { used = {}, total = {}, className = '', oldVal = ''} = this.props
    let percent = 0
    if(total.num !== 0){
      percent = used.num / total.num * 100
    }
    let text = used.oldVal + '/' + total.oldVal



    let color = ''
    if(percent < 30){
      color = 'bg-success'
    }else if(percent < 80){
      color = 'bg-primary'
    }else if(percent < 90){
      color = 'bg-warning'
    }else{
      color = 'bg-error'
    }

    return (
      <Tooltip
        title={text}
      >
        <Row className={classnames(styles["capProgress"], styles[color], className)}>
          <Progress
            percent={percent}
            showInfo={false}
          />
        </Row>

      </Tooltip>
    )
  }
}

CapProgress.propTypes = {
  used : PropTypes.object,
  total : PropTypes.object,
  oldVal : PropTypes.string,
}
