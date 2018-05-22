/**
 * Created by wengyian on 2017/6/27.
 */

import Base from 'routes/base'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {
  Row, Col, Icon, message, Tag, Button,
  Modal, Form, Input, Select, Tabs, DatePicker, TimePicker
} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, HostFilter} from 'components'
import {routerRedux, Link} from 'dva/router'
import classnames from 'classnames'
import styles from './schedulers.less'
import _ from 'lodash'
import {constant, TimeFilter} from 'utils'

import ToolModal from './ToolModal'
import  moment from 'moment'

const modelKey = 'work/schedulers/add'
const FormItem = Form.Item
const Option = Select.Option
const InputGroup = Input.Group
const TabPane = Tabs.TabPane
const {CRONTAB_REG} = constant
const { TextArea } = Input

const formItemLayout = {
  labelCol: {
    span: 3
  },
  wrapperCol: {
    span: 12
  }
}

const crontabType = ['minute', 'hour', 'day', 'month', 'week']
const crontabText = ['分钟', '小时', '天', '月', '星期'];

class AddSchedule extends Base {

  constructor(props) {
    super(props)

    this.setGobackBtn()
    let pathname = this.props.location.pathname
    const activeName = pathname.includes('add') ? '新建任务' : '编辑任务'
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {activeName : activeName, selectedKey : '定时任务schedulers'},
      defer : true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })

    this.showToolModal = this.showToolModal.bind(this)
    this.onCancel = this.onCancel.bind(this)
    this.handleTabsChange = this.handleTabsChange.bind(this)
    this.selectMachine = this.selectMachine.bind(this)
    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.validateOnceTime = this.validateOnceTime.bind(this)
    this.handleReset = this.handleReset.bind(this)
    this.scheduleOnChange = this.scheduleOnChange.bind(this)
  }


  showToolModal() {
    this.props.dispatch({
      type: `${modelKey}/showToolModal`
    })
  }

  onCancel() {
    this.props.dispatch({type: `${modelKey}/hideToolModal`})
  }

  handleTabsChange(value) {
    this.props.dispatch({
      type: `${modelKey}/setActiveKey`,
      payload: value
    })
  }


  // 机器筛选部分
  selectMachine() {
    this.props.dispatch({
      type: `${modelKey}/showMachineModal`
    })
  }

  handleOk(data) {
    const { form, dispatch } = this.props
    const {setFieldsValue} = form
    // const {machineModalType, selectedIps} = addModels
    setFieldsValue({
      ips: data.join(',')
    })
    dispatch({type: `${modelKey}/hideMachineModal`})
    // const {setFieldsValue} = form
    // if (machineModalType === 'table') {
    //   setFieldsValue({
    //     ips: selectedIps
    //   })
    //   dispatch({type: `${modelKey}/hideMachineModal`})
    // } else if (machineModalType === 'column') {
    //   // 修改table 的 column 属性
    //   dispatch({
    //     type: `${modelKey}/setNeedShowColumns`,
    //   })
    //   // 设置 machineModalType 为 column
    //   dispatch({
    //     type: `${modelKey}/setMachineModalType`,
    //     payload: 'table'
    //   })
    // }
  }

  handleCancel() {
    const {dispatch} = this.props
    // const {machineModalType, needShowColumns} = addModels
    dispatch({type: `${modelKey}/hideMachineModal`})
    // if (machineModalType === 'table') {
    //   dispatch({type: `${modelKey}/hideMachineModal`})
    // } else if (machineModalType === 'column') {
    //   dispatch({
    //     type: `${modelKey}/setMachineModalType`,
    //     payload: 'table'
    //   })
    //   dispatch({
    //     type: `${modelKey}/setNewColumns`,
    //     payload: needShowColumns
    //   })
    // }
  }

  handleSubmit(e) {
    const {addModels, form, dispatch} = this.props
    const {
      activeKey, errTip, onceErr,
      chosenToolItem, isCreate, scheduleObj
    } = addModels
    const {validateFields} = form

    e.preventDefault()
    validateFields((err, values) => {
      if (err) {
        delete err.start_run_at
        if (!_.isEmpty(err)) {//验证基础信息
          return false
        }
      }

      if (activeKey == 1) {//验证周期任务
        if (Object.values(errTip).includes('has-error')) {
          return false
        }
        delete values.start_run_at
      } else {//验证一次性任务
        if (onceErr) {
          return false
        }
        delete values.schedule
        values.start_run_at = moment(values.start_run_at).format('YYYY-MM-DD HH:mm:ss')
      }

      values.need_repeat = activeKey

      let needDelete = [...crontabType]
      needDelete.forEach((val, index) => {
        delete values[val]
      })

      // 现在获取的 tool_id 是 tool_name 改过来
      values.tool_id = chosenToolItem.tool_id
      if (isCreate) {
        dispatch({
          type: `${modelKey}/submitAddSchedule`,
          payload: values
        })
      } else {
        dispatch({
          type: `${modelKey}/submitEditSchedule`,
          payload: {
            id: scheduleObj.id,
            data: values
          }
        })
      }

    })
  }

  validateOnceTime(rule, value, callback) {
    const {addModels, dispatch} = this.props
    const {
      activeKey
    } = addModels
    if (value == null && activeKey == 0) {
      dispatch({
        type: `${modelKey}/setOnceErr`,
        payload: true
      })
      callback('请选择日期')
    } else {
      dispatch({
        type: `${modelKey}/setOnceErr`,
        payload: false
      })
      callback()
    }
  }

  handleReset() {
    this.props.dispatch({
      type: `${modelKey}/resetNewColumns`
    })
  }

  scheduleOnChange(type, e) {
    // console.log('type===>', type)
    // console.log('e===>', e)

    const {addModels, form, dispatch} = this.props
    const {getFieldValue, setFieldsValue} = form
    let schedule = getFieldValue('schedule')
    let scheduleArr = schedule.split(' ')
    const index = crontabType.findIndex(val => val == e.target.id)

    // 验证值
    const err = CRONTAB_REG[type].test(e.target.value) ? '' : 'has-error'
    dispatch({
      type: `${modelKey}/setErrTip`,
      payload: {
        [type]: err
      }
    })
    if (err === '') {
      scheduleArr[index] = e.target.value
    } else {
      scheduleArr[index] = ''
    }
    schedule = scheduleArr.join(' ')
    setFieldsValue({
      'schedule': schedule
    })
  }


  render() {
    const {dispatch, loading, addModels, location, form} = this.props

    const { getFieldDecorator, setFieldsValue } = form

    let {
      tools, needShowTools, ToolModalVisible, chosenToolItem,
      scheduleObj, isCreate, activeKey, machineModalVisible,
      machineModalType, selectedIps, needShowColumns,
      filter, newColumns, errTip, onceErr
    } = addModels

    const toolButton = (
      <Col className={styles["cursor-pointer"]} onClick={this.showToolModal}>选择工具</Col>
    )


    let toolModalSettings = {
      visible: ToolModalVisible,
      title: '选择工具',
      tools: needShowTools,
      chosenToolItem: chosenToolItem,
      onClick: (params) => {
        dispatch({
          type: `${modelKey}/setChosenToolItem`,
          payload: params
        })
        dispatch({
          type: `${modelKey}/hideToolModal`
        })
        setFieldsValue({
          tool_id: params.tool_name,
          parameter: params.parameter
        })
      },
      onCancel: this.onCancel,
      handleSearch: (val) => {
        dispatch({
          type: `${modelKey}/setNeedShowTools`,
          payload: val
        })
      },
      footer: (<Button onClick={this.onCancel}>取消</Button>),
    }


    const crontab = () => {
      let values = []

      if (!isCreate) {
        if (scheduleObj.schedule) {
          values = scheduleObj.schedule.split(' ')
        } else {
          values = ['*', '*', '*', '*', '*']
        }
      } else {
        values = ['*', '*', '*', '*', '*']
      }

      const crontab_content = crontabText.map((value, index) => {
        return (
          <Col span="3" className={styles["mgr-offset-1"]} key={index}>
            <FormItem label={value}>
              {getFieldDecorator(`${crontabType[index]}`, {
                initialValue: values[index],
                onChange: (e) => this.scheduleOnChange(crontabType[index], e),
              })(
                <Input className={styles[`${errTip[crontabType[index]]}`]}/>
              )}
            </FormItem>
          </Col>
        )
      })

      return (
        <Row>
          <Row>{crontab_content}</Row>
          <Row>
            <FormItem>
              { getFieldDecorator('schedule', {
                initialValue: values.join(' ')
              })(
                <Input disabled/>
              )}
            </FormItem>
          </Row>
        </Row>
      )
    }


    // const footer = () => {
    //   if (machineModalType === 'table') {
    //     return (
    //       <Row>
    //         <Button onClick={this.handleCancel}>取消</Button>
    //         <Button type="primary" onClick={this.handleOk}>确定</Button>
    //       </Row>
    //     )
    //   } else if (machineModalType === 'column') {
    //     return (
    //       <Row>
    //         <Button className={styles['reset-btn']} onClick={this.handleReset}>恢复默认</Button>
    //         <Button onClick={this.handleCancel}>取消</Button>
    //         <Button type="primary" onClick={this.handleOk}>确定</Button>
    //       </Row>
    //     )
    //   }
    // }

    const HostFilterProps = {
      visible : machineModalVisible,
      onOk : this.handleOk,
      onCancel : this.handleCancel,
    }

    // const machineModalProps = {
    //   visible: machineModalVisible,
    //   type: machineModalType,
    //   maskClosable: false,
    //   needShowColumns,
    //   filter,
    //   newColumns,
    //   handleColumn: () => {
    //     dispatch({
    //       type: `${modelKey}/setMachineModalType`,
    //       payload: 'column'
    //     })
    //   },
    //   onCancel: () => {
    //     dispatch({type: `${modelKey}/hideMachineModal`})
    //   },
    //   rowOnChange: (data) => {
    //     dispatch({
    //       type: `${modelKey}/setSelectedIps`,
    //       payload: data
    //     })
    //   },
    //   columnsChange: (data) => {
    //     dispatch({
    //       type: `${modelKey}/setNewColumns`,
    //       payload: data
    //     })
    //   },
    //   handleSearch: (data) => {
    //     dispatch({
    //       type: `${modelKey}/handleFilter`,
    //       payload: data
    //     })
    //   },
    //   footer: footer()
    // }


    let onceTime = (() => {
      if (scheduleObj.start_run_at) {
        return moment(scheduleObj.start_run_at, 'YYYY-MM-DD HH:mm:ss')
      } else {
        return moment(new Date, 'YYYY-MM-DD HH:mm:ss')
      }
    })()


    return (
      <Row>
        <Form
          layout="horizontal"
          className={styles["form"]}
          onSubmit={this.handleSubmit}
        >
          <FormItem label="工具" {...formItemLayout}>
            { getFieldDecorator('tool_id', {
              initialValue: isCreate ? '' : scheduleObj ? scheduleObj.tool_name : '',
              rules: [{
                required: true,
                message: '请选择工具'
              }]
            })(
              <Input addonAfter={toolButton} disabled={true} className={styles["cursor-text"]}/>
            )}
          </FormItem>
          <FormItem label="工具输入" {...formItemLayout}>
            { getFieldDecorator('parameter', {
              initialValue: isCreate ? '' : scheduleObj ? scheduleObj.parameter : '',
              rules: [{}]
            })(
              <TextArea />
            )}
          </FormItem>
          <FormItem label="名称" {...formItemLayout}>
            { getFieldDecorator('name', {
              initialValue: isCreate ? '' : scheduleObj ? scheduleObj.name : '',
              rules: [{
                required: true,
                message: '请输入名称'
              }]
            })(
              <Input />
            )}
          </FormItem>

          <FormItem label="目标机器:" {...formItemLayout}>
            { getFieldDecorator('ips', {
              initialValue: isCreate ? '' : scheduleObj ? scheduleObj.ips : '',
              rules: [{
                required: true,
                message: '请输入目标机器'
              }]
            })(
              <TextArea placeholder="多个机器请用逗号隔开"/>
            )}
          </FormItem>
          <Row className={styles["mg-btn"]}>
            <Col offset="3">
              <Button onClick={this.selectMachine}><IconFont type="plus"/>筛选机器</Button>
            </Col>
          </Row>

          <FormItem label="执行用户:" {...formItemLayout}>
            { getFieldDecorator('run_user', {
              initialValue: isCreate ? '' : scheduleObj ? scheduleObj.run_user : '',
              rules: [{}]
            })(
              <Input placeholder='root'/>
            )}
          </FormItem>

          <Row>
            <Col span="3" className={classnames('text-right', styles["schedule-style"])}>执行策略:</Col>
            <Col span="12">
              <Tabs className={styles["tabs-my-container"]}
                    activeKey={activeKey.toString()}
                    onTabClick={this.handleTabsChange}
              >
                <TabPane tab="周期性任务" key="1">{crontab()}</TabPane>
                <TabPane tab="一次性任务" key="0">
                  <FormItem className={styles["w-180"]}>
                    { getFieldDecorator('start_run_at', {
                      initialValue: onceTime,
                      rules: [
                        {type: 'object', message: '请选择时间'},
                        {validator: this.validateOnceTime}
                      ]
                    })(
                      <DatePicker
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                      />
                    )}
                  </FormItem>
                </TabPane>
              </Tabs>
            </Col>
          </Row>
          <FormItem wrapperCol={{span: 14, offset: 3}} className={styles["mgt-4"]}>
            <Button type="primary" htmlType="submit">保存任务</Button>
          </FormItem>
        </Form>
        <ToolModal {...toolModalSettings}/>
        <HostFilter {...HostFilterProps}/>
      </Row>
    )
  }
}

AddSchedule.propTypes = {
  addModels: PropTypes.object,
  location: PropTypes.object,
  loading: PropTypes.bool,
  dispatch: PropTypes.func
}

export default connect((state) => {
  return {
    loading: state.loading.models[modelKey],
    addModels: state[modelKey],
  }
})(Form.create()(AddSchedule))
