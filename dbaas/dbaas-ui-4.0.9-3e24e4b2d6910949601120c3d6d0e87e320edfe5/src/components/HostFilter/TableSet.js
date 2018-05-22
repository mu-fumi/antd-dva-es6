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
import { Link } from 'dva/router'
import styles from './HostFilter.less'

const CheckboxGroup = Checkbox.Group

class TableSet extends React.Component {

  render() {

    /*********** 20180104 新增默认 禁止取消选上*************/
    const disabledKey = {
      name : true
    }

    let content = () => {
      return Object.keys(HOST_LIST).map((val, index) => {
        return (
          <Col span="7" offset="1" key={index}>
            <Checkbox value={val} className={styles["check-box"]} disabled={disabledKey[val] ? true : false}>{HOST_LIST[val]}</Checkbox>
          </Col>
        )
      })
    }

    const CheckedOnChange = (checkedValues) => {
      this.props.onChange(checkedValues)
    }

    return (
      <CheckboxGroup onChange={CheckedOnChange.bind(this)} value={this.props.newColumns}>
        {content()}
      </CheckboxGroup>
    )
  }
}

TableSet.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  isAllParams : PropTypes.bool,
  isRadio : PropTypes.bool,
  fetchFilter : PropTypes.object,
}

export default TableSet
