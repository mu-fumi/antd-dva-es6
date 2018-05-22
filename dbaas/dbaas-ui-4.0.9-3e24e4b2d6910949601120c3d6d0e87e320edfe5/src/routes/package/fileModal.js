/**
 * Created by zhangmm on 2017/7/5.
 */
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './fileList.less'
import { DataTable, Filter } from 'components'
import { Link } from 'dva/router'
import { Row ,Col ,Icon , Modal, Button, Upload ,message,Input} from 'antd'

class FileModal extends React.Component{

  constructor(props){
    super(props)

    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  handleOk(){
    this.props.onOk( this.props.visible)
  }
  handleCancel(){
    this.props.onCancel(this.props.visible)
  }
  render(){
    const { title , visible ,  fileOkText , fileCancelText} = this.props

    return(
      <Modal
        title={title}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        okText={fileOkText}
        cancelText={fileCancelText}>
        <Row>确定要删除这个包下的所有文件吗？</Row>
      </Modal>
    )
  }
}
export default FileModal
