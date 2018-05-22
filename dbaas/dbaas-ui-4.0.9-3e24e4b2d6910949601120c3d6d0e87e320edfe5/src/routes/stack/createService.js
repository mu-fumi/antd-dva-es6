/**
 * Created by wengyian on 2017/7/31.
 */
import Base from 'routes/base'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, Input, Icon, message, Button, Modal, Steps, Form} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont} from 'components'
import {routerRedux, Link} from 'dva/router'
import {classnames} from 'utils'
import _ from 'lodash'
import {constant, TimeFilter} from 'utils'
import {} from 'utils/constant'
import styles from './service.less'
import EditServiceInfo from './editServiceInfo'
import ChoosePackage from './choosePackage'
import ChoosePackageVersion from './choosePackageVersion'

const modelKey = 'stack/createService'
const Step = Steps.Step

class CreateService extends Base {

  constructor(props) {
    super(props)

    this.setGobackBtn()

    this.push({
      type :  'app/handleCurrentMenu',
      payload : {activeName : '新建服务', selectedKey : '组件管理component'},
      defer : true,
    })

    this.next = this.next.bind(this)
    this.prev = this.prev.bind(this)
    this.saveServiceInfo = this.saveServiceInfo.bind(this)
    this.saveSelectedPackage = this.saveSelectedPackage.bind(this)
    this.saveSelectedPackageVersion = this.saveSelectedPackageVersion.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
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

  saveServiceInfo(data) {
    this.props.dispatch({
      type: `${modelKey}/saveServiceInfo`,
      payload: data
    })
  }

  saveSelectedPackage(data) {
    this.props.dispatch({
      type: `${modelKey}/saveSelectedPackage`,
      payload: data
    })
  }

  saveSelectedPackageVersion(data) {
    this.props.dispatch({
      type: `${modelKey}/saveSelectedPackageVersion`,
      payload: data
    })
  }

  onSubmit(data) {
    this.props.dispatch({
      type: `${modelKey}/createService`,
      payload: data
    })
  }

  render() {
    const {location, createService, dispatch, loading, form} = this.props
    const {currentStep, serviceInfo, selectedPackage, selectedPackageVersion,} = createService


    const editServiceInfoProps = {
      next : this.next,
      saveServiceInfo : this.saveServiceInfo,
      serviceInfo,
    }


    const choosePackageProps = {
      next : this.next,
      prev : this.prev,
      selectedPackage,
      onChange: this.saveSelectedPackage,
    }


    const choosePackageVersionProps = {
      submit: this.onSubmit,
      prev : this.prev,
      selectedPackage : selectedPackage,
      selectedPackageVersion : selectedPackageVersion,
      serviceInfo,
      onChange: this.saveSelectedPackageVersion,
    }

    const steps = [{
      title: '服务信息',
      content: <EditServiceInfo {...editServiceInfoProps} />
    }, {
      title: '选择包',
      content: <ChoosePackage {...choosePackageProps} />
    }, {
      title: '选择包版本',
      content: <ChoosePackageVersion {...choosePackageVersionProps} />
    },]

    return (
      <Row className={styles["mgt-10"]}>
        <Steps current={currentStep} className={styles["steps-container"]}>
          { steps.map(item => <Step key={item.title} title={item.title}/>)}
        </Steps>
        <Row className={styles["mgt-16"]}>
          { steps[currentStep].content}
        </Row>
      </Row>
    )
  }
}

CreateService.proptypes = {
  location: PropTypes.object,
  createService: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.bool,
  form: PropTypes.object
}

export default connect((state) => {
  return {
    loading: state.loading.models[modelKey],
    createService: state[modelKey]
  }
})(CreateService)
