/**
 * Created by zhangmm on 2017/7/4.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './commitVersion.less'
import { DataTable, Filter } from 'components'
import { Row ,Col , Button ,Form , Input, Icon, Tooltip, Table, Spin } from 'antd'
const { TextArea } = Input
const FormItem = Form.Item
import { constant } from 'utils'
const {VERSION_COMPLEXITY, PATH_COMPLEXITY} = constant

class CommitVersion extends Base{
  constructor(props){
    super(props)

    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '版本新增', selectedKey: '程序包管理packages'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
    this.setGobackBtn()
    this.handleSubmit = this.handleSubmit.bind(this)
    this.checkVersion = this.checkVersion.bind(this)
  }

  handleSubmit = (e) =>{
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if(err){
        return false
      }
      const data = {
        ...this.props.form.getFieldsValue()
      }
      this.props.dispatch({type:'package/commitVersion/handleRecommit',payload:{recommit:true}})
      this.props.dispatch({
        type:'package/commitVersion/commitVersions',
        payload:{
          id:this.props.match.params.id,
          formData:data
        }
      })
    })
  }

  checkVersion (rule, value, callback) {
    if (!value) {
      callback()
    }
    else {
      VERSION_COMPLEXITY.forEach((d)=>{
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

  render(){
    const { location, dispatch ,history,commitVersion ,params} = this.props
    const { getFieldDecorator } = this.props.form
    const { disabled, recommit, version, spinning } = commitVersion

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
      },
    }

    return(
      <Row className={styles.commitVersion}>
        <Spin spinning={spinning}>
        <Row className="inner-cont">
          <Form onSubmit={this.handleSubmit}>
            <FormItem label="版本名称:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('version_name', {
                rules: [{
                  required: true,
                  message: '请输入版本名称',
                },{
                  validator: this.checkVersion
                }],
              })(
                <Input placeholder="版本名称"  id="version_name " name="version_name "/>
              )}
            </FormItem>
            <FormItem label="包文件路径:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('location', {
                rules: [{
                  required: true,
                  message: '请输入包文件名',
                },{
                  pattern:/^[^\s]+$/,
                  message:'包文件名不能包含空格'
                },{
                  pattern:/^[^\/\\]+$/,
                  message:'包文件名不能包含/或者\\字符'
                },{
                  max:50,
                  message: '包文件名的最大长度为50',
                }],
              })(
                <Input addonBefore="/data/dbaas/packages/" placeholder="包文件名"  id="location" name="location" style={{width:"100%"}}/>
              )}
            </FormItem>
            <FormItem label="备注:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('memo',{
                rules: [{
                  required: false,
                  message: '请输入备注',
                },{
                  max:100,
                  message: '备注的最大长度为100',
                }],
              })(
                <TextArea placeholder="备注" id="memo" name="memo" autosize={{ minRows: 2, maxRows: 6 }} />
              )}
            </FormItem>
            <FormItem>
              <Button type="primary" htmlType="submit" style={{marginLeft:"16.666%"}} loading={recommit}>确定</Button>
            </FormItem>
          </Form>
        </Row>
        </Spin>
      </Row>
    )
  }
}

CommitVersion.propTypes = {
  commitVersion: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=>{
  return {
    commitVersion: state['package/commitVersion'],
    loading: state.loading.effects,
  }
})(Form.create()(CommitVersion))
