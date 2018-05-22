/**
 * Created by lizzy on 2018/4/20.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './index.less'
import { DataTable, Filter , IconFont, ProgressIcon, StateIcon } from 'components'
import { Link } from 'dva/router'
import { Row , Col , Modal, Icon, Tooltip, Table, Badge, Select, Steps, Button } from 'antd'
import { classnames, TimeFilter, constant, Cache } from 'utils'

const cache = new Cache()
const { ACCOUNT_MANAGEMENT } = constant

const modelKey = 'accounts/manage'

class Summary extends Base {
  constructor(props) {
    super(props)

  }

  render() {

    const { manage, dispatch } = this.props

    const { accountName, accountRemark, databases, permissions, selectedDatabases } = manage

    const manageType = cache.get('manageType')
    const type = ACCOUNT_MANAGEMENT[manageType]
    // console.log(manageType, ACCOUNT_MANAGEMENT[manageType])

    const nodes = selectedDatabases.map(v => <div key={`${v.name}+${v.stack_name}`}>{v.name}（所属套件：{v.stack_name}）</div>)

    const dataSource = databases.length === 0 ?
      [{
        type: type,
        accountName: accountName,
        accountRemark: accountRemark,
        nodes: nodes,
      }]
      :
      databases.map((v, index) => {
        return {
          type: type,
          accountName: accountName,
          accountRemark: accountRemark,
          nodes: nodes,
          databases: v,
          permissions: permissions[index] && permissions[index].join(', ')
        }
      })

    const setRowSpan = (value, row, index) => {
      const obj = {
        children: value,
        props: {
          rowSpan: databases.length
        },
      }
      if (index > 0) {
        obj.props.rowSpan = 0
      }
      return obj
    }

    const columns = [{
        title: '操作类型',
        dataIndex: 'type',
        width: 100,
        render: setRowSpan
      }, {
        title: '账号名',
        dataIndex: 'accountName',
        width: 100,
        render: setRowSpan
      }, {
        title: '数据库',
        dataIndex: 'databases',
        width: 100,
      }, {
        title: '权限',
        dataIndex: 'permissions',
        width: 300,
      }, {
        title: '节点',
        dataIndex: 'nodes',
        width: 300,
        render: setRowSpan
      }, {
        title: '备注说明',
        dataIndex: 'accountRemark',
        width: 200,
        render: setRowSpan
      }]

    // console.log(columns, dataSource)
    if (manageType === 2 || manageType === 3) {
      columns.splice(2, 2)
    }

    const tableProps = {
      columns: columns,
      pagination: false,
      bordered: true,
      size: 'small',
      dataSource: dataSource,
      rowKey: manageType === 2 || manageType === 3 ? 'type' : 'databases',
    }

    const prev = () => {
      dispatch({
        type: `${modelKey}/minusCurrentStep`
      })
    }

    const handleSubmit = () => {
      dispatch({
        type: `${modelKey}/handleSubmit`
      })
    }


    return (
      <Row className={styles["create"]}>
        <DataTable {...tableProps}/>
        <Row className="mgt-16 text-right">
          <Button className="mgr-8" onClick={prev}>上一步</Button>
          <Button type="primary" onClick={handleSubmit}>提交</Button>
        </Row>
      </Row>
    )
  }
}

function mapStateToProps(state) {
  return {
    manage: state['accounts/manage'],
    loading: state.loading.effects
  }
}

Summary.propTypes = {
  manage: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect(mapStateToProps)(Summary)
