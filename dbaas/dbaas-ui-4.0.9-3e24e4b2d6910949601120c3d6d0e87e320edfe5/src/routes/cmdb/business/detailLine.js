/**
 * Created by zhangmm on 2017/7/4.
 */
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './detailLine.less'
import { DataTable, Filter } from 'components'
import { Link } from 'dva/router'
import { Row ,Col } from 'antd'

class DetailLine extends React.Component{
  constructor(props){
    super(props)
  }

  render(){
    const { business = {} }  = this.props
    return(
      <Row className={styles.detailLine}>
        <Row>
          <Col span={12} className="left-col">业务名称：{ business.name }</Col>
          <Col span={12} className="right-col">负责人：{ business.user_name }</Col>
        </Row>
        <Row>
          <Col span={12} className="left-col">应用数：{
            Number(business.application_count) === 0 ? 0
              :
              (<Link target="_blank" to={`/cmdb/app?business_id=${business.id}`}>
                {business.application_count}
                </Link>)
          }</Col>
          <Col span={12} className="right-col">备注：{ !business.desc ? '无' :  business.desc}</Col>
        </Row>
      </Row>
    )
  }
}

DetailLine.propTypes = {
  business : PropTypes.object,
}
export default DetailLine
