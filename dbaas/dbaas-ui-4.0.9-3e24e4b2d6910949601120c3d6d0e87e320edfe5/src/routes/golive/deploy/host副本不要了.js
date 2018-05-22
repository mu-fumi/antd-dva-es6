/**
 * Created by wengyian on 2017/8/21.
 */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, Input, message, Button, Modal, Tooltip, Form, Tabs} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, HostFilter} from 'components'
import {routerRedux, Link, browserHistory} from 'dva/router'
import {classnames, Cache, constant} from 'utils'
import Json from 'utils/json'
import _ from 'lodash'
import styles from './create.less'

const FormItem = Form.Item
const TabPane = Tabs.TabPane
const { MEMORY_SLIDER } =  constant

const formLayoutItem = {
  labelCol: {
    span: 3
  },
  wrapperCol: {
    span: 20
  }
}

class Host extends React.Component {
  constructor(props) {
    super(props)

    // 初始化用来存取机器信息的对象
    let hostObj = {}
    //  需要展示删除图标的临界数字 集群为3 其余为1
    let deleteNumber = 1
    let canAdd = true //只有实例不能新增
    // 类型是集群时 至少选择3个机器 实例只能一个 其他至少一个
    props.selectedService.forEach(item => {
      let version = item.version.replace(/\./g, '_')
      let name = item.name + '--' + version
      let key = name + '-_-' + item.id
      hostObj[key] = {}
      // 如果已选机器 自动填写 如果没有 补不上
      if(item.host){
        Object.values(item.host).map( val => {
          hostObj[key][uuid++] = val.name
        })
        // for(let i = 0; i < item.host.length; i++){
        //   hostObj[key][uuid++] = item.host[i]
        // }
        if(props.selectedStack[0] && props.selectedStack[0].tag === '集群'){//记得改为 集群
          deleteNumber =  3
        }else if(props.selectedStack[0] && props.selectedStack[0].tag === '实例'){
          canAdd = false
        }
      }else{
        if(props.selectedStack[0] && props.selectedStack[0].tag === '集群'){//记得改为 集群
          for(let i = 0; i < 3; i++){
            hostObj[key][uuid++] = ''
          }
        deleteNumber = 3
        }else if(props.selectedStack[0] && props.selectedStack[0].tag === '实例'){
          hostObj[key][uuid++] = ''
          canAdd = false
        }else{
          hostObj[key][uuid++] = ''
        }
      }
    })

    this.state = {
      selectedService : props.selectedService,
      hostObj,
      deleteNumber,
      canAdd,
    }

    this.showHostFilter = this.showHostFilter.bind(this)
    this.hostFilterOk = this.hostFilterOk.bind(this)
    this.next = this.next.bind(this)
    this.prev = this.prev.bind(this)
    this.machineButton = this.machineButton.bind(this)
    this.add = this.add.bind(this)
    this.remove = this.remove.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if(!_.isEqual(nextProps.selectedService, this.state.selectedService)){
      let hostObj = {}
      let deleteNumber = 1
      let canAdd = true //只有实例不能新增
      nextProps.selectedService.forEach(item => {
        let version = item.version.replace(/\./g, '_')
        let name = item.name + '--' + version
        let key = name + '-_-' + item.id
        hostObj[key] = {}
        // 如果已选机器 自动填写 如果没有 补不上
        if(item.host){
          Object.values(item.host).map( val => {
            hostObj[key][uuid++] = val.name
          })
          // for(let i = 0; i < item.host.length; i++){
          //   hostObj[key][uuid++] = item.host[i]
          // }
          if(nextProps.selectedStack[0] && nextProps.selectedStack[0].tag === '集群'){//记得改为 集群
            deleteNumber =  3
          }else if(nextProps.selectedStack[0] && nextProps.selectedStack[0].tag === '实例'){
            canAdd = false
          }
        }else{
          if(nextProps.selectedStack[0] && nextProps.selectedStack[0].tag === '集群'){//记得改为 集群
            for(let i = 0; i < 3; i++){
              hostObj[key][uuid++] = ''
            }
            deleteNumber = 3
          }else if(nextProps.selectedStack[0] && nextProps.selectedStack[0].tag === '实例'){
            hostObj[key][uuid++] = ''
            canAdd = false
          }else{
            hostObj[key][uuid++] = ''
          }
        }
      })
      this.setState({
        hostObj,
        selectedService : nextProps.selectedService,
        deleteNumber,
        canAdd,
      })
    }
  }

  showHostFilter(key) {
    this.setState({
      formKey: key
    })
    this.props.showHostFilter && this.props.showHostFilter()
  }

  hostFilterOk(data) {
    let newData = data[0] && data[0].machine_name
    let formKey = this.state.formKey
    this.props.form.setFieldsValue({
      [formKey]: newData
    })
    this.props.hideHostFilter()
  }

  next() {
    this.props.form.validateFields((err, values) => {
      let errTip = {}
      let canNext = true
      let host = {}
      if (err) {
        Object.keys(err).map(key => {
          const serviceName = key.split('-_-')[0]
          err[key].errors.map((v, k) => {
            errTip[serviceName] ? ( errTip[serviceName].includes(v.message) || errTip[serviceName].push(v.message))
              : errTip[serviceName] = [v.message]
          })
        })
        canNext = false
      }
      // console.log('values===>', values)
      Object.keys(values).map((val, index) => {
        let serviceName = val.split('-_-')[0]
        let serviceId = val.split('-_-')[1]
        let uniqueId = val.split('-_-')[2]
        // 错误信息提示
        !errTip[serviceName] && (errTip[serviceName] = [])
        // 验证有无选重复机器
        if(values[val] && host[serviceId] &&host[serviceId].includes(values[val])){
          !errTip[serviceName].includes(`重复选择机器${values[val]}`)
          && errTip[serviceName].push(`重复选择机器${values[val]}`)
          canNext = false
        }

        // if(values[val] == '' || values[val] == undefined){
        //   !errTip[serviceName].includes('机器信息不全') && errTip[serviceName].push('机器信息不全')
        //   canNext = false
        // }else if(host[serviceId] &&host[serviceId].includes(values[val])){
        //   !errTip[serviceName].includes(`重复选择机器${values[val]}`)
        //     && errTip[serviceName].push(`重复选择机器${values[val]}`)
        //   canNext = false
        // }
        // 如果存在 host[serviceId] 就把值压入 否之赋值
        host[serviceId] != undefined
          ? (host[serviceId].push(values[val]))
          : (host[serviceId] = [values[val]])
      })

      // 将 host 数据 存入 selectedService 中 因为是引用类型 所以不需要在用 setState 了
      this.state.selectedService.map((val, index) => {
        if(host[val.id]){
          val.host = host[val.id].map(v =>{ return { name : v }})
        }
      })

        this.props.selectedServiceHost
          && this.props.selectedServiceHost(this.state.selectedService)
      if(canNext){
        this.props.next && this.props.next()
      }else {
        let content = Object.keys(errTip).map((key, index) => {
          return <Row key={index}>{key.replace(/_/g, '.')} : {errTip[key].join('，')}</Row>
        })
        Modal.error({
          title : '错误信息提示',
          content : content
        })
        return
      }
    })
  }

  prev() {
    this.props.prev && this.props.prev()
  }

  machineButton(key) {
    return <Col className={styles["cursor-pointer"]} onClick={() => this.showHostFilter(key)}>筛选机器</Col>
  }

  add(key){

    // console.log('this.state.hostObj===>', this.state.hostObj)
    let oneServiceObj = this.state.hostObj[key]
    // newHostObj[uuid] =
    // console.log('oneServiceObj===>', oneServiceObj)
    oneServiceObj[uuid] = ''
    this.setState({
      hostObj : {
        ...this.state.hostObj,
        [key] : oneServiceObj
      }
    })
    uuid++

    // console.log('this.state.hostObj===>', this.state.hostObj)
  }

  remove(key, id){
    // console.log('key===>', key)
    // console.log('id===>', id)
    let oneServiceObj = this.state.hostObj[key]
    delete oneServiceObj[id]

    this.setState({
      hostObj : {
        ...this.state.hostObj,
        [key] : oneServiceObj
      }
    })
  }


  render() {

    const {form, selectedService, selectedStack, deployInfo} = this.props
    const {getFieldDecorator} = form
    let hostKeys = []

    const hostFilterProps = {
      visible: this.props.visible,
      onCancel: this.props.hideHostFilter,
      onOk: this.hostFilterOk,
      key: this.state.formKey,
      isRadio : true,
      isAllParams : true,
      fetchFilter : { mem : MEMORY_SLIDER[deployInfo.memory]}
    }

    const stackName = selectedStack[0] && selectedStack[0].name
    // const deployName = deployInfo.name
    // const service = deployInfo.service

    return (
      <Row>
        <Row>
          <span>已选套件： {stackName}</span>
          <span className="mgl-8">名称： {deployInfo.deployName}</span>
          <span className="mgl-8">内存大小： {MEMORY_SLIDER[deployInfo.memory]}</span>
          <span className="mgl-8">服务： {deployInfo.service}</span>
        </Row>
        <Tabs tabPosition="left" className={styles["mgt-16"]}>
          {
            selectedService.map(item => {
              let hostObjKey = item.name + '--' + item.version.replace(/\./g, '_')
              let iconClassName = classnames(styles['mgt-8'], 'text-error')
              return (
                <TabPane key={item.id} tab={`${item.name}--${item.version}`}>
                  {
                    item.need_host
                      ?  <Form>
                      {
                        Object.keys(this.state.hostObj[`${hostObjKey}-_-${item.id}`]).map((val, index, arr) => {
                          let obj = this.state.hostObj[`${hostObjKey}-_-${item.id}`]
                          return (
                          <Row key={val}>
                            <Col span="16">
                              <FormItem label="机器" {...formLayoutItem}>
                                { getFieldDecorator(`${hostObjKey}-_-${item.id}-_-${val}`, {
                                  initialValue : obj[val] ? obj[val] : '',
                                  rules : [{
                                    // 集群默认显示3条 几条必选由后台返回值决定
                                    required : !(index >= item.need_host ),
                                    message : '请选择机器'
                                  }]
                                })(
                                  <Input
                                    style={{width : '100%'}}
                                    disabled={true}
                                    addonAfter={this.machineButton(`${hostObjKey}-_-${item.id}-_-${val}`)}/>
                                )}
                              </FormItem>
                            </Col>
                            {
                              index >= this.state.deleteNumber ?
                                <Col offset={1} className={iconClassName}>
                                  <Tooltip title="点击删除机器">
                                    <IconFont
                                      type="minus-circle-o"
                                      className=""
                                      onClick={() => this.remove(`${hostObjKey}-_-${item.id}`, val)}
                                    />
                                  </Tooltip>
                                </Col>
                                : ''
                            }
                          </Row>
                          )
                        })
                      }
                      {
                        this.state.canAdd ?
                          <Col offset={2}>
                            <Button onClick={() => this.add(`${hostObjKey}-_-${item.id}`)}>新增机器</Button>
                          </Col>
                          : ''
                      }
                      </Form>
                      : <Row>此服务不需要配置机器</Row>
                  }
                </TabPane>
              )
            })
          }
        </Tabs>
        <Col offset={3} className={styles["mgt-16"]}>
          <Button
            onClick={this.prev}
            className="mgr-16"
          >
            上一步
          </Button>
          <Button
            type="primary"
            onClick={this.next}
          >
            下一步
          </Button>
        </Col>
        <HostFilter {...hostFilterProps}/>
      </Row>

    )
  }
}

Host.proptypes = {
  prev: PropTypes.func,
  next: PropTypes.func,
  showHostFilter: PropTypes.func,
  visible: PropTypes.bool,
  selectedService : PropTypes.array,
  selectedStack : PropTypes.array,
  deployInfo : PropTypes.object,
  hideHostFilter : PropTypes.func,
  selectedServiceHost : PropTypes.func,
}

export default Form.create()(Host)
