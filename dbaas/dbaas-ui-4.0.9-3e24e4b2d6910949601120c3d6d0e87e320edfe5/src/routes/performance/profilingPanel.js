/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-05-16 10:17 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Icon, message, Progress, Card as CardComponent, Input, Collapse } from 'antd'
import { DataTable } from 'components'
import styles from './panel.less'
import _ from 'lodash'

const { TextArea } = Input

class Panel extends React.Component {

  constructor (props) {
    super(props)
  }

  render() {
    const { content = '', profilingSQL } = this.props
    const className = 'collapse-content collapse-content-' +(profilingSQL ? '' : 'in')+'active'
    return (
      <Row className={styles.panel}>
        <TextArea rows={4} value={profilingSQL} disabled={true}/>
        <div className="collapse">
          <div className="collapse-item">
            <div className="collapse-header" role="tab">
            </div>
            <div className={className} role="tabpanel">
              <div className="collapse-content-box">
                <DataTable { ...this.props.tableProp } />
              </div>
            </div>
          </div>
        </div>
      </Row>
    )
  }
}

Panel.propTypes = {
  onClick: PropTypes.func,
  tableProp: PropTypes.object,
  content: React.PropTypes.oneOfType([
    React.PropTypes.string,
    PropTypes.element,
  ]),
}

export default Panel
