/**
 * Created by wengyian on 2017/7/22.
 */

import Base from 'routes/base'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Icon, message, Button, Modal, Tabs, Form } from 'antd'
import { DataTable, Layout, Search, Filter, IconFont } from 'components'
import { routerRedux, Link } from 'dva/router'
import { classnames } from 'utils'
import _ from 'lodash'
import EditStackInfo from './editStackInfo'
import EditStackService from './editStackService'

const modelKey = 'stack/editStack'
const TabPane = Tabs.TabPane
const FormItem = Form.Item

class EditStack extends Base{

  constructor(props){
    super(props)

    this.setGobackBtn()
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {activeName : '编辑套件', selectedKey : '组件管理component'},
      defer : true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })

    this.submitStackInfo = this.submitStackInfo.bind(this)
    this.deleteStackService = this.deleteStackService.bind(this)
    this.showDeploymentModal = this.showDeploymentModal.bind(this)
    this.onOk = this.onOk.bind(this)
    this.onCancel = this.onCancel.bind(this)
    this.afterClose = this.afterClose.bind(this)
  }


  submitStackInfo(params){
    this.props.dispatch({
      type : `${modelKey}/submitStackInfo`,
      payload : params
    })
  }

  deleteStackService(data){
    this.props.dispatch({
      type : `${modelKey}/deleteStackService`,
      payload : {
        service : data,
        stack_id : this.props.editStack.stackId
      }
    })
  }

  showDeploymentModal(id){
    const { dispatch, editStack } = this.props
    const { stackId } = editStack
    dispatch({
      type : `${modelKey}/setServiceId`,
      payload : id
    })
    dispatch({
      type : `${modelKey}/getStackConfig`,
      payload : {
        stack_id : stackId,
        service_id : id
      }
    })
    dispatch({
      type : `${modelKey}/showDeploymentModal`
    })
  }

  onCancel(){
    this.props.dispatch({
      type : `${modelKey}/hideDeploymentModal`
    })
  }

  onOk(params){
    const { dispatch, editStack } = this.props
    const { stackId, serviceId } = editStack
    dispatch({
      type : `${modelKey}/updateStackConfig`,
      payload : {
        stack_id : stackId,
        service_id : serviceId,
        conf : params
      }
    })
  }

  afterClose(){
    this.props.dispatch({
      type : `${modelKey}/initStackConfig`
    })
  }

  render(){
    const { location, dispatch, editStack, loading} = this.props
    const { stackInfo, stackTags, stackId, reload, serviceId, stackConfig, deploymentModalVisible } = editStack

    const stackInfoProps = {
      stackInfo,
      stackTags,
      stackId,
      type : 'edit',
      submitStackInfo : this.submitStackInfo
    }

    const stackServiceProps = {
      stackId,
      reload,
      serviceId,
      stackConfig,
      deleteService : this.deleteStackService,
      showDeploymentModal : this.showDeploymentModal,
      deploymentModalVisible,
      onOk : this.onOk,
      onCancel : this.onCancel,
      afterClose : this.afterClose
    }

    return (
      <Tabs>
        <TabPane tab="基本信息" key="1"><EditStackInfo {...stackInfoProps} /></TabPane>
        <TabPane tab="服务信息" key="2"><EditStackService {...stackServiceProps}/></TabPane>
      </Tabs>
    )
  }
}

EditStack.propTypes = {
  editStack : PropTypes.object,
  loading : PropTypes.bool,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=>{
  return {
    loading: state.loading.models[modelKey],
    editStack: state[modelKey],
  }
})(EditStack)
