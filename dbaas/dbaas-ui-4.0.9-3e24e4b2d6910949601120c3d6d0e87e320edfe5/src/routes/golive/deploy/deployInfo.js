/**
 * Created by wengyian on 2017/8/18.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Input, message, Button, Modal, Checkbox, Form, Slider, Select } from 'antd'
import { DataTable, Layout, Search, Filter, IconFont, SliderInput, } from 'components'
import { routerRedux, Link } from 'dva/router'
import { classnames, Cache, convertMToG, Logger } from 'utils'
import Json from 'utils/json'
import _ from 'lodash'
import { existDeployName } from 'services/deploy'
import styles from './create.less'

import DbTemp from './DbTemp'
import ToolsTemp from './ToolsTemp'
import Hcfdb from './Hcfdb'


const FormItem = Form.Item
const TextArea = Input.TextArea
const Option = Select.Option
const CheckboxGroup = Checkbox.Group
const cache = new Cache()

class DeployInfo extends React.Component{
  constructor(props){
    super(props)

    // this.state = {
    //   serviceList : props.serviceList,
    //   deployInfo : props.deployInfo,
    //   selectedStack : props.selectedStack,
    // }

    this.handleNext = this.handleNext.bind(this)
    this.handlePrev = this.handlePrev.bind(this)
    // this.validateService = this.validateService.bind(this)
  }

  componentWillReceiveProps(nextProps){
    // console.log('nextProps===>', nextProps)

    // if(!_.isEqual(nextProps.serviceList, this.state.serviceList) ||
    //   !_.isEqual(nextProps.deployInfo, this.state.deployInfo) ||
    //   !_.isEqual(nextProps.selectedStack, this.state.selectedStack)
    // ){
    //   this.setState({
    //     serviceList : nextProps.serviceList,
    //     deployInfo : nextProps.deployInfo,
    //     selectedStack : nextProps.selectedStack
    //   })
    // }
  }

  handlePrev(){
    if(this.props.prev){
      this.props.prev()
    }
  }

  handleNext(){
    this.props.form.validateFields((err, values) => {
      if(err){
        return false
      }
      // 此处获取的 memory 的值为 0,25,50,75,100 记得在最后转为 1G,2G...
      // 缓存相关 form 信息
      let { service } = values
      // zabbix 服务需要展示在最后
      const index = service.findIndex(v =>{
        if(v){
         return  v.toLowerCase().includes('zabbix')
        }
      })
      if(index > -1){
        const zabbixservice = service[index]
        service.splice(index, 1)
        service.push(zabbixservice)
      }
      // 获取serviceId  格式 "1,2,3"
      let service_id = service.map(val => val.split('-_-')[1]).join(',')
      let stack_id = this.props.selectedStack[0] && this.props.selectedStack[0].id

      // 处理机器筛选的过滤条件
      this.props.handleFilter && this.props.handleFilter({memory : values.memory})
      if(this.props.preSelectedService !== service_id){// 如果和之前选的服务一致，不管，不一致则重新赋值
        this.props.setSelectedService && this.props.setSelectedService(service_id)
        this.props.getConfig && this.props.getConfig({service_id, stack_id})
      }
      // cache.put('deploy-info', Json.dumps(values))
      this.props.setDeployInfo && this.props.setDeployInfo(values)
      this.props.next && this.props.next()
    })
  }

  // validatorName(rule, value, callback){
  //   // callback 里面的文本会反馈到页面中
  //   let stack_id = this.props.selectedStack[0] && this.props.selectedStack[0].id
  //   let app= this.props.form.getFieldValue('app')
  //   let app_id = app && app.split('-_-')[1]
  //   if(value === undefined || value.trim() ===''
  //     || app_id === undefined || app_id.trim() === ''){
  //     return callback()
  //   }else{
  //     existDeployName( value, stack_id, app_id)
  //       .then((res) => {
  //         if(res.code === 0){
  //           callback()
  //         }else{
  //           message.error( res.msg || res.error )
  //           callback(res.msg || res.error )
  //         }
  //       })
  //       .catch((err) => {
  //         message.error(err)
  //         callback(err)
  //       })
  //   }
  // }

  // validateService(rule, value, callback){
  //   if(value.length === 1){
  //     let name = value[0].split('-_-')[0]
  //     if(name.toUpperCase() === 'ZABBIX-AGENT'){
  //       callback('至少选择一个非 zabbix 服务')
  //     }else{
  //       callback()
  //     }
  //   }else{
  //     callback()
  //   }
  // }

  // changeApp(val){
  //   const name = this.props.form.getFieldValue('name')
  //   if(name !== undefined){
  //     let stack_id = this.props.selectedStack[0] && this.props.selectedStack[0].id
  //     let app_id = val.split('-_-')[1]
  //     existDeployName( name, stack_id, app_id)
  //       .then((res) => {
  //         if(res.code !== 0) {
  //           message.error(res.msg || res.error)
  //           this.props.form.setFields({
  //             name: {
  //               value: name,
  //               errors: ['抱歉，名称已被占用']
  //             }
  //           })
  //         }
  //       })
  //       .catch((err) => {
  //         message.error(err)
  //       })
  //   }
  // }
  //
  // changeBusinesses(val){
  //   const id = val.split('-_-')[1]
  //
  //   this.props.form.setFieldsValue({
  //     app : ''
  //   })
  //   if(this.props.clearAppList){
  //     this.props.clearAppList()
  //   }
  //   if(this.props.getAppList){
  //     this.props.getAppList(id)
  //   }
  // }

  // serviceContent = () => {
  //   let { serviceList = [], form, deployInfo = {} } = this.props
  //   const { getFieldDecorator } = form
  //   let defaultService = []
  //   for(let i = 0; i < serviceList.length; i++){
  //
  //
  //     /***********************20171127 必选的服务新增字段 required  1:必选  0：非必选 *******************************/
  //     /***********************不必在单独判断 zabbix了 *******************************/
  //     // if(serviceList[i].name && serviceList[i].name.toLowerCase().includes('zabbix-agent')){
  //     //   const value = serviceList[i].name + '-_-' + serviceList[i].id
  //     //   defaultService = defaultService.concat(value)
  //     //   break
  //     // }
  //     if(serviceList[i].required === 1){
  //       const value = serviceList[i].name + '-_-' + serviceList[i].id
  //       defaultService = defaultService.concat(value)
  //     }
  //     /***********************over*******************************/
  //   }
  //   if(serviceList.length){
  //     // console.log('defaultService===>', defaultService)
  //     return getFieldDecorator('service', {
  //       // 此处 value 用 name-id 是为了方便存储 信息
  //       initialValue : deployInfo.service ? deployInfo.service :defaultService,
  //       rules : [{
  //         required : true,
  //         message : '请选择服务',
  //       },
  //         /****************** 20171127 有必选字段 并且自动选上不让操作了 不需要在单独验证了******************************/
  //       //   {
  //       //   validator : this.validateService
  //       // }
  //         /*********************************over*******************************/
  //       ]
  //     })(
  //       <CheckboxGroup className={styles["checkboxGroup"]}>
  //         <Row type="flex" justify="space-between">
  //         {
  //           serviceList.map(item => {
  //             if(item.visible !== 0){
  //               return <Col key={item.id} span="11">
  //                 <Checkbox
  //                   value={item.name + '-_-' + item.id}
  //                   key={item.id} disabled={item.required === 1}
  //                 >
  //                   {item.name}
  //                 </Checkbox>
  //               </Col>
  //             }
  //           })
  //         }
  //         </Row>
  //       </CheckboxGroup>
  //     )
  //   }else {
  //     return  <Row>服务加载中...</Row>
  //   }
  // }

  render(){

    const { form, deployInfo = {}, selectedStack = [],
      serviceList = [], businessList = [], appList = [],
      memoryMarks, template, chunkKeeperList, zooKeeperList
    } = this.props
    const { getFieldDecorator } = form

    // let stackInfo = Json.loads(cache.get('deploy-stackInfo'))
    // console.log('stackInfo===>', stackInfo)
    // let stackName = stackInfo && stackInfo.name

    const formItemLayout = {
      labelCol : {
        span : 3
      },
      wrapperCol : {
        span : 12
      }
    }

    // const sliderMarks = {
    //   0 : '1G',
    //   25 : '2G',
    //   50 : '4G',
    //   75 : '8G',
    //   100 : '16G',
    // }

    // const memoryMark = this.calcMemoryMarks(memoryRange)

    // 此处的onchange 方法感觉有问题呀

    const stackName = selectedStack[0] && selectedStack[0].name

    const dbTempProps = {
      deployInfo,
      appList,
      memoryMarks,
      businessList,
      getAppList: this.props.getAppList,
      clearAppList : this.props.clearAppList,
      selectedStack,
      form,
      template,
      formItemLayout,
    }

    const toolsTempProps = {
      deployInfo,
      serviceList,
      form,
      template,
      formItemLayout,
    }

    const hcfdbProps = {
      deployInfo,
      zooKeeperList,
      chunkKeeperList,
      form,
      template,
      formItemLayout,
    }

    const className = classnames(styles["button-row"], 'text-right')

    return (
      <Form>
        <Row className={styles["info-tip"]}>
          已选套件 : {stackName}
        </Row>
        <DbTemp {...dbTempProps}/>
        <Hcfdb {...hcfdbProps}/>
        <ToolsTemp {...toolsTempProps}/>
        <Row className={className}>
          <Button onClick={this.handlePrev} className="mgr-16">上一步</Button>
          <Button type="primary" onClick={this.handleNext}>下一步</Button>
        </Row>
      </Form>
    )
  }
}

DeployInfo.proptypes = {
  serviceList : PropTypes.array,
  businessList : PropTypes.array,
  appList : PropTypes.array,
  chunkKeeperList : PropTypes.array,
  zooKeeperList : PropTypes.array,
  next : PropTypes.func,
  getConfig : PropTypes.func,
  setDeployInfo : PropTypes.func,
  setConfig : PropTypes.func,
  selectedStack : PropTypes.array,
  selectedService : PropTypes.array,
  template : PropTypes.string,
  preSelectedService : PropTypes.string,
  setSelectedService : PropTypes.func,
  handleFilter : PropTypes.func,
  clearAppList : PropTypes.func,
  getAppList : PropTypes.func,
  memoryMarks : PropTypes.object,
  deployInfo : PropTypes.object
}

export default Form.create()(DeployInfo)
