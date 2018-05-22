/**
 * Created by wengyian on 2017/9/8.
 */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, Select, message, Form, Button, Modal, Checkbox, Input} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon} from 'components'
import {routerRedux, Link, browserHistory,} from 'dva/router'
import {classnames, constant, TimeFilter, Logger} from 'utils'
import Json from 'utils/json'
import _ from 'lodash'
import {getService} from 'services/nodes'
import styles from './add.less'
import RelateSelect from './relateSelect'

const FormItem = Form.Item
const Option = Select.Option
const CheckboxGroup = Checkbox.Group
const InputGroup = Input.Group;
const {RELATE_TYPE, NODE_ADD_RELATE, CHUNKKEEPER_ID} = constant

const formLayout = {
  labelCol: {
    span: 3
  },
  wrapperCol: {
    span: 14
  }
}

class BaseInfo extends React.Component {
  constructor(props) {
    super(props)

    this.next = this.next.bind(this)
    this.validateService = this.validateService.bind(this)
    this.changeRelateId = this.changeRelateId.bind(this)
    this.changeRelateType = this.changeRelateType.bind(this)
    this.serviceChange = this.serviceChange.bind(this)

    let {serviceList = [], selectedBaseInfo = {}} = props
    let defaultService = []
    Logger.info('props===>', props)
    for (let i = 0; i < serviceList.length; i++) {
      if (serviceList[i].service.toLowerCase().includes('zabbix-agent')) {
        const value = serviceList[i].id
        defaultService = defaultService.concat(value)
        break
      }
    }
    defaultService = selectedBaseInfo.service.length ? selectedBaseInfo.service : defaultService

    this.state = {
      isLoading: false,
      selService: defaultService, // 20180409 已选的服务 用于几个服务之间相互关联
    }
  }

  next() {
    const {form, serviceList, preInfo} = this.props
    form.validateFields((err, values) => {
      if (err) {
        return false
      }

      let {service} = values
      // zabbix 服务需要展示在最后
      const zabbix = serviceList.find(v => v.service.toUpperCase() === 'ZABBIX-AGENT')
      let zabbixId = ''
      zabbix && ( zabbixId = zabbix.id)
      const index = service.findIndex(v => v === zabbixId);
      if (index > -1) {
        const zabbixservice = service[index]
        service.splice(index, 1)
        service.push(zabbixservice)
      }

      /******* 20171214 新增节点 第一步 集群 适配 实例组/集群*********/
      /******** cluster 相关方法修改为 relate *****/
      const relate_id = values.relate.id
      const relate_type = values.relate.type
      const params = {
        relate_id: relate_id.split('-_-')[1],
        service_id: service,
        relate_type,
      }
      //  todo 配置信息的请求参数
      // const relate_id = values.cluster_id.split('-_-')[1]
      // const params = {
      //   relate_id : relate_id,
      //   service_id : service,
      //   relate_type : 0 //表示集群 暂时写死
      // }


      if (this.props.setSelectedBaseInfo) {
        const baseInfo = Json.loads(Json.dumps(values))
        delete baseInfo.relate
        baseInfo.relateId = relate_id
        baseInfo.relateType = relate_type
        this.props.setSelectedBaseInfo(baseInfo)
      }

      // 与之前所选服务比较 如果有改变就清空 selectedHost
      // 这次无需考虑 zabbix 情况 将所有服务id排序排序后比较，排序前后顺序影响
      let copyInfo = Json.loads(Json.dumps(service)).sort((a, b) => a - b).join(',')
      copyInfo += ',' + relate_id
      // console.log('copyInfo===>', copyInfo)

      if (preInfo !== copyInfo) {
        if (this.props.setPreAndClearHost) {
          this.props.setPreAndClearHost(copyInfo)
        }
      }

      if (this.props.setSelectedService) {
        this.props.setSelectedService(service)
      }

      if (this.props.getConfig) {
        this.props.getConfig(params)
      }

      if (this.props.next) {
        this.props.next()
      }
    })
  }

  // changeCluster(value){
  //   this.setState({
  //     isLoading : true
  //   })
  //
  //   // 清空已选服务
  //   if(this.props.clearService){
  //     this.props.clearService()
  //   }
  //
  //   const id = value.split('-_-')[1]
  //   //
  //   // if(this.props.getService){
  //   //   this.props.getService(id)
  //   // }
  //   // 处理默认 有 zabbix 选上
  //   getService(id).then((res) => {
  //     if(res.code === 0){
  //       this.props.setService(res.data)
  //
  //       let zabbixService = res.data.find( v => v.service.toLowerCase() === 'zabbix-agent')
  //       if(zabbixService){
  //         zabbixService = [].concat(zabbixService.id)
  //       }else{
  //         zabbixService = []
  //       }
  //       this.props.form.setFieldsValue({
  //         service : zabbixService
  //       })
  //     }else{
  //       message.error(res.msg || res.error)
  //     }
  //   }).catch((err) => {
  //     message.error(err)
  //   })
  // }

  changeBusinesses(value) {
    const id = value.split('-_-')[1]

    // 清空其他已选项
    this.props.form.setFieldsValue({
      app_id: '',
      cluster_id: '',
      service: []
    })
    if (this.props.clearService) {
      this.props.clearService()
      this.setState({
        isLoading: false
      })
    }
    // if(this.props.clearCluster){
    //   this.props.clearCluster()
    // }
    if (this.props.clearRelate) {
      this.props.clearRelate()
    }

    if (this.props.getApps) {
      this.props.getApps(id)
    }
  }

  changeApp(value) {
    const appId = value.split('-_-')[1]

    // if(this.props.getClusters){
    //   this.props.getClusters({
    //     app_id : appId,
    //   })
    // }
    const relate = this.props.form.getFieldValue('relate')
    const {type} = relate
    if (this.props.getRelateList) {
      // this.props.getClusters({
      //   app_id : appId,
      // })
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
      service: []
    })
    if (this.props.clearService) {
      this.props.clearService()
      this.setState({
        isLoading: false
      })
    }
  }

  validateService(rule, value, callback) {
    const {serviceList} = this.props
    if (value.length === 1) {
      const selected = serviceList.find(v => v.id == value[0])
      if (selected.service.toUpperCase() === 'ZABBIX-AGENT') {
        callback('至少选择一个非 zabbix 服务')
      } else {
        callback()
      }
    } else {
      callback()
    }
  }

  serviceChange(val, preVal = []) {
    /*** 20180409 将相关服务互相级联起来 ***/
    /*** hcf2.0 ***/
    /*** mysql 120 nodeguard 122***/
    /*** 120  122***/
    /*** spider 124  spider agent 125***/
    /*** 实例组 ***/
    /*** mysql 127 nodeguard 128 ***/
    if (val.length === preVal.length) {
      return val
    }
    // 表示是什么操作 true 选中 false 删除所选
    const {serviceList, form} = this.props
    let isCheck = val.length - preVal.length > 0
    // diff 每次长度都为1 表示操作的哪一个服务 转化成数字
    let diff = parseInt(val.concat(preVal).filter(v => !preVal.includes(v) || !val.includes(v)).join(''))
    let newService = [...val]
    // 如果 serviceList 里面存在关联的服务 就自动选上 否则就不选
    if (serviceList.find(v => v.id === NODE_ADD_RELATE[diff])) {
      if (isCheck) {
        newService.push(NODE_ADD_RELATE[diff])
      } else {
        // Logger.info('NODE_ADD_RELATE[diff]===>', NODE_ADD_RELATE[diff])
        newService = newService.filter(v => v !== NODE_ADD_RELATE[diff])
      }
    }
    // Logger.info('newService===>', newService)
    return newService
  }

  serviceContent = () => {
    let {serviceList = [], form, selectedBaseInfo = {}, isLoading} = this.props
    const {getFieldDecorator, setFieldsValue} = form
    let defaultService = []
    for (let i = 0; i < serviceList.length; i++) {
      if (serviceList[i].service.toLowerCase().includes('zabbix-agent')) {
        const value = serviceList[i].id
        defaultService = defaultService.concat(value)
        break
      }
    }

    return getFieldDecorator('service', {
      // 此处 value 用 name-id 是为了方便存储 信息
      initialValue: selectedBaseInfo.service.length ? selectedBaseInfo.service : defaultService,
      rules: [{
        required: true,
        message: '请选择服务',
      }, {
        validator: this.validateService
      }],
      normalize: this.serviceChange
    })(
      <CheckboxGroup className={styles['overflow-hidden']}>
        {
          serviceList.length ?
            serviceList.map(item => {
              /**********20171215 新增 visible 0 不显示 1 显示************/
              /********* 通过display 来控制显示隐藏 ***********/
              /***** 20180409 服务关联性处理 ******/
              /***** 20180409 id = 130 时是 chunkkeeper 需要隐藏 ******/
              return <Col key={item.id} span="11"
                          style={{display: (item.visible === 0 || item.id === CHUNKKEEPER_ID) ? 'none' : ''}}>
                <Checkbox
                  value={item.id}
                  disabled={defaultService.includes(item.id)}
                >
                  {item.service}
                </Checkbox>
              </Col>
            })
            : (isLoading ? <Row>服务加载中</Row> : <Row>请选择所属后再选择服务</Row>)
        }
      </CheckboxGroup>
    )
  }

  changeRelate(value) {
    // 清空已选服务
    if (this.props.clearService) {
      this.props.clearService()
    }

    if (value.change === 'type') {
      this.changeRelateType(value)
    } else if (value.change === 'id') {
      this.changeRelateId(value)
    }
  }

  changeRelateId(value) {
    this.setState({
      isLoading: true
    })
    const relateId = value.id
    if (!relateId) {
      return
    }
    const id = relateId.split('-_-')[1]
    /****** 20180224 新增获取所属类型******/
    const relateType = value.type
    // Logger.info('relateType===>', relateType)
    //
    // if(this.props.getService){
    //   this.props.getService(id)
    // }
    // 处理默认 有 zabbix 选上
    getService(id, relateType).then((res) => {
      if (res.code === 0) {
        this.props.setService(res.data)

        let zabbixService = res.data.find(v => v.service.toLowerCase() === 'zabbix-agent')
        if (zabbixService) {
          zabbixService = [].concat(zabbixService.id)
        } else {
          zabbixService = []
        }
        this.props.form.setFieldsValue({
          service: zabbixService
        })
        this.setState({
          selService: zabbixService
        })
      } else {
        message.error(res.msg || res.error)
      }
    }).catch((err) => {
      message.error(err)
    })
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

  checkRelate(rule, value, callback) {
    if (value.id !== '') {
      callback()
      return
    }
    callback('所属必选')
  }


  render() {
    const {
      form, serviceList, businesses, clusters,
      apps, selectedBaseInfo, relateType, relateId, relateList
    } = this.props
    const {getFieldDecorator} = form
    const {isLoading} = this.state

    const relateLabel = (
      <Select defaultValue="0" className={styles['relateLabel']} size="large">
        <Option value="0">集群</Option>
        <Option value="1">实例组</Option>
      </Select>
    )

    const relateSelectProps = {
      relateList,
    }

    return (
      <Row className={styles['baseInfo']}>
        <Form>
          <FormItem label="业务" {...formLayout}>
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
                    return <Option key={v.id} value={v.name + '-_-' + v.id}>
                      {v.name}
                    </Option>
                  })
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="应用" {...formLayout}>
            {getFieldDecorator('app_id', {
              initialValue: selectedBaseInfo.app_id,
              onChange: this.changeApp.bind(this),
              rules: [{
                required: true,
                message: '应用必选'
              }]
            })(
              <Select placeholder="请先选择业务">
                {
                  apps && apps.map(v => {
                    return <Option key={v.id} value={v.name + '-_-' + v.id}>
                      {v.name}
                    </Option>
                  })
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="所属" {...formLayout}>
            {
              getFieldDecorator('relate', {
                initialValue: {
                  type: selectedBaseInfo.relateType,
                  id: selectedBaseInfo.relateId
                },
                onChange: this.changeRelate.bind(this),
                rules: [{
                  required: true,
                  message: '所属必填',
                  validator: this.checkRelate.bind(this)
                }]
              })(
                <RelateSelect {...relateSelectProps}/>
              )
            }
          </FormItem>


          {/*<FormItem label={relateLabel} {...formLayout}>*/}
          {/*{getFieldDecorator('cluster_id', {*/}
          {/*initialValue : selectedBaseInfo.cluster_id,*/}
          {/*onChange : this.changeCluster.bind(this),*/}
          {/*rules : [{*/}
          {/*required : true,*/}
          {/*message : '集群必选',*/}
          {/*}]*/}
          {/*})(*/}
          {/*<Select>*/}
          {/*{*/}
          {/*clusters && clusters.map(v => {*/}
          {/*return <Option key={v.id} value={v.name + '-_-' + v.id}>*/}
          {/*{v.name}*/}
          {/*</Option>*/}
          {/*})*/}
          {/*}*/}
          {/*</Select>*/}
          {/*)}*/}
          {/*</FormItem>*/}
          <FormItem label="服务" {...formLayout}>
            {this.serviceContent()}
          </FormItem>
          <Col offset={3}>
            <Button type="primary" onClick={this.next}>下一步</Button>
          </Col>
        </Form>
      </Row>
    )
  }
}
BaseInfo.propTypes = {
  next: PropTypes.func,
  selectedBaseInfo: PropTypes.object,
  baseInfo: PropTypes.object,
  setSelectedBaseInfo: PropTypes.func,
  setPreAndClearHost: PropTypes.func,
  setSelectedService: PropTypes.func,
  getRelateList: PropTypes.func,
  clearService: PropTypes.func,
  clearCluster: PropTypes.func,
  clearRelate: PropTypes.func,
  setService: PropTypes.func,
  zabbixService: PropTypes.array,
  preInfo: PropTypes.string,
}

export default Form.create()(BaseInfo)
