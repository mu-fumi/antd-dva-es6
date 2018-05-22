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
import { Row , Col , Modal, Icon, Tooltip, Table, Badge, Select, Steps, Button, message } from 'antd'
import { classnames, TimeFilter, constant } from 'utils'
import DatabaseStatusBadge from './DatabaseStatusBadge'

const modelKey = 'accounts/manage'

class Manage extends Base {
  constructor(props) {
    super(props)

  }

  render() {

    const { manage, dispatch } = this.props

    const { selectedDatabases } = manage

    const setSeleted = (selected, changeRows) => {
      // console.log(selected, changeRows)
      let oldSelected = selectedDatabases || []
      if(selected) {
        oldSelected.push(...changeRows)
      }else{
        changeRows.forEach(v => {
          oldSelected = oldSelected.filter( val => val.id + val.relate_type !== v.id + v.relate_type)
        })
      }
      dispatch({
        type: `${modelKey}/setSelectedDatabases`,
        payload: oldSelected
      })
      // debugger
    }

    const rowSelection = {
      onSelect : (record, selected, selectedRows) => {
        setSeleted(selected, [record])
      },
      onSelectAll : (selected, selectedRows, changeRows) => {
        setSeleted(selected, changeRows)
      },
      selectedRowKeys: selectedDatabases.map(v => `${v.id}+${v.relate_type}`),
    }

    // console.log(rowSelection.selectedRowKeys)

    const dataTableProps = {
      fetch : {
        url : '/databases',
      },
      rowSelection,
      columns: [{
        title: '名称',
        dataIndex: 'name',
      },{
        title: '所属',
        dataIndex: 'belong',
      },{
        title: '套件',
        dataIndex: 'stack_name',
      },{
        title: '用户',
        dataIndex: 'user_name',
      },{
        title: '运行状态',
        dataIndex: 'run_status',
        render: (text) => {
          return <DatabaseStatusBadge {...{type: text}}/>
        }
      },{
        title: '时间',
        dataIndex: 'created_at',
        width : 220
      }],
      rowKey : (record) => `${record.id}+${record.relate_type}`,

    }

    const prev = () => {

      dispatch({
        type: `${modelKey}/minusCurrentStep`
      })
    }

    const next = () => {
      if (selectedDatabases.length === 0) {
        message.error('至少选择一个数据库')
        return
      }
      dispatch({
        type: `${modelKey}/plusCurrentStep`
      })
    }

    return (
      <Row className={styles["create"]}>
        <DataTable {...dataTableProps} />
        <Row className="mgt-16 text-right">
          <Button className="mgr-8" onClick={prev}>上一步</Button>
          <Button type="primary" onClick={next}>下一步</Button>
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

Manage.propTypes = {
  manage: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect(mapStateToProps)(Manage)
