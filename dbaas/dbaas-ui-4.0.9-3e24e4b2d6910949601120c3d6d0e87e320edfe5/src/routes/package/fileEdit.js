/**
 * Created by zhangmm on 2017/7/18.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './fileEdit.less'
import { DataTable, Filter , IconFont} from 'components'
import { Link , routerRedux} from 'dva/router'
import { Row , Button, Col, Icon,Tooltip , Modal, Input,Form, Spin } from 'antd'
const FormItem = Form.Item
const confirm = Modal.confirm
import AsTable from './asTable'
import CodeMirror from 'react-codemirror'
require('codemirror/lib/codemirror.css')
require('codemirror/mode/shell/shell')
require('codemirror/mode/python/python')
import { Cache, constant } from 'utils'
const {FILENAME_COMPLEXITY} = constant
const cache = new Cache()

class FileEdit extends Base{
  constructor(props){
    super(props)

    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '文件编辑', selectedKey: '程序包管理packages'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
    this.cancel = this.cancel.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.switch = this.switch.bind(this)
    this.change = this.change.bind(this)
    this.handleCommitVersion = this.handleCommitVersion.bind(this)
    this.checkFileName = this.checkFileName.bind(this)

    this.state = {
      stateContent:this.props ? this.props.fileEdit.content : "",
      //stateName:this.props ? this.props.fileEdit.name : "",
      disabled:false,//提交按钮是否是disabled
    }
    this.setGobackBtn()
    this.pageBtns = {
      element: ()=>{
        return  <Row>
          <Col className="pageBtn">
            <a href="javascript:void(0);" onClick={this.handleCommitVersion}>
              <IconFont type="upload"/>提交版本
            </a>
          </Col>
        </Row>
    }}

    this.push({
      type:"package/fileEdit/resetFileInfo"
    })
  }

  handleCommitVersion(){
    const id = this.props.match.params.id
    if(this.props.form.getFieldValue(['name']) != this.props.fileEdit.name ||
      this.state.stateContent != this.props.fileEdit.content){
      confirm({
        title: "提示",
        content: "你的修改还未保存，确定放弃更改离开页面吗？",
        onOk:() =>{
          this.props.dispatch(
            routerRedux.push({
              pathname:`/packages/${id}/commitVersion`
            })
          )
        },
        onCancel() {},
      })
    }else{
      this.props.dispatch(
        routerRedux.push({
          pathname:`/packages/${id}/commitVersion`
        })
      )
    }
  }

  componentWillReceiveProps(nextProps){
    this.setState({
      //stateName:nextProps.fileEdit.name,
      stateContent:nextProps.fileEdit.content
    })
  }
  change(value){
    this.setState({
      stateContent:value
    })
  }
  switch(e){
    this.setState({
      //stateName:e.target.value,
      disabled:e.target.value === "" ? true : false
    })
  }
  handleSubmit = (e) =>{
    e.preventDefault()
    const filepath = cache.get("filepath")
    const wholePath = cache.get("wholePath") ? cache.get("wholePath") : ""
    this.props.form.validateFields((err,values) => {
      if(err){
        return false
      }
      this.props.dispatch({type:'package/fileEdit/handleRecommit',payload:{recommit:true}})
      this.props.dispatch({
        type:"package/fileEdit/editFileInfo",
        payload:{
          name:filepath + wholePath + "/" + values['name'].replace(/\s+/g, ""),
          content:this.state.stateContent,
          id:this.props.match.params.id,
          originName: this.props.fileEdit.originName,
          binary:this.props.fileEdit.binary
        }
      })
    })
  }
  cancel() {
    const id = this.props.match.params.id
    const name = this.props.match.params.name
    if((this.props.form.getFieldValue(['name']) != this.props.fileEdit.name) ||
      (this.state.stateContent != this.props.fileEdit.content)){
      confirm({
        title: "提示",
        content: "你的修改还未保存，确定放弃更改离开页面吗？",
        onOk:() =>{
          this.props.dispatch(
            routerRedux.push({
              pathname:`/packages/file/${id}/${name}`
            })
          )
        },
        onCancel() {},
      })
    }else{
      this.props.dispatch(
        routerRedux.push({
          pathname:`/packages/file/${id}/${name}`
        })
      )
    }
  }

  checkFileName (rule, value, callback) {
    if (!value) {
      callback()
    }
    else {
      FILENAME_COMPLEXITY.forEach((d)=>{
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
    const { location , history , dispatch , FileEdit , fileEdit} = this.props
    const { getFieldDecorator } = this.props.form
    const { name , content ,originName , binary ,
      charset ,executable ,path ,size ,script_type, spinning, recommit } = fileEdit

    const options = {
      lineNumbers: true,
      mode: script_type === 'shell' ?  'text/x-sh' :  'text/x-python',
      readOnly: false,
      cursorBlinkRate: 530,
      lineWrapping:true, //是否强制换行
      autofocus:true
    }

    return(
      <Form onSubmit={this.handleSubmit}>
      <Spin spinning={spinning}>
      <Row className={styles.fileEdit}>
        <Row className="inner-cont">

{/*          <Row className="asTable">
              <Icon type="folder-open" style={{fontSize:"15px"}}/>&nbsp;&nbsp;/&nbsp;&nbsp;
              <Input key={this.props.fileEdit.name} value={this.state.stateName} autoComplete="off"
                     onChange={this.switch} placeholder="请输入文件名" style={{width:"150px"}}/>
              <span style={{marginLeft:"10px"}}>或者</span>
              <span className="text-cancel" onClick={this.cancel}>取消</span>
          </Row>*/}

          <Row className="asTable">
            <Icon type="folder-open" style={{fontSize:"15px"}}/>&nbsp;&nbsp;/&nbsp;&nbsp;
            <FormItem style={{width:"200px"}}>
              {getFieldDecorator('name',{
                initialValue:name,
                rules: [
                  {
                    validator: this.checkFileName
                  }]
              })(
                <Input id="name" name="name" placeholder="请输入文件名" autoComplete="off"
                       style={{width:"200px"}} onChange={this.switch}/>
              )}
            </FormItem>
            <span style={{marginLeft:"10px"}}>或者</span>
            <span className="text-cancel" onClick={this.cancel}>取消</span>
          </Row>
          {binary ?
            (
            <Row className="binary-content">
              <Row className="binary-inner">
                <span>二进制文件不能编辑
                </span>
              </Row>
            </Row>
            ) :
            (
              <FormItem style={{width:"100%"}}>
                <Row style={{border: "1px solid #efefef"}}>
                  <CodeMirror key={this.props.fileEdit.content}  options={options}
                              value={this.state.stateContent} className="code-mirror" onChange={this.change}/>
                </Row>
              </FormItem>
            )}
          <FormItem>
            <Button type="primary" htmlType="submit" style={{marginTop:"24px"}}
                    disabled={this.state.disabled} loading={recommit}>保存文件</Button>
          </FormItem>
        </Row>
      </Row>
      </Spin>
      </Form>
    )
  }
}

FileEdit.propTypes = {
  fileEdit: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=>{
  return {
    fileEdit: state['package/fileEdit'],
    loading: state.loading.effects,
  }
})(Form.create()(FileEdit))
