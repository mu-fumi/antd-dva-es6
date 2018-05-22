/**
 * Created by zhangmm on 2017/7/18.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './fileAdd.less'
import { DataTable, Filter , IconFont} from 'components'
import { Link , routerRedux} from 'dva/router'
import { Row , Button, Col, Icon,Tooltip , Modal, Input,Form} from 'antd'
const FormItem = Form.Item
const confirm = Modal.confirm
import AsTable from './asTable'
import CodeMirror from 'react-codemirror'
require('codemirror/lib/codemirror.css')
require('codemirror/mode/shell/shell')
require('codemirror/mode/python/python')
import { Cache } from 'utils'
import { constant } from 'utils'
const {FILENAME_COMPLEXITY} = constant
const cache = new Cache()

class FileAdd extends Base{
  constructor(props){
    super(props)

    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '文件新增', selectedKey: '程序包管理packages'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
    this.changeContent = this.changeContent.bind(this)
    this.changeName = this.changeName.bind(this)
    this.cancel = this.cancel.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.checkFileName = this.checkFileName.bind(this)
    this.handleCommitVersion = this.handleCommitVersion.bind(this)
    this.state= {
      name: "",
      content: ""
    }
    //获取Id
    const pathnameArr = location.pathname.split('/')
    this.id = pathnameArr[pathnameArr.length - 2]
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
  }

  handleCommitVersion(){
    const id = this.props.match.params.id
    if(this.state.name != "" || this.state.content != ""){
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

  changeContent(value){
    this.setState({
      content:value
    })
  }

  changeName(e){
    this.setState({
      name: e.target.value
    })
    this.props.dispatch({
      type:"package/fileAdd/handleDisabledBut",
      payload:e.target.value ? false : true
    })
  }

  cancel() {
    const id = this.props.match.params.id
    if(this.state.name != "" || this.state.content != ""){
      confirm({
        title: "提示",
        content: "你的修改还未保存，确定放弃更改离开页面吗？",
        onOk:() => {
          this.props.dispatch(
            routerRedux.push({
            pathname:`/packages/${id}/tree`
            })
          )
        },
        onCancel() {},
      })
    }else{
      this.props.dispatch(
        routerRedux.push({
          pathname:`/packages/${id}/tree`
        })
      )
    }
  }

  handleSubmit = (e) =>{
    e.preventDefault()
    const filepath = cache.get("filepath")
    const wholePath = cache.get("wholePath") ? cache.get("wholePath") : ""

    const id = this.props.match.params.id

    this.props.form.validateFields((err, values) => {
      if(err){
        return false
      }
      if(this.props.fileAdd.allFile.indexOf(values['name']) !== -1){
        Modal.error({
          title: '提示',
          content: '存在相同名称的文件或者文件夹，操作无法成功。',
        })
        return false
      }
      this.props.dispatch({type:'package/fileAdd/handleRecommit',payload:{recommit:true}})
      this.props.dispatch({
        type:"package/fileAdd/addFileInfo",
        payload:{
          id:id,
          filepath:filepath + wholePath,
          content:this.state.content,
          name:this.state.name.replace(/\s+/g, ""),
          type:"file"
        }
      })
    })
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
    const { location ,dispatch , history , fileAdd } = this.props
    const { disabledBut, recommit } = fileAdd
    const { getFieldDecorator } = this.props.form

    const id = this.props.match.params.id

    const options = {
      lineNumbers: true,
      mode:  'text/x-sh',
      readOnly: false,
      cursorBlinkRate: 530,
      lineWrapping:true, //是否强制换行
      autofocus:true
    }

    return(
      <Form onSubmit={this.handleSubmit}>
        <Row className={styles.fileAdd}>
          <Row className="inner-cont">
            <Row className="asTable">
              <Icon type="folder-open" style={{fontSize:"15px"}}/>&nbsp;&nbsp;/&nbsp;&nbsp;
              <FormItem style={{width:"200px"}}>
                {getFieldDecorator('name',{
                  rules: [
                  {
                    validator: this.checkFileName
                  }]
                })(
                  <Input id="name" name="name" placeholder="请输入文件名" autoComplete="off"
                         style={{width:"200px"}} onChange={this.changeName}/>
                )}
              </FormItem>
              <span style={{marginLeft:"10px"}}>或者</span>
              <span className="text-cancel" onClick={this.cancel}>取消</span>
            </Row>
            <FormItem style={{width:"100%"}}>
              <Row style={{border: "1px solid #efefef"}}>
                <CodeMirror key={this.props.fileAdd.content}  options={options}  className="code-mirror" onChange={this.changeContent}/>
              </Row>
            </FormItem>
            <FormItem>
              <Button type="primary" htmlType="submit" style={{marginTop:"24px"}}
                      disabled={disabledBut} loading={recommit}>保存文件</Button>
            </FormItem>
          </Row>
        </Row>
      </Form>
    )
  }
}

FileAdd.propTypes = {
  fileAdd: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=>{
  return {
    fileAdd: state['package/fileAdd'],
    loading: state.loading.effects,
  }
})(Form.create()(FileAdd))
