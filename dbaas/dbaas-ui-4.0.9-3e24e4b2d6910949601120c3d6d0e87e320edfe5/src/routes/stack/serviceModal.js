/**
 * Created by wengyian on 2017/7/6.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Modal, Select, Input, Row, Table } from 'antd'
import { IconFont, DataTable } from 'components'
import { Link, routerRedux } from 'dva/router'
import _ from 'lodash'
import styles from './stack.less'
import classnames from 'classnames'

const Option = Select.Option

class ServiceModal extends React.Component{

  constructor(props){
    super(props)

    this.state = {
      visible : props.visible,
      stackInfo : props.stackInfo,
      footer : props.footer,
      reload : props.serviceReload
    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.visible != this.state.visible
    || !_.isEqual(nextProps.stackInfo, this.state.stackInfo)
    || !_.isEqual(nextProps.serviceReload, this.state.reload)){
      this.setState({
        visible : nextProps.visible,
        stackInfo : nextProps.stackInfo
      })
    }
  }

  deleteService(record){
    // console.log('record===>', record)

    Modal.confirm({
      title : '提示',
      content : '确定要删除套件吗？',
      onOk(){
        if(this.props.deleteService){
          this.props.deleteService(record.id)
        }
      },
    })
  }

  render(){

    const fetchDataTableProps = {
      fetch : {
        url : '/service/list',
        data : {stack_id : this.state.stackInfo.id}
      },
      reload : this.state.reload,
      columns : [
        {
          title : '服务名',
          dataIndex : 'name'
        },{
          title : '版本',
          dataIndex : 'version'
        },{
          title : '描述',
          dataIndex : 'description'
        },
        // {
        //   title : '操作',
        //   render : (text, record) => {
        //
        //     return (
        //       <Row>
        //         <Link to="">修改</Link>
        //         <span className="ant-divider" />
        //         <a href="javascript:;" onClick={this.deleteService.bind(this, record)}>删除</a>
        //       </Row>
        //     )
        //   }
        // }
      ],
      pagination : false,
      rowKey : 'id'
    }

    let title = <Row><span className={styles["title-hidden"]}>{this.state.stackInfo.name}</span>的服务列表</Row>

    return (
      <Modal
        visible={this.state.visible}
        title={title}
        footer={this.state.footer}
        onCancel={this.props.onCancel}
      >
        <DataTable {...fetchDataTableProps}/>
      </Modal>
    )
  }
}

ServiceModal.propTypes = {
  visible : PropTypes.bool,
  stackInfo : PropTypes.object,
  deleteService : PropTypes.func,
  onCancel : PropTypes.func,
  footer : PropTypes.string
}

export default ServiceModal
