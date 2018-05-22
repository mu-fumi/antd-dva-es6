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
const { TextArea } = Input
class MemoModal extends React.Component{

  constructor(props){
    super(props)

    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.updateMemo = this.updateMemo.bind(this)
  }
  updateMemo(e){
    this.props.updateMemo(e.target.value)
  }
  handleOk(){
    this.props.onOk( this.props.visible , this.props.version ,this.props.memo)
  }
  handleCancel(){
    this.props.onCancel(this.props.visible)
  }
  render(){
    const { title , visible , file , okText , cancelText , version , memo} = this.props

    return(
      <Modal
        title={title}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        okText={okText}
        cancelText={cancelText}>
        <Row>请给{version}版本输入新的备注：</Row>
        <Row>
          <TextArea placeholder="请输入备注" maxLength='100'
                 style={{marginBottom:"10px",fontSize:"14px"}} autosize={{ minRows: 2, maxRows: 6 }}
                 onChange={this.updateMemo} value={memo}/>
        </Row>
      </Modal>
    )
  }
}
export default MemoModal
