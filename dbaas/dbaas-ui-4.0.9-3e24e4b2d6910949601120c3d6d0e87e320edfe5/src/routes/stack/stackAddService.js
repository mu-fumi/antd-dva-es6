/**
 * Created by wengyian on 2017/7/25.
 */

import Base from 'routes/base'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Input, message, Button, Modal, Steps,  } from 'antd'
import { DataTable, Search, Filter, IconFont } from 'components'
import { classnames } from 'utils'
import { Link, routerRedux, browserHistory } from 'dva/router'
import _ from 'lodash'
import styles from './stack.less'
import ChooseService from './chooseService'
import DeploymentInfo from './deploymentInfo'

const modelKey = 'stack/editStack'
const Step = Steps.Step

class StackAddService extends Base{

  constructor(props){
    super(props)

    this.setGobackBtn()

    this.push({
      type : 'app/handleCurrentMenu',
      payload : {activeName : '新增服务', selectedKey : '组件管理component'},
      defer : true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })

    this.next = this.next.bind(this)
    this.prev = this.prev.bind(this)
    this.handleBack = this.handleBack.bind(this)
  }

  next(){
    this.props.dispatch({
      type : `${modelKey}/plusCurrentStep`,
    })
  }

  prev(){
    this.props.dispatch({
      type : `${modelKey}/minusCurrentStep`,
    })
  }

  handleBack(){
    const { stackId } = this.props.editStack
    Modal.confirm({
      title: '提示',
      content: '确定放弃修改，返回套件编辑吗？',
      onOk: () => {
        browserHistory.push(`cmdb/component/editStack/${stackId}`)
      }
    })
  }

  render(){
    const { dispatch, editStack } = this.props

    const { currentStep, stackId, selectedService } = editStack

    const chooseServiceProps = {
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
      type : 'edit',
      stackId,
    }

    const deploymentInfoProps = {
      chosenService : Object.values(selectedService),
      prev : this.prev,
      onOk : (param) => {
        dispatch({
          type : `${modelKey}/addService`,
          payload : param
        })
      },
      stackId,
      type : 'edit'
    }

    const steps = [{
      title : '选择服务',
      content : <ChooseService {...chooseServiceProps} />
    },{
      title : '配置信息',
      content : <DeploymentInfo {...deploymentInfoProps} />
    }]

    return (
      <Row>
        <Steps current={currentStep}  className={styles["pd-16"]}>
          {steps.map(item => <Step key={item.title} title={item.title}/>)}
        </Steps>
        <Row className={styles["steps-content"]}>
          {steps[currentStep].content}
        </Row>
      </Row>
    )
  }
}

StackAddService.propTypes = {
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
})(StackAddService)
