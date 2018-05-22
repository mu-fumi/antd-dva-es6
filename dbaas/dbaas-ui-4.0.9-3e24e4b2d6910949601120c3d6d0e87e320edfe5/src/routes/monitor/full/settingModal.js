/**
 * Created by wengyian on 2018/3/28.
 */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, Input, message, Form, Radio, Modal, Select, Switch, InputNumber} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon} from 'components'
import {routerRedux, Link, browserHistory,} from 'dva/router'
import {classnames, constant, Logger} from 'utils'
import _ from 'lodash'
import styles from './settingModal.less'
import RelateSelect from './relateSelect'

const { CRONTAB_REG } = constant
const FormItem = Form.Item
const Option = Select.Option
const crontabType = ['minute', 'hour', 'day', 'month', 'week']
const crontabText = ['分钟', '小时', '天', '月', '周'];
const formLayout = {
  labelCol: {
    span: 4
  },
  wrapperCol: {
    span: 16,

  }
}
class SettingModal extends React.Component{
  constructor(props) {
    super(props)

    // preErrTip 只是为了切换 isCheck 的时候用的
    // 当切换成 false 的时候 就把 errTip 赋值给 preErrTip
    // 当切换成 true 的时候 就把 preErrTip 赋值给 errTip
    // 别的东西切换的时候 不需要管
    this.state = {
      isCheck: !!props.settingModalValue.disabled,
      instanceNumber: props.settingModalValue.group_size,
      interval: props.settingModalValue.interval,
      grayList: props.settingModalValue.gray,
      schedule: props.settingModalValue.schedule,
      errTip: {},
      preErrTip: {},
      selectedNodes: [],
      isShow: false,
    }

    this.switchChange = this.switchChange.bind(this)
    this.handleSelectChange = this.handleSelectChange.bind(this)
    this.handleScheduleChange = this.handleScheduleChange.bind(this)
    this.handleNumberChange = this.handleNumberChange.bind(this)
    this.handleIntervalChange = this.handleIntervalChange.bind(this)
    this.handleOk = this.handleOk.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.changeRelateId = this.changeRelateId.bind(this)
    this.changeRelateType = this.changeRelateType.bind(this)
  }
  changeBusinesses(value) {
    const id = value.split('-_-')[1]
    const relate = this.props.form.getFieldValue('relate')
    const {type} = relate
    // 清空其他已选项
    this.props.form.setFieldsValue({
      app_id: '',
      relate: {
        type: type,
        id: ''
      },
    })

    if (this.props.getApps) {
      this.props.getApps(id)
    }
  }
  changeApps(value) {
    const appId = value.split('-_-')[1]

    const relate = this.props.form.getFieldValue('relate')
    const {type} = relate
    if (this.props.getRelateList) {
      this.props.getRelateList({
        type,
        data: {
          app_id: appId
        }
      })
    }

    // 清空服务
    this.props.form.setFieldsValue({
      // cluster_id : '',
      relate: {
        type: type,
        id: ''
      },
      app_id: '',
    })

  }
  changeRelate(value) {

    if (value.change === 'type') {
      this.changeRelateType(value)
    } else if (value.change === 'id') {
      this.changeRelateId(value)
    }
  }
  changeRelateId(value) {
  }

  changeRelateType(value) {
    const {form} = this.props
    const app = form.getFieldValue('app_id')
    if (!app) {
      return
    }
    if (this.props.clearRelate) {
      this.props.clearRelate()
    }
    const app_id = app.split('-_-')[1]
    const relateType = value.type
    form.setFieldsValue({
      relate: {
        id: '',
        type: relateType
      }
    })
    if (this.props.getRelateList) {
      this.props.getRelateList({
        type: relateType,
        data: {
          app_id: app_id
        }
      })
    }
  }

    handleSelectChange(val) {
      this.setState({
        grayList: val
      })
      this.props.form.setFieldsValue({
        belong_id: '',
      })
    }


  componentWillReceiveProps(nextProps) {
    if(!_.isEqual(nextProps.settingModalValue, this.props.settingModalValue)) {
      this.setState({
        isCheck: !!nextProps.settingModalValue.disabled,
        instanceNumber: nextProps.settingModalValue.group_size,
        interval: nextProps.settingModalValue.interval,
        grayList: nextProps.settingModalValue.gray,
        schedule: nextProps.settingModalValue.schedule,
        errTip: {},
        preErrTip: {}
      })
    }
  }


  switchChange(checked) {
    const {errTip, preErrTip} = this.state
    if(checked) {
      this.setState({
        isCheck: checked,
        errTip: preErrTip,
        preErrTip: {}
      })
    }else {
      this.setState({
        errTip: {},
        isCheck: checked,
        preErrTip: errTip
      })
    }

    this.setState({
      isCheck: checked
    })
  }

  handleNumberChange(val) {
    const err = val ? '' : 'has-error'
    this.setState({
      instanceNumber: val,
      errTip: {
        ...this.state.errTip,
        instanceNumber: err
      }
    },)
  }

  handleIntervalChange(val) {
    const err = val ? '' : 'has-error'
    this.setState({
      interval: val,
      errTip: {
        ...this.state.errTip,
        interval: err
      }
    })
  }

  handleScheduleChange(key, e) {
    let { schedule, errTip } = this.state
    let scheduleArr = schedule.split(' ')
    const index = crontabType.findIndex(val => val === key)
    const inputValue = e.target.value
    const err = CRONTAB_REG[key].test(inputValue) ? '' : 'has-error'

    if(err) {
      scheduleArr[index] = ''
    } else {
      scheduleArr[index] = inputValue
    }
    const newSchedule = scheduleArr.join(' ')
    this.setState({
      'schedule': newSchedule,
      errTip: {
        ...this.state.errTip,
        [key]: err
      }
    })
  }

  handleOk() {
    const {isCheck, errTip, instanceNumber, interval, schedule, grayList} = this.state
    const errTipKey = Object.keys(errTip)
    // 因为 isCheck 为 false 的时候 errTip 必定是 {}
    // 所以不需要更具 isCheck 的 true false 来判断是否需要验证
    // 直接判断 errTip 内容 即可
    // 如果 errTip 为 [] 那肯定没问题
    // 不为空的话 就判断每项的值是否为 has-error
    let isError = false
    if(errTipKey.length) {
      for (let i = 0; i < errTipKey.length; i++) {
        if (errTip[errTipKey[i]] === 'has-error') {
          isError = true
          break
        }
      }
    }
    if (isError) {
      message.error('参数错误')
      return
    } else {
      if (grayList.length === 0 && isCheck) {
        Modal.confirm({
          title: '提示',
          content: '灰度名单为空，强烈建议设置灰度名单！',
          okText: '暂不设置',
          cancelText: '去设置',
          onOk: this.handleSubmit
        })
      }else {
        this.handleSubmit()
      }
    }
  }

  handleSubmit() {
    const {isCheck, instanceNumber, interval, schedule, grayList} = this.state
    const data = {
      disabled: isCheck ? 1 : 0,
      gray: grayList,
      group_size: instanceNumber,
      interval,
      schedule
    }
    if (this.props.onOk) {
      this.props.onOk(data)
    }
  }

  selectIsVisible() {
    this.setState({
      isShow:true,
    })
  }

  render() {
    const {visible, onCancel, grayList,businesses,apps,selectedBaseInfo = {},form,relateList,settingModalValue} = this.props
    const {getFieldDecorator} = form
    const relateSelectProps = {
      relateList,
    }
    const isVisible = this.state.isShow ? 'block' : 'none';
    const crontab = () => {
      let values = []
      if (this.state.schedule) {
        values = this.state.schedule.split(' ')
      } else {
        values = ['*', '*', '*', '*', '*']
      }

      const crontab_content = crontabText.map((value, index) => {
        return (
          <Col span="4" className={styles['mgr-offset-1']} key={index}>
            <Row>{value}</Row>
            <Row className={styles['gutter-base']}>
              <Input
                defaultValue={values[index]}
                className={styles[`${this.state.errTip[crontabType[index]]}`]}
                onChange={(e) => this.handleScheduleChange(crontabType[index], e)}
                disabled={!this.state.isCheck}
              />
            </Row>
          </Col>
        )
      })
      return crontab_content
    }

    return (
      <Modal
        title="调度配置"
        visible={visible}
        onCancel={onCancel}
        onOk={this.handleOk}
        className={styles['setting-modal']}
      >
        <Row className={styles['item']}>
          <Col span="5">
            开启调度：
          </Col>
          <Col span="15">
            <Switch
              checkedChildren="开"
              unCheckedChildren="关"
              defaultChecked={this.state.isCheck}
              onChange={this.switchChange}/>
          </Col>
        </Row>
        <Row className={styles['item']}>
          <Col span="4">
            调度周期：
          </Col>
          <Col span="20">
            {crontab()}
            <Input
              disabled={true}
              value={this.state.schedule}
              className={styles['schedule']}
            />
          </Col>
        </Row>
        <Row className={styles['item']}>
          <Col className={styles['name-item']} span="4">限速控制：</Col>
          <Col span="20">
            <span>每组 </span>
            <InputNumber
              className={classnames(styles['mgt-8'], styles[`${this.state.errTip.instanceNumber}`])}
              min={1}
              disabled={!this.state.isCheck}
              defaultValue={this.state.instanceNumber}
              onChange={this.handleNumberChange}
            />
            <span> 个实例进行巡检，每组巡检间隔 </span>
            <InputNumber
              min={60}
              disabled={!this.state.isCheck}
              defaultValue={this.state.interval}
              className={styles[`${this.state.errTip.interval}`]}
              onChange={this.handleIntervalChange}
            />
            <span> 秒</span>
          </Col>
        </Row>
        <Form>
          <FormItem label="业务:" {...formLayout} style={{display:isVisible}}>
            {getFieldDecorator('business_id', {
              initialValue: selectedBaseInfo.business_id,
              onChange: this.changeBusinesses.bind(this),
              rules: [{
                required: true,
                message: '业务必选'
              }]
            })(
              <Select>
                {
                  businesses && businesses.map(v => {
                    return <Option key={v.value} value={v.label + '-_-' + v.value}>
                      {v.label}
                    </Option>
                  })
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="应用：" {...formLayout} style={{display:isVisible}}>
            {getFieldDecorator('app_id', {
              initialValue: selectedBaseInfo.app_id,
              onChange: this.changeApps.bind(this),
              rules: [{
                required: true,
                message: '应用必选'
              }]
            })(
              <Select>
                {
                  apps && apps.map(v => {
                    return <Option key={v.value} value={v.label + '-_-' + v.value}>
                      {v.label}
                    </Option>
                  })
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="所属：" {...formLayout} style={{display:isVisible}}>
            {
              getFieldDecorator('relate', {
                initialValue: {
                  type: selectedBaseInfo.relateType,
                  id: selectedBaseInfo.relateId
                },
                onChange: this.changeRelate.bind(this),
                rules: [{
                  required: true,
                  message: '所属必选',
                }]
              })(
                <RelateSelect {...relateSelectProps}/>
              )
            }
          </FormItem>
          <FormItem label="灰度名单：" {...formLayout}>
            {getFieldDecorator('belong_id', {
              initialValue: settingModalValue.gray,
              onChange: this.handleSelectChange.bind(this),
            })(
              <Select
                mode="multiple"
                onFocus={this.selectIsVisible.bind(this)}
              >
                {
                  relateList && relateList.map(v => {
                    return <Option key={v.value} value={v.label}>
                      {v.label}
                    </Option>
                  })

                }
              </Select>
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

SettingModal.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  selectedBaseInfo: PropTypes.object,
  settingModalValue: PropTypes.object,
  grayList: PropTypes.array,
  businesses:PropTypes.array,
  apps:PropTypes.array,
}
export default Form.create()(SettingModal)

