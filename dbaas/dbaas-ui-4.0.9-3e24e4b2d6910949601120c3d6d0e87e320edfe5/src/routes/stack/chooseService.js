/**
 * Created by wengyian on 2017/7/7.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Input, Icon, message, Button, Modal, Steps, Form } from 'antd'
import { DataTable, Layout, Search, Filter, IconFont } from 'components'
import { classnames } from 'utils'
import { Link } from 'dva/router'
import _ from 'lodash'

const FormItem = Form.Item

class ChooseService extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      stackId : props.stackId,
      selectedService : props.selectedService || {},
    }

    this.prev = this.prev.bind(this)
    this.next = this.next.bind(this)
  }

  componentWillReceiveProps(nextProps){
    if(this.state.stackId !== nextProps.stackId ||
      !_.isEqual(nextProps.selectedService, this.state.selectedService)
    ){
      this.setState({
        stackId : nextProps.stackId,
        selectedService : nextProps.selectedService || {},
      })
    }
  }



  prev(){
    if(this.props.prev){
      this.props.prev()
    }
  }

  next(){
    if(_.isEmpty(this.state.selectedService)){
      message.error('请选择服务')
      return
    }

    // // 查找有无重复的服务名
    // const serviceNames = this.state.chosenService.map((item) => {
    //   return item.name
    // })
    //
    // let isUnique = true;
    //
    // for( let i = 0; i < serviceNames.length - 1; i++ ){
    //   if(serviceNames.includes(serviceNames[i], i + 1)){
    //     isUnique = false
    //     break
    //   }
    // }
    // if(!isUnique){
    //   message.error('同一服务只能选择一个版本')
    //   return
    // }


    if(this.props.next){
      this.props.next()
    }
  }

  render(){
    const rowSelected = Object.values(this.state.selectedService).map((item) => {
      return item.id
    })

    let tableFetchData = { paginate : 1}
    let pagination = true
    if(this.props.type === 'edit'){
      tableFetchData = { nousing : 1, stack_id : this.state.stackId,}
      pagination = false
    }

    const DataTableProps = {
      fetch : {
        url : '/service/list',
        data : tableFetchData
      },
      columns : [{
        title : '服务名',
        dataIndex : 'name'
      },{
        title : '版本',
        dataIndex : 'version'
      },{
        title : '描述',
        dataIndex : 'description'
      }],
      rowKey : 'id',
      pagination : false,
      rowSelection : {
        onSelect : (record, selected, selectedRows) => {
          if(this.props.onSelect){
            this.props.onSelect(record, selected)
          }
        },
        onSelectAll : (selected, selectedRows, changeRows) => {
          if(this.props.onSelectAll){
            this.props.onSelectAll(selected, changeRows)
          }
        },
        selectedRowKeys : rowSelected
      },
    }

    let fromNum = 4

    if(this.props.type != 'edit'){
      fromNum = 2
      delete DataTableProps.pagination
    }

    return (
      <Row>
        <DataTable {...DataTableProps} />
        <Row style={{textAlign : "right", marginTop : '8px' }}>
          <Link to={`/cmdb/component/createService?from=${fromNum}`} className="pull-left">新建服务&gt;&gt;</Link>
          { this.props.type === 'edit' ? '' : <Button type="primary" onClick={this.prev}>上一步</Button>}
          <Button type="primary" onClick={this.next} style={{marginLeft : "8px"}}>下一步</Button>
        </Row>
      </Row>
    )
  }

}

ChooseService.propTypes = {
  selectedService : PropTypes.object,
  prev : PropTypes.func,
  next : PropTypes.func,
}

export default ChooseService
