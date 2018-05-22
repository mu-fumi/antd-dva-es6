/**
 * Created by lizzy on 2018/4/20.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './manage.less'
import { DataTable, Filter , IconFont, ProgressIcon, StateIcon } from 'components'
import { Link } from 'dva/router'
import { Row , Col , Modal, Icon, Tooltip, Table, Badge, Select, Steps } from 'antd'
import { classnames, TimeFilter, constant } from 'utils'
import Operation from './Operation'
import Database from './Database'
import Summary from './Summary'

const modelKey = 'accounts/manage'
const Step = Steps.Step

class Manage extends Base {
  constructor(props) {
    super(props)

    this.setGobackBtn()
    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '管理数据库账号', selectedKey: '账号权限account'},
      fire: [Base.DidMount]
    })
    this.push({
      type: 'app/handleCurrentMenu',
      payload: {selectedKey: ''},
      fire: [Base.WillUnmount],
    })
  }

  componentWillUnmount() {
    super.componentWillUnmount()
    this.props.dispatch({
      type: `${modelKey}/resetState`
    })
  }

  render() {

    const { manage } = this.props
    // console.log(this.props)
    const { currentStep } = manage

    const steps = [{
      title : '操作',
      content : <Operation />,
    },{
      title : '选择节点',
      content : <Database />,
    },{
      title : '信息汇总',
      content : <Summary />,
    }]

    return (
      <Row className={styles["manage"]}>
        <Steps current={currentStep}>
          {steps.map(item => <Step key={item.title} title={item.title}/>)}
        </Steps>
        <Row className="mgt-16">
          {steps[currentStep].content}
        </Row>
      </Row>
    )
  }
}

function mapStateToProps(state) {
  // console.log(state)
  return {
    manage: state['accounts/manage'],
    loading: state.loading.effects
  }
}

Manage.propTypes = {
  manage: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect(mapStateToProps)(Manage)
