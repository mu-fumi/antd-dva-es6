/**
 * Created by wengyian on 2017/9/8.
 */

import Base from 'routes/base'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, Select, message, Tooltip, Button, Modal, Steps, Spin} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon} from 'components'
import {routerRedux, Link,} from 'dva/router'
import {classnames, constant, TimeFilter} from 'utils'
import _ from 'lodash'
import styles from './add.less'


import BaseInfo from './baseInfo'
import Host from './host'
import Summary from './summary'

const modelKey = 'nodes/add'
const Step = Steps.Step


class Add extends Base {
  constructor(props) {
    super(props)

    this.setGobackBtn()
    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '新增节点', selectedKey: '节点管理node'},
      fire: [Base.DidMount]
    })
    this.push({
      type: 'app/handleCurrentMenu',
      payload: {selectedKey: ''},
      fire: [Base.WillUnmount]
    })

    this.push({
      type: `${modelKey}/resetState`,
      fire: [Base.WillUnmount]
    })


    this.next = this.next.bind(this)
    this.prev = this.prev.bind(this)
    this.setSelectedBaseInfo = this.setSelectedBaseInfo.bind(this)
    this.handleKeywords = this.handleKeywords.bind(this)
    this.setSelectedHost = this.setSelectedHost.bind(this)
    this.getService = this.getService.bind(this)
    this.clearService = this.clearService.bind(this)
    this.clearCluster = this.clearCluster.bind(this)
    this.setSelectedService = this.setSelectedService.bind(this)
    this.setPreAndClearHost = this.setPreAndClearHost.bind(this)
    this.addNode = this.addNode.bind(this)
    this.getConfig = this.getConfig.bind(this)
    this.getApps = this.getApps.bind(this)
    this.getClusters = this.getClusters.bind(this)
    this.toggleTipModalVisible = this.toggleTipModalVisible.bind(this)
    this.setSpinning = this.setSpinning.bind(this)
    this.setService = this.setService.bind(this)
    this.showIPModal = this.showIPModal.bind(this)
    this.handleIPCancel = this.handleIPCancel.bind(this)
    this.getRelateList = this.getRelateList.bind(this)
    this.clearRelate = this.clearRelate.bind(this)
    this.goIndex = this.goIndex.bind(this)
    this.setFilter = this.setFilter.bind(this)
  }

  next() {
    this.props.dispatch({
      type: `${modelKey}/plusCurrentStep`
    })
  }

  prev() {
    this.props.dispatch({
      type: `${modelKey}/minusCurrentStep`
    })
  }

  setSelectedBaseInfo(data) {
    this.props.dispatch({
      type: `${modelKey}/setSelectedBaseInfo`,
      payload: data
    })
  }

  handleKeywords(value, key) {
    this.props.dispatch({
      type: `${modelKey}/handleKeywords`,
      payload: {value: value, key: key}
    })
  }

  setSelectedHost(data) {
    this.props.dispatch({
      type: `${modelKey}/setSelectedHost`,
      payload: data
    })
  }

  getService(id) {
    this.props.dispatch({
      type: `${modelKey}/getService`,
      payload: id
    })
  }

  clearService() {
    this.props.dispatch({
      type: `${modelKey}/clearService`
    })
  }

  clearCluster() {
    this.props.dispatch({
      type: `${modelKey}/clearCluster`
    })
  }

  setSelectedService(data) {
    this.props.dispatch({
      type: `${modelKey}/setSelectedService`,
      payload: data
    })
  }

  setPreAndClearHost(data) {
    this.props.dispatch({
      type: `${modelKey}/setPreAndClearHost`,
      payload: data
    })
  }

  addNode(data) {
    this.props.dispatch({
      type: `${modelKey}/addNode`,
      payload: data
    })
  }

  getConfig(data) {
    this.props.dispatch({
      type: `${modelKey}/getConfig`,
      payload: data
    })
  }

  getApps(data) {
    this.props.dispatch({
      type: `${modelKey}/getApps`,
      payload: data
    })
  }

  getClusters(data) {
    this.props.dispatch({
      type: `${modelKey}/getClusters`,
      payload: data
    })
  }

  toggleTipModalVisible() {
    this.props.dispatch({
      type: `${modelKey}/toggleTipModalVisible`
    })
  }

  setSpinning(bool) {
    this.props.dispatch({
      type: `${modelKey}/setSpinning`,
      payload: bool
    })
  }

  setService(data) {
    this.props.dispatch({
      type: `${modelKey}/setService`,
      payload: data
    })
  }

  showIPModal(hostIP) {
    this.props.dispatch({
      type: `${modelKey}/handleHostIP`,
      payload: {hostIP: hostIP}
    })
    this.props.dispatch({
      type: `${modelKey}/toggleHostVisible`
    })
  }

  handleIPCancel() {
    this.props.dispatch({
      type: `${modelKey}/toggleHostVisible`
    })
  }

  /********20171214 集群 修改为 实例组/集群*******/
  /***** 之前与 cluster 相关方法 修改为 relate ****/
  getRelateList(data){
    this.props.dispatch({
      type : `${modelKey}/getRelateList`,
      payload : data
    })
  }

  clearRelate(){
    this.props.dispatch({
      type : `${modelKey}/clearRelate`
    })
  }

  /***** 20171221 routerRedux 需要走dispatch *******/
  goIndex(){
    this.props.dispatch(
      routerRedux.push('/nodes')
    )
  }

  setFilter(data){
    this.props.dispatch({
      type : `${modelKey}/setFilter`,
      payload : data
    })
  }

  render() {
    const {dispatch, add} = this.props
    const {
      currentStep, selectedHost, keywords, serviceList,
      selectedBaseInfo, config, businesses, apps, clusters,
      selectedService, tipModalVisible, spinning, zabbixService,
      preInfo, hostIP, hostVisible, relateType, relateList, pages
    } = add

    const baseInfoProps = {
      next: this.next,
      serviceList,
      getService: this.getService,
      clearService: this.clearService,
      clearCluster: this.clearCluster,
      setSelectedBaseInfo: this.setSelectedBaseInfo,
      setSelectedService: this.setSelectedService,
      setPreAndClearHost: this.setPreAndClearHost,
      getConfig: this.getConfig,
      businesses,
      clusters,
      apps,
      selectedBaseInfo,
      zabbixService,
      preInfo,
      setService: this.setService,
      getApps: this.getApps,
      getClusters: this.getClusters,
      relateList,
      clearRelate : this.clearRelate,
      getRelateList : this.getRelateList,
    }

    const hostProps = {
      next: this.next,
      prev: this.prev,
      selectedHost: selectedHost,
      handleKeywords: this.handleKeywords,
      setSelectedHost: this.setSelectedHost,
      keywords: keywords,
      selectedService,
      selectedBaseInfo,
      showIPModal: this.showIPModal,
      handleIPCancel: this.handleIPCancel,
      hostIP,
      hostVisible,
      selectedBaseInfo,
      pages,
      setFilter : this.setFilter,
    }

    const summaryProps = {
      selectedHost,
      addNode: this.addNode,
      prev: this.prev,
      config,
      selectedBaseInfo,
      selectedService,
      toggleTipModalVisible: this.toggleTipModalVisible,
      tipModalVisible,
      setSpinning: this.setSpinning,
      goIndex: this.goIndex,
    }

    const steps = [{
      title: '基本信息',
      content: <BaseInfo {...baseInfoProps}/>
    }, {
      title: '选择主机',
      content: <Host {...hostProps}/>
    }, {
      title: '信息汇总',
      content: <Summary {...summaryProps}/>
    }]

    return (
      <Row className={styles['add']}>
        <Steps current={currentStep}>
          {steps.map(item => <Step key={item.title} title={item.title}/>)}
        </Steps>
        <Row className={styles["mgt-32"]}>
          <Spin size="large" spinning={spinning}>
            {steps[currentStep].content}</Spin>
        </Row>
      </Row>
    )
  }
}

Add.propTypes = {
  node: PropTypes.object,
  location: PropTypes.object,
  loading: PropTypes.bool,
  dispatch: PropTypes.func
}

export default connect((state) => {
  return {
    loading: state.loading.models[modelKey],
    add: state[modelKey]
  }
})(Add)
