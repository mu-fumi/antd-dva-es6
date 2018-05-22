/**
 * Created by wengyian on 2017/12/11.
 */
import React from 'react'
import PropTypes from 'prop-types'
import {Row, Col, Input, message, Button, Modal, Checkbox, Form, Slider, Select} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, SliderInput,} from 'components'
import {routerRedux, Link} from 'dva/router'
import {classnames, Cache, convertMToG} from 'utils'
import Json from 'utils/json'
import _ from 'lodash'
import {existDeployName} from 'services/deploy'
import styles from './DbTemp.less'

const FormItem = Form.Item
const Option = Select.Option

class DbTemp extends React.Component {
  constructor(props) {
    super(props)

  }

  componentWillReceiveProps(nextProps) {

  }

  changeBusinesses(val) {
    const id = val.split('-_-')[1]

    this.props.form.setFieldsValue({
      app: ''
    })
    if (this.props.clearAppList) {
      this.props.clearAppList()
    }
    if (this.props.getAppList) {
      this.props.getAppList(id)
    }
  }

  changeApp(val) {
    const name = this.props.form.getFieldValue('name')
    if (name !== undefined && name.trim() !== '') {
      let stack_id = this.props.selectedStack[0] && this.props.selectedStack[0].id
      let app_id = val.split('-_-')[1]
      existDeployName(name, stack_id, app_id)
        .then((res) => {
          if (res.code !== 0) {
            message.error(res.msg || res.error)
            this.props.form.setFields({
              name: {
                value: name,
                errors: res.msg || res.error
              }
            })
          }
        })
        .catch((err) => {
          message.error(err)
        })
    }
  }

  validatorName(rule, value, callback) {
    // callback 里面的文本会反馈到页面中
    const {selectedStack = [], form} = this.props
    let stack_id = selectedStack[0] && selectedStack[0].id
    let app = form.getFieldValue('app')
    let app_id = app && app.split('-_-')[1]
    if (value === undefined || value.trim() === ''
      || app_id === undefined || app_id.trim() === '') {
      return callback()
    } else {
      existDeployName(value, stack_id, app_id)
        .then((res) => {
          if (res.code === 0) {
            callback()
          } else {
            message.error(res.msg || res.error)
            callback(res.msg || res.error)
          }
        })
        .catch((err) => {
          message.error(err)
          callback(err)
        })
    }
  }

  render() {
    const {
      deployInfo = {}, appList = [], memoryMarks = {},
      businessList = [], form, template = '', formItemLayout = {}
    } = this.props
    const {getFieldDecorator} = form

    if (template !== 'DBTemp' && template !== 'HCFDB') {
      return null
    }


    return (
      <Row>
        <FormItem label="业务" {...formItemLayout}>
          {getFieldDecorator('business', {
            initialValue: deployInfo.business,
            onChange: this.changeBusinesses.bind(this),
            rules: [{
              required: true,
              message: '业务必选'
            }]
          })(
            <Select placeholder="请选择业务">
              {
                businessList && businessList.map(v => {
                  return <Option key={v.id} value={v.name + '-_-' + v.id}>
                    {v.name}
                  </Option>
                })
              }
            </Select>
          )}
        </FormItem>
        <FormItem label="应用" {...formItemLayout}>
          {getFieldDecorator('app', {
            initialValue: deployInfo.app,
            onChange: this.changeApp.bind(this),
            rules: [{
              required: true,
              message: '应用必选'
            }],
          })(
            <Select placeholder="请先选择业务" notFoundContent='该业务下无部署应用，无法部署集群'>
              {
                appList && appList.map(v => {
                  return <Option key={v.id} value={v.name + '-_-' + v.id}>
                    {v.name}
                  </Option>
                })
              }
            </Select>
          )}
        </FormItem>
        <FormItem label="名称" {...formItemLayout} className={styles["mgt-16"]}>
          { getFieldDecorator('name', {
            initialValue: deployInfo.name,
            validateTrigger : 'onBlur',
            rules: [{
              required: true,
              message: '请输入名称',
              whitespace: true,
            },{
              max : 50,
              message : '最多输入50个字符'
            }, {
              pattern: /^[\w\-]+$/,
              message: '只能输入字母、数字、破折号（-）以及下划线（_）'
            }, {
              validator: this.validatorName.bind(this)
            }]
          })(
            <Input placeholder="请输入名称"/>
          )}
        </FormItem>
        <FormItem label="数据库内存" {...formItemLayout}>
          { getFieldDecorator('memory', {
            initialValue: deployInfo.memory || 0,
            rules: [{
              required: true,
              message: '请选择数据库内存大小'
            }]
          })(
            <Slider marks={memoryMarks} step={null} tipFormatter={null}/>
          )}
        </FormItem>
      </Row>
    )
  }
}

DbTemp.propTypes = {
  serviceList: PropTypes.array,
  businessList: PropTypes.array,
  appList: PropTypes.array,
  selectedStack: PropTypes.array,
  clearAppList: PropTypes.func,
  getAppList: PropTypes.func,
  deployInfo: PropTypes.object,
  formItemLayout: PropTypes.object,
  template: PropTypes.string,
  form : PropTypes.object,
}

export default DbTemp

