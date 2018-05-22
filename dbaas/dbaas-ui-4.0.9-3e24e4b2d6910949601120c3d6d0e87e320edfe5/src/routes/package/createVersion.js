/**
 * Created by zhangmm on 2017/7/4.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './createVersion.less'
import { DataTable, Filter , IconFont} from 'components'
import { Link } from 'dva/router'
import { Row ,Col , Button ,Icon , Modal , Input, Spin, Form } from 'antd'
import AsTable from './asTable'
import { Cache, constant } from 'utils'
const {PATH_COMPLEXITY} = constant
const cache = new Cache()
const FormItem = Form.Item

class CreateVersion extends Base{
  constructor(props){
    super(props)

    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '版本管理', selectedKey: '程序包管理packages'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })

    this.updateVisibility = this.updateVisibility.bind(this)
    this.repath = this.repath.bind(this)
    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.checkPath = this.checkPath.bind(this)
    this.state = {
      pathSuffix: ""
    }
    //获取Id
    const pathnameArr = location.pathname.split('/')
    this.id = pathnameArr[pathnameArr.length - 2]

    cache.put("wholePath",this.state.pathSuffix)
    this.setGobackBtn()
    this.pageBtns = {
      element: ()=>{
        return  <Row>
          <Col className="pageBtn">
            <Link to={`/packages/${this.id}/commitVersion`}>
              <IconFont type="upload"/>提交版本
            </Link>
          </Col>
        </Row>
      }}
  }

  handleOk = () =>{
    //获取Id
    const pathnameArr = this.props.location.pathname.split('/')
    const id = pathnameArr[pathnameArr.length - 2]
    this.props.form.validateFields((err, values) => {
      if(err){
        return false
      }
      if(this.props.createVersion.allFile.indexOf(values['path']) !== -1){
        Modal.error({
          title: '提示',
          content: '存在相同名称的文件或者文件夹，操作无法成功。',
        })
        return false
      }
      //清空之前表单域的值
      this.props.form.setFieldsValue({path:''})
      this.props.dispatch({
        type:'package/createVersion/createPath',
        payload:{
          id:id,
          filepath:this.state.pathSuffix ? cache.get("filepath") + this.state.pathSuffix : cache.get("filepath"),
          name:values['path'],
          type:"path"
        }
      })
      this.props.dispatch({type:'package/createVersion/handlePath',payload:false})
    })
  }

  handleCancel = () =>{
    this.props.dispatch({
      type:'package/createVersion/handlePath',
      payload:false
    })
  }

  checkPath (rule, value, callback) {
    if (!value) {
      callback()
    }
    else {
      PATH_COMPLEXITY.forEach((d)=>{
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

  updateVisibility(visible){
    visible = visible ? false : true
    this.props.dispatch({
      type:'package/createVersion/handleVisibility',
      payload:{
        uploadModalVisible:visible
      }
    })
  }

  repath(e){
    cache.put("wholePath",this.state.pathSuffix + "/" + e.target.innerText.replace(/\s+/g, ""))
    this.setState({
      pathSuffix : this.state.pathSuffix + "/" + e.target.innerText.replace(/\s+/g, "")
    })
    //获取Id
    const pathnameArr = this.props.location.pathname.split('/')
    const id = pathnameArr[pathnameArr.length - 2]
    this.props.dispatch({
      type:'package/createVersion/getAllFile',
      payload:{
        id:id,
        filepath:cache.get('filepath') + cache.get('wholePath')
      }
    })
  }

  render(){
    const {location ,dispatch , history , createVersion } = this.props
    const {reload , okText , cancelText , pathVisible, spinning, allFile } = createVersion
    const { getFieldDecorator } = this.props.form
    //获取Id
    const pathnameArr = location.pathname.split('/')
    const id = pathnameArr[pathnameArr.length - 2]
    const filepath = cache.get("filepath")

    const tableProps = {
      fetch:{
        url:`/packages/file/${id}/info`,
        data:{
          filepath: this.state.pathSuffix ? filepath + this.state.pathSuffix : filepath
        }
      },
      showHeader:false,
      rowKey:"id",
      columns:[{
        dataIndex: 'file',
        key: 'file',
        render:(text,record) => {
          if(record.type === "file"){
            return(
              <Row><Icon type="file-text"/>&nbsp;&nbsp;<Link to={`/packages/file/${id}/${record.file}`}>{text}</Link></Row>
            )
          }else if(record.type === "dir"){
            return(
              <Row><Icon type="folder"/>&nbsp;&nbsp;<a href="javascript:void(0);" onClick={this.repath}>{text}</a></Row>
            )
          }
        }
      },
      {
        dataIndex: 'size',
        key: 'size',
      }],
      reload:reload
    }
    const asTableProps = {
      show:"visible",
      uploadModalVisible : createVersion.uploadModalVisible,
      dispatch : dispatch,
      location : location,
      file:createVersion.file,
      okText:okText,
      cancelText:cancelText,
      allFile:allFile
    }

    const modalProps = {
      title:"新增目录",
      onOk:this.handleOk,
      onCancel:this.handleCancel,
      visible:pathVisible,
      okText:"确定",
      cancelText:"取消"
    }

    return(
      <Row className={styles.createVersion}>
        <Row className="inner-cont">
          <Spin spinning={spinning} tip="上传中..." size='large'>
          <AsTable {...asTableProps} onUpdate={this.updateVisibility} />
          <DataTable {...tableProps} />
          </Spin>
          <Modal {...modalProps}>
            <Row>请输入路径名：</Row>
            {/*<Input placeholder="请输入路径名" onChange={this.changePath} value={this.state.pathName}/>*/}
            <FormItem>
              {getFieldDecorator('path', {
                rules: [{
                  required: true,
                  message: '请输入路径名',
                },{
                  validator: this.checkPath
                }],
              })(
                <Input placeholder="请输入路径名"/>
              )}
            </FormItem>
          </Modal>
        </Row>
      </Row>
    )
  }
}

CreateVersion.propTypes = {
  createVersion: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}
CreateVersion.defaultProps = {//省去逻辑判断
  onUpdate: f => f
}

export default connect((state)=>{
  return {
    createVersion: state['package/createVersion'],
    loading: state.loading.effects,
  }
})(Form.create()(CreateVersion))
