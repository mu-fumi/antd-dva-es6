/**
 * Created by wengyian on 2017/7/24.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Input, Icon, message, Button, Modal, Steps, Form } from 'antd'
import { DataTable, Layout, Search, Filter, IconFont } from 'components'
import { classnames } from 'utils'
import { Link } from 'dva/router'
import _ from 'lodash'
import styles from './stack.less'
import EditDeploymentModal from './editDeploymentModal'

class EditStackService extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      stackId : props.stackId,
      reload : props.reload,
      serviceId : props.serviceId,
      stackConfig : props.stackConfig,
      deploymentModalVisible : props.deploymentModalVisible
    }

  }

  componentWillReceiveProps(nextProps){
    if(this.state.stackId !== nextProps.stackId ||
      this.state.reload !== nextProps.reload ||
      this.state.serviceId !== nextProps.serviceId ||
      this.state.deploymentModalVisible !== nextProps.deploymentModalVisible ||
      this.state.stackConfig !== nextProps.stackConfig
    ){
      this.setState({
        stackId : nextProps.stackId,
        reload : nextProps.reload,
        serviceId : nextProps.serviceId,
        deploymentModalVisible : nextProps.deploymentModalVisible,
        stackConfig : nextProps.stackConfig,
      })
    }
  }

  deleteService(id){
    const _this = this
    Modal.confirm({
      title : '提示',
      content : '确定删除此项服务么？',
      onOk(){
        if(_this.props.deleteService){
          let data = [{id : id}]
          _this.props.deleteService(data)
        }
      }
    })
  }

  showDeploymentModal(id){
    if(this.props.showDeploymentModal){
      this.props.showDeploymentModal(id)
    }
  }

  render(){

    const DataTableProps = {
      fetch : {
        url : '/service/list',
        data : {
          stack_id : this.state.stackId
        }
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
      }, {
        title : '操作',
        render : (text, record) => {
          return (
            <span>
              <a href="javascript:;" onClick={this.deleteService.bind(this, record.id)}>删除</a>
              <span className="ant-divider"></span>
              <a href="javascript:;" onClick={this.showDeploymentModal.bind(this, record.id)}>编辑配置</a>
            </span>
          )
        }
      }],
      rowKey : 'id',
      reload : this.state.reload,
      pagination : false,//不分页
      // rowSelection : {
      //   onChange : (selectedRowKeys, selectedRows) => {
      //     if(this.props.chooseService){
      //       this.props.chooseService(selectedRows)
      //     }
      //   },
      //   selectedRowKeys : rowSelected
      // },
    }

    const deploymentModalProps = {
      visible : this.state.deploymentModalVisible,
      stackConfig : this.state.stackConfig,
      serviceId : this.state.serviceId,
      onOk : (params) => {
        if(this.props.onOk){
          this.props.onOk(params)
        }
      },
      onCancel : () => {
        if(this.props.onCancel){
          this.props.onCancel()
        }
      },
      afterClose : () => {
        if(this.props.afterClose){
          this.props.afterClose()
        }
      }
    }

    return(
      <Row>
        <DataTable {...DataTableProps} />
        <Row style={{marginTop : '16px',}}>
          <Link to="/cmdb/component/editStack/addService?from=3">
            <IconFont type="plus" />新增服务
          </Link>
        </Row>
        <EditDeploymentModal {...deploymentModalProps}/>
      </Row>
    )
  }
}

EditStackService.propTypes = {
  stackId : PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  reload : PropTypes.number,
  serviceId : PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  stackConfig : PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  deploymentModalVisible : PropTypes.bool,
  onOk : PropTypes.func,
  onCancel : PropTypes.func,
}

export default EditStackService
