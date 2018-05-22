/**
 *
 * @copyright(c) 2017
 * @created by  lizzy
 * @package dbaas-ui
 * @version :  2017-08-16 10:41 $
 * 加动态key后，codemirror使用表单自带验证会一直报onchange of undefined，
 * validateStatus控制help信息的颜色，
 * 用state存取和更新code编辑器才不会卡。。。
 *
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Form, Button, Icon, Row, Col } from 'antd'
import { DataTable, Layout, Search, ProgressIcon, IconFont } from 'components'
import { classnames, Cache } from 'utils'
import CodeMirror from 'react-codemirror'
require('codemirror/lib/codemirror.css')
require('codemirror/mode/sql/sql') // 语法高亮

import DragUploader from './dragUploader'

const FormItem = Form.Item
const modelKey = 'golive/sqlPublish/create'

class SqlUpload extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      sql : this.props.create.sql,
      errorMsg: null,
      validateStatus: 'success',
      startUpload: false,
    }
  }

  componentWillReceiveProps(nextProps) {  // 初始model里面的sql为空，需要在props时更新为接口的数据
    if (this.props.create.sql !== nextProps.create.sql) {
      this.setState({
        sql: nextProps.create.sql,
      })
    }
  }

  render () {

    const {
      dispatch,
      create,
    } = this.props

    const { file } = create

    const handleCodeChange = (value) => {
      this.setState({
        sql: value
      })
      validateCode(!(file.length === 0 && value === ''))  // 前端验证两个不能同时为空
    }

    const validateCode = (check) => {
      if (check) {
        this.setState({
          errorMsg: null,
          validateStatus: 'success',
        })
        return true
      } else {
        this.setState({
          errorMsg: '请上传或输入 SQL 语句！',
          validateStatus: 'error',
        })
        return false
      }
    }

    const next = () => {
      this.setState({
        startUpload: !this.state.startUpload
      })
      dispatch({
        type: `${modelKey}/handleSql`,
        payload: this.state.sql
      })
    }

    const props = {
      validateCode,
      currentSql: this.state.sql,
      startUpload: this.state.startUpload,  // 文件上传开关
      file,
      handleFile: (file) => {
        dispatch({
          type: `${modelKey}/handleFile`,
          payload: file
        })
      },
      next: this.props.next,
      handleSql: (sql) => {
        dispatch({
          type: `${modelKey}/handleSql`,
          payload: sql
        })
      },
      handleOther: (other) => {
        dispatch({
          type: `${modelKey}/handleOther`,
          payload: other
        })
      },
      handlePageLoading: (bool) => {
        dispatch({
          type: `${modelKey}/handlePageLoading`,
          payload: bool
        })
      },
    }

    return (
      <div className="upload">
        <div className="tool-tip">
          <div>
            <Icon type="bulb"/>
            <span>提示：</span>
          </div>
          <div className="tip-content">
            <div>请上传后缀名为 .txt 或 .sql 的文本文件，大小不超过 1MB。</div>
            <div>如果同时上传和填写SQL，填写的SQL语句将接在上传的SQL语句之后。</div>
            <div>DML 语句及 DDL 语句建议分开发布，避免由于表结构变更出现不可预知的错误。</div>
            <div>支持以下语句：USE、SET NAMES、CREATE、INSERT [SELECT]、DELETE、UPDATE、DROP TABLE、TRUNCATE、ALTER TABLE。</div>
          </div>
        </div>
        <Form>
          <div className="upload-file">
            上传 SQL:
            <FormItem help={this.state.errorMsg} validateStatus={this.state.validateStatus}>
              <DragUploader {...props}/>
            </FormItem>
          </div>
          <div className="edit">
            填写 SQL:
            <FormItem help={this.state.errorMsg} validateStatus={this.state.validateStatus}>
              <CodeMirror value={this.state.sql} options={{ lineNumbers: true, mode: 'text/x-sql' }}
                        onChange={handleCodeChange.bind(this)} className="code-mirror"/>
            </FormItem>
          </div>
          <div>
            <Button onClick={next}>
              上传
            </Button>
          </div>
        </Form>
      </div>
    )
  }
}

SqlUpload.propTypes = {
  create: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=>{
  return {
    create: state[modelKey],
  }
})(SqlUpload)
