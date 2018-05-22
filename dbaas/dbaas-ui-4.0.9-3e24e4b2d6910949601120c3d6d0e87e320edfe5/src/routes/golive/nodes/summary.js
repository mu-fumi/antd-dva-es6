/**
 * Created by wengyian on 2017/9/11.
 */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, Tabs, message, Form, Button, Modal,} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon} from 'components'
import {routerRedux, Link,} from 'dva/router'
import {classnames, constant, TimeFilter, Cache} from 'utils'
import _ from 'lodash'
import styles from './add.less'
import TipModal from './tipModal'

const TabPane = Tabs.TabPane
const cookie = new Cache('cookie')
const { RELATE_TYPE } = constant

class Summary extends React.Component{
  constructor(props){
    super(props)

    this.next = this.next.bind(this)
    this.prev = this.prev.bind(this)

    this.state = {
      isLoading : false
    }
  }

  next(){
    // todo  把数据处理成后台需要的数据
    // const user_id = cookie.get('uid')


    let { selectedHost, selectedBaseInfo, selectedService } = this.props
    let { relateId, service, relateType } = selectedBaseInfo
    const dataId = parseInt(relateId.split('-_-')[1])
    const dataType = Number(relateType)
    let data = {
      id : dataId,
      type: dataType,
      service : [],
    }


    selectedService.forEach( v => {
      if(v.visible === 0){
        data.service.push({
          id : v.id,
          pname : ''
        })
      }else{
        const key = v.service + '-_-' + v.id
        let pname = ''
        selectedHost[key].forEach( val => {
          pname = pname + val.host_name + ','
        })
        pname = pname.slice(0, -1)
        data.service.push({
          id : v.id,
          pname : pname
        })
      }
    })

    // Object.keys(selectedHost).forEach(key => {
    //   const service_id = parseInt(key.split('-_-')[1])
    //   let pname = ''
    //   selectedHost[key].forEach( v => {
    //     pname = pname + v.host_name + ','
    //   })
    //   pname = pname.slice(0, -1)
    //   data.service.push({
    //     id : service_id,
    //     pname : pname
    //   })
    // })


    // console.log('data===>', data)

    if(this.props.setSpinning){
      this.props.setSpinning()
    }
    if(this.props.addNode){
      this.props.addNode(data)
    }
  }

  prev(){
    if(this.props.prev){
      this.props.prev()
    }
  }

  configTable = (config) => {
    const columns = [{
      title : '配置项',
      dataIndex : 'configKey',
      width : '50%'
    }, {
      title : '值',
      dataIndex : 'configVal',
      width : '50%'
    }]

    let dataSource = []
    Object.keys(config).forEach((key, i) => {
      if(config[key] === "true" || config[key] === "false"){
        dataSource.push({
          configKey : key,
          configVal : config[key] === "true" ? '是' : '否',
          id : i
        })
      }else{
        dataSource.push({
          id : i,
          configKey : key,
          configVal : String(config[key])
        })
      }
    })

    const tableProps = {
      columns,
      dataSource,
      size : 'small',
      pagination : false,
      bordered : true,
      rowKey : 'id'
    }
    if(dataSource.length === 0){
      return <Row className="text-center">无需配置</Row>
    }else{
      return <DataTable {...tableProps}/>
    }
  }


  render(){
    const {config, selectedHost, selectedBaseInfo, selectedService, tipModalVisible} = this.props
    const businessName = selectedBaseInfo.business_id
      && selectedBaseInfo.business_id.split('-_-')[0]
    const appName = selectedBaseInfo.app_id
      && selectedBaseInfo.app_id.split('-_-')[0]
    /******** 20180108 修复列表 集群一栏不包含实例和不显示问题  *******/
    let relateTag = ''
    switch (parseInt(selectedBaseInfo.relateType)){
      case RELATE_TYPE['set'] :
        relateTag = '实例组'
            break
      case RELATE_TYPE['instance'] :
        relateTag = '实例'
            break
      default:
        relateTag = '集群'
    }
    const relateName = selectedBaseInfo.relateId &&  selectedBaseInfo.relateId.split('-_-')[0]

    // const clusterName = selectedBaseInfo.cluster_id
    //   && selectedBaseInfo.cluster_id.split('-_-')[0]

    const tipModalProps = {
      visible : tipModalVisible,
      title : '任务提示：',
      content : (
        <Row>
          <Row>增加节点任务已经提交。</Row>
          <Row>提交成功,本次任务已在后台执行,耗时较长,您稍候可以在任务列表查看进度及结果。</Row>
        </Row>
      ),
      onOk : () => {
        this.props.toggleTipModalVisible()
        this.props.goIndex()
      },
      onCancel : () => {
        this.props.toggleTipModalVisible()
      }
    }

    let tableRows = 0
    // 每个服务配置多长
    let serviceRows = {}
    // 选了几个服务
    // 选了几个服务
    /********20171215 服务的 visible 0 时不需要展示********/
      // let serviceLength = selectedService.length
    let serviceLength = selectedService.filter(v => v.visible !== 0).length
    Object.keys(config).forEach(v => {
      const service = selectedService.find(val => val.id == v)
      /********20171215 服务的 visible 0 时不需要展示********/
      const { name, visible} = service
      if(visible !== 0){
        serviceRows[v] = Object.keys(config[v]).length
        tableRows += serviceRows[v]
      }
    })

    const columns = [{
      title: '业务',
      dataIndex: 'business',
      render: (text, row, index) => {
        let obj = {
          children: text,
          props: {
            rowSpan: 0
          }
        }
        if (index == 0) {
          obj.props.rowSpan = serviceLength || 1
        }
        return obj
      }
    }, {
      title: '应用',
      dataIndex: 'app',
      render: (text, row, index) => {
        let obj = {
          children: text,
          props: {
            rowSpan: 0
          }
        }
        if (index == 0) {
          obj.props.rowSpan = serviceLength || 1
        }
        return obj
      }
    },{
      title: relateTag,
      dataIndex: 'cluster',
      render: (text, row, index) => {
        let obj = {
          children: text,
          props: {
            rowSpan: 0
          }
        }
        if (index == 0) {
          obj.props.rowSpan = serviceLength || 1
        }
        return obj
      }
    },  {
      title : '服务',
      dataIndex : 'service'
    }, {
      title : '主机',
      dataIndex : 'host'
    }, {
      title : '服务配置',
      dataIndex : 'config',
      className : styles["config-table"],
      render : (text) => {
        return this.configTable(text)
      }
    }]

    let dataSource = []
    selectedService.forEach((v, i) => {
      if(v.visible !== 0){
        const key = v.service + '-_-' + v.id
        dataSource.push({
          id : i,
          business : businessName,
          app : appName,
          cluster : relateName,
          service : v.service,
          host : selectedHost[key] && selectedHost[key].map(v => v.host_name).join('，'),
          config : config[v.id]
        })
      }
    })

    // console.log('dataSource===>', dataSource)

    const tableProps = {
      columns : columns,
      dataSource : dataSource,
      bordered : true,
      pagination : false,
      rowKey : 'id'
    }

    return (
      <Row>
        <DataTable {...tableProps}/>
        <Row className={classnames('text-right', styles["mgt-16"])}>
          <Button onClick={this.prev} className="mgr-16">上一步</Button>
          <Button type="primary" onClick={this.next}>确定</Button>
        </Row>
        <TipModal {...tipModalProps}/>
      </Row>
    )
  }
}

Summary.propTypes = {
  prev : PropTypes.func,
  next : PropTypes.func,
  selectedBaseInfo : PropTypes.object,
  config : PropTypes.object,
  selectedHost : PropTypes.object,
  selectedService : PropTypes.array,
  tipModalVisible : PropTypes.bool,
  toggleTipModalVisible : PropTypes.func,
  setSpinning : PropTypes.func,
  goIndex : PropTypes.func
}

export default Summary


/*************************** 原先展示 不要了 ****************/
/*
<Row><span className={styles["font-bold"]}>业务：</span>{businessName}</Row>
<Row><span className={styles["font-bold"]}>应用：</span>{appName}</Row>
<Row><span className={styles["font-bold"]}>集群：</span>{clusterName}</Row>
<Row>
  { selectedService.map((item, index) => {
    const key = item.service + '-_-' + item.id
    return <Row key={index}>
      <Row><span className={styles["font-bold"]}>服务：</span>{item.service}</Row>
      <Row><span className={styles["font-bold"]}>机器：</span>
        {selectedHost[key] && selectedHost[key].map(v => v.host_name).join('，')}</Row>
      <Row type="flex">
        <Col className={styles["font-bold"]}>服务配置：</Col>
        <Col>{
          (config[item.id] && String(config[item.id]) != '{}')
            ? Object.keys(config[item.id]).map((v, k) => {
            return (<Row key={k}>
              <span>{v}：</span>
              <span>{config[item.id][v]}</span>
            </Row>)
          })
            : '此服务不需要配置'
        }</Col>
      </Row>
    </Row>
  })}*/
/***********************************************/
