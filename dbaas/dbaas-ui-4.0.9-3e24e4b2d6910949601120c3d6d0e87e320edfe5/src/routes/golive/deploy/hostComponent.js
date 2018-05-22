/**
 * Created by wengyian on 2017/12/15.
 */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, message, Button, Modal, Tooltip, Form, Tabs, Badge, Progress, Tag, Icon} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, HostFilter} from 'components'
import {routerRedux, Link} from 'dva/router'
import {classnames, Cache, constant} from 'utils'
import Json from 'utils/json'
import _ from 'lodash'
import styles from './create.less'
import IPModal from 'routes/cmdb/host/ipModal'
import TableSet from 'components/HostFilter/TableSet'

const TabPane = Tabs.TabPane
const {HOST_STATUS, HOST_TYPE, HOST_IP} = constant

class HostComponent extends React.Component{
  constructor(props){
    super(props)

    this.showIPModal = this.showIPModal.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.showSettingModal = this.showSettingModal.bind(this)
    this.hideSettingModal = this.hideSettingModal.bind(this)
    this.toDefault = this.toDefault.bind(this)
    this.ShowIP = this.ShowIP.bind(this)
    this.handleIPPop = this.handleIPPop.bind(this)
    this.handleIPPush = this.handleIPPush.bind(this)
    this.handlePage = this.handlePage.bind(this)
    this.state = {
      defaultColumns: ['name', 'connect_ip', 'connect_status', 'type', 'free_memory', 'free_disk', 'cpu_load',
        'running_services'],
      columns:  ['name', 'connect_ip', 'connect_status', 'type', 'free_memory', 'free_disk', 'cpu_load',
        'running_services'],
      newColumns: [],
      settingVisible : false,
      idToShow:[],
    }
  }

  componentWillReceiveProps(nextProps){

  }

  componentDidMount() {
    this.setState({
      newColumns: this.state.columns
    })
  }

  onSelected(serviceKey, record, selected, selectedRows){
    if(this.props.onSelect){
      this.props.onSelect(serviceKey, record, selected, selectedRows)
    }
  }

  onSelectedAll(serviceKey, selected, selectedRows, changeRows){
    if(this.props.onSelectAll){
      this.props.onSelectAll(serviceKey, selected, selectedRows, changeRows)
    }
  }

  handleSearch(value, key){
    if(this.props.handleSearch){
      this.props.handleSearch(value, key)
    }
  }

  showIPModal(hostIP){
    if (this.props.showIPModal) {
      this.props.showIPModal(hostIP)
    }
  }

  showSettingModal(){
    this.setState({
      settingVisible : true
    })
  }

  hideSettingModal(){
    this.setState({
      settingVisible : false
    })
  }

  toDefault(){
    this.setState({
      newColumns : this.state.defaultColumns
    })
  }

  //处理ip的显示
  ShowIP(text,record){
  let result = ''
  let hostIP = record.host_ip
  return result = this.state.idToShow.indexOf(record.id) !== -1 ?
    (
      <div className='machine-list tag-list' style={{minWidth:'240px'}}>
        {
          Object.keys(hostIP).map((nodeType,k1)=>{
            let list = hostIP[nodeType].map((v, k) => {
              if(k1 === 0 && k === hostIP[nodeType].length - 1){
                return (
                  <div key={k} className='machine'>
                    <Tag>{v}</Tag>
                    <Icon type="minus-square-o" style={{cursor:'pointer'}}
                          onClick={() =>this.handleIPPop(record.id)}/>
                  </div>
                )
              }else{
                return (
                  <div key={k} className='machine'>
                    <Tag>{v}</Tag>
                  </div>
                )
              }
            })
            return (
              <Row key={nodeType}>
                <Col span="9">
                  <span className="pull-right mgr-10 line-height-28">{HOST_IP[nodeType]}：</span>
                </Col>
                <Col span="15">
                  { list }
                </Col>
              </Row>
            )
          })
        }
      </div>
    )
    :
    (
      <Row style={{width:'130px'}}>
        <div className='line-height-28'>
          <Tag>{text}</Tag>
          <Icon type="plus-square-o" style={{cursor:'pointer'}}
                onClick={() =>this.handleIPPush(record.id)}/>
        </div>
      </Row>
    )
}

  handleIPPush(id){
    this.state.idToShow.push(id)
    this.setState({
      idToShow:this.state.idToShow
    })
  }

  handleIPPop(id){
    this.setState({
      idToShow:this.state.idToShow.filter(v => v !== id)
    })
  }

  handlePage(value, key){
    if(this.props.handlePage){
      this.props.handlePage(value, key)
    }
  }

  content(key){
    const { memoryMarks, deployInfo, hostObj, relateId, relateType,  keywords, pages, connect_status } = this.props

    const searchProps = {
      placeholder : '根据关键字过滤',
      onSearch: (value) => this.handleSearch(value, key),
      keyword : keywords[key]
    }

    /******************20171122 修改table 列数据**************************/
    const ProgressNum = (text1, denominator1, type) => {
        const text = text1 === '' ? 0 : text1
        const denominator = denominator1 === '' ? 0 : denominator1
        let number = Number((Number(text) / Number(denominator) * 100).toFixed(2))
        let title = ''
        let className = ''
        if (number < 30) {
          className = 'bg-success'
        } else if (number < 80) {
          className = 'bg-primary'
        } else if (number < 90) {
          className = 'bg-warning'
        } else {
          className = 'bg-error'
        }
        switch (type) {
          case 'memory_rate' :
            title = "占比:" + number + '%    ' + text + 'MB' + '/' + denominator + 'MB'
            if (denominator === 0) title = '已用内存:' + text + 'MB,' + '内存大小:' + denominator + 'MB.'
            break
          case 'disk_rate' :
            /*********20180103 bug：修复磁盘大小 单位为 G**********/
            title = "占比:" + number + '%    ' + text + 'G' + '/' + denominator + 'G'
            if (denominator === 0) title = '已用磁盘:' + text + 'G,' + '磁盘大小:' + denominator + 'G.'
            break
          case 'load_rate' :
            title = "占比:" + number + '%    ' + text + '/' + 3
            if (denominator === 0) title = 'CPU负载:' + text + ',' + '总负载:' + denominator + '.'
            break
        }
        return (
          <Row className={styles[className]}>
            <Tooltip title={title}>
              <Progress percent={number} showInfo={false}/>
            </Tooltip>
          </Row>
        )
      }

    const memoryTitle =
      <span>
        内存&nbsp;
        <Tooltip title="已用内存/内存大小">
          <IconFont className="text-info" type="question-circle"/>
        </Tooltip>
      </span>

    const diskTitle =
      <span>
        磁盘&nbsp;
        <Tooltip title="已用磁盘/磁盘大小">
          <IconFont className="text-info" type="question-circle"/>
        </Tooltip>
      </span>

    const loadTitle =
      <span>
        负载&nbsp;
        <Tooltip title="CPU负载/总负载">
          <IconFont className="text-info" type="question-circle"/>
        </Tooltip>
      </span>


    let columns = [{
      title: '主机名', dataIndex: 'name', key: 'name',width:150,
      // render:(text,record) => {
      //   return <Link to={`/cmdb/host/${record.id}`}>{text}</Link>
      // }
    },
      {
        title: 'IP', dataIndex:'connect_ip', key:'connect_ip',width:120,
        render:(text,record) =>{
          return this.ShowIP(text,record)
          // return (
          //   <Row>
          //     <span>{text}</span>&nbsp;&nbsp;
          //     <IconFont type="plus-square-o" style={{cursor: 'pointer'}}
          //               onClick={() => this.showIPModal(record.host_ip)}/>
          //   </Row>
          // )
        }
      },
      {
        title: '状态',dataIndex: 'connect_status', key: 'connect_status',width:100,className: 'text-center',
        // filters: [
        //   {
        //     text: '环境未初始化',
        //     value: '0'
        //   },
        //   {
        //     text: '运行中',
        //     value: '1'
        //   },
        //   {
        //     text: 'Agent异常',
        //     value: '2'
        //   },
        //   {
        //     text: 'SSH连接异常',
        //     value: '3'
        //   }
        // ],
        render: (text, record) => {
          let status = ''
          let desc = ''
          switch(Number(text)){
            case HOST_STATUS.HOST_NOT_INIT:
              status = 'default'
              desc = '环境未初始化'
              break
            case HOST_STATUS.HOST_RUNNING:
              status = 'success'
              desc = '运行中'
              break
            case HOST_STATUS.HOST_AGENT_ABNORMAL:
              status = 'error'
              desc = 'Agent异常'
              break
            case HOST_STATUS.HOST_SSH_ABNORMAL:
              status = 'error'
              desc = 'SSH连接异常'
              break
          }
          return (
            <Tooltip title={desc}>
            <span style={{cursor : 'pointer'}} >
            <Badge status={status}/>
            </span>
            </Tooltip>
          )
        }
      },
      {
        title: '类型',dataIndex: 'type',key: 'type',width:120,
        render: (text) => {
          text = text === HOST_TYPE['NORMAL'] ? '普通主机'
            : (text === HOST_TYPE['RHCS'] ? 'RHCS主机'
              :(text === HOST_TYPE['RHCS_SLAVE'] ? 'RHCS备机' : ''))
          return <span>{text}</span>
        }
      },
      {
        title: memoryTitle,dataIndex: 'free_memory',key: 'free_memory',width:150,
        render: (text,record)=>{
          return ProgressNum(Number(record.memory)-Number(text),record.memory,'memory_rate')
        }
      },
      {
        title: '内存大小（MB）',dataIndex: 'memory',key: 'memory',width:120,
      },
      {
        title: diskTitle,dataIndex: 'free_disk',key: 'free_disk',width:150,
        render: (text,record)=>{
          return ProgressNum(Number(record.disk_size)-Number(text),record.disk_size,'disk_rate')
        }
      },
      {
        title: '磁盘大小（G）',dataIndex: 'disk_size',key: 'disk_size',width:150,
      },
      {
        title: loadTitle,dataIndex: 'cpu_load',key: 'cpu_load',width:150,
        render: (text)=>{
          return ProgressNum(text,10,'load_rate')
        }
      },
      {
        title: '运行服务数',dataIndex: 'running_services',key: 'running_services',width:100,
        // render:(text,record) =>{
        //   if(text === 0 || text === undefined || text === ''){
        //     return <span>{text}</span>
        //   }else{
        //     return <a href="javascript:void(0);"
        //               onClick={this.handleRunningServices.bind(this,record.serviceList)}>{text}</a>
        //     return <a href="javascript:void(0);" >{text}</a>
        //   }
        // }
      },
      {
        title: '城市',dataIndex: 'city',key: 'city',width:100,
      },
      {
        title: '数据中心',dataIndex: 'idc',key: 'idc',width:100,
      },
      {
        title: '优先级',dataIndex: 'priority',key: 'priority',width:100,
      },
      {
        title: '权重',dataIndex: 'weight',key: 'weight',width:100,
      },
      {
        title: '系统架构',dataIndex: 'os_arch',key: 'os_arch',width:150,
      },
      {
        title: '系统版本',dataIndex: 'os_version',key: 'os_version',width:150,
      },
      {
        title: 'Agent 状态',dataIndex: 'agent_status',key: 'agent_status',width:130,className:'text-center',
        filters: [
          {
            text: '环境未初始化',
            value: '0'
          },
          {
            text: '运行中',
            value: '1'
          },
          {
            text: 'Agent 异常',
            value: '2'
          },
        ],
        render:(text) =>{
          let status = ''
          let desc = ''
          switch(Number(text)){
            case HOST_STATUS.HOST_NOT_INIT:
              status = 'default'
              desc = '环境未初始化'
              break
            case HOST_STATUS.HOST_RUNNING:
              status = 'success'
              desc = '运行中'
              break
            case HOST_STATUS.HOST_AGENT_ABNORMAL:
              status = 'error'
              desc = 'Agent异常'
              break
          }
          return (
            <Tooltip title={desc}>
                <span style={{cursor : 'pointer'}} >
                  <Badge status={status}/>
                </span>
            </Tooltip>
          )
        }
      },
      {
        title: '系统内核',dataIndex: 'os_kernel',key: 'os_kernel',width:150,
      },
      {
        title: '磁盘',dataIndex: 'devices',key: 'devices',width:100,
      },
      {
        title: 'CPU 型号',dataIndex: 'processor',key: 'processor',width:200,
      },
      {
        title: '挂载分区',dataIndex: 'mounts',key: 'mounts',width:200,
      },
      {
        title: '网卡',dataIndex: 'interfaces',key: 'interfaces',width:100,
      },
      {
        title: '最大运行服务数',dataIndex: 'max_running_services',key: 'max_running_services',
        width:120,
      }]

    // let columns = [{
    //   title: '主机名', dataIndex: 'name', key: 'name', width: 150, className: 'text-center',
    //   // render:(text,record) => {
    //   //   return <Link to={`cmdb/host/${record.id}`}>{text}</Link>
    //   // }
    // },
    //   {
    //     title: 'IP', dataIndex: 'connect_ip', key: 'connect_ip', className: 'text-center', width: 150,
    //     render: (text, record) => {
    //       return (
    //         <Row>
    //           <span>{text}</span>&nbsp;&nbsp;
    //           <IconFont type="plus-square-o" style={{cursor: 'pointer'}}
    //                     onClick={() => this.showIPModal(record.host_ip)}/>
    //         </Row>
    //       )
    //     }
    //   },
    //   {
    //     title: '状态', dataIndex: 'connect_status', key: 'connect_status', width: 100, className: 'text-center',
    //     filters: [
    //       {
    //         text: '环境未初始化',
    //         value: '0'
    //       },
    //       {
    //         text: '运行中',
    //         value: '1'
    //       },
    //       {
    //         text: 'Agent异常',
    //         value: '2'
    //       },
    //       {
    //         text: 'SSH连接异常',
    //         value: '3'
    //       }
    //     ],
    //     render: (text, record) => {
    //       let status = ''
    //       let desc = ''
    //       switch (Number(text)) {
    //         case HOST_STATUS.HOST_NOT_INIT:
    //           status = 'default'
    //           desc = '环境未初始化'
    //           break
    //         case HOST_STATUS.HOST_RUNNING:
    //           status = 'success'
    //           desc = '运行中'
    //           break
    //         case HOST_STATUS.HOST_AGENT_ABNORMAL:
    //           status = 'error'
    //           desc = 'Agent异常'
    //           break
    //         case HOST_STATUS.HOST_SSH_ABNORMAL:
    //           status = 'error'
    //           desc = 'SSH连接异常'
    //           break
    //       }
    //       return (
    //         <Tooltip title={desc}>
    //           <span style={{cursor: 'pointer'}}>
    //             <Badge status={status}/>
    //           </span>
    //         </Tooltip>
    //       )
    //     }
    //   },
    //   {
    //     title: '类型', dataIndex: 'type', key: 'type', className: 'text-center', width: 100,
    //     render: (text) => {
    //       text = text === HOST_TYPE['NORMAL'] ? '普通主机'
    //         : (text === HOST_TYPE['RHCS'] ? 'RHCS主机'
    //           :(text === HOST_TYPE['RHCS_SLAVE'] ? 'RHCS备机' : ''))
    //       return <span>{text}</span>
    //     }
    //   },
    //   {
    //     title: memoryTitle, dataIndex: 'free_memory', key: 'free_memory', className: 'text-center', width: 130,
    //     render: (text, record) => {
    //       return ProgressNum(text, record.memory, 'memory_rate')
    //     }
    //   },
    //   {
    //     title: diskTitle, dataIndex: 'free_disk', key: 'free_disk', className: 'text-center', width: 130,
    //     render: (text, record) => {
    //       return ProgressNum(text, record.disk_size, 'disk_rate')
    //     }
    //   },
    //   {
    //     title: loadTitle, dataIndex: 'cpu_load', key: 'cpu_load', className: 'text-center', width: 130,
    //     render: (text) => {
    //       return ProgressNum(text, 3, 'load_rate')
    //     }
    //   },
    //   {
    //     title: '运行服务数', dataIndex: 'running_services', key: 'running_services', className: 'text-center', width: 100,
    //     // render:(text,record) =>{
    //     //   if(text === 0 || text === undefined || text === ''){
    //     //     return <span>{text}</span>
    //     //   }else{
    //     //     return <Link onClick={this.handleRunningServices.bind(this,record.serviceList)}>{text}</Link>
    //     //   }
    //     // }
    //   },
    //   {
    //     title: '城市', dataIndex: 'city', key: 'city', className: 'text-center', width: 100,
    //   },
    //   {
    //     title: '数据中心', dataIndex: 'idc', key: 'idc', className: 'text-center', width: 100,
    //   },
    //   {
    //     title: '系统架构', dataIndex: 'os_arch', key: 'os_arch', className: 'text-center', width: 150,
    //   },
    //   {
    //     title: '系统版本', dataIndex: 'os_version', key: 'os_version', className: 'text-center', width: 150,
    //   },
    //   {
    //     title: '网卡', dataIndex: 'interfaces', key: 'interfaces', className: 'text-center', width: 100,
    //   },
    //   {
    //     title: '最大运行服务数', dataIndex: 'max_running_services', key: 'max_running_services',
    //     className: 'text-center', width: 150,
    //   }]
    /***********************over************************************/
      // 需要修改的数据
      // const dataSource = this.state.hostObj ? this.state.hostObj[key] : []

      // 获取属于这个服务的keyword
    const keyword = keywords[key]
    const filter = {
      name : keyword,
    }
    if(relateId ){
      filter.relate_id = relateId
      filter.relate_type = relateType
    }
    if(memoryMarks !== undefined && deployInfo.memory !== undefined){
      filter.mem =  memoryMarks[deployInfo.memory]
    }
    if(pages){
      filter.page = pages[key]
    }
    if(connect_status !== undefined){
      filter.connect_status = connect_status
    }

    const selectedRowKeys = hostObj[key].length ? hostObj[key].map(v => v.id) : []
    let showTip = false
    let width = 0
    /******** 20180110 Firefox 下 隐藏列的宽度也会渲染出来 chorme 不会 ************/
    /******** 不使用 display：none 来控制了 ************/
    /******** 直接从 columns 里面剔除要隐藏的列 ************/
    // columns = columns.map((val, index) => {
    //   if (this.state.columns.indexOf(val['dataIndex']) === -1) {
    //     return {...val, className: "hide-column"}
    //   }
    //   width += val.width
    //   return val
    // })
    let newColumns = []
    columns.forEach(val => {
      if(this.state.columns.indexOf(val['dataIndex']) !== -1){
        newColumns.push(val)
        width += val.width
      }
    })
    // columns.forEach((v) =>
    //   width += v.width
    // )
    let dataTableProps = {
      fetch : {
        // url : '/machines',
        url : '/hosts',
        data : filter,
      },
      // columns,
      columns : newColumns,
      rowSelection : {
        /******************20171130 修改：实例还是变回了单选 *******************/
        /**********20171128 修改：实例可以多选了 table 默认 Checkbox  **********/
        type : this.props.isInstance ? 'radio' : 'checkbox',
        /****************over****************/
        onSelect : this.onSelected.bind(this, key),
        onSelectAll : this.onSelectedAll.bind(this, key),
        selectedRowKeys,
        getCheckboxProps : (record) => ({
          disabled : record.type === HOST_TYPE['RHCS_SLAVE']
        })
      },
      rowKey : 'id',
      cb : (params) => {
        const { pagination } = params
        const { total } = pagination
        if(total=== 0){
          this.setState({
            showTip : true
          })
        }
      },
      locale : {
        emptyText : '暂无符合条件机器。可通过主机管理，新增合适的机器'
      },
      scroll : { x : width}
    }

    if(pages){
      dataTableProps.currentPage = pages[key]
      dataTableProps.setCurrentPage = (value) => {
        this.handlePage(value, key)
      }
    }


    // 如果是监控服务 需要把别的服务选的机器合并去重作为监控的 dataSource
    /*********** 20180328 gateway_agent 服务于 spider_gataway 一致，不需要选择***************/
    /***********20171207 nodeguard 服务主机与 mysql一致 不需要再去选择*************/
    if(key.toLowerCase().includes('zabbix-agent')
      || key.toLowerCase().includes('nodeguard')
      || key.toLowerCase().includes('gateway_agent')){
      // 拷贝一个 hostObj 避免操作原对象
      /****************************20171122 zabbix 默认必选，不可操作******************************************/
        // let newHostObj = JSON.parse(JSON.stringify(this.state.hostObj))
        // const newKeys = Object.keys(newHostObj).filter(v => !v.toLowerCase().includes('zabbix-agent'))
        // let dataSource = []
        // newKeys.forEach((v, i) => {
        //   if(newHostObj[v].length){
        //     for(let k = 0; k < newHostObj[v].length; k++){
        //       if(!dataSource.find(val => val.id == newHostObj[v][k].id)){
        //         dataSource.push( newHostObj[v][k])
        //       }
        //     }
        //   }
        // })
      let dataSource = hostObj[key]
      /***********************************over***********************************/

      // console.log('dataSource===>', dataSource)
      delete dataTableProps.fetch
      dataTableProps.locale.emptyText =  key.toLowerCase().includes('nodeguard')
        ? '配置 MySQL 主机' :
        (key.toLowerCase().includes('gateway_agent')
          ? '配置 Spider_Gateway 主机' : '请先配置其他服务！')
      dataTableProps.pagination = false
      dataTableProps.dataSource = dataSource
      /********************************* 20171122 zabbix 不可操作*********************************/
      dataTableProps.rowSelection.getCheckboxProps = record => ({
        disabled : true
      })
      /***********************************over***********************************/
    }

    return (
      <Row className={styles["host-component"]}>
        <Row>
          <span>已选主机： </span>
          <span>{
            hostObj[key].length
              // ? this.state.hostObj[key].map( v => v.machine_name ).join('，')
              ? hostObj[key].map( v => v.host_name ).join('，')
              : ('请选择主机')
          }</span>
        </Row>
        <Row className={styles["mgtb-8"]}>
          {
            key.toLowerCase().includes('zabbix-agent')
              ? <Row className={styles["tip-container"]}>
              <IconFont type="info-circle" className="text-info"/>&nbsp;
              <span>提示：zabbix 节点与数据库节点不统一将会导致无法提供监控服务，所以不提供 zabbix 相关的机器选择。</span>
            </Row>
              : (key.toLowerCase().includes('nodeguard')
                ? <Row className={styles["tip-container"]}>
                  <IconFont type="info-circle" className="text-info"/>&nbsp;
                  <span>提示：nodeguard 节点与 mysql 节点一致，所以不提供 nodeguard 相关的机器选择。</span>
                </Row>
                /*********** 20180328 gateway_agent 服务于 spider_gataway 一致，不需要选择***************/
                :(key.toLowerCase().includes('gateway_agent')
                  ? <Row className={styles["tip-container"]}>
                    <IconFont type="info-circle" className="text-info"/>&nbsp;
                    <span>提示：gateway_agent 节点与 spider_gateway 节点一致，所以不提供 gateway_agent 相关的机器选择。</span>
                  </Row>
                  :<Row type="flex" justify="space-between">
                    <Col span={6}>
                      <Search {...searchProps} />
                    </Col>
                      <Col span={4} className={styles['txt-r']}>
                        <Button onClick={this.showSettingModal} >
                          <IconFont type="setting"/>
                          列表设置
                        </Button>
                      </Col>
                    </Row>
                  )
                )
          }
        </Row>
        <DataTable {...dataTableProps}/>
        {/*{this.state.showTip && <span style={{float : 'left'}}>暂无此内存下的主机，请添加!</span>}*/}
      </Row>
    )
  }




  render(){

    const { selectedService, hostVisible, hostIP } = this.props

    const ipModalProps = {
      title: '主机ip详情',
      visible: hostVisible,
      onCancel: this.props.handleIPCancel,
      onOk: this.props.handleIPCancel,
      hostIP: hostIP
    }

    const tableSetProps = {
      newColumns : this.state.newColumns,
      onChange: (value) => {
        this.setState({
          newColumns: value
        })
      }
    }

    const settingModalOpts = {
      title: '筛选机器',
      visible: this.state.settingVisible,
      onOk: () => {
        this.setState({
          columns: this.state.newColumns,
        })
        this.hideSettingModal()
      },
      onCancel: () => {
        this.setState({
          newColumns: this.state.columns
        })
        this.hideSettingModal()
      },
      wrapClassName: styles['settingModal'],
      width: '70%',
    }

    return (
    <Row className={styles['machine-modal']}>
      <Tabs tabPosition="left">
        {
          Json.loads(selectedService).map(item => {
            /********20171215 服务的 visible 0 时不需要选择主机********/
            let key = ''
            if(item.version === undefined){
              key = `${item.name}-_-${item.id}`
            }else{
              key = `${item.name}-_-${item.version}-_-${item.id}`
            }
            if(item.visible !== 0){
              return (
                <TabPane key={item.id} tab={`${item.name}`}>
                  {
                    item.need_host
                      ? this.content(key)
                      : <Row>此服务不需要配置机器</Row>
                  }
                </TabPane>
              )
            }
          })
        }
      </Tabs>
      <IPModal {...ipModalProps}/>
      <Modal {...settingModalOpts}>
        <Row> <TableSet {...tableSetProps}/></Row>
        <Button className="to-default" onClick={this.toDefault}>恢复默认</Button>
      </Modal>
    </Row>
    )
  }
}

HostComponent.propTypes = {
  onSelect : PropTypes.func,
  onSelectAll : PropTypes.func,
  handleIPCancel : PropTypes.func,
  showIPModal : PropTypes.func,
  handleSearch : PropTypes.func,
  hostObj : PropTypes.object,
  deployInfo : PropTypes.object,
  memoryMarks : PropTypes.object,
  selectedService : PropTypes.string,
  isInstance : PropTypes.bool,
  hostVisible : PropTypes.bool,
  hostIP : PropTypes.object,
}

export default HostComponent
