/**
 *
 * @copyright(c) 2017
 * @created by  zhangmm
 * @package dbaas-ui
 * @version :  2017-09-19 10:41 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Icon } from 'antd'
import { DataTable, Layout, Search, ProgressIcon, IconFont, Filter, TablePanel } from 'components'
import { routerRedux, Link } from 'dva/router'
import styles from './detail.less'
import ServiceTable from './serviceTable.js'
import { constant } from 'utils'

const { HOST_IP, HOST_CERTIFICATE, HOST_SYSTEM, HOST_DISK } = constant

class Extend extends React.Component {
  constructor(props){
    super()

    this.state = {
      eyeVisibility:'eye',
      root_password:'******'
    }

    this.changeEye = this.changeEye.bind(this)
  }

  changeEye(){
    const rootPassword = '$encrypt$'
    this.setState({
      eyeVisibility:this.state.eyeVisibility === 'eye-o' ? 'eye' : 'eye-o',
      root_password:this.state.eyeVisibility === 'eye-o' ? '******' : rootPassword,
    })
  }

  render() {
    const { extend } = this.props
    const { system, disk, certificate, service, ip } = extend

    const system_render = {

    }

    const system_info = Object.keys(HOST_SYSTEM).map((v,k) =>{
      if( (k + 1) % 2 === 0 ){
        return (
          <Col key={k} span={15} className="right-col" style={{wordWrap:'break-word'}}>
            <span>{HOST_SYSTEM[v]}：</span>
            <span style={{color:'black'}}>{system_render[v] || system && system[v] || '无'}</span>
          </Col>
        )
      }else{
        return (
          <Col key={k} span={9} className="left-col" style={{wordWrap:'break-word'}}>
            <span>{HOST_SYSTEM[v]}：</span>
            <span style={{color:'black'}}>{system_render[v] || system && system[v] || '无'}</span>
          </Col>
        )
      }
    })

    const real_memory_var =
      <span>
        {disk && disk.real_memory ? disk.real_memory + ' MB' : ''}
      </span>

    const swap_var =
      <span>
        {disk && disk.swap ? disk.swap + ' MB' : ''}
      </span>

    const disk_render = {
      real_memory:real_memory_var,
      swap:swap_var
    }

    const disk_info = Object.keys(HOST_DISK).map((v,k) =>{
      if( (k + 1) % 2 === 0 ){
        return (
          <Col key={k} span={15} className="right-col" style={{wordWrap:'break-word'}}>
            <span>{HOST_DISK[v]}：</span>
            <span style={{color:'black'}}>{disk_render[v] || disk && disk[v] || '无'}</span>
          </Col>
        )
      }else{
        return (
          <Col key={k} span={9} className="left-col" style={{wordWrap:'break-word'}}>
            <span>{HOST_DISK[v]}：</span>
            <span style={{color:'black'}}>{disk_render[v] || disk && disk[v] || '无'}</span>
          </Col>
        )
      }
    })

    const serviceTableProps = {
      dataSource:service,
/*      pagination : {
        showTotal: total => `共 ${total} 条`,
        current: service.current_page,
        pageSize: 10,
        total: service.total },*/
    }
//console.log("serviceTableProps==========>",serviceTableProps)
    const ipInfo_render = {

    }

    const remember_token_var =
      <span>
        ******
      </span>

    const root_password_var =
      <span>
        {this.state.root_password}
        <Icon type={`${this.state.eyeVisibility}`} style={{cursor:"pointer"}} onClick={this.changeEye}/>
      </span>

    const user_password_var =
      <span>
        ******
      </span>

    const certificate_render = {
      remember_token:remember_token_var,
      root_password:root_password_var,
      user_password:user_password_var
    }

    const ip_info = Object.keys(HOST_IP).map((v,k) =>{
      if( (k + 1) % 2 === 0 ){
        return (
          <Col key={k} span={15} className="right-col" style={{wordWrap:'break-word'}}>
            <span>{HOST_IP[v]}：</span>
            <span style={{color:'black'}}>{ipInfo_render[v] || ip && ip[v] || '无'}</span>
          </Col>
        )
      }else{
        return (
          <Col key={k} span={9} className="left-col" style={{wordWrap:'break-word'}}>
            <span>{HOST_IP[v]}：</span>
            <span style={{color:'black'}}>{ipInfo_render[v] || ip && ip[v] || '无'}</span>
          </Col>
        )
      }
    })

    const certificate_info = Object.keys(HOST_CERTIFICATE).map((v,k) =>{
      if( (k + 1) % 2 === 0 ){
        return (
          <Col key={k} span={15} className="right-col" style={{wordWrap:'break-word'}}>
            <span>{HOST_CERTIFICATE[v]}：</span>
            <span style={{color:'black'}}>{certificate_render[v] || certificate && certificate[v] || '无'}</span>
          </Col>
        )
      }else{
        return (
          <Col key={k} span={9} className="left-col" style={{wordWrap:'break-word'}}>
            <span>{HOST_CERTIFICATE[v]}：</span>
            <span style={{color:'black'}}>{certificate_render[v] || certificate && certificate[v] || '无'}</span>
          </Col>
        )
      }
    })

    return (
      <Row className={styles.extend}>
        <Row style={{color:'black',marginBottom:'16px',fontSize:'16px'}}>系统信息</Row>
        { system_info }
        <Row style={{borderBottom:"1px solid #eee",margin:'32px 0 16px 0'}}></Row>
        <Row style={{color:'black',marginBottom:'16px',fontSize:'16px'}}>硬件信息</Row>
        { disk_info }
        <Row style={{borderBottom:"1px solid #eee",margin:'32px 0 16px 0'}}></Row>
        <Row style={{color:'black',marginBottom:'16px',fontSize:'16px'}}>IP信息</Row>
        { ip_info }
        <Row style={{borderBottom:"1px solid #eee",margin:'32px 0 16px 0'}}></Row>
        <Row style={{color:'black',marginBottom:'16px',fontSize:'16px'}}>凭证信息</Row>
        { certificate_info }
        <Row style={{borderBottom:"1px solid #eee",margin:'32px 0 16px 0'}}></Row>
        <Row style={{color:'black',marginBottom:'16px',fontSize:'16px'}}>服务信息</Row>
        <ServiceTable {...serviceTableProps}/>
      </Row>
    )
  }
}

Extend.propTypes = {
  extend: PropTypes.object,
}

export default Extend
