/**
 *
 * @copyright(c) 2017
 * @created by  lizzy
 * @package dbaas-ui
 * @version :  2017-06-26 10:41 $
 * 加动态key后，codemirror使用表单自带验证会一直报onchange of undefined，validateStatus控制help信息的颜色，用state存取和更新code编辑器才不会卡。。。
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Form, Input, Radio, Select, Row, Col, Card, Icon, message, Tag, Button, Tabs} from 'antd'
import { DataTable, Layout, Search, ProgressIcon, IconFont } from 'components'
import CodeMirror from 'react-codemirror'
import { classnames, Cache } from 'utils'
require('codemirror/lib/codemirror.css')
require('codemirror/mode/shell/shell') // 语法高亮
require('codemirror/mode/python/python')

const modelKey = 'work/tool/create'
const FormItem = Form.Item
const Option = Select.Option
const { TextArea } = Input

const cache = new Cache()

const formItemLayout = {
  labelCol : {
    span : 2
  },
  wrapperCol : {
    span : 10
  }
}

class Info extends React.Component {
  constructor(props) {
    super(props)
    cache.put('currentCode', this.props.create.toolDetail.code)
    this.state = {
      code : this.props.create.toolDetail.code,
      errorMsg: null,
      validateStatus: 'success',
      script: this.props.create.toolDetail.script,
      mode: this.props.create.toolDetail.script === 'shell' ? 'text/x-sh' : 'text/x-python'
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.create.toolDetail.code !== nextProps.create.toolDetail.code) {
      cache.put('currentCode', nextProps.create.toolDetail.code)
      this.setState({
        code: nextProps.create.toolDetail.code,
        script: nextProps.create.toolDetail.script,
        mode: nextProps.create.toolDetail.script === 'shell' ? 'text/x-sh' : 'text/x-python'
      })
    }
  }

  render() {
    const {
      dispatch,
      create,
      form: {
        getFieldDecorator,
        validateFields,
        getFieldsValue,
      }
    } = this.props

    const {tags, toolDetail, toolID} = create

    const {toolName, newTags, code, script, parameter, description} = toolDetail

    const codeLabel =  (<span>
                          <span className="star">*</span>
                          <span>脚本代码</span>
                        </span>
                        )

    const handleCodeChange = (value) => {
      this.setState({
        code: value
      })
      cache.put('currentCode', value)  // 调试需要当前code
      validateCode(this.state.code)   // code清除为空时报错
    }

    const handleSubmit = (e) => {
      e.preventDefault()
      validateFields((err) => {
        if (err) {
          return false
        }
        validateCode(this.state.code)
        if (!this.state.code) {
          return false
        }
        const data = {
          ...getFieldsValue()
        }
        if (toolID) {
          dispatch({
            type: `${modelKey}/updateTool`,
            payload: {...data, code:this.state.code, id: toolID}
          })
        } else {
          dispatch({
            type: `${modelKey}/createTool`,
            payload: {...data, code:this.state.code}
          })
        }
      })
    }

    const validateCode = (code) => {
      if (code) {
        this.setState({
          errorMsg: null,
          validateStatus: 'success',
        })
      } else {
        this.setState({
          errorMsg: '请输入脚本代码！',
          validateStatus: 'error',
        })
      }
    }

    const handleScriptChange = (e) => {   // 切换脚本类型，mode只需要保存在state中，script需要修改到model，供debug页面调用
      this.setState({
        script: e.target.value,
        mode: e.target.value === 'shell' ? 'text/x-sh' : 'text/x-python'
      })
      dispatch ({
        type: `${modelKey}/handleToolDetail`,
        payload: {"script": e.target.value}
      })
    }

    const onInputChange = (key, e) => {  // 当前this仍然是info; 同步各项修改到model，供debug页面调用
      dispatch ({
        type: `${modelKey}/handleToolDetail`,
        payload: {[key]: e.target.value}   // 变量做键名要加[]
      })
    }

    const onChange = (key, value) => {
      dispatch ({
        type: `${modelKey}/handleToolDetail`,
        payload: {[key]: value}
      })
    }

    return (
      <Form layout="horizontal" onSubmit={handleSubmit.bind(this)}>
        <div className="tool-tip">
          <Icon type="bulb"/>
          <span>提示：工具是一个可以在目标机器上执行并完成特定任务的脚本代码。</span>
        </div>
        <FormItem label="工具名称:" {...formItemLayout}>
          { getFieldDecorator('tool_name', {
            initialValue: toolName,
            onChange: onInputChange.bind(this, "toolName"), // 参数里面不能写e......
            rules: [{
              required: true,
              message: '请输入工具名称'
            }]
          })(
            <Input />
          )}
        </FormItem>
        <FormItem label="标签:" {...formItemLayout}>
          { getFieldDecorator('tags', {
            initialValue: newTags,
            onChange: onChange.bind(this, "newTags"),
            rules: [{
              required: true,
              message: '请选择标签'
            }]
          })(
            <Select mode="tags">
              { tags.map((v) => {
                return <Option key={v.id} value={v.tag_name}>{v.tag_name}</Option>
              })}
            </Select>
          )}
        </FormItem>
        <FormItem label="脚本语言:" {...formItemLayout}>
          { getFieldDecorator('script_type', {
            initialValue: script,
            onChange: handleScriptChange.bind(this),
          })(
            <Radio.Group>
              <Radio.Button value="shell">shell</Radio.Button>
              <Radio.Button value="python">python</Radio.Button>
            </Radio.Group>
          )}
        </FormItem>
        <FormItem label={codeLabel} {...formItemLayout} help={this.state.errorMsg}
                  validateStatus={this.state.validateStatus}>
          <CodeMirror key={code} value={this.state.code} options={{ lineNumbers: true, mode: this.state.mode }}
                      onChange={handleCodeChange.bind(this)} className="code-mirror"/>
        </FormItem>
        <FormItem label="脚本参数:" {...formItemLayout}>
          { getFieldDecorator('parameter', {
            initialValue: parameter || '无',
            onChange: onInputChange.bind(this, "parameter"),
          })(
            <Input/>
          )}
        </FormItem>
        <FormItem label="工具说明:" {...formItemLayout}>
          { getFieldDecorator('description', {
            initialValue: description || '无',
            onChange: onInputChange.bind(this, "description"),
          })(
            <TextArea/>
          )}
        </FormItem>
        <hr/>
        <FormItem wrapperCol={{span: 14}}>
          <Button type="primary" size="default" htmlType="submit" className="ok-button">确定</Button>
        </FormItem>
      </Form>
    )
  }
}

Info.propTypes = {
  create: PropTypes.object,
  location : PropTypes.object,
  loading : PropTypes.bool,
  dispatch : PropTypes.func
}

export default connect((state)=>{
  return {
    loading: state.loading.models[modelKey],
    create: state[modelKey],
  }
})(Form.create()(Info))
