/**
 * Created by wengyian on 2017/12/1.
 */

import Base from 'routes/base'
import PropTypes from 'prop-types'
import {Row, Col, Select, message, Tooltip, Button, Modal, Card, Spin} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon, TablePanel, NodeRunBadge,} from 'components'
import {routerRedux, Link, browserHistory,} from 'dva/router'
import {classnames, constant, TimeFilter} from 'utils'
import _ from 'lodash'
import styles from './summary.less'

import Func from './func'
import CapProgress from './capProgress'

function ClusterOther(obj){

  const { other } = obj
  if (!other) {
    return null
  }
  const {value, table_name = '集群状态指标'} = other
  let columns = []
  // const table_name = '集群状态指标'
  value[0] && Object.keys(value[0]).forEach(val => {
    if (val === 'item') {
      columns.unshift({
        title: '监控项',
        dataIndex: val
      })
    } else {
      columns.push({
        title: val,
        dataIndex: val,
        render: (text, record) => {
          const className = Func.getMonitorClass(text)
          return <span className={className}>{text}</span>
        }
      })
    }
  })
  let dataSource = value

  const dataTableProps = {
    columns,
    dataSource,
    title: () => table_name,
    bordered: true,
    rowKey: 'item',
    pagination: false,
    size: 'small'
  }

  return (
    <Row className={styles["mgt-24"]}>
      <DataTable {...dataTableProps}/>
    </Row>
  )
}

ClusterOther.propTypes = {
  obj : PropTypes.object
}

export default ClusterOther
