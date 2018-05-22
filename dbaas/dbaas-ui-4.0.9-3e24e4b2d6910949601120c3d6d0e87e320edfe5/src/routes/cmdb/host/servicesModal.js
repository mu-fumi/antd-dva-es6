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
import styles from './servicesModal.less'

const { HOST_SERVICE_STATUS } = constant

class ServicesModal extends React.Component {

  render() {
    const { visible, title, onCancel, onOk, dataSource } = this.props
    const modalOpts = {
      title: title,
      visible,
      onCancel:onCancel,
      onOk:onOk,
    }

    const tableProps = {
      rowKey: 'id',
      columns:[{
        title: '服务名',
        dataIndex: 'service',
        key: 'service',
        width:350,
        render:(text,record) =>{
          return <Link target='_blank'
                       to={`/cmdb/component/service-view/${record.service_id}`}>{text}</Link>
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width:150,
        className:'text-center',
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
      }],
      pagination:false,
      scroll:{y:200},
      dataSource:dataSource,
    }

    return (
      <Modal {...modalOpts} className={styles['modal-style']}>
        <DataTable {...tableProps} />
      </Modal>
    )
  }
}

ServicesModal.propTypes = {
  visible: PropTypes.bool,
  title: PropTypes.string,
  dataSource: PropTypes.array,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
}

export default ServicesModal
