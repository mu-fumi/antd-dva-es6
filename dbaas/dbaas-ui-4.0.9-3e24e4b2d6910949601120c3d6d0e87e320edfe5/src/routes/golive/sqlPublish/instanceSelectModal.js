/**
 *
 * @copyright(c) 2017
 * @created by lizzy
 * @package dbaas-ui
 * @version :  2017-09-5 21:28 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { classnames, Logger } from 'utils'
import { DataTable, IconFont, Search } from 'components'
import { Modal, Row, Col, Badge } from 'antd'
import styles from './instanceSelectModal.less'

class InstanceSelectModal extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      filter: '',
      selectedInstances: this.props.selectedInstances, // node_name可能重复，因此要保存行信息，用id比较
      selectedRowKeys: this.props.selectedRowKeys
    }
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.selectedRowKeys.length !== nextProps.selectedRowKeys.length) { // 初始为[]
      this.setState({
        selectedRowKeys: nextProps.selectedRowKeys,
        selectedInstances: nextProps.selectedInstances
      })
    }
  }

  render() {

    const {visible, onOk, onCancel} = this.props

    const placeholder = '根据关键词过滤'

    const searchProps = {
      placeholder,
      onSearch: (value) => {
        this.setState({
          filter: value,
          selectedRowKeys: [],  // 筛选时清空原有选项，以防各种筛选情况的选项夹杂在一起
          selectedInstances: []
        })
      },
    }

    const modalOpts = {
      title: '选择实例',
      visible,
      onOk: () => {
        if (this.state.selectedRowKeys.length > 1) {   // 选中多个实例时弹出确认框
          Modal.confirm({
            title: '确认',
            content: <div>
              <div>1.在多个实例上执行相同的 SQL 语句可能会导致数据不一致等严重问题；</div>
              <div>2.在多个实例上执行耗时操作容易造成网关超时，您可以为每个实例单独创建 SQL 发布；</div>
              <div>确认选择以上实例吗？</div>
            </div>,
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
              onOk(this.state.selectedInstances, this.state.selectedRowKeys)
            },
            onCancel() {},
          })
        } else {
          onOk(this.state.selectedInstances, this.state.selectedRowKeys)
        }
      },
      onCancel: () => {
        this.setState({
          selectedRowKeys: this.props.selectedRowKeys,
          selectedInstances: this.props.selectedInstances,
        })
        onCancel()
      },
      wrapClassName: 'vertical-center-modal',
      width: '70%',
    }

    const setSelected = (selected, changeRows) => {
      let selectedInstances = this.state.selectedInstances
      if(selected){
        selectedInstances.push(...changeRows)
      }else{
        changeRows.forEach(v => {  //  添加不重复的行
          selectedInstances = selectedInstances.filter( val => val.id != v.id)
        })
      }
      this.setState({
        selectedInstances: selectedInstances
      })
    }

    const onSelect = (record, selected, selectedRows) => {
      setSelected(selected, [record])
    }

    const onSelectedAll = (selected, selectedRows, changeRows) => {
      setSelected(selected, changeRows)
    }

    const onChange = (selectedRowKeys) => {
      this.setState({
        selectedRowKeys: selectedRowKeys
      })
    }

    const fetchDataTableProps = {
      fetch: {
        url: "/public/node",
        data: {
          keywords: this.state.filter,
          alive: 0,
          only_db: 1
        }
      },
      columns: [
        {title: '实例名', dataIndex: 'instance_name', width: 250, render: (text, record) => {
          return <span>
            {record.set_name ? record.set_name : record.cluster_name ? record.cluster_name : record.instance_name}
          </span>
        } },
        {title: '节点名', dataIndex: 'node_name', width: 250 },
        {title: '端口号', dataIndex: 'port', width: 150 },
        {title: '状态', dataIndex: 'alive', width: 150, render: (text, record) => {
          return text === 0 ? (<span><Badge status="success"/>存活</span>) : (<span><Badge status="error"/>离线</span>)
        }},
        {title: '所属业务', dataIndex: 'business_name', width: 200},
        {title: '所属应用', dataIndex: 'application_name', width: 200},
        {title: '架构', dataIndex: '', width: 200, render: (text, record) => {
          return <span>
            {record.set_stack_name ? record.set_stack_name : record.cluster_stack_name ? record.cluster_stack_name : record.instance_stack_name}
          </span>
        }},
        {title: '内存 (MB)', dataIndex: 'memory', width: 150},
        {title: '所在城市', dataIndex: 'city', width: 200, sorter: true },
        {title: '所在 IDC', dataIndex: 'idc', width: 200, sorter: true },
      ],
      scroll: {x: 1750},
      rowKey: 'id',
      rowSelection : {
        onSelect : onSelect,
        onSelectAll : onSelectedAll,
        onChange: onChange,
        selectedRowKeys: this.state.selectedRowKeys,
      },
    }

    return (
      <Modal {...modalOpts} className={styles["instance-modal"]}>
        <Row className='filter mgt-16'>
          <Col span={12}>
            <Search {...searchProps} />
          </Col>
        </Row>
        <DataTable
          {...fetchDataTableProps}
        />
      </Modal>
    )
  }
}

InstanceSelectModal.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  selectedRowKeys: PropTypes.array,
  selectedInstances: PropTypes.array
}

export default InstanceSelectModal
