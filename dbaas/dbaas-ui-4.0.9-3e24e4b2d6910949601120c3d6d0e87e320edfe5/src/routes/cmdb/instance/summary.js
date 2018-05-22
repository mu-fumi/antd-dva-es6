/**
 * Created by wengyian on 2017/9/7.
 */

import Base from 'routes/base'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, Select, message, Tooltip, Button, Modal, Card, Spin} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon, TablePanel, NodeRunBadge,} from 'components'
import {routerRedux, Link, browserHistory,} from 'dva/router'
import {classnames, constant, TimeFilter} from 'utils'
import _ from 'lodash'
import styles from '../cluster/summary.less'
import Graph from '../cluster/graph'
import Func from '../cluster/func'
import CapProgress from '../cluster/capProgress'
import BasicTable from '../cluster/basicTable'
import NodeTable from '../cluster/nodeTable'
import ClusterOther from '../cluster/clusterOther'
import ChartContent from '../cluster/chartContent'

const {CLUSTER_STATE} = constant
const modelKey = 'cmdb/instance/summary'

class Monitor extends Base {
  constructor(props) {
    super(props)

    this.setGobackBtn()

    this.push({
      type: 'app/handleCurrentMenu',
      fire: [Base.DidMount],
      payload: {activeName: '概览', selectedKey: '实例管理instance'}
    })
    this.push({
      type : 'app/handleCurrentMenu',
      fire : [Base.WillUnmount],
      payload : { selectedKey: ''}
    })

    this.push({
      type: `${modelKey}/handleReload`,
      fire: [Base.DidMount]
    })
    this.push({
      type: `${modelKey}/clearTimer`,
      fire: [Base.WillUnmount]
    })

    this.push({
      type: `${modelKey}/clearInstance`,
      fire: [Base.WillUnmount]
    })

    this.push({
      type : `${modelKey}/setSpinning`,
      payload : true,
      fire : [Base.WillUnmount],
      clear : false
    })

    this.updateStatus = this.updateStatus.bind(this)
  }

  updateStatus(){
    const { monitor = {}, dispatch } = this.props
    const { instanceId } = monitor
    dispatch({
      type : `${modelKey}/setUpdating`,
      payload : true
    })
    dispatch({
      type : `${modelKey}/updateStatus`,
      payload : instanceId
    })
  }

  render() {
    const {monitor, dispatch} = this.props
    const {instance, instanceId, spinning = true, relateType} = monitor

    const baseTableProps = {
      basic : instance.basic,
      id :instanceId,
      relateType : relateType
    }

    const nodeTableProps = {
      nodeAlive : instance.nodeAlive,
      disabled : instance.basic && (instance.basic.run_status === CLUSTER_STATE.CREATING ? true : false),
      updating : monitor.updating,
      updateStatus : this.updateStatus
    }

    const clusterOtherProps = {
      other : instance.other
    }
    const chartContentProps = {
      nodes : instance.topology,
      relateType : relateType
    }

    return (
      <Row className={styles["mgt-8"]}>
        <Spin spinning={spinning} size="large">
          <Row>
            <Col span="12">
              <Row className={styles["info"]}>
                <BasicTable {...baseTableProps}/>
              </Row>
              <Row className={styles["info"]}>
                <NodeTable {...nodeTableProps}/>
              </Row>
            </Col>
            <Col span="11" offset={1} className={styles["graph"]}>
              <Row className={classnames(styles["pd-8"], styles["clear-float"])}>
                实例关系图
              </Row>
              <Row className={styles["jsPlumb"]} id="summary_graph">
                <ChartContent {...chartContentProps}/>
              </Row>
            </Col>
          </Row>
          <Row className={styles["info"]}>
            <ClusterOther {...clusterOtherProps}/>
          </Row>
        </Spin>

      </Row>
    )
  }
}

Monitor.propTypes = {
  monitor: PropTypes.object,
  location: PropTypes.object,
  loading: PropTypes.bool,
  dispatch: PropTypes.func
}

export default connect((state) => {
  return {
    loading: state.loading.models[modelKey],
    monitor: state[modelKey]
  }
})(Monitor)
