/**
 * Created by wengyian on 2017/11/21.
 */

import React from 'react'
import PropTypes from 'prop-types'
import styles from './Description.less'
import { DataTable, Filter } from 'components'
import { Link } from 'dva/router'
import { Row ,Col } from 'antd'
import { classnames } from 'utils'

class Description extends React.Component{

  render(){
    const { colspan = 11, list, className = '' } = this.props


    return (
      <Row type="flex" justify="space-between"
           className={classnames(styles["container"], className)}
      >
        {
          list.map((v, i) => {
            return <Col
              span={ v.colspan || colspan}
              key={i}
              className={styles['list-col']}
            >
              <span className={styles['break-all']}>{v.name}：</span>
              <span className={styles['break-all']}>
                { typeof v.render === 'function' ? v.render(v.value, list) : v.value}
              </span>
              {/*<Col span="4" className={styles["txt-r"]}>{v.name}：</Col>*/}
              {/*<Col span="20" className={styles['break-all']}>*/}
                {/*{ typeof v.render === 'function' ? v.render(v.value, list) : v.value}*/}
              {/*</Col>*/}
            </Col>
          })
        }
      </Row>
    )
  }
}

Description.propTypes = {
  colspan : PropTypes.number,
  list : PropTypes.array,
  className : PropTypes.string
}

export default Description
