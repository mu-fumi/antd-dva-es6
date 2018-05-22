/**
 * Created by wengyian on 2017/7/20.
 */

/**
 * Created by wengyian on 2017/7/31.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Input, Icon, message, Button, Modal, Form, Select } from 'antd'
import { DataTable, Layout, Search, Filter, IconFont } from 'components'
import { classnames } from 'utils'
import { Link } from 'dva/router'
import _ from 'lodash'


const FormItem = Form.Item
const Option = Select.Option

class ChoosePackage extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      selectedPackage : props.selectedPackage
    }

    this.prev = this.prev.bind(this)
    this.next = this.next.bind(this)
  }

  componentWillReceiveProps(nextProps){
    if( nextProps.selectedPackage != this.state.selectedPackage){
      this.setState({
        selectedPackage : nextProps.selectedPackage
      })
    }
  }

  next(){
    if(this.state.selectedPackage != -1){
      if(this.props.next){
        this.props.next()
      }
    }else{
      message.error('请选择一个包')
    }
  }

  prev(){
    if(this.props.prev){
      this.props.prev()
    }
  }


  render(){

    const dataTableProps = {
      fetch : {
        url : '/packages',
        data : {
          has_version : true
        }
      },
      columns : [{
        title : '名称',
        dataIndex : 'package_name',
      },{
        title : '用户名',
        dataIndex : 'user_name'
      },{
        title : '最新版本',
        dataIndex : 'latest_version'
      }],
      rowSelection : {
        type : 'radio',
        onChange : (selectedRowKeys) => {
          // console.log('selectedRowKeys===>', selectedRowKeys)
          const packageId = selectedRowKeys.pop()
          if(this.props.onChange){
            this.props.onChange(packageId)
          }
        },
        selectedRowKeys : this.state.selectedPackage.toString()
      },
      rowKey : 'id'
    }

    return (
      <Row>
        <DataTable {...dataTableProps}/>
        <Row style={{textAlign : 'right', marginTop : '8px'}}>
          <Link to="/packages/create?from=1" style={{float : 'left'}}>新建包&gt;&gt;</Link>
          <Button onClick={this.prev} style={{marginRight : '16px'}}>上一步</Button>
          <Button onClick={this.next}>下一步</Button>
        </Row>
      </Row>
    )
  }
}

ChoosePackage.propTypes = {
  selectedPackage : PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  next : PropTypes.func,
  prev : PropTypes.func,
  onChange : PropTypes.func,
}

export default ChoosePackage
