// @todo： All时，modal框同步选中所有

import Base from 'routes/base'
import React from 'react'
import PropTypes from 'prop-types'
import styles from './permissionModal.less'
import { DataTable, Filter, IconFont } from 'components'
import { Modal, Table, Tooltip } from 'antd'
import { PRIVILEGES, GLOBAL_PRIVILEGES} from '../../../utils/constant'

class PermissionModal extends Base{
  constructor(props){
    super(props)
    this.state = {
      selectedPermissions: this.props.selectedPermissions.split(', ')
    }
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.selectedPermissions !== nextProps.selectedPermissions) {
      this.setState({
        selectedPermissions: nextProps.selectedPermissions.split(', ')
      })
    }
  }

  render() {

    const handleSelect = (record, selected, selectedRows) => {  // 本地数据，所以不需要管变动行，只需要管选中行
      this.setState({
        selectedPermissions: selectedRows.map((v) => {
          return v.privilege
        })
      })
    }

    const handleSelectAll = (selected) => {
      this.setState({
        selectedPermissions: selected ? PRIVILEGES : []
      })
    }

    let rowSelection = {
      selectedRowKeys: this.state.selectedPermissions,
      onSelect: handleSelect,
      onSelectAll: handleSelectAll
    }

    const privileges = []
    PRIVILEGES.map((item, k) => {
      privileges.push({
        key: k,
        privilege: item
      })
    })

    const columns = [{
      title: '所有',
      dataIndex: 'privilege',
      render: (text) => {
        if(GLOBAL_PRIVILEGES.indexOf(text) === -1){
          return (<span >{text}</span>)
        }
        return (
          <Tooltip placement="right" title={<span className="word-wrap">GLOBAL PRIVILEGE</span>}>
            <span >
              <IconFont type="iconfont-global-privileges"/>
              {text}
              </span>
          </Tooltip>
        )
      }
    }]

    return (
      <Modal className={styles['permission']} title='权限列表' visible={this.props.visible}
             onOk={() => this.props.onOk(this.state.selectedPermissions.join(', '))} onCancel={this.props.onCancel}>
        <div className="table-wrapper">
          <Table rowSelection={rowSelection} size='small' bordered={false} columns={columns}
                 dataSource={privileges}
                 pagination={false} rowKey={(record) => {
            return record.privilege
          }}/>
        </div>
      </Modal>
    )
  }
}

PermissionModal.propTypes = {
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  visible: PropTypes.bool,
  selectedPermissions: PropTypes.string,
}

export default PermissionModal
