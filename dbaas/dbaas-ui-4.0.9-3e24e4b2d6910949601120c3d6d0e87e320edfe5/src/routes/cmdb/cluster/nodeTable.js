/**
 * Created by wengyian on 2017/12/1.
 */

import Base from 'routes/base'
import PropTypes from 'prop-types'
import {Row, Col, Select, message, Tooltip, Button, Modal, Card, Spin} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon, TablePanel, NodeRunBadge,} from 'components'
import {routerRedux, Link, browserHistory,} from 'dva/router'
import {classnames, constant, TimeFilter} from 'utils'
// import Json from 'utils/json'
import _ from 'lodash'
import styles from './summary.less'
import SwitchMasterModal from './switchMasterModal'
import RelationChart from './relationChart'
import Graph from './graph'
import Func from './func'
import CapProgress from './capProgress'

function NodeTable(obj){
  const {nodeAlive = [], updating, disabled, updateStatus } = obj
  // let nodeAlive = cluster.nodeAlive
  // const disabled = cluster.basic && (cluster.basic.run_status === CLUSTER_STATE.CREATING ? true : false)

  let tableTitle = (
    <Row type="flex" justify="space-between">
      <Col className={styles["lh-26"]}>节点状态</Col>
      <Col>
        <Button
          disabled={disabled}
          size="small" type="primary"
          loading={updating}
          onClick={updateStatus}
        >更新状态
        </Button>
      </Col>
    </Row>
  )
  const tableProps = {
    title: () => tableTitle,
    columns: [{
      title: '节点名',
      dataIndex: 'name',
      render: (text, record) => {
        // todo 链接到节点页面
        return <Link to={`/nodes?node_id=${record.id}`} target="_blank">{text}</Link>
      }
    }, {
      title: '类型',
      dataIndex: 'type_meanings'
    }, {
      title: '服务',
      dataIndex: 'service',
      render: (text, record) => {
        // todo 链接到服务页面 服务id 在哪里哦
        const serviceId = record.service_id
        return <Link to={`/cmdb/component/service-view/${serviceId}`} target="_blank">{text}</Link>
      }
    }, {
      title: '状态',
      dataIndex: 'alive',
      className: styles["txt-c"],
      render: (text) => {
        return <NodeRunBadge type={text}/>
      }
    }],
    pagination: false,
    bordered: true,
    size: 'small',
    dataSource: nodeAlive,
    rowKey: 'id',
  }
  return <Row>
    <DataTable {...tableProps}/>
  </Row>
}

NodeTable.propTypes = {
  obj : PropTypes.object
}

export default NodeTable
