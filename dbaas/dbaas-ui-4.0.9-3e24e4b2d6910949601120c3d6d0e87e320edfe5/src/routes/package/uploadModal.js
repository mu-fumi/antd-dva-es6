/**
 * Created by zhangmm on 2017/7/5.
 */
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './fileList.less'
import { DataTable, Filter, IconFont } from 'components'
import { Link } from 'dva/router'
import { Modal,Input , Checkbox, Form } from 'antd'
const FormItem = Form.Item

class UploadModal extends React.Component{

  constructor(props){
    super(props)

    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.fileChange = this.fileChange.bind(this)
    this.normFile = this.normFile.bind(this)
    this.state = {
      file:''
    }
  }
  normFile = (e) => {
    this.setState({file:e.target.files[0]})
    return e.target.value
  }
  fileChange(e) {
    this.props.onFile(e.target.files[0])
  }
  handleOk(){
    this.props.form.validateFields((err, values) => {
      if(err){
        return false
      }
      if(this.props.allFile.indexOf(this.state.file.name) !== -1){
        Modal.error({
          title: '提示',
          content: '存在相同名称的文件或者文件夹，操作无法成功。',
        })
        return false
      }
      this.props.onOk(this.state.file , this.props.visible)
    })
  }
  handleCancel(){
    this.props.onCancel(this.props.visible)
  }
  render(){
    const { title , visible , file , okText , cancelText} = this.props
    const { getFieldDecorator } = this.props.form
    return(
      <Modal
        title={title}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        okText={okText}
        cancelText={cancelText}>
        {/*<Input type="file" style={{height:"34px",padding:'2px 7px'}} onChange={this.fileChange}/>*/}
        <FormItem style={{marginBottom:"8px"}}>
          {getFieldDecorator('file', {
            getValueFromEvent: this.normFile,
            rules: [{
              required: true,
              message: '未选择任何文件',
            }],
          })(
            <Input type="file" style={{height:"34px",padding:'2px 7px'}}/>
          )}
        </FormItem>
        <div style={{marginTop:"10px"}}>
          <IconFont type="bulb" className="text-warning"/>
          支持自动解压tar.gz, tgz 或zip文件
        </div>
      </Modal>
    )
  }
}
export default connect((state)=>{
  return {}
})(Form.create()(UploadModal))
