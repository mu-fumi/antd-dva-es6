/**
 * Created by wengyian on 2017/11/30.
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

export default class UpModal extends React.Component{
  constructor(props){
    super(props)
  }

  handleOk = () => {
    if(this.props.onOk){
      this.props.onOk()
    }
  }

  handleCancel = () => {
    if(this.props.onCancel){
      this.props.onCancel()
    }
  }

  render(){

    return (
      <Modal
        title = "确定要启动吗？"
        visible = {this.props.visible}
        closable = {false}
        onOk = {this.handleOk}
        onCancel = {this.handleCancel}
        wrapClassName={styles["tipModal"]}
      >
        集群异常停止，强制启动会造成数据异常
      </Modal>
    )
  }
}

UpModal.propTypes = {
  onOk : PropTypes.func,
  onCancel : PropTypes.func,
  visible : PropTypes.bool,
}
