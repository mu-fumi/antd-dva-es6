/**
 *
 * @copyright(c) 2017
 * @created by lizzy
 * @package dbaas-ui
 * @version :  2017-06-27 21:28 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { classnames, Logger } from 'utils'
import { DataTable, IconFont } from 'components'
import { Form, Input, InputNumber, Switch, Modal, Tabs, Row, Col } from 'antd'
import styles from './resultModal.less'

const TabPane = Tabs.TabPane;
class ResultModal extends React.Component {

  componentWillReceiveProps(nextProps){
    if(!_.isEqual(nextProps.debugResult.data, this.props.debugResult.data)){
      const activeKey = nextProps.debugResult.data || []
      this.setState({
        activeKey : (activeKey[0] || {}).ip
      })
    }
  }

  render() {
    const {visible, debugResult, onOk, onCancel} = this.props

    const {consuming, parameter, status, data = [], start_at, target, user, run_user} = debugResult
    const modalOpts = {
      title: '工具执行详情',
      visible,
      onOk,
      onCancel,
      wrapClassName: 'vertical-center-modal',
      width: '70%',
    }

    return (
      <Modal {...modalOpts} className={styles["result-modal"]}>
        <Row>
          <Col span={24} className={styles["result-details"]}>
            <Col span={12}>
              <span>结果：{status ? '成功' : '失败'}</span>
              <IconFont type={status ? 'check-circle-o' : 'close-circle-o'}
                        className={status ? 'text-success' : 'text-error'}/>
            </Col>
            <Col span={12}>
              <span>用户：{user}</span>
            </Col>
            <Col span={12}>
              <span>目标：{target}</span>
            </Col>
            <Col span={12}>
              <span>开始：{start_at}</span>
            </Col>
            <Col span={12}>
              <span>执行用户：{run_user}</span>
            </Col>
            <Col span={12}>
              <span>耗时：{consuming}</span>
            </Col>
            <Col span={12}>
              <span>参数：{parameter || '无'}</span>
            </Col>
          </Col>
          <Col span={24}>
            <Tabs defaultActiveKey={(data[0] || {}).ip}>
              {
                data.map((v) => {
                  const tab = (
                    <span>{v.ip}
                      <IconFont type={v.success ? 'check-circle-o' : 'close-circle-o'}
                                className={v.success ? 'text-success' : 'text-error'}/>
                </span>)
                  return (<TabPane tab={tab} key={v.ip}>
                    <div className={styles["result-info"]}>{v.result}</div>
                  </TabPane>)
                })}
            </Tabs>
          </Col>
        </Row>
      </Modal>
    )
  }
}

ResultModal.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  debugResult: PropTypes.object,
}

export default ResultModal
