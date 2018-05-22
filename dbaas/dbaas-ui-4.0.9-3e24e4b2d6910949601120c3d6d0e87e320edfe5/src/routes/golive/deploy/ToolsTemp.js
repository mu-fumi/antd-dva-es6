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
import styles from './ToolsTemp.less'

const CheckboxGroup = Checkbox.Group
const FormItem = Form.Item
const TextArea = Input.TextArea

class ToolsTemp extends React.Component {
  constructor(props) {
    super(props)

    this.serviceContent = this.serviceContent.bind(this)
  }

  componentWillReceiveProps(nextProps) {

  }

  serviceContent = () => {
    let {serviceList = [], form, deployInfo = {}} = this.props
    const {getFieldDecorator} = form
    let defaultService = []
    for (let i = 0; i < serviceList.length; i++) {

      /***********************20171127 必选的服务新增字段 required  1:必选  0：非必选 *******************************/
      /***********************不必在单独判断 zabbix了 *******************************/
      // if(serviceList[i].name && serviceList[i].name.toLowerCase().includes('zabbix-agent')){
      //   const value = serviceList[i].name + '-_-' + serviceList[i].id
      //   defaultService = defaultService.concat(value)
      //   break
      // }
      if (serviceList[i].required === 1) {
        const value = serviceList[i].name + '-_-' + serviceList[i].id
        defaultService = defaultService.concat(value)
      }
      /***********************over*******************************/
    }
    if (serviceList.length) {
      // console.log('defaultService===>', defaultService)
      return getFieldDecorator('service', {
        // 此处 value 用 name-id 是为了方便存储 信息
        initialValue: deployInfo.service ? deployInfo.service : defaultService,
        rules: [{
          required: true,
          message: '请选择服务',
        },
          /****************** 20171127 有必选字段 并且自动选上不让操作了 不需要在单独验证了******************************/
          //   {
          //   validator : this.validateService
          // }
          /*********************************over*******************************/
        ]
      })(
        <CheckboxGroup className={styles["checkboxGroup"]}>
          <Row type="flex" justify="space-between">
            {
              serviceList.map(item => {
                /**********20171215 新增 visible 0 不显示 1 显示************/
                /********* 通过display 来控制显示隐藏 ***********/
                return <Col key={item.id} span="11" style={{display : item.visible === 0 ? 'none' : ''}}>
                  <Checkbox
                    value={item.name + '-_-' + item.id}
                    key={item.id} disabled={item.required === 1}
                  >
                    {item.name}
                  </Checkbox>
                </Col>
              })
            }
          </Row>
        </CheckboxGroup>
      )
    } else {
      return <Row>服务加载中...</Row>
    }
  }

  render() {
    const {form, deployInfo = {}, template = '', formItemLayout = {}} = this.props
    const {getFieldDecorator} = form

    if (template !== 'ToolsTemp' && template !== 'DBTemp' && template !== 'HCFDB') {
      return null
    }
    return (
      <Row>
        <FormItem label="描述" {...formItemLayout}>
          { getFieldDecorator('description', {
            initialValue: deployInfo.description,
            rules : [{
              max : 255,
              message : '描述不能超过255个字符'
            }]
          })(
            <TextArea placeholder="描述不能超过255个字符"/>
          )}
        </FormItem>
        <FormItem label="服务" {...formItemLayout}>
          {this.serviceContent()}
        </FormItem>
      </Row>
    )
  }
}

ToolsTemp.propTypes = {
  serviceList: PropTypes.array,
  form: PropTypes.object,
  deployInfo: PropTypes.object,
  formItemLayout: PropTypes.object,
  template: PropTypes.string,
}

export default ToolsTemp
