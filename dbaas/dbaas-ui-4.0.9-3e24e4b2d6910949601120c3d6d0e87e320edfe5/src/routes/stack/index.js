/**
 * Created by wengyian on 2017/7/4.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Card, Icon, message, Tag, Button, Modal } from 'antd'
import { DataTable, Layout, Search, Filter, IconFont } from 'components'
import { routerRedux, Link } from 'dva/router'
import { classnames } from 'utils'
import _ from 'lodash'
import { constant, TimeFilter } from 'utils'
import { CLUSTER_STATUS, CLUSTER_STATUS_ICON } from 'utils/constant'
import * as moment from 'moment'

import styles from './stack.less'

function Stack({ location, dispatch, stack, loading}){

  const { clusterInfo } = stack

  const stack_summary = () => {
    if(_.isEmpty(clusterInfo)) return null
    return ['machine', 'stack'].map((value, index) => {
      // todo 部署信息的链接未写
      const linkUrl = value === 'machine' ? '/cmdb/host' : ''

      let content = Object.keys(clusterInfo[value]).map((val, i) => {
       if(val === 'count') return
       let type = `${CLUSTER_STATUS_ICON[val]}-circle`
       let className = classnames(styles["icon-style"], styles[`icon-${val}`])

       return (
         <Row className={styles["mg-4"]} key={i}>
           <IconFont type={type} className={className}/>
           {CLUSTER_STATUS[val]}
           <span className={styles["num-style"]}>{clusterInfo[value][val]}</span>
           {value === 'machine' ? '台' : '套'}
         </Row>
        )
      })
     return (
       <Col span="12" key={index} className={styles["list-item"]}>
         <Col span="10" className={styles["pd-16"]}>
           <Row className={styles["mg-16"]}>{value==='machine' ? '主机' : '已部署套件'}</Row>
           <Row className={styles["mg-16"]}>
             <Link to={linkUrl} className={styles["ftz-12"]}>{value==='machine' ? '查看主机列表' : '查看部署信息'}&gt;&gt;</Link>
           </Row>
           <Row className={styles["item-count"]}>
             <span className={styles["count-style"]}>{clusterInfo[value].count}</span>
             {value==='machine' ? '台' : '套'}
             </Row>
         </Col>
         <Col span="14" className={styles["pd-16"]}>
           {content}
         </Col>
       </Col>
     )
    })
  }

  return (
    <Row>
      <Row className={styles["stack-info"]}>
        <Col span="4" >套件概览</Col>
        <Col span="4">
          <Link to="/cmdb/component/stack-view">套件{clusterInfo.stack_count}个&gt;&gt;</Link>
        </Col>
        <Col span="4">
          <Link to="/cmdb/component/service-view">服务{clusterInfo.service_count}个&gt;&gt;</Link>
        </Col>
      </Row>
      <Row className={styles["stack-summary"]}>{stack_summary()}</Row>
      <Row>

      </Row>
    </Row>
  )
}


Stack.propTypes = {
  stack : PropTypes.object,
  loading : PropTypes.bool,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect(({ stack, loading, app }) => ({
  stack,
  loading : loading.models.stack
}))(Stack)
