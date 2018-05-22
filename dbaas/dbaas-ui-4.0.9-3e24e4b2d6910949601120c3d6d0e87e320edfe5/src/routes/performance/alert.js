/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-05-24 20:11 $
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Alert as AlertComponent } from 'antd'

import styles from './alert.less'

class Alert extends React.Component {

  render() {
    const {
      location,
      settingData,
      } = this.props


    const key = location.pathname.replace('performance/', '').replace('/', '')
    let type = 'warning'
    let display = 'none'
    let message = '数据可能不正常'
    const module = settingData.module

    if(!module){
      return null
    }

    if(settingData && !settingData.enable){
      type = "error"
      message = '未开启性能分析,' + message
      display = ''
    }else if(settingData && (settingData.enable && key in module && !module[key]['value'])){
      message = '当前模块未开启,' + message
      display = ''
    }
    return (
      <Row className={styles.alert} style={{display: display }}>
        <Col span={24}>
          <AlertComponent message={message} type={type} showIcon />
        </Col>
      </Row>
    )
  }
}

Alert.propTypes = {
  location: PropTypes.object,
  settingData: PropTypes.object,
}

export default Alert
