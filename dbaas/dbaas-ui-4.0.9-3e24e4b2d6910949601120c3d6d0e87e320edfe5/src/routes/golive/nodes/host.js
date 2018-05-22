/**
 * Created by wengyian on 2017/9/8.
 */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, Select, message, Tabs, Button, Modal, Progress, Tooltip, Badge} from 'antd'
import {
  DataTable, Layout, Search, Filter,
  IconFont, ProgressIcon,
} from 'components'
import {routerRedux, Link, browserHistory,} from 'dva/router'
import {classnames, constant, TimeFilter} from 'utils'
import Json from 'utils/json'
import _ from 'lodash'
import styles from './add.less'
import IPModal from 'routes/cmdb/host/ipModal.js'

import HostComponent from '../deploy/hostComponent'

const TabPane = Tabs.TabPane
const {HOST_STATUS, HOST_TYPE} = constant

class Host extends React.Component {
  constructor(props) {
    super(props)

    let hostObj = {}
    let keywords = {}
    /******  20180109 保留筛选条件 ****/
    let pages = {}
    props.selectedService.forEach(item => {
      /**********20171215 新增 visible 0 不显示 1 显示************/
      /********** visible 0 的时候 服务对应的主机都不用修改 所以不渲染*********/
      if(item.visible !== 0){
        /******* 20171218 兼容 hostComponent 的写法 *******/
        let key = item.service + '-_-' + item.id
        // 如果存在 就赋值给hostObj
        hostObj[key] = props.selectedHost[key] || []
        keywords[key] = props.keywords[key] || ''
        pages[key] = props.pages[key] || 0
      }
    })

    this.state = {
      hostObj,
      keywords,
      pages
    }

    this.handleSearch = this.handleSearch.bind(this)
    // this.onSelect = this.onSelect.bind(this)
    // this.onSelectAll = this.onSelectAll.bind(this)
    this.prev = this.prev.bind(this)
    this.next = this.next.bind(this)
    // this.content = this.content.bind(this)
    this.checkMax = this.checkMax.bind(this)
    this.showIPModal = this.showIPModal.bind(this)
    this.handleIPCancel = this.handleIPCancel.bind(this)
    this.changeSelect = this.changeSelect.bind(this)
    this.handlePage = this.handlePage.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    // 打开后 造成 table 刷新时 已选项清空了  注释后未看见影响
    // if(!_.isEqual(this.state.selectedHost, nextProps.selectedHost) ||
    //   !_.isEqual(nextProps.selectedService, this.state.selectedService) ||
    //     !_.isEqual(nextProps.keywords, this.state.keywords)
    // ){
    //   let hostObj = {}
    //   let keywords = {}
    //   nextProps.selectedService.forEach(item => {
    //     let key = item.service + '-_-' + item.id
    //     // 如果存在 就赋值给hostObj
    //     hostObj[key] = nextProps.selectedHost[key] || []
    //     keywords[key] = nextProps.keywords[key] || ''
    //   })
    //   this.setState({
    //     hostObj,
    //     keywords
    //   })
    // }
  }

  // handleSearch(value, key) {
  //   if (this.props.handleKeywords) {
  //     this.props.handleKeywords(value, key)
  //   }
  // }

  changeSelect(serviceKey, selected, changeRows){
    /*************20171208 新增：nodeguard 和 mysql 关联**************/
    /************* 选了 mysql 就把 nodeguard 也给选上 **************/
    /*************  实例里面不会出现 nodeguard 和 mysql 同时出现的情况 **************/
    let isMysql= serviceKey.toLowerCase().includes('mysql')
    let nodeguardKey = Object.keys(this.state.hostObj).find( v => v.toLowerCase().includes('nodeguard'))
    let nodeguardHostList = []
    if(isMysql && nodeguardKey){
      nodeguardHostList = [...this.state.hostObj[nodeguardKey]]
    }

    /******* 20180328 hcf2.0 的 spider 和 gateway 是相互关联的 *********/
    let isSpider = serviceKey.toLowerCase().includes('spider_gateway')
    let gatewayAgentKey = Object.keys(this.state.hostObj).find( v => v.toLowerCase().includes('gateway_agent'))
    let gatewayAgentHostList = []
    if(isSpider && gatewayAgentKey){
      gatewayAgentHostList = [...this.state.hostObj[gatewayAgentKey]]
    }

    let zabbixKey =  Object.keys(this.state.hostObj).find(v => v.toLowerCase().includes('zabbix-agent'))
    let zabbixHostList = []
    if (zabbixKey) {
      // 找到 zabbix 服务的 hostObj key
      zabbixHostList = [...this.state.hostObj[zabbixKey]]
    }
    let oldHostList = this.state.hostObj[serviceKey] || []
    if (selected) {
      oldHostList.push(...changeRows)

      /*************20171208 新增：nodeguard 和 mysql 关联**************/
      if(isMysql && nodeguardKey){
        nodeguardHostList.push(...changeRows)
      }

      /********* 20180328 spider_gateway 和 gateway_agent 关联 ***********/
      if(isSpider && gatewayAgentKey){
        gatewayAgentHostList.push(...changeRows)
      }

      /**************** 20171122 新增：zabbix 服务 主机默认选上，而且禁止操作 **************/
      // 新增的也加入到 zabbix中，如果不重复加入，重复的不加
      changeRows.forEach(v => {
        if(zabbixKey && zabbixHostList.find(val => val.id === v.id) === undefined){
          zabbixHostList.push(v)
        }
      })
      /**************************over*************************/
    } else {
      if (zabbixKey) {
        zabbixHostList = [...this.state.hostObj[zabbixKey]]
      }
      /************20171207 修复： 删除zabbix所选时，需要判断除了当前操作服务外别的服务是否有选此主机***************/
      /************ 针对mysql 和 nodeguard 两者数据一样 不用再判断 nodeguard 的情况了 ***************/
      /************ 主要是为了避免 取消选择 mysql 时，nodeguard 的还未反馈到数据中，会影响 zabbix 的数据 ***************/
      /************ 20180308 主要是为了避免 取消选择 spider_gateway 时，gateway_agent 的还未反馈到数据中，会影响 zabbix 的数据 ***************/
      let otherHostKey = Object.keys(this.state.hostObj).filter(v => {
        return v.toLowerCase().includes('zabbix-agent') === false
          && v !== serviceKey
          && v.toLowerCase().includes('nodeguard') === false
          && v.toLowerCase().includes('gateway_agent') === false
      })

      changeRows.forEach(val => {
        oldHostList = oldHostList.filter(v => v.id != val.id)
        /*************20171208 新增：nodeguard 和 mysql 关联**************/
        if(isMysql && nodeguardKey){
          nodeguardHostList =  nodeguardHostList.filter(v => v.id != val.id)
        }
        /*************20170328 新增：gateway_agent 和 spider_gateway 关联**************/
        if(isSpider && gatewayAgentKey){
          gatewayAgentHostList =  gatewayAgentHostList.filter(v => v.id != val.id)
        }
        if(zabbixKey){
          let hasRecord = false
          for(let i = 0; i < otherHostKey.length; i++){
            for(let k = 0; k < this.state.hostObj[otherHostKey[i]].length; k++){
              if(this.state.hostObj[otherHostKey[i]][k].id === val.id){
                hasRecord = true
                break
              }
            }
            if(hasRecord){
              break
            }
          }
          !hasRecord && (zabbixHostList = zabbixHostList.filter( v => v.id != val.id))
        }
      })
    }

    const serviceId = serviceKey && serviceKey.split('-_-')[1]
    this.checkMax(serviceId, oldHostList.length)


    let editHostObj = {
      [nodeguardKey] : nodeguardHostList,
      [serviceKey] : oldHostList,
      [zabbixKey] : zabbixHostList,
      /********** 20180328 gateway_agent 关联了 spider_gateway **********/
      [gatewayAgentKey] : gatewayAgentHostList
  }
    zabbixKey || (delete editHostObj[zabbixKey])
    /**********此处用 短路时 页面显示有问题 不知道为啥 *********/
    if(!(isMysql && nodeguardKey)){
      delete editHostObj[nodeguardKey]
    }
    /****** 20180328 如果不是spider_gateway 就删掉 *******/
    if(!(isSpider && gatewayAgentKey)){
      delete editHostObj[gatewayAgentKey]
    }

    this.setState({
      hostObj : {
        ...this.state.hostObj,
        ...editHostObj
      }
    })
  }

  onSelect(serviceKey, record, selected, selectedRows) {
    /******* 20171218 合并onSelected 和 onSelectedAll *******/
    this.changeSelect(serviceKey, selected, [record])


    // /*************20171208 新增：nodeguard 和 mysql 关联**************/
    // /************* 选了 mysql 就把 nodeguard 也给选上 **************/
    // /*************  实例里面不会出现 nodeguard 和 mysql 同时出现的情况 **************/
    // let isMysql= serviceKey.toLowerCase().includes('mysql')
    // let nodeguardKey = Object.keys(this.state.hostObj).find( v => v.toLowerCase().includes('nodeguard'))
    // let nodeguardHostList = []
    // if(isMysql && nodeguardKey){
    //   nodeguardHostList = [...this.state.hostObj[nodeguardKey]]
    // }
    //
    // let zabbixKey = Object.keys(this.state.hostObj).find(v => v.toLowerCase().includes('zabbix-agent'))
    // let zabbixHostList = []
    // if (zabbixKey) {
    //   // 找到 zabbix 服务的 hostObj key
    //   zabbixHostList = [...this.state.hostObj[zabbixKey]]
    // }
    // let oldHostList = this.state.hostObj[serviceKey] || []
    // // selected ? oldSelected.push(record)
    // //   : (oldSelected = oldSelected.filter( v => v.id != record.id))
    //
    // if (selected) {
    //   oldHostList.push(record)
    //
    //   /*************20171208 新增：nodeguard 和 mysql 关联**************/
    //   if(isMysql && nodeguardKey){
    //     nodeguardHostList.push(record)
    //   }
    //
    //   /**************** 20171122 新增：zabbix 服务 主机默认选上，而且禁止操作 **************/
    //   // 新增的也加入到 zabbix中，如果不重复加入，重复的不加
    //   if(zabbixKey && zabbixHostList.find(v => v.id === record.id) === undefined){
    //     zabbixHostList.push(record)
    //   }
    //   /**************************over*************************/
    // } else {
    //   oldHostList = oldHostList.filter(v => v.id != record.id)
    //   /*************20171208 新增：nodeguard 和 mysql 关联**************/
    //   if(isMysql && nodeguardKey){
    //     nodeguardHostList =  nodeguardHostList.filter(v => v.id != record.id)
    //   }
    //
    //   if (zabbixKey) {
    //     /************20171207 修复： 删除zabbix所选时，需要判断除了当前操作服务外别的服务是否有选此主机***************/
    //     /************ 针对mysql 和 nodeguard 两者数据一样 不用再判断 nodeguard 的情况了 ***************/
    //     /************ 主要是为了避免 取消选择 mysql 时，nodeguard 的还未反馈到数据中，会影响 zabbix 的数据 ***************/
    //     let otherHostKey = Object.keys(this.state.hostObj).filter(v => {
    //       return v.toLowerCase().includes('zabbix-agent') === false
    //         && v !== serviceKey
    //         && v.toLowerCase().includes('nodeguard') === false
    //     })
    //     let hasRecord = false
    //     for(let i = 0; i < otherHostKey.length; i++){
    //       for(let k = 0; k < this.state.hostObj[otherHostKey[i]].length; k++){
    //         if(this.state.hostObj[otherHostKey[i]][k].id === record.id){
    //           hasRecord = true
    //           break
    //         }
    //       }
    //       if(hasRecord){
    //         break
    //       }
    //     }
    //     !hasRecord && (zabbixHostList = zabbixHostList.filter( v => v.id != record.id))
    //   }
    // }
    //
    // const serviceId = serviceKey && serviceKey.split('-_-')[1]
    // this.checkMax(serviceId, oldHostList.length)
    //
    // let editHostObj = {
    //   [nodeguardKey] : nodeguardHostList,
    //   [serviceKey] : oldHostList,
    //   [zabbixKey] : zabbixHostList
    // }
    // zabbixKey || (delete editHostObj[zabbixKey])
    // /**********此处用 短路时 页面显示有问题 不知道为啥 *********/
    // if(!(isMysql && nodeguardKey)){
    //   delete editHostObj[nodeguardKey]
    // }
    //
    // this.setState({
    //   hostObj : {
    //     ...this.state.hostObj,
    //     ...editHostObj
    //   }
    // })
  }

  onSelectAll(serviceKey, selected, selectedRows, changeRows) {
    /******* 20171218 合并onSelected 和 onSelectedAll *******/
    this.changeSelect(serviceKey, selected, changeRows)

    // /*************20171208 新增：nodeguard 和 mysql 关联**************/
    // /************* 选了 mysql 就把 nodeguard 也给选上 **************/
    // /*************  实例里面不会出现 nodeguard 和 mysql 同时出现的情况 **************/
    // let isMysql= serviceKey.toLowerCase().includes('mysql')
    // let nodeguardKey = Object.keys(this.state.hostObj).find( v => v.toLowerCase().includes('nodeguard'))
    // let nodeguardHostList = []
    // if(isMysql && nodeguardKey){
    //   nodeguardHostList = [...this.state.hostObj[nodeguardKey]]
    // }
    //
    // let zabbixKey =  Object.keys(this.state.hostObj).find(v => v.toLowerCase().includes('zabbix-agent'))
    // let zabbixHostList = []
    // if (zabbixKey) {
    //   // 找到 zabbix 服务的 hostObj key
    //   zabbixHostList = [...this.state.hostObj[zabbixKey]]
    // }
    // let oldHostList = this.state.hostObj[serviceKey] || []
    // if (selected) {
    //   oldHostList.push(...changeRows)
    //
    //   /*************20171208 新增：nodeguard 和 mysql 关联**************/
    //   if(isMysql && nodeguardKey){
    //     nodeguardHostList.push(...changeRows)
    //   }
    //
    //   /**************** 20171122 新增：zabbix 服务 主机默认选上，而且禁止操作 **************/
    //   // 新增的也加入到 zabbix中，如果不重复加入，重复的不加
    //   changeRows.forEach(v => {
    //     if(zabbixKey && zabbixHostList.find(val => val.id === v.id) === undefined){
    //       zabbixHostList.push(v)
    //     }
    //   })
    //   /**************************over*************************/
    // } else {
    //   if (zabbixKey) {
    //     zabbixHostList = [...this.state.hostObj[zabbixKey]]
    //   }
    //   /************20171207 修复： 删除zabbix所选时，需要判断除了当前操作服务外别的服务是否有选此主机***************/
    //   /************ 针对mysql 和 nodeguard 两者数据一样 不用再判断 nodeguard 的情况了 ***************/
    //   /************ 主要是为了避免 取消选择 mysql 时，nodeguard 的还未反馈到数据中，会影响 zabbix 的数据 ***************/
    //   let otherHostKey = Object.keys(this.state.hostObj).filter(v => {
    //     return v.toLowerCase().includes('zabbix-agent') === false
    //       && v !== serviceKey
    //       && v.toLowerCase().includes('nodeguard') === false
    //   })
    //
    //   changeRows.forEach(val => {
    //     oldHostList = oldHostList.filter(v => v.id != val.id)
    //     /*************20171208 新增：nodeguard 和 mysql 关联**************/
    //     if(isMysql && nodeguardKey){
    //       nodeguardHostList =  nodeguardHostList.filter(v => v.id != val.id)
    //     }
    //     if(zabbixKey){
    //       let hasRecord = false
    //       for(let i = 0; i < otherHostKey.length; i++){
    //         for(let k = 0; k < this.state.hostObj[otherHostKey[i]].length; k++){
    //           if(this.state.hostObj[otherHostKey[i]][k].id === val.id){
    //             hasRecord = true
    //             break
    //           }
    //         }
    //         if(hasRecord){
    //           break
    //         }
    //       }
    //       !hasRecord && (zabbixHostList = zabbixHostList.filter( v => v.id != val.id))
    //     }
    //   })
    // }
    //
    // const serviceId = serviceKey && serviceKey.split('-_-')[1]
    // this.checkMax(serviceId, oldHostList.length)
    //
    //
    // let editHostObj = {
    //   [nodeguardKey] : nodeguardHostList,
    //   [serviceKey] : oldHostList,
    //   [zabbixKey] : zabbixHostList
    // }
    // zabbixKey || (delete editHostObj[zabbixKey])
    // /**********此处用 短路时 页面显示有问题 不知道为啥 *********/
    // if(!(isMysql && nodeguardKey)){
    //   delete editHostObj[nodeguardKey]
    // }
    //
    // this.setState({
    //   hostObj : {
    //     ...this.state.hostObj,
    //     ...editHostObj
    //   }
    // })
    // this.setState({
    //   hostObj : {
    //     ...this.state.hostObj,
    //     [key] : oldHostList
    //   }
    // })
  }

  prev() {
    if (this.props.prev) {
      this.props.prev()
    }
  }

  checkMax(id, length) {
    const targetService = this.props.selectedService.find(v => v.id === Number(id))
    const {nodes = 0, max, service} = targetService // 默认值 记得删除
    if(max === 0){
      return
    }else{
      if (length > max - nodes) {
        message.warning(`机器超过${max}台可能会使集群性能下降`, 1)
      }
    }

  }

  /***********20171122 table 列相关****************/
  showIPModal(hostIP) {
    if (this.props.showIPModal) {
      this.props.showIPModal(hostIP)
    }
  }

  handleIPCancel() {
    if (this.props.handleIPCancel) {
      this.props.handleIPCancel()
    }
  }
  /*****************over**********************/

  handleSearch(value, key){
    this.setState({
      keywords : {
        ...this.state.keywords,
        [key] : value
      }
    })
  }

  /******** 20180709 保留筛选项 *********/
  handlePage(value, key){
    this.setState({
      pages : {
        ...this.state.pages,
        [key] : value
      }
    })
  }

  next() {
    const {hostObj} = this.state

    let canNext = true
    let errTip = {}

    Object.keys(hostObj).map(item => {
      // let serviceInfo = item.split('-_-')[0]
      if (hostObj[item].length === 0) {
        canNext = false
        errTip[item] = '请选择主机'
      }
    })

    if (!canNext) {
      const content = Object.keys(errTip).map((v, i) => {
        const name = v.split('-_-')[0]
        return <Row key={i}>{ name + '：' + errTip[v]}</Row>
      })
      Modal.error({
        title: '错误提示',
        content: content
      })
      return false
    }

    if (this.props.setSelectedHost) {
      this.props.setSelectedHost(this.state.hostObj)
    }

    if(this.props.setFilter){
      this.props.setFilter({
        keywords : this.state.keywords,
        pages : this.state.pages,
      })
    }
    if (this.props.next) {
      this.props.next()
    }
  }

  // content(key) {
  //   const {keywords, selectedBaseInfo} = this.props
  //   let {cluster_id} = selectedBaseInfo
  //   const clusterId = cluster_id && cluster_id.split('-_-')[1]
  //
  //   const searchProps = {
  //     placeholder: '根据关键字过滤',
  //     onSearch: (value) => this.handleSearch(value, key),
  //     keyword: keywords[key]
  //   }
  //
  //   // const columns =  [{
  //   //   title : '主机名',
  //   //   // dataIndex : 'machine_name',
  //   //   dataIndex : 'host_name',
  //   // },{
  //   //   // title : '主机IP',
  //   //   // dataIndex : 'machine_ip'
  //   //   title : '连接IP',
  //   //   dataIndex : 'connect_ip'
  //   // },{
  //   //   title : '城市',
  //   //   dataIndex : 'city'
  //   // },{
  //   //   title : '数据中心',
  //   //   dataIndex : 'idc'
  //   // }]
  //
  //
  //   // 新增 处理 进度条 + 百分比
  //   const ProgressNum = (text1, denominator1, type) => {
  //     const text = text1 === '' ? 0 : text1
  //     const denominator = denominator1 === '' ? 0 : denominator1
  //     let number = Number((Number(text) / Number(denominator) * 100).toFixed(2))
  //     let title = ''
  //     let className = ''
  //     if (number < 30) {
  //       className = 'bg-success'
  //     } else if (number < 80) {
  //       className = 'bg-primary'
  //     } else if (number < 90) {
  //       className = 'bg-warning'
  //     } else {
  //       className = 'bg-error'
  //     }
  //     switch (type) {
  //       case 'memory_rate' :
  //         title = "占比:" + number + '%    ' + text + 'MB' + '/' + denominator + 'MB'
  //         if (denominator === 0) title = '可用内存:' + text + 'MB,' + '内存大小:' + denominator + 'MB.'
  //         break
  //       case 'disk_rate' :
  //         title = "占比:" + number + '%    ' + text + 'MB' + '/' + denominator + 'MB'
  //         if (denominator === 0) title = '可用磁盘:' + text + 'MB,' + '磁盘大小:' + denominator + 'MB.'
  //         break
  //       case 'load_rate' :
  //         title = "占比:" + number + '%    ' + text + '/' + 3
  //         if (denominator === 0) title = 'CPU负载:' + text + ',' + '总负载:' + denominator + '.'
  //         break
  //     }
  //     return (
  //       <Row className={styles[className]}>
  //         <Tooltip title={title}>
  //           <Progress percent={number} showInfo={false}/>
  //         </Tooltip>
  //       </Row>
  //     )
  //   }
  //
  //   const memoryTitle =
  //     <span>
  //       内存&nbsp;
  //       <Tooltip title="可用内存/内存大小">
  //         <IconFont className="text-info" type="question-circle"/>
  //       </Tooltip>
  //     </span>
  //
  //   const diskTitle =
  //     <span>
  //       磁盘&nbsp;
  //       <Tooltip title="可用磁盘/磁盘大小">
  //         <IconFont className="text-info" type="question-circle"/>
  //       </Tooltip>
  //     </span>
  //
  //   const loadTitle =
  //     <span>
  //       负载&nbsp;
  //       <Tooltip title="CPU负载/总负载">
  //         <IconFont className="text-info" type="question-circle"/>
  //       </Tooltip>
  //     </span>
  //
  //   let columns = [{
  //     title: '主机名', dataIndex: 'name', key: 'name', width: 150, className: 'text-center',
  //     // render:(text,record) => {
  //     //   return <Link to={`cmdb/host/${record.id}`}>{text}</Link>
  //     // }
  //   },
  //     {
  //       title: 'IP', dataIndex: 'connect_ip', key: 'connect_ip', className: 'text-center', width: 150,
  //       render: (text, record) => {
  //         return (
  //           <Row>
  //             <span>{text}</span>&nbsp;&nbsp;
  //             <IconFont type="plus-square-o" style={{cursor: 'pointer'}}
  //                   onClick={() => this.showIPModal(record.host_ip)}/>
  //           </Row>
  //         )
  //       }
  //     },
  //     {
  //       title: '状态', dataIndex: 'connect_status', key: 'connect_status', width: 100, className: 'text-center',
  //       filters: [
  //         {
  //           text: '环境未初始化',
  //           value: '0'
  //         },
  //         {
  //           text: '运行中',
  //           value: '1'
  //         },
  //         {
  //           text: 'Agent异常',
  //           value: '2'
  //         },
  //         {
  //           text: 'SSH连接异常',
  //           value: '3'
  //         }
  //       ],
  //       render: (text, record) => {
  //         let status = ''
  //         let desc = ''
  //         switch (Number(text)) {
  //           case HOST_STATUS.HOST_NOT_INIT:
  //             status = 'default'
  //             desc = '环境未初始化'
  //             break
  //           case HOST_STATUS.HOST_RUNNING:
  //             status = 'success'
  //             desc = '运行中'
  //             break
  //           case HOST_STATUS.HOST_AGENT_ABNORMAL:
  //             status = 'error'
  //             desc = 'Agent异常'
  //             break
  //           case HOST_STATUS.HOST_SSH_ABNORMAL:
  //             status = 'error'
  //             desc = 'SSH连接异常'
  //             break
  //         }
  //         return (
  //           <Tooltip title={desc}>
  //             <span style={{cursor: 'pointer'}}>
  //               <Badge status={status}/>
  //             </span>
  //           </Tooltip>
  //         )
  //       }
  //     },
  //     {
  //       title: '类型', dataIndex: 'type', key: 'type', className: 'text-center', width: 100,
  //       render: (text) => {
  //         text = text === HOST_TYPE['NORMAL'] ? '普通主机'
  //           : (text === HOST_TYPE['RHCS'] ? 'RHCS主机'
  //             :(text === HOST_TYPE['RHCS_SLAVE'] ? 'RHCS备机' : ''))
  //         return <span>{text}</span>
  //       }
  //     },
  //     {
  //       title: memoryTitle, dataIndex: 'free_memory', key: 'free_memory', className: 'text-center', width: 130,
  //       render: (text, record) => {
  //         return ProgressNum(text, record.memory, 'memory_rate')
  //       }
  //     },
  //     {
  //       title: diskTitle, dataIndex: 'free_disk', key: 'free_disk', className: 'text-center', width: 130,
  //       render: (text, record) => {
  //         return ProgressNum(text, record.disk_size, 'disk_rate')
  //       }
  //     },
  //     {
  //       title: loadTitle, dataIndex: 'cpu_load', key: 'cpu_load', className: 'text-center', width: 130,
  //       render: (text) => {
  //         return ProgressNum(text, 3, 'load_rate')
  //       }
  //     },
  //     {
  //       title: '运行服务数', dataIndex: 'running_services', key: 'running_services', className: 'text-center', width: 100,
  //       // render:(text,record) =>{
  //       //   if(text === 0 || text === undefined || text === ''){
  //       //     return <span>{text}</span>
  //       //   }else{
  //       //     return <Link onClick={this.handleRunningServices.bind(this,record.serviceList)}>{text}</Link>
  //       //   }
  //       // }
  //     },
  //     {
  //       title: '城市', dataIndex: 'city', key: 'city', className: 'text-center', width: 100,
  //     },
  //     {
  //       title: '数据中心', dataIndex: 'idc', key: 'idc', className: 'text-center', width: 100,
  //     },
  //     {
  //       title: '系统架构', dataIndex: 'os_arch', key: 'os_arch', className: 'text-center', width: 150,
  //     },
  //     {
  //       title: '系统版本', dataIndex: 'os_version', key: 'os_version', className: 'text-center', width: 150,
  //     },
  //     {
  //       title: '网卡', dataIndex: 'interfaces', key: 'interfaces', className: 'text-center', width: 100,
  //     },
  //     {
  //       title: '最大运行服务数', dataIndex: 'max_running_services', key: 'max_running_services',
  //       className: 'text-center', width: 150,
  //     }]
  //
  //   const filter = {
  //     name: keywords[key] || '',
  //     cluster_id: clusterId
  //   }
  //   const selectedRowKeys = this.state.hostObj[key]
  //     && this.state.hostObj[key].map(v => v.id)
  //   let width = 0
  //   columns.forEach((v) =>
  //     width += v.width
  //   )
  //   const dataTableProps = {
  //     fetch: {
  //       // url : '/machines',
  //       url: '/hosts',
  //       data: filter,
  //     },
  //     columns,
  //     rowSelection: {
  //       onSelect: this.onSelect.bind(this, key),
  //       onSelectAll: this.onSelectAll.bind(this, key),
  //       selectedRowKeys,
  //       getCheckboxProps : (record) => ({
  //         disabled : record.type === HOST_TYPE['RHCS_SLAVE']
  //       })
  //     },
  //     rowKey: 'id',
  //     scroll : {x : width}
  //   }
  //
  //   // 如果是监控服务 需要把别的服务选的机器合并去重作为监控的 dataSource
  //   if (key.toLowerCase().includes('zabbix-agent')) {
  //     // 拷贝一个 hostObj 避免操作原对象
  //     /****************************20171122 zabbix 默认必选，不可操作******************************************/
  //     // let newHostObj = JSON.parse(JSON.stringify(this.state.hostObj))
  //     // const newKeys = Object.keys(newHostObj).filter(v => !v.toLowerCase().includes('zabbix-agent'))
  //     // let dataSource = []
  //     // newKeys.forEach((v, i) => {
  //     //   if (newHostObj[v].length) {
  //     //     for (let k = 0; k < newHostObj[v].length; k++) {
  //     //       if (!dataSource.find(val => val.id == newHostObj[v][k].id)) {
  //     //         dataSource.push(newHostObj[v][k])
  //     //       }
  //     //     }
  //     //   }
  //     // })
  //     let dataSource = this.state.hostObj[key]
  //     /***********************************over***********************************/
  //     // console.log('dataSource===>', dataSource)
  //     delete dataTableProps.fetch
  //     dataTableProps.pagination = false
  //     dataTableProps.dataSource = dataSource
  //     /********************************** 20171122 zabbix 不可操作*********************************/
  //     dataTableProps.rowSelection.getCheckboxProps = record => ({
  //       disabled : true
  //     })
  //     /***********************************over***********************************/
  //   }
  //
  //   return (
  //     <Row className={styles.host}>
  //       <Row>
  //         <span>已选主机：</span>
  //         <span>{
  //           this.state.hostObj[key].length
  //             // ? this.state.hostObj[key].map( v => v.machine_name ).join('，')
  //             ? this.state.hostObj[key].map(v => v.host_name).join('，')
  //             : '请选择主机'
  //         }</span>
  //       </Row>
  //       <Row className={styles["mgtb-8"]}>
  //         {
  //           key.toLowerCase().includes('zabbix-agent')
  //             ?  <Row className={styles['tip-container']}>
  //             <IconFont type="info-circle" className="text-info"/>&nbsp;
  //             <span>提示：zabbix节点与数据库节点不统一将会导致无法提供监控服务，所以不提供zabbix相关的机器选择。</span>
  //           </Row>
  //             : <Col span={6}>
  //             <Search {...searchProps} />
  //           </Col>
  //         }
  //       </Row>
  //       <DataTable {...dataTableProps}/>
  //     </Row>
  //   )
  // }

  render() {

    const {selectedService, hostVisible, hostIP, selectedBaseInfo} = this.props

    const ipModalProps = {
      title: '主机ip详情',
      visible: hostVisible,
      onCancel: this.handleIPCancel,
      onOk: this.handleIPCancel,
      hostIP: hostIP
    }

    /******* 20171218 hostComponent 里面 selectedService 需要有 need_host 字段 否则不显示 ***********/
    /******* 手动加入 need_host 字段 值为 1， ***********/
    /******* 手动加入 name 字段 值为 每项的 service  ***********/
    let newSelectedService = Json.loads(Json.dumps(selectedService))
    newSelectedService = newSelectedService.map( v => {
      return {...v, need_host : 1, name : v.service}
    })

    const hostComponentProps = {
      onSelect: this.onSelect.bind(this),
      onSelectAll: this.onSelectAll.bind(this),
      handleIPCancel: this.props.handleIPCancel,
      showIPModal: this.props.showIPModal,
      handleSearch: this.handleSearch,
      hostObj : this.state.hostObj,
      selectedService : Json.dumps(newSelectedService),
      hostIP : hostIP,
      hostVisible : hostVisible,
      keywords : this.state.keywords,
      relateId : selectedBaseInfo.relateId && selectedBaseInfo.relateId.split('-_-')[1],
      relateType : selectedBaseInfo.relateType,
      handlePage : this.handlePage,
      pages : this.state.pages,
      /***** 20180111 新增筛选出初始化了的机器 *****/
      connect_status : 1
    }

    return (
      <Row>
        {/*<Tabs tabPosition="left">*/}
          {/*{*/}
            {/*selectedService.map(item => {*/}
              {/********20171215 服务的 visible 0 时不需要选择主机********/}
              {/*if(item.visible !== 0){*/}
                {/*return (*/}
                  {/*<TabPane key={item.id} tab={`${item.service}`}>*/}
                    {/*{this.content(`${item.service}-_-${item.id}`)}*/}
                  {/*</TabPane>*/}
                {/*)*/}
              {/*}*/}
            {/*})*/}
          {/*}*/}
        {/*</Tabs>*/}
        <HostComponent {...hostComponentProps}/>
        <Row className={classnames('text-right', styles["button-row"])}>
          <Button onClick={this.prev} className="mgr-16">上一步</Button>
          <Button type="primary" onClick={this.next}>下一步</Button>
        </Row>
        {/*<IPModal {...ipModalProps}/>*/}
      </Row>
    )
  }
}

Host.propTypes = {
  next: PropTypes.func,
  prev: PropTypes.func,
  selectedHost: PropTypes.object,
  handleKeywords: PropTypes.func,
  setSelectedHost: PropTypes.func,
  keywords: PropTypes.object,
  selectedService: PropTypes.array,
  selectedBaseInfo: PropTypes.object,
  showIPModal: PropTypes.func,
  handleIPCancel: PropTypes.func,
  hostIP: PropTypes.object,
  hostVisible: PropTypes.bool,
  pages : PropTypes.object,
  setFilter : PropTypes.func
}

export default Host



