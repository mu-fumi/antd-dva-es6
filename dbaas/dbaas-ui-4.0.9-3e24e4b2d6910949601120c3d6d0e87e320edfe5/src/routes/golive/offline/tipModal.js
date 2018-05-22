/**
 * Created by wengyian on 2017/10/19.
 */

import Base from 'routes/base'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, Select, message, Tooltip, Button, Modal, Card} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon} from 'components'
import {routerRedux, Link, browserHistory,} from 'dva/router'
import {classnames, constant, TimeFilter} from 'utils'
import _ from 'lodash'
import styles from './tipModal.less'

export default class TipModal extends React.Component{
  constructor(props){
    super(props)
  }

  render(){

    const footer = <Row><Button type="primary" onClick={this.props.onOk}>确定</Button></Row>

    return (
      <Modal
        title = {this.props.title}
        visible = {this.props.visible}
        closable = {false}
        footer = {footer}
        wrapClassName={styles["tipModal"]}
      >
        {this.props.content}
      </Modal>
    )
  }
}

TipModal.propTypes = {
  title : PropTypes.string,
  onOk : PropTypes.func,
  onCancel : PropTypes.func,
  visible : PropTypes.bool,
  content : PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.array,
    PropTypes.string
  ])
}
