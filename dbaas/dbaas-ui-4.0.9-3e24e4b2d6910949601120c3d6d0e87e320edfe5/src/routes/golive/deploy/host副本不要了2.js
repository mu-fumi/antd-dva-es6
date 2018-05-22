/**
 * Created by wengyian on 2017/9/1.
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

class Host extends React.Component{
  constructor(props){
    super(props)

    let hostObj = {}
    props.selectedService.forEach(item => {
      let key = item.name + '--' + item.version + '-_-' + item.id
      // 如果存在 就赋值给hostObj
      hostObj[key] = item.host || []
    })

    // 如果是实例 只能选择一台机器 其实随意
    let isInstance = false
    if(props.selectedStack && props.selectedStack[0].tag == '实例'){
      isInstance = true
    }

    this.state = {
      hostObj,
      selectedService : props.selectedService,
      selectedStack : props.selectedStack,
      isInstance,
    }

    console.log('props this.state===>', this.state.hostObj)

    this.content = this.content.bind(this)
    this.next = this.next.bind(this)
    this.prev = this.prev.bind(this)
    this.showHostFilter = this.showHostFilter.bind(this)
    this.hostFilterOk = this.hostFilterOk.bind(this)
  }

  componentWillReceiveProps(nextProps){
    if(!_.isEqual(nextProps.selectedService, this.state.selectedService) ||
      !_.isEqual(nextProps.selectedStack, this.state.selectedStack)
    ){
      let hostObj = {}
      nextProps.selectedService.forEach(item => {
        let key = item.name + '--' + item.version + '-_-' + item.id
        // 如果存在 就赋值给hostObj
        hostObj[key] = item.host || []
      })

      // 如果是实例 只能选择一台机器 其他随意
      let isInstance = false
      if(nextProps.selectedStack && nextProps.selectedStack[0].tag == '实例'){
        isInstance = true
      }

      this.setState({
        hostObj : hostObj,
        selectedService : nextProps.selectedService,
        selectedStack : nextProps.selectedStack,
        isInstance,
      })
    }
  }

  hostFilterOk(data) {
    //  todo 如何修改dataSource
    let newObj = {...this.state.hostObj}
    newObj[this.state.whichOne] = data
    this.setState({
      hostObj : newObj
    })
    this.props.hideHostFilter && this.props.hideHostFilter()
  }

  next(){
    // 验证错误
    let { hostObj, selectedService, needNumber } = this.state
    let errTip = {}
    let canNext = true
    Object.keys(hostObj).forEach(key => {
      let serviceName = key.split('-_-')[0]
      let serviceId = key.split('-_-')[1]
      const index = selectedService.findIndex( v => v.id == serviceId)
      // const lestHost = selectedService.filter(v => v.id == serviceId)[0].need_host

      // 因为实例时 我修改了 选择主机 为单选 所以最多只能选到一台 无需在判断大于1台的情况
      // 集群 对上线无要求 只用比最少数多即可
      if(selectedService[index].need_host > 0){
        if(hostObj[key].length < selectedService[index].need_host){
          errTip[serviceName] == undefined && (errTip[serviceName] = [])
          const prefixerr = this.state.isInstance ? '' : '至少'
          errTip[serviceName].push(`${prefixerr}需要配置${selectedService[index].need_host}台机器`)
          canNext = false
        }else{
          selectedService[index].host = [...hostObj[key]]
        }
      }
      // 当 need_host 为0 的时候 没有选机器这样 所以不需要去配置这个信息了
      // 先注释掉吧 也许以后有用
      // else{
      //   selectedService[serviceId].host = [...hostObj[key]]
      // }
    })

    if(!canNext){
      const content = Object.keys(errTip).map((key, index) => {
        return (
          <Row key={index}>
            <span>{key}：</span>
            <span>{errTip[key]}</span>
          </Row>
        )
      })
      Modal.error({
        title : '错误提示',
        content : content
      })
      return
    }

    this.props.selectedServiceHost
      && this.props.selectedServiceHost(this.state.selectedService)
    this.props.next && this.props.next()
    // 将 state 中的 hostObj 赋值到 selectedService 中

  }

  prev(){
    this.props.prev && this.props.prev()
  }

  showHostFilter(key) {
    // todo  如何知道要修改的 dataSource 是谁
    this.setState({
      whichOne : key
    })
    this.props.showHostFilter && this.props.showHostFilter()
  }

  content(key){
    const columns =  [{
      title : '机器名',
      dataIndex : 'machine_name',
    },{
      title : '机器IP',
      dataIndex : 'machine_ip'
    },{
      title : '机器内存',
      dataIndex : 'machine_memory'
    },{
      title : 'MySQL内存',
      dataIndex : 'db_memory'
    },{
      title : '城市',
      dataIndex : 'city'
    },{
      title : '数据中心',
      dataIndex : 'idc'
    }]
    // 需要修改的数据
    const dataSource = this.state.hostObj ? this.state.hostObj[key] : []
    const dataTableProps = {
      columns,
      dataSource,
      pagination : false,
    }

    return (
      <Row>
        <Row>
          <span>已选主机列表</span>
          <Button
            className="pull-right" type="primary"
            onClick={() => this.showHostFilter(key)}
          >选择主机</Button>
        </Row>
        <DataTable {...dataTableProps}/>
      </Row>
    )
  }

  render(){
    const {form, selectedService, selectedStack, deployInfo} = this.props
    const stackName = selectedStack[0] && selectedStack[0].name

    const hostFilterProps = {
      visible: this.props.visible,
      onCancel: this.props.hideHostFilter,
      onOk: this.hostFilterOk,
      isAllParams : true,
      isRadio : this.state.isInstance,
      fetchFilter : { mem : MEMORY_SLIDER[deployInfo.memory]}
    }

    console.log('this.state===>', this.state)

    return (
      <Row>
        <Row>
          <span>已选套件： {stackName}</span>
          <span className="mgl-8">名称： {deployInfo.deployName}</span>
          <span className="mgl-8">内存大小： {MEMORY_SLIDER[deployInfo.memory]}</span>
          <span className="mgl-8">服务： {deployInfo.service}</span>
        </Row>
        <Tabs tabPosition="left" className="mgt-16">
          {
            selectedService.map(item => {
              return (
                <TabPane key={item.id} tab={`${item.name}--${item.version}`}>
                  {
                    item.need_host ? this.content(`${item.name}--${item.version}-_-${item.id}`) : <Row>此服务不需要配置机器</Row>
                  }
                </TabPane>
              )
            })
          }
        </Tabs>
        <Row className={classnames('text-right', styles["mgt-16"])}>
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
        </Row>
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
