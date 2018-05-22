/**
 * Created by zhangmm on 2017/7/4.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './fileView.less'
import { DataTable, Filter } from 'components'
import { Row , Col , Icon , Tooltip, Spin } from 'antd'
import CodeMirror from 'react-codemirror'
require('codemirror/lib/codemirror.css')
require('codemirror/mode/shell/shell')
require('codemirror/mode/python/python')
import { Cache } from 'utils'
const cache = new Cache()

class FileView extends Base{
  constructor(props){
    super(props)
    this.download = this.download.bind(this)
    this.setGobackBtn()

    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '文件预览', selectedKey: '程序包管理packages'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
    this.push({
      type:"package/fileView/resetFileInfo"
    })
  }

  componentWillMount(){
    const filepath = cache.get("filepath")
    const wholePath = cache.get("wholePath") ? cache.get("wholePath") : ""

    this.props.dispatch({
      type:"package/fileView/getVersionFileInfo",
      payload:{
        id:this.props.match.params.id,
        name:filepath + wholePath +  "/" + this.props.match.params.name,
        version:this.props.match.params.version
      }
    })
  }

  download(){
    const filepath = cache.get("filepath")
    const wholePath = cache.get("wholePath") ? cache.get("wholePath") : ""
    const fileName = this.props.match.params.name

    window.open(`/api/v2/packages/file/download?filepath=${filepath + wholePath + "/" + fileName}`)
  }

  render(){
    const {location ,dispatch , history , fileView} = this.props
    const {name , content ,binary ,charset ,executable ,path ,size ,script_type, spinning } = fileView

    const wholePath = cache.get("wholePath") ? cache.get("wholePath") : ""


    const options = {
      lineNumbers: true,
      mode: script_type === 'shell' ?  'text/x-sh' :  'text/x-python',
      readOnly: true,
      cursorBlinkRate: -1,
      lineWrapping:true, //是否强制换行
    }
    return(
      <Row className={styles.fileView}>
        <Spin spinning={spinning}>
        <Row className="inner-cont">
          <Row className="asTable">
            <Col span={12}>
              <Icon type="folder-open" style={{fontSize:"15px"}}/>&nbsp;&nbsp;
              <span style={{fontSize:"14px",fontWeight:"bold"}}>{wholePath}/{name}</span>
            </Col>
            <Col span={12}>
              <Tooltip title="原始文件">
                <Row className="icon-style" onClick={this.download}><Icon type="export"/></Row>
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
            )
              :
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

FileView.propTypes = {
  fileView: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    fileView: state['package/fileView'],
    loading: state.loading.effects,
  }
}

export default connect(mapStateToProps)(FileView)
