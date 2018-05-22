import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Button, Icon, Select } from 'antd'
import styles from './topfilter.less'
import { IconFont } from 'components'
import SettingModal from './settingModal'
import Alert from './alert'

const Option = Select.Option

class TopFilter extends React.Component {

  render() {
    const {
      nodes = {}, currentNode, settingVisible, settingData = {}, tabMenu, onOk, onCancel,
      onChange, location, confirmLoading,
      } = this.props

    const settingProps = {
      //key: +new Date(),
      visible: settingVisible,
      settingData,
      title: '性能分析设置',
      onOk,
      onCancel,
      confirmLoading,
      modules: tabMenu,
    }

    const alertProps = {
      location,
      settingData
    }

    return (
      <Row>
        <Row className={styles['top-filter']}>
          <Col span={16} className={styles['single-line']}>
            <span className="mgr-8">节点: </span>
            <Select showSearch value={currentNode} onChange={onChange}>
              { Object.keys(nodes).map((v, k) => <Option key={k} value={v}>{nodes[v].node_name}</Option>) }
            </Select>
            {
              nodes[currentNode] ?
            <span className="mgl-8 text-caption">所属实例: {nodes[currentNode].instance_name || ''}
              {nodes[currentNode].instance_desc ? `, ${nodes[currentNode].instance_desc}` : ''}
            </span>
              : ''
            }
          </Col>
          <Col span={8} className="text-right">
            <span className="mgr-16">
              当前采集频率: { settingData['update_interval'] } 分钟
            </span>
          </Col>
          <SettingModal { ...settingProps } />
        </Row>
        <Alert { ...alertProps } />
      </Row>
    )
  }
}

TopFilter.propTypes = {
  nodes: PropTypes.object,
  currentNode: PropTypes.string,
  onClick: PropTypes.func,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  onChange: PropTypes.func,
  tabMenu: PropTypes.array,
  settingData: PropTypes.object,
  location: PropTypes.object,
  confirmLoading: PropTypes.bool,
}

export default TopFilter
