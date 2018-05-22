import React from 'react'
import PropTypes from 'prop-types'
import { classnames, Logger } from 'utils'
import { Form, Modal, Row, Col } from 'antd'

import { Chart } from 'components'
import LazyLoad from 'react-lazyload'

import styles from './queryAnalysisModal.less'

class QueryAnalysisModal extends React.Component{

  render(){
    const {
      visible,
      sqlID,
      time,
      currentNode,
      onOk,
      onCancel
    } = this.props

    const modalOpts = {
      title: 'SQL 执行趋势图',
      visible,
      onOk,
      onCancel,
      //wrapClassName: 'vertical-center-modal',
    }

    const keys = ['used_time', 'execution', 'row_affect']

    return (
      <Modal {...modalOpts} className={styles.graphs}>
        <Row>
          {/*<Col span={24}>*/}
            {/*<span>以下为当前语句所选时间点/段明细图</span>*/}
          {/*</Col>*/}
          { keys.map((v, k) => {
            const chartProps = {
              fetch: {
                url: `/performance/statmenet/detail/${sqlID}`,
                data: {type: v, time, hostname: currentNode},
                required: ['hostname']
              }
            }
            return (
              <LazyLoad key={k} height={200} offset={[-100, 0]} scroll={true}>
                <Row className={styles.chart}>
                  <Col key={k} span={24}><Chart {...chartProps} /> </Col>
                </Row>
              </LazyLoad>
            )
          })}
        </Row>
      </Modal>
    )
  }
}

QueryAnalysisModal.propTypes = {
  visible: PropTypes.bool,
  sqlID: PropTypes.string,
  time: PropTypes.string,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
}

export default Form.create({mapPropsToFields(data) {
  return {
  };
}})(QueryAnalysisModal)

