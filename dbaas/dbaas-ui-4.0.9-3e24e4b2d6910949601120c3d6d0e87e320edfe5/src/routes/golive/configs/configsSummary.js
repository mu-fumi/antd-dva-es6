/**
 * Created by zhangmm on 2017/9/30.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Input, Icon, message, Button, Modal, Steps, InputNumber, Tooltip } from 'antd'
import { DataTable, Search, Filter, IconFont, ConfigInput, TablePanel } from 'components'
import { classnames } from 'utils'
import _ from 'lodash'
import styles from './modify.less'
const confirm = Modal.confirm

export default class ConfigsSummary extends React.Component{
  constructor(props){
    super(props)

    this.handlePrev = this.handlePrev.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  componentDidMount(){
    if(this.props.handleLoading){
      this.props.handleLoading()
    }
  }

  handlePrev(){
    if(this.props.prev){
      this.props.prev()
    }
  }

  handleChange(){
    Modal.confirm({
      title:`确认`,
      content:<Row style={{marginTop : '8px'}}>
        <IconFont type="bulb" className="text-warning"/>
        <span>是否要进行变更配置</span>
      </Row>,
      onOk:() =>{
        if(this.props.handleChange){
          this.props.handleChange()
        }
      },
      onCancel(){
      }
    })
  }

  render(){
    const { params, loading } = this.props
    const dataTableProps = {
      rowKey: 'id',
      bordered:true,
      columns:[{
        title: '集群/节点',
        dataIndex: 'cluster',
        width:"100px",
        render: (value, row, index) => {
          const obj = {
            children: value,
            props: {},
          }
          if(!(index + 1 === params.length) && params[index + 1]['cluster'] === value){
            obj.props.rowSpan = params.length
          }
          if(!(index === 0) && params[index - 1]['cluster'] === value){
            obj.props.rowSpan = 0
          }
          return obj
        },
      }, {
        title: '配置名',
        dataIndex: 'key',
        width:"350px",
      }, {
        title: '当前值',
        dataIndex: 'before',
        width:"400px",
        render: (text) =>{
          return (
            <Tooltip title={text} placement="left" overlayClassName="tooltip-style">
              <span className="text-ellipsis-1">{text}</span>
            </Tooltip>
          )
        }
      }, {
        title: '修改值',
        dataIndex: 'after',
        width:"400px",
        render: (text) =>{
          return (
            <Tooltip title={text} placement="left" overlayClassName="tooltip-style">
              <span className="text-ellipsis-1">{text}</span>
            </Tooltip>
          )
        }
      }],
      dataSource:params,
      pagination:false,
      loading:loading,
    }

    return (
      <Row className={styles.configsSummary} style={{marginTop:'24px'}}>
        <DataTable {...dataTableProps}/>
        <Row className="text-right">
          <Button onClick={this.handlePrev} style={{marginTop:'32px'}} className="mgr-16">上一步</Button>
          <Button type="primary" onClick={this.handleChange}>变更</Button>
        </Row>
      </Row>
    )
  }
}

ConfigsSummary.propTypes = {
  prev : PropTypes.func,
  params : PropTypes.array,
  loading : PropTypes.bool,
  handleLoading : PropTypes.func,
  handleChange : PropTypes.func,
}
