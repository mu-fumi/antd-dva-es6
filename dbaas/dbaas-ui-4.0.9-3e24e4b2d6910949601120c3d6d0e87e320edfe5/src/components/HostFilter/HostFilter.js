/**
 * Created by wengyian on 2017/8/7.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { classnames, Logger } from 'utils'
import { DataTable, Search, IconFont } from 'components'
import { Form, Input, InputNumber, Switch, Modal, Button, Row, Col, Checkbox, Tooltip } from 'antd'
import { HOST_LIST, HOST_STATUS, HOST_IP } from 'utils/constant'
import HostTable from './HostTable.js'
import TableSet from './TableSet.js'
import { Link } from 'dva/router'
import styles from './HostFilter.less'

const CheckboxGroup = Checkbox.Group

class HostFilter extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      defaultColumns: ['name', 'connect_ip', 'connect_status', 'type', 'free_memory', 'free_disk', 'cpu_load',
        'running_services'],
      columns:  ['name', 'connect_ip', 'connect_status', 'type', 'free_memory', 'free_disk', 'cpu_load',
        'running_services'],
      newColumns: [],
      checkboxShow: false,
      filter: '',
      selectedMachines: []
    }
  }

  componentDidMount() {
    this.setState({
      newColumns: this.state.columns
    })
  }

  render() {
    const placeholder = '根据关键词过滤'

    const searchProps = {
      placeholder,
      onSearch: (value) => {
        this.setState({
          filter: value
        })
      },
    }

    const modalOpts = {
      title: '筛选机器',
      visible: this.props.visible,
      onOk: () => {
        if (this.state.checkboxShow) {
          this.setState({
            columns: this.state.newColumns,
            checkboxShow: false
          })
        } else {
          this.setState({
            checkboxShow: false
          })
          if (this.props.onOk) {
            this.props.onOk(this.state.selectedMachines)
          }
        }

      },
      onCancel: () => {
        if (this.state.checkboxShow) {
          this.setState({
            checkboxShow: false,
            newColumns: this.state.columns
          })
        } else if (this.props.onCancel) {
          this.props.onCancel()
        }
      },
      wrapClassName: 'vertical-center-modal',
      width: '70%',
    }

    const onclick = () => {
      this.setState({
        checkboxShow: true
      })
    }

    const toDefault = () => {
      this.setState({
        newColumns: this.state.defaultColumns
      })
    }

    const hostTableProps = {
      filter: this.state.filter,
      fetchFilter: this.props.fetchFilter,
      selectedMachines: this.state.selectedMachines,
      columns: this.state.columns,
      isAllParams: this.props.isAllParams,
      isRadio : this.props.isRadio,
      onChange: (value) => {
        this.setState({
          selectedMachines : value
        })
      }
    }

    const tableSetProps = {
      newColumns: this.state.newColumns,
      onChange: (value) => {
        this.setState({
          newColumns: value
        })
      }
    }

    return (
      <Modal {...modalOpts} className={styles["machine-modal"]}>
        <Row style={{display: this.state.checkboxShow ? 'none' : ''}} >
          <Row className='filter'>
            <Col span={12}>
              <Search {...searchProps} />
            </Col>
            <Col offset={8} span={4}>
              <Button onClick={onclick} className='pull-right'>
                <IconFont type="setting"/>
                列表设置
              </Button>
            </Col>
          </Row>
          <HostTable {...hostTableProps} />
        </Row>
        <Row style={{ display: this.state.checkboxShow ? '' : 'none'}}>
          <TableSet {...tableSetProps} />
        </Row>
        <Button style={{ display: this.state.checkboxShow ? '' : 'none'}}
                className="to-default" onClick={toDefault}>恢复默认</Button>
      </Modal>
    )
  }
}

HostFilter.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  isAllParams : PropTypes.bool,
  isRadio : PropTypes.bool,
  fetchFilter : PropTypes.object,
}

export default HostFilter
