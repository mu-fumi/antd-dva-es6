/**
 *
 * @copyright(c) 2017
 * @created by zhangmm
 * @package dbaas-ui
 * @version :  2017-10-19 21:28 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { classnames, Logger } from 'utils'
import { DataTable, IconFont } from 'components'
import { Modal, Tooltip, Checkbox, Row, Col, Button } from 'antd'
import styles from './settingModal.less'

class SettingModal extends React.Component {

  render() {
    const { visible, title, onCancel, onOk, settingUsingOk, handleChangeSettings,
      handleResetSettings, recommitReset, recommitConfirm  } = this.props

    const modalOpts = {
      title: title,
      visible,
      onCancel:onCancel,
      onOk:onOk,
      wrapClassName: 'vertical-center-modal',
      width: 'auto',
      style: {maxWidth: '35%'},
      footer:<Row>
        <Col span={12} style={{textAlign:'left'}}>
          <Button onClick={handleResetSettings} loading={recommitReset}>恢复默认</Button>
        </Col>
        <Col span={12}>
          <Button onClick={onCancel}>取消</Button>
          <Button onClick={onOk} type='primary' loading={recommitConfirm}>确定</Button>
        </Col>
      </Row>
    }

    return (
      <Modal {...modalOpts} className={styles['modal-style']}>

        <Row>
          {
            settingUsingOk.map((v,k) =>{
              return <Col span={8} key={k} style={{marginBottom:'6px'}}>
                <Checkbox value={v['key']} checked={v['show']} disabled={v['disabled']}
                 onClick={handleChangeSettings.bind(this,v['key'])}>{v['name']}</Checkbox></Col>
            })
          }
        </Row>
        <Row style={{marginTop:'8px'}}>
          <IconFont type="bulb" className="text-warning"/>
          <span>选择你想要显示在列表里的字段</span>
        </Row>
      </Modal>
    )
  }
}

SettingModal.propTypes = {
  visible: PropTypes.bool,
  title: PropTypes.string,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  settingUsingOk: PropTypes.array,
  handleChangeSettings: PropTypes.func,
  handleResetSettings: PropTypes.func,
}

export default SettingModal
