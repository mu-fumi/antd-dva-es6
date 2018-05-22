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
    const { app = {} }  = this.props


    return(
      <Row className={styles.detailLine}>
        <Row>
          <Col span={12} className="left-col">应用名称：{ app.name }</Col>
          <Col span={12} className="right-col">用户：{ app.user_name }</Col>
        </Row>
        <Row>
          <Col span={12} className="left-col">业务：{ app.business_name }</Col>
          <Col span={12} className="right-col">集群数：{
            Number(app.cluster_count) === 0 ? 0
              :
              (<Link target='_blank' to={`/cmdb/cluster?app_id=${app.id}&business_id=${app.business_id}`}>
                {app.cluster_count
                }</Link>)
          }</Col>
        </Row>
        <Row>
          <Col span={12} className="left-col">实例组数：{
            Number(app.set_count) === 0 ? 0
              :
              (<Link target='_blank' to={`/cmdb/instance-group?app=${app.id}&business_id=${app.business_id}`}>
                {app.set_count}
                </Link>)
          }</Col>
          <Col span={12} className="right-col">实例数：{
            Number(app.instance_count) === 0 ? 0
              :
              (<Link target='_blank' to={`/cmdb/instance?app_id=${app.id}&business_id=${app.business_id}`}>
                {app.instance_count}
              </Link>)
          }</Col>
        </Row>
        <Row>
          <Col span={12} className="left-col">备注：{ !app.desc ? '无' : app.desc}</Col>
        </Row>
      </Row>
    )
  }
}

DetailLine.propTypes = {
  app : PropTypes.object,
}
export default DetailLine
