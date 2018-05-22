/**
 * Created by zhangmm on 2017/12/18.
 */
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './fileList.less'
import { DataTable, Filter, IconFont } from 'components'
import { Link } from 'dva/router'
import { Row ,Col ,Icon , Modal, Button, Upload ,message,Input, Form} from 'antd'
const FormItem = Form.Item
import { Cache, constant } from 'utils'
const {IMPORT_COMPLEXITY} = constant

class ImportModal extends React.Component{

  constructor(props){
    super(props)

    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.checkPath = this.checkPath.bind(this)
  }

  checkPath (rule, value, callback) {
    if (!value) {
      callback()
    }
    else {
      IMPORT_COMPLEXITY.forEach((d)=>{
        if(Array.prototype.isPrototypeOf(d.exp)){
          if(value.length>d.exp[1] || value.length<d.exp[0]){
            callback ([new Error(d.msg)])
          }
        }else {
          if( !value.match(d.exp)){
            callback ([new Error(d.msg)])
          }
        }
      })
    }
    callback()
  }

  handleOk(){
    this.props.form.validateFields((err, values) => {
      if(err){
        return false
      }
      //清空之前表单域的值
      this.props.form.setFieldsValue({path:''})
      this.props.onOk( this.props.visible , values['path'] )
    })
  }

  handleCancel(){
    this.props.onCancel(this.props.visible)
  }

  render(){
    const { title , visible , okText , cancelText } = this.props
    const { getFieldDecorator } = this.props.form
    return(
      <Modal
        title={title}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        okText={okText}
        cancelText={cancelText}>
        <Row>
          {/*<Input placeholder="请输入导入路径名"
                 style={{marginBottom:"10px",fontSize:"14px"}}
                 onChange={this.handlePath} value={path}/>*/}
          <FormItem style={{marginBottom:"8px"}}>
            {getFieldDecorator('path', {
              rules: [{
                required: true,
                message: '请输入导入路径名',
              },{
                validator: this.checkPath
              }],
            })(
              <Input placeholder="请输入导入路径名"/>
            )}
          </FormItem>
          <IconFont type="bulb" className="text-warning"/>
          <span>支持导入目录或文件</span>
        </Row>
      </Modal>
    )
  }
}
export default connect((state)=>{
  return {}
})(Form.create()(ImportModal))
