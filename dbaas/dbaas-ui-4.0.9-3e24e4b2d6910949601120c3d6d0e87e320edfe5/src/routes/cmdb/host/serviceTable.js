/**
 *
 * @copyright(c) 2017
 * @created by zhangmm
 * @package dbaas-ui
 * @version :  2017-10-19 21:28 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { classnames, Logger, constant } from 'utils'
import { DataTable, IconFont } from 'components'
import { Modal, Tooltip, Badge } from 'antd'
import { Link } from 'dva/router'

const { HOST_SERVICE_STATUS, HOST_BELONG_NAME } = constant

class ServiceTable extends React.Component {

  render() {

    const { dataSource } = this.props

    const tableProps = {
      rowKey: 'name',
      columns:[{
        title: '名称',
        dataIndex: 'service',
        key: 'service',
        render: (text,record) =>{
          //跳到服务详情页
          return <Link target='_blank'
                       to={`/cmdb/component/service-view/${record.service_id}`}>{text}</Link>
        }
      },
      {
        title: '套件',
        dataIndex: 'stack',
        key: 'stack',
        render: (text,record) =>{
          //跳到套件列表页
          return <Link target='_blank'
                       to={`/cmdb/component/stack-view?stack_id=${record.stack_id}`}>{text}</Link>
        }
      },
      {
        title: '所属',
        dataIndex: 'belong',
        key: 'belong',
        render: (text,record) =>{
          return <Link target='_blank'
                       to={`/cmdb/${HOST_BELONG_NAME[record.type]}/${record.belong_id}`}>{text}</Link>
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        className: 'text-center',
        render:(text) =>{
          let status = ''
          let desc = ''
          switch(Number(text)){
            case HOST_SERVICE_STATUS.STATUS_ALIVE:
              status = 'success'
              desc = '运行中'
              break
            case HOST_SERVICE_STATUS.STATUS_RESTARTING:
              status = 'processing'
              desc = '重启中'
              break
            case HOST_SERVICE_STATUS.STATUS_DEAD:
              status = 'error'
              desc = '异常'
              break
            case HOST_SERVICE_STATUS.STATUS_STOPPING:
              status = 'processing'
              desc = '停止中'
              break
            case HOST_SERVICE_STATUS.STATUS_BUILDING:
              status = 'processing'
              desc = '创建中'
              break
            case HOST_SERVICE_STATUS.STATUS_DESTROYING:
              status = 'warning'
              desc = '删除中'
              break
            case HOST_SERVICE_STATUS.STATUS_DELETED:
              status = 'default'
              desc = '已删除'
              break
          }
          return (
            <Tooltip title={desc}>
            <span style={{cursor : 'pointer'}} >
            <Badge status={status}/>
            </span>
            </Tooltip>
          )
        }
      },
      {
        title: '版本',
        dataIndex: 'version',
        key: 'version',
        render:(text) =>{
          return<span>{!text ? "无" : text }</span>
        }
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        render:(text) =>{
          return<span>{!text ? "无" : text }</span>
        }
      }],
      //pagination:pagination,
      dataSource:dataSource
    }

    return (
      <DataTable {...tableProps}/>
    )
  }
}

ServiceTable.propTypes = {
  dataSource: PropTypes.array,
}

export default ServiceTable
