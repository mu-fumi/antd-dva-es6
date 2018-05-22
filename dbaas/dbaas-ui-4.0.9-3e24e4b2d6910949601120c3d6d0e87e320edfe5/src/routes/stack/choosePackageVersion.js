/**
 * Created by wengyian on 2017/8/1.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Input, Icon, message, Button, Modal, Form, Select } from 'antd'
import { DataTable, Layout, Search, Filter, IconFont } from 'components'
import { classnames } from 'utils'
import { Link } from 'dva/router'
import _ from 'lodash'

class ChoosePackageVersion extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      selectedPackage : props.selectedPackage,
      selectedPackageVersion : props.selectedPackageVersion,
      serviceInfo : props.serviceInfo
    }

    this.prev = this.prev.bind(this)
    this.submit = this.submit.bind(this)
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.selectedPackage != this.state.selectedPackage ||
      nextProps.selectedPackageVersion != this.state.selectedPackageVersion ||
        !_.isEqual(nextProps.serviceInfo, this.state.serviceInfo)
    ){
      this.setState({
        selectedPackage : nextProps.selectedPackage,
        selectedPackageVersion : nextProps.selectedPackageVersion,
        serviceInfo : nextProps.serviceInfo,
      })
    }
  }

  submit(){
    // 验证未写
    if(this.state.selectedPackageVersion == -1){
      message.error('请选择相应包版本')
      return
    }

    let data = {...this.state.serviceInfo, package : { id : this.state.selectedPackageVersion}}
    if(this.props.submit){
      this.props.submit(data)
    }
  }

  prev(){
    if(this.props.prev){
      this.props.prev()
    }
  }

  render(){

    // console.log('this.state.selectedPackageVersion===>', this.state.selectedPackageVersion)

    const dataTableProps = {
      fetch : {
        url : `/packages/${Number(this.state.selectedPackage)}/version`
      },
      columns : [{
        title : '版本',
        dataIndex : 'version',
      },{
        title : '用户名',
        dataIndex : 'user_name'
      },{
        title : '备注',
        dataIndex : 'memo'
      }],
      rowSelection : {
        type : 'radio',
        onChange : (selectedRowKeys) => {
          const packageVersionId = selectedRowKeys.pop()
          if(this.props.onChange){
            this.props.onChange(packageVersionId)
          }
        },
        selectedRowKeys : this.state.selectedPackageVersion.toString()
      },
      rowKey : 'id'
    }

    return (
      <Row>
        <DataTable {...dataTableProps}/>
        <Row style={{textAlign : 'right'}}>
          <Button onClick={this.prev} style={{marginRight : '16px'}}>上一步</Button>
          <Button onClick={this.submit}>完成</Button>
        </Row>
      </Row>
    )
  }
}

ChoosePackageVersion.propTypes = {
  selectedPackage : PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  next : PropTypes.func,
  prev : PropTypes.func,
}

export default ChoosePackageVersion
