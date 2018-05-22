/**
 * Created by zhangmm on 2017/7/5.
 */
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './fileList.less'
import { DataTable, Filter } from 'components'
import { routerRedux } from 'dva/router'
import { Row ,Col ,Icon , Tooltip , Modal } from 'antd'
import UploadModal from './uploadModal'
const confirm = Modal.confirm
import { Cache } from 'utils'
const cache = new Cache()

class AsTable extends React.Component{
  constructor(props){
    super(props)

    this.showModal = this.showModal.bind(this)
    this.deleteFiles = this.deleteFiles.bind(this)
    this.createFile = this.createFile.bind(this)
    this.createPath = this.createPath.bind(this)
  }
  showModal(){
     this.props.onUpdate(this.props.uploadModalVisible)
  }
  createFile(){
    const pathnameArr = this.props.location.pathname.split('/')
    const id = pathnameArr[pathnameArr.length - 2]
    this.props.dispatch(
      routerRedux.push({pathname:`/packages/info/file/${id}/add`})
    )
  }
  createPath(){
    this.props.dispatch({
      type:'package/createVersion/handlePath',
      payload:true
    })
  }
  deleteFiles(){
    let _this = this
    const pathnameArr = this.props.location.pathname.split('/')
    let id = pathnameArr[pathnameArr.length - 2]

    const filepath = cache.get("filepath")
    const wholePath = cache.get("wholePath") ? cache.get("wholePath") : ""
    confirm({
      title: "提示",
      content: "确定要删除这个包的全部文件吗？",
      onOk(){
        _this.props.dispatch ({
          type:'package/createVersion/deleteAllFile',
          payload:{
            id:id,
            filepath:filepath + wholePath
          }
        })
      },
      onCancel() {},
    })
  }
  render(){
    const { show , uploadModalVisible ,dispatch ,location , file , okText , cancelText, allFile } = this.props

    const pathnameArr = location.pathname.split('/')
    const id = pathnameArr[pathnameArr.length - 2]

    const filepath = cache.get("filepath")
    const wholePath = cache.get("wholePath") ? cache.get("wholePath") : ""

    const modalSetting = {
      title :'上传文件',
      visible : uploadModalVisible,
      okText : okText,
      cancelText : cancelText,
      file : file,
      allFile:allFile,
      onOk(data , visible ){
        let formData = new FormData()
        formData.append('file', data)
        formData.append('filepath', filepath + wholePath )
        dispatch({
          type : 'package/createVersion/uploadFile',
          payload : {
            pkgid : id,
            file  : formData,
          }
        })
        dispatch({
          type:'package/createVersion/handleVisibility',
          payload:{
            uploadModalVisible:visible ? false : true
          }
        })
        dispatch({
          type:'package/createVersion/handleSpinning',
          payload:{
            spinning:true
          }
        })
      },
      onCancel(visible){
        visible = visible ? false : true
        dispatch({
          type:'package/createVersion/handleVisibility',
          payload:{
            uploadModalVisible:visible
          }
        })
      },
      onFile(file){
        dispatch({
          type:'package/createVersion/handleFile',
          payload:{
            file:file
          }
        })
      }
    }

    const showIcon = show === 'visible' ? {visibility:"visible"} : {visibility:"hidden"}
    return(
      <Row className={styles.asTable}>
        <Col span={16} style={{fontSize:"14px",fontWeight:"bold"}}><Icon type="folder-open" style={{fontSize:"15px",fontWeight:"normal"}}/>&nbsp;&nbsp;{wholePath}</Col>
        <Col span={8} style={showIcon}>
          <Tooltip title="删除文件">
          <Row className="icon-style-del" onClick={this.deleteFiles} ><Icon type="delete" className="icon-color"/></Row>
          </Tooltip>
          <Tooltip title="新建目录">
          <Row className="icon-style" onClick={this.createPath}><Icon type="folder"/></Row>
          </Tooltip>
          <Tooltip title="上传文件">
          <Row className="icon-style" onClick={this.showModal}><Icon type="upload"/></Row>
          </Tooltip>
          <Tooltip title="新增文件">
          <Row className="icon-style" onClick={this.createFile}><Icon type="plus"/></Row>
          </Tooltip>
        </Col>
        <UploadModal {...modalSetting}/>
      </Row>
    )
  }
}
export default AsTable
