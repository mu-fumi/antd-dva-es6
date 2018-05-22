/**
 * Created by wengyian on 2017/7/7.
 */

import Base from 'routes/base'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Input, Icon, message, Button, Modal, Steps, Form } from 'antd'
import { DataTable, Layout, Search, Filter, IconFont } from 'components'
import { routerRedux, Link, browserHistory } from 'dva/router'
import { classnames } from 'utils'
import _ from 'lodash'
import { constant, TimeFilter } from 'utils'
import { CLUSTER_STATUS, CLUSTER_STATUS_ICON } from 'utils/constant'
import * as moment from 'moment'

import EditStackInfo from './editStackInfo'
import ChooseService from './chooseService'
import DeploymentInfo from './deploymentInfo'

import styles from './addStack.less'

const Step = Steps.Step
const FormItem = Form.Item
const modelKey = 'stack/addStack'

class AddStack extends Base{

  constructor(props){
    super(props)

    this.setGobackBtn()

    this.push({
      type : 'app/handleCurrentMenu',
      payload : {activeName : '新建套件', selectedKey : '组件管理component'},
      defer : true,
      fire : [Base.DidMount]
    })

    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
    this.push({
      type : `${modelKey}/clearInfo`,
      fire : [Base.WillUnmount]
    })

    this.next = this.next.bind(this)
    this.prev = this.prev.bind(this)
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

  render(){
    const { addStack, dispatch, form} = this.props

    const { currentStep, chosenService, serviceList, stackInfo,
      stackTags, isStackUnique, selectedService } = addStack

    const editStackInfoProps = {
      next :  this.next,
      saveStackInfo : (data) => {
        dispatch({
          type : `${modelKey}/setStackInfo`,
            payload : data
        })
      },
      stackTags,
      stackInfo,
      isStackUnique,
      checkStackUnique : (data) => {
        dispatch({
          type : `${modelKey}/checkStackUnique`,
          payload : data
        })
      }
    }

    const chooseServiceProps = {
      prev : this.prev,
      next : this.next,
      onSelect : (selectedItem, isSelected) => {
        dispatch({
          type : `${modelKey}/setSelectedService`,
          payload : {
            selectedItem,
            isSelected
          }
        })
      },
      onSelectAll : (isSelected, selectedItem) => {
        dispatch({
          type : `${modelKey}/setSelectedService`,
          payload : {
            selectedItem,
            isSelected
          }
        })
      },
      selectedService,
    }
    const deploymentInfoProps = {
      chosenService : Object.values(selectedService),
      prev : this.prev,
      onOk : (param) => {
        dispatch({
          type : `${modelKey}/addStack`,
          payload : param
        })
      },
      stackInfo,
    }

    const steps = [{
      title : '套件信息',
      content : <EditStackInfo {...editStackInfoProps} />
    },{
      title : '选择服务',
      content : <ChooseService {...chooseServiceProps} />
    },{
      title : '配置信息',
      content : <DeploymentInfo {...deploymentInfoProps} />
    }]

    return (
        <Row className={styles["addStack"]}>
          <Steps current={currentStep}>
            {steps.map(item => <Step key={item.title} title={item.title}/>)}
          </Steps>
          <Row className={styles["steps-content"]}>
            {steps[currentStep].content}
          </Row>
        </Row>
      )
  }
}

AddStack.proptypes = {
  location : PropTypes.object,
  addStack : PropTypes.object,
  dispatch : PropTypes.func,
  loading : PropTypes.bool,
  form : PropTypes.object
}

export default connect((state) => {
  return {
    loading : state.loading.models[modelKey],
    addStack : state[modelKey]
  }
})(Form.create({mapPropsToFields(data){
  return {}
}})(AddStack))
