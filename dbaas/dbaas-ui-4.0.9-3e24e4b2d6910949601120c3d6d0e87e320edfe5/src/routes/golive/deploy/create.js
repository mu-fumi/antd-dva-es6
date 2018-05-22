/**
 * Created by wengyian on 2017/8/15.
 */

import Base from 'routes/base'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, Spin, Tag, Button, Modal, Steps} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon} from 'components'
import {routerRedux, Link, browserHistory,} from 'dva/router'
import {classnames} from 'utils'
import _ from 'lodash'
import styles from './create.less'
import {constant, TimeFilter} from 'utils'

import DeployInfo from './deployInfo'
import Config from './config'
import Host from './host'
import Summary from './summary'
import Stack from './stack'

const confirm = Modal.confirm
const Step = Steps.Step
const CheckableTag = Tag.CheckableTag

const modelKey = 'deploy/create'

class Create extends Base {

  constructor(props) {
    super(props)

    this.setGobackBtn()
    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '新增部署', selectedKey: '自动化部署deploy'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
    // 暂时先这么处理 看最后需求需不需要清空数据
    this.push({
      type : `${modelKey}/initState`,
      fire : [Base.WillUnmount]
    })

    this.next = this.next.bind(this)
    this.prev = this.prev.bind(this)
    this.getConfig = this.getConfig.bind(this)
    this.setDeployInfo = this.setDeployInfo.bind(this)
    this.showHostFilter = this.showHostFilter.bind(this)
    this.hideHostFilter = this.hideHostFilter.bind(this)
    this.handleFilter = this.handleFilter.bind(this)
    this.handleStackChange = this.handleStackChange.bind(this)
    this.getService = this.getService.bind(this)
    this.setConfig = this.setConfig.bind(this)
    this.setSelectedService = this.setSelectedService.bind(this)
    this.setSelectedServiceHost = this.setSelectedServiceHost.bind(this)
    this.submitDeploy = this.submitDeploy.bind(this)
    this.setSpinning = this.setSpinning.bind(this)
    this.clearMasterSlave = this.clearMasterSlave.bind(this)
    this.clearChunkConfig = this.clearChunkConfig.bind(this)
    this.getAppList = this.getAppList.bind(this)
    this.clearAppList = this.clearAppList.bind(this)
    this.toggleTipModalVisible = this.toggleTipModalVisible.bind(this)
    this.getMemoryRange = this.getMemoryRange.bind(this)
    this.showIPModal = this.showIPModal.bind(this)
    this.handleIPCancel = this.handleIPCancel.bind(this)
    this.getTemplate = this.getTemplate.bind(this)
    this.goIndex = this.goIndex.bind(this)
  }


  next(){
    this.props.dispatch({
      type : `${modelKey}/plusCurrentStep`,
    })
  }

  prev(){
    this.props.dispatch({
      type : `${modelKey}/minusCurrentStep`
    })
  }

  setDeployInfo (data){
    this.props.dispatch({
      type : `${modelKey}/setDeployInfo`,
      payload : data
    })
  }

  getConfig(params){
    this.props.dispatch({
      type : `${modelKey}/getConfig`,
      payload : params
    })
  }

  setConfig(params){
    this.props.dispatch({
      type : `${modelKey}/setConfig`,
      payload : params
    })
  }

  showHostFilter(){
    this.props.dispatch({
      type : `${modelKey}/showHostFilter`
    })
  }

  hideHostFilter(){
    this.props.dispatch({
      type : `${modelKey}/hideHostFilter`
    })
  }

  handleFilter(data){
    this.props.dispatch({
      type : `${modelKey}/handleFilter`,
      payload : data
    })
  }

  handleStackChange(data){
    this.props.dispatch({
      type : `${modelKey}/setSelectedStack`,
      payload : data
    })
  }

  getService(id){
    // 当用户从填基本信息处点击上一步返回时
    // 如果 修改了机器 那就清空用户选的服务 和 服务列表
    // 为了防止出现 之前选的别的机器的服务 还存在的现象
    this.props.dispatch({
      type : `${modelKey}/clearDeployInfoService`
    })
    this.props.dispatch({
      type : `${modelKey}/getService`,
      payload : id
    })
  }

  setSelectedService(ids){
    // 选服务时的设置
    this.props.dispatch({
      type : `${modelKey}/setSelectedService`,
      payload : ids
    })
  }

  setSelectedServiceHost(data){
    // 选服务对应机器后修改 selectedServcie
    this.props.dispatch({
      // type : `${modelKey}/SelectedSeriveHost`,
      type : `${modelKey}/selectedServiceHost`,
      payload : data
    })
  }

  submitDeploy(data){
    this.props.dispatch({
      type : `${modelKey}/deploy`,
      payload : data
    })
  }

  setSpinning(bool){
    this.props.dispatch({
      type : `${modelKey}/setSpinning`,
      payload : bool
    })
  }

  clearMasterSlave(id){
    this.props.dispatch({
      type : `${modelKey}/clearMasterSlave`,
      payload : id
    })
  }

  clearAppList(){
    this.props.dispatch({
      type : `${modelKey}/clearAppList`
    })
  }

  getAppList(id){
    this.props.dispatch({
      type : `${modelKey}/getApps`,
      payload : id
    })
  }

  toggleTipModalVisible(){
    this.props.dispatch({
      type : `${modelKey}/toggleTipModalVisible`
    })
  }

  getMemoryRange(id){
    this.props.dispatch({
      type : `${modelKey}/getMemoryRange`,
      payload : id
    })
  }

  showIPModal(hostIP){
    this.props.dispatch({
      type:`${modelKey}/handleHostIP`,
      payload:{hostIP:hostIP}
    })
    this.props.dispatch({
      type : `${modelKey}/toggleHostVisible`
    })
  }

  handleIPCancel(){
    this.props.dispatch({
      type : `${modelKey}/toggleHostVisible`
    })
  }

  getTemplate(id){
    this.props.dispatch({
      type : `${modelKey}/getTemplate`,
      payload : id
    })
  }

  /***** 20171221 routerRedux 需要走dispatch *******/
  goIndex(){
    this.props.dispatch(
      routerRedux.push('/deploy')
    )
  }

  /******  20180301 清楚chunk 配置******/
  clearChunkConfig(id) {
    this.props.dispatch({
      type: `${modelKey}/clearChunkConfig`,
      payload: id
    })
  }

  render() {
    const {create} = this.props
    let {currentStep, serviceList, configList, deployInfo,
      dataFilter, stackTags, selectedStack, selectedService, spinning,
      businessList, appList, tipModalVisible, memoryMarks, preSelectedService,
      hostIP, hostVisible, template, chunkKeeperList, zooKeeperList
    } = create

    const deployInfoProps = {
      serviceList,
      next : this.next,
      prev : this.prev,
      setDeployInfo : this.setDeployInfo,
      setSelectedService : this.setSelectedService,
      deployInfo,
      getConfig : this.getConfig,
      selectedStack,
      selectedService,
      preSelectedService,
      handleFilter : this.handleFilter,
      businessList,
      appList,
      getAppList : this.getAppList,
      clearAppList : this.clearAppList,
      memoryMarks,
      template,
      zooKeeperList,
      chunkKeeperList
    }

    const configProps = {
      configList,
      deployInfo,
      selectedService,
      selectedStack,
      next : this.next,
      prev : this.prev,
      setConfig : this.setConfig,
      memoryMarks,
    }

    const hostProps = {
      next : this.next,
      prev : this.prev,
      selectedStack,
      selectedService : JSON.stringify(selectedService),
      deployInfo,
      setSelectedServiceHost : this.setSelectedServiceHost,
      clearMasterSlave : this.clearMasterSlave,
      clearChunkConfig : this.clearChunkConfig,
      memoryMarks,
      showIPModal : this.showIPModal,
      handleIPCancel : this.handleIPCancel,
      hostIP,
      hostVisible,
    }

    const summaryProps = {
      prev : this.prev,
      selectedStack,
      selectedService,
      deployInfo,
      configList,
      submitDeploy : this.submitDeploy,
      setSpinning : this.setSpinning,
      goIndex : this.goIndex,
      tipModalVisible,
      toggleTipModalVisible : this.toggleTipModalVisible,
      memoryMarks,
    }

    const stackProps = {
      next : this.next,
      handleFilter : this.handleFilter,
      filter : dataFilter,
      stackTags,
      getService : this.getService,
      selectedStack,
      handleStackChange : this.handleStackChange,
      getMemoryRange : this.getMemoryRange,
      getTemplate : this.getTemplate,
    }

    const steps = [{
      title : '选择套件',
      content : <Stack {...stackProps}/>,
    },{
      title : '部署信息',
      content : <DeployInfo {...deployInfoProps}/>,
    },{
      title : '筛选主机',
      content : <Host {...hostProps}/>,
    },{
      title : '编辑服务配置',
      content : <Config {...configProps}/>,
    },{
      title : '信息汇总',
      content : <Summary {...summaryProps}/>,
    },]

    return (
      <Row className={styles["create"]}>
        <Steps current={currentStep}>
          {steps.map(item => <Step key={item.title} title={item.title}/>)}
        </Steps>
        <Row className={styles["mgt-16"]}>
          <Spin tip="目标环境检测中..." size="large" spinning={spinning}>
            {steps[currentStep].content}
          </Spin>
        </Row>
      </Row>
    )
  }

}

Create.propTypes = {
  create: PropTypes.object,
  location: PropTypes.object,
  loading: PropTypes.bool,
  dispatch: PropTypes.func
}

export default connect((state) => {
  return {
    loading: state.loading.models[modelKey],
    create: state[modelKey],
  }
})(Create)
