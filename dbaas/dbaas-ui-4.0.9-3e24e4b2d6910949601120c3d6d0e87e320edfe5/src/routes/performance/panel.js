/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-05-16 10:17 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Icon, message, Progress, Card as CardComponent, Input, Collapse } from 'antd'
import { DataTable } from 'components'
import styles from './panel.less'
import _ from 'lodash'

const { TextArea } = Input

class Panel extends React.Component {

  constructor (props) {
    super(props)

    const { content = '' } = props

    this.state = {
      content,
      active: false
    }
  }

  handleClick() {
    // const value = this.textInput.refs.input.value  //老版本中如果对应的 ref 是 input 则这么写，新版本估计要去掉refs.input

    const value = this.textInput.textAreaRef.value // 对应的 ref 是 textarea 的写法
    this.props.onClick(value)
    this.setState({
      active: true
    })
  }

  render() {

    const className = 'collapse-content collapse-content-' +(this.state.active ? '' : 'in')+'active'
    return (
      <Row className={styles.panel}>
        <TextArea rows={4} ref={(input) => { this.textInput = input }} />
        <div className="collapse">
          <div className="collapse-item">
            <div className="collapse-header" role="tab">
              <Icon onClick={this.handleClick.bind(this)} className="exec-icon" type="play-circle-o" />
            </div>
            <div className={className} role="tabpanel">
              <div className="collapse-content-box">
                <DataTable { ...this.props.tableProp } />
              </div>
            </div>
          </div>
        </div>
      </Row>
    )
  }
}

Panel.propTypes = {
  onClick: PropTypes.func,
  tableProp: PropTypes.object,
  content: React.PropTypes.oneOfType([
    React.PropTypes.string,
    PropTypes.element,
  ]),
}

export default Panel
