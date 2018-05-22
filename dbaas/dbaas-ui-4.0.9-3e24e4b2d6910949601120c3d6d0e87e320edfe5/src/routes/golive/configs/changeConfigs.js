/**
 * Created by zhangmm on 2017/9/29.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Input, Icon, message, Button, Modal, Steps, InputNumber, Tooltip, Badge } from 'antd'
import { DataTable, Search, Filter, IconFont, ConfigInput, ProgressIcon, StateIcon } from 'components'
import { classnames, constant } from 'utils'
import NodeBadge from './nodeBadge'
import _ from 'lodash'
import styles from './modify.less'

export default class ChangeConfigs extends React.Component{
  constructor(props){
    super(props)

    this.next = this.next.bind(this)
    this.handleSelectedRowKeys = this.handleSelectedRowKeys.bind(this)
  }

  next(){
    if(this.props.selectedRowKeys.length === 0){
      message.error('至少选择一个实例/集群')
      return false
    }
    if(this.props.status){
      let first = this.props.status[0]
      let skip = false
      this.props.status.map((v,k) =>{
        if(skip){
          return false
        }
        if(first.stack !== v.stack){
          message.error("一次配置变更只能批量修改同一套件类型集群")
          skip = true
          return false
        }else if(v.status === -2){
          message.error(`${v.name}状态异常，无法进行配置变更`)
          skip = true
          return false
        }
      })
      if(skip){
        return false
      }
    }
    if(this.props.next){
      this.props.next()
    }

  }

  handleSelectedRowKeys(selectedRowKeys,selectedRows,selectedRowStatus){
    if(this.props.handleSelectedRowKeys){
      this.props.handleSelectedRowKeys(selectedRowKeys,selectedRows,selectedRowStatus)
    }
  }

  render(){
    const {handleFilter, handleStackId, filter, selectedRowKeys, stackOption} = this.props
    const searchProps = [{
      placeholder:'根据关键词搜索',
      onSearch:(value) => {
        if(handleFilter){
          handleFilter({
            keyword : value
          })
        }
      },
    }]

    const selectProps = [{
      label : '套件类型',
      options: stackOption,
      props : {
        onChange : (value) => {
          if(handleStackId){
            handleStackId({
              stack_id : value
            })
          }
        },
        value:!filter.stack_id ? '全部' : filter.stack_id
      }
    }]

    const filterProps = {
      searchProps,
      selectProps
    }
    const belongTitle = <Tooltip title="业务-应用-集群 | 实例 | 实例组[-节点]">
      所属 <IconFont type="question-circle-o"/>
    </Tooltip>

    const dataTableProps = {
      fetch : {
        url : '/deploy/cluster/list',
        data : filter
      },
      rowKey : 'id',
      columns: [{
        title: '集群名',
        dataIndex: 'cluster_name',
      },{
        title: belongTitle,
        dataIndex: 'belong',
      },{
        title: '用户',
        dataIndex: 'user',
      },{
        title: '使用套件',
        dataIndex: 'stack',
      },{
        title: '节点状态',
        dataIndex: 'nodes_status',
        sorter : (a, b) => a.nodes_status - b.nodes_status,
        render: (text, record) => {
          return  <NodeBadge type={text} node_list={record.node_list}/>
        }
      },{
        title: '运行状态',
        dataIndex: 'run_status',
        sorter : (a, b) => a.run_status - b.run_status,
        render:(text) =>{
          return <StateIcon type={text}/>
        }
      },{
        title: '时间',
        dataIndex: 'time',
        sorter : (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
      }],
      rowSelection : {
        type : 'checkbox',
        onChange : (selectedRowKeys,selectedRowsValue) => {
          let selectedRows = selectedRowsValue.map((v,k) =>{
            return {[v.id]:v.cluster_name}
          })
          let selectedRowStatus = selectedRowsValue.map((v,k) =>{
            return {"id":v.id,"status":v.nodes_status,"name":v.cluster_name,"stack":v.stack}
          })
          if(this.handleSelectedRowKeys){
            this.handleSelectedRowKeys(selectedRowKeys,selectedRows,selectedRowStatus)
          }
        },
        selectedRowKeys : selectedRowKeys
      },
  }

    return (
      <Row className={styles.changeConfigs}>
        <Row className="mgrt-24">
          <Filter {...filterProps}/>
        </Row>
        <DataTable {...dataTableProps} className="mgt-16"/>
        <Row className="text-right">
          <Button type="primary" onClick={this.next}>下一步</Button>
        </Row>
      </Row>
    )
  }
}

ChangeConfigs.propTypes = {
  next : PropTypes.func,
  filter : PropTypes.object,
  handleFilter : PropTypes.func,
  handleStackId : PropTypes.func,
  stackOption : PropTypes.object,
  status : PropTypes.array,
}
