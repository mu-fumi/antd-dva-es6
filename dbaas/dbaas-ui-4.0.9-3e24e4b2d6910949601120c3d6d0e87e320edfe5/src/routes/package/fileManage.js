/**
 * Created by zhangmm on 2017/7/14.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './fileManage.less'
import { DataTable, Filter , IconFont} from 'components'
import { routerRedux , Link } from 'dva/router'
import { Row , Col, Icon,Tooltip , Modal, Spin } from 'antd'
const confirm = Modal.confirm
import AsTable from './asTable'
import CodeMirror from 'react-codemirror'
require('codemirror/lib/codemirror.css')
require('codemirror/mode/shell/shell')
require('codemirror/mode/python/python')
import { Cache } from 'utils'
const cache = new Cache()

class FileManage extends Base{
  constructor(props){
    super(props)

    this.showConfirm = this.showConfirm.bind(this)
    this.edit = this.edit.bind(this)
    this.download = this.download.bind(this)

    this.setGobackBtn()
    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '文件管理', selectedKey: '程序包管理packages'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })

    this.pageBtns = {
      element: ({id})=>{
        return  <Row>
          <Col className="pageBtn">
            <Link to={`/packages/${id}/commitVersion`}>
              <IconFont type="upload"/>提交版本
            </Link>
          </Col>
        </Row>
    }}

    this.push({
      type:"package/fileManage/resetFileInfo"
    })
  }

  edit(){
    const id = this.props.match.params.id
    const name = this.props.match.params.name
    this.props.dispatch(
      routerRedux.push({
        pathname:`/packages/file/${id}/${name}/info`
      })
    )
  }
  showConfirm() {
    const filepath = cache.get("filepath")
    const wholePath = cache.get("wholePath") ? cache.get("wholePath") : ""
    confirm({
      title:`提示`,
      content: <span className="wrap-break">确定要删除 {this.props.match.params.name} 文件吗？</span>,
      onOk:()=> {
        this.props.dispatch({
          type:"package/fileManage/deleteFile",
          payload:{
            id:this.props.match.params.id,
            name:filepath + wholePath + "/" + this.props.match.params.name
          }
        })
      },
      onCancel() {},
    })
  }

  download(){
    const filepath = cache.get("filepath")
    const wholePath = cache.get("wholePath") ? cache.get("wholePath") : ""
    const fileName = this.props.match.params.name

    window.open(`/api/v2/packages/file/download?filepath=${filepath + wholePath + "/" + fileName}`)
  }

  render(){
    const { location , history , dispatch , fileManage} = this.props
    const { name , content ,binary ,
      charset ,executable ,path ,size ,script_type, spinning } = fileManage

    const filepath = cache.get("filepath")
    const wholePath = cache.get("wholePath") ? cache.get("wholePath") : ""

    const options = {
      lineNumbers: true,
      mode: script_type === 'shell' ?  'text/x-sh' :  'text/x-python',
      readOnly: true,
      cursorBlinkRate: -1,
      lineWrapping:true, //是否强制换行
    }

    return(
      <Row className={styles.fileManage}>
        <Spin spinning={spinning}>
        <Row className="inner-cont">
          <Row className="asTable">
            <Col span={12}>
              <Icon type="folder-open" style={{fontSize:"15px"}}/>&nbsp;&nbsp;
              <span style={{fontSize:"14px",fontWeight:"bold"}}>{wholePath}/{name}</span>
            </Col>
            <Col span={12}>
              <Tooltip title="删除文件">
              <Row className="icon-style-del" onClick={this.showConfirm}>
                <Icon type="delete" className="icon-color"/>
              </Row>
              </Tooltip>
              {/*<Row className="icon-style"><Icon type="setting"/></Row>*/}
              <Tooltip title="原始文件">
              <Row className="icon-style" onClick={this.download}>
                <Icon type="export"/>
              </Row>
              </Tooltip>
              <Tooltip title="编辑文件">
              <Row className="icon-style" onClick={this.edit}><Icon type="edit"/></Row>
              </Tooltip>
              <span className="size-span">{size}</span>
            </Col>
          </Row>

          {binary ?
            (
            <Row className="binary-content">
              <Row className="binary-inner">
                <span>这可能是一个二进制文件
                  <Tooltip title="原始文件">
                    <Icon type="export" className="binary-font" onClick={this.download}/>
                  </Tooltip>
                </span>
              </Row>
            </Row>
            ) :
            (
            <Row style={{border: "1px solid #efefef"}}>
              <CodeMirror key={+new Date()} className="code-mirror" options={options} value={content}/>
            </Row>
            )}
        </Row>
        </Spin>
      </Row>
    )
  }
}

FileManage.propTypes = {
  fileManage: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    fileManage: state['package/fileManage'],
    loading: state.loading.effects,
  }
}

export default connect(mapStateToProps)(FileManage)
