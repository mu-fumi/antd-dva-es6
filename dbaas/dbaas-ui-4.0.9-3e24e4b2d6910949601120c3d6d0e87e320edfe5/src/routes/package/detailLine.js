/**
 * Created by zhangmm on 2017/7/4.
 */
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './detail.less'
import { DataTable, Filter } from 'components'
import { Link } from 'dva/router'
import { Row ,Col } from 'antd'

class DetailLine extends React.Component{
  constructor(props){
    super(props)
  }

  render(){
    const {info = {}}  = this.props
    return(
      <Row className={styles.detailLine}>
        <Row>
          <Col>
            <Col span={12} className="left-col">程序包名：{!info.package_name ? '无' : info.package_name}</Col>
            <Col span={12} className="right-col">创建者：{!info.user_name ? '无' : info.user_name}</Col>
          </Col>
        </Row>
        <Row>
          <Col>
            {/*<Col span={12} className="left-col">部署路径：{!info.location ? '无' : info.location}</Col>*/}
            <Col span={12} className="left-col">备注：{!info.memo ? '无' : info.memo}</Col>
          </Col>
        </Row>
      </Row>
    )
  }
}
export default DetailLine
