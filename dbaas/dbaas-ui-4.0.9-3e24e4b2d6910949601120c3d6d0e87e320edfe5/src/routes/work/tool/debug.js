/**
 *
 * @copyright(c) 2017
 * @created by  lizzy
 * @package dbaas-ui
 * @version :  2017-06-26 10:41 $
 */
// 编辑页及新建页调试

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Form, Input, message, Button, Spin } from 'antd'
import { DataTable, Layout, Search, ProgressIcon, IconFont, HostFilter } from 'components'
import { classnames, Cache } from 'utils'
import ResultModal from './resultModal'
require('codemirror/lib/codemirror.css')

const cache = new Cache()
const modelKey = 'work/tool/create'
const FormItem = Form.Item

const formItemLayout = {
  labelCol : {
    span : 2
  },
  wrapperCol : {
    span : 10
  }
}

function Debug ({
  dispatch,
  loading,
  create,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
    setFieldsValue,
  },
 }) {

  const { machineModalVisible, resultModalVisible, debugResult, toolDetail, toolID } = create

  const { toolName, newTags, code, script, parameter } = toolDetail

  const selectMachine = () => {
    dispatch({ type: `${modelKey}/showMachineModal` })
  }

  const startDebugging = () => {
    validateFields((err, values) => {
      if (err) {
        return false
      }
      const data = {
        ...getFieldsValue()
      }
      const code = cache.get('currentCode')
      if (code) {
        dispatch({
          type: `${modelKey}/handleLoading`,
          payload: true
        })
        dispatch({
          type: `${modelKey}/startDebugging`,
          payload: { ...data, code, script_type: script, parameter }
        })
      } else {
        dispatch({
          type: `${modelKey}/handleProps`,
          payload: {activeKey: '1'}
        })
        message.error('请填写脚本代码后再执行调试！')
      }
    })
  }

  const handleSubmit = () => { // 除code从缓存获取外，其他都从model获取
    const code = cache.get('currentCode')
    if (toolName && code && (newTags.length>0)) { // 基本信息必填项都填了才能发起新建工具请求，否则跳转基本信息页
      let data = { ...toolDetail }    // 根据参数对应修改变量名
      data.tool_name = data.toolName
      data.script_type = data.script
      data.tags = data.newTags
      delete data['toolName']
      delete data['script']
      delete data['newTags']
      const debugData = {
        ...getFieldsValue()
      }
      if (toolID) {
        dispatch({
          type: `${modelKey}/updateTool`,
          payload: { ...data, code, ...debugData, id: toolID }
        })
      } else {
        dispatch({
          type: `${modelKey}/createTool`,
          payload: { ...data, code, ...debugData }
        })
      }
    } else {
      dispatch({
        type: `${modelKey}/handleProps`,
        payload: {activeKey: '1'}
      })
      message.error('请填写必填项后再进行保存！')
    }
  }

  const HostFilterProps = {
    visible: machineModalVisible,
    onOk: (data) => {
      setFieldsValue({
        ips: data.join(',')
      })
      dispatch({ type: `${modelKey}/hideMachineModal` })
    },
    onCancel: () => {
      dispatch({ type: `${modelKey}/hideMachineModal` })
    },
  }

  const resultModalProps = {
    visible: resultModalVisible,
    debugResult,
    onOk: () => {
      dispatch({ type: `${modelKey}/hideResultModal` })
    },
    onCancel: () => {
      dispatch({ type: `${modelKey}/hideResultModal` })
    },
  }

  return (
  	<div>
      <Spin spinning={loading} size="large">
        <Form layout="horizontal" className="debug">
          <FormItem label="目标机器:" {...formItemLayout}>
            { getFieldDecorator('ips', {
              initialValue : '',
              rules : [{
                required : true,
                message : '请输入目标机器'
              }]
            })(
              <Input />
            )}
          </FormItem>
          <div className="button-wrapper">
            <Button onClick={selectMachine}>
              <IconFont type="plus"/>
              筛选机器
            </Button>
          </div>
          <FormItem label="执行用户:" {...formItemLayout}>
            { getFieldDecorator('run_user', {
              initialValue : 'root',
            })(
              <Input />
            )}
          </FormItem>
          <div className="button-wrapper">
            <Button onClick={startDebugging}>
              <IconFont type="iconfont-debug"/>
              执行调试
            </Button>
          </div>
          <hr/>
          <div className="button-wrapper">
            <Button type="primary" onClick={handleSubmit} className='ok-button'>确定</Button>
          </div>
        </Form>
      </Spin>
	    <HostFilter {...HostFilterProps}/>
      <ResultModal {...resultModalProps}/>
    </div>
  )
}

Debug.propTypes = {
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
})(Form.create()(Debug))
