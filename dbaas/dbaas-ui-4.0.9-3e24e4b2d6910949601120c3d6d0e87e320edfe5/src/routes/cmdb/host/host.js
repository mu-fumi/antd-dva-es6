/**
 * Created by zhangmm on 2017/8/19.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './host.less'
import { DataTable, Filter , IconFont } from 'components'
import { Link } from 'dva/router'
import { Row , Col , Modal, Tooltip, message, Checkbox, Badge, Progress, Tag, Icon } from 'antd'
import { classnames, constant } from 'utils'
import ServicesModal from './servicesModal.js'
import SettingModal from './settingModal.js'
import IPModal from './ipModal.js'

const { HOST_STATUS, HOST_IP } = constant
const confirm = Modal.confirm

class Host extends Base{
  constructor(props){
    super(props)

    this.state = {
      serviceTitle:'运行服务列表',
      serviceVisible:false,
      settingTitle:'设置列表字段',
      settingVisible:false,
      ipTitle:'主机IP详情',
      ipVisible:false,
      idToShow:[],
      validate: false,//用于检验搜索输入
    }

    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '主机管理', selectedKey: '主机管理host'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
    this.push({
      type: 'host/resetFilter',
      fire: [Base.WillUnmount]
    })
    this.pageBtns = {
      element: ()=>{
        return (<Row>
          <Col className="pageBtn">
            <a href="javascript:void(0);" className="text-info" onClick={this.handleHostImport}>
              <IconFont type="plus"/>批量导入
            </a>
          </Col>
          <Col className="pageBtn">
            <a href="javascript:void(0);" onClick={this.handleHostAllDelete}>
              <IconFont type="delete"/>批量删除
            </a>
          </Col>
          <Col className="pageBtn">
            <a href="javascript:void(0);" onClick={this.handleHostReload}>
              <IconFont type="reload"/>刷新
            </a>
          </Col>
        </Row>)
      }
    }
    this.handleHostReload = this.handleHostReload.bind(this)
    this.handleHostChange = this.handleHostChange.bind(this)
    this.handleHostImport = this.handleHostImport.bind(this)
    this.handleHostAllDelete = this.handleHostAllDelete.bind(this)
    this.handleHostImpOk = this.handleHostImpOk.bind(this)
    this.handleHostImpCancel = this.handleHostImpCancel.bind(this)
    this.handleHostFile = this.handleHostFile.bind(this)
    this.handleHostMachine = this.handleHostMachine.bind(this)
    this.handleHostMachCancel = this.handleHostMachCancel.bind(this)
    this.handleRunningServices = this.handleRunningServices.bind(this)
    this.handleServicesCancel = this.handleServicesCancel.bind(this)
    this.handleHostSetting = this.handleHostSetting.bind(this)
    this.handleSettingCancel = this.handleSettingCancel.bind(this)
    this.handleSettingOk = this.handleSettingOk.bind(this)
    this.handleChangeSettings = this.handleChangeSettings.bind(this)
    this.handleResetSettings = this.handleResetSettings.bind(this)
    this.showIPModal = this.showIPModal.bind(this)
    this.handleIPCancel = this.handleIPCancel.bind(this)
    this.handleIPPush = this.handleIPPush.bind(this)
    this.handleIPPop = this.handleIPPop.bind(this)
  }

  componentWillMount(){
    this.props.dispatch({
      type:'host/getSetting',
      payload:{default_key:'1'}
    })
  }

  componentWillUnmount(){
    super.componentWillUnmount()
    this.props.dispatch({
      type:'host/resetSettingsLeave',
      payload:{
        keys:[]
      }
    })
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.host.reload !== this.props.host.reload){
      this.props.dispatch({
        type:'host/getSetting',
        payload:{default_key:'0'}
      })
    }
  }

  handleHostReload(){
    if (this.refs.inputSearch && this.refs.inputSearch.length >= 36) { //校验是否大于36个字符
      return
    }
    this.props.dispatch({
      type:'host/handleKeyword',
      payload:{keyword:this.refs.inputSearch}
    })
    this.props.dispatch({
      type : `host/handleReload`
    })
  }

  handleHostChange(rowKeys,rowItems){
    this.props.dispatch({
      type : `host/handleHostSelected`,
      payload: {
        selectedRowKeys: rowKeys,
        selectedRowItems:rowItems.map((v,k) =>{
          //之前是serviceList长度来判断，现在直接通过serviceExist判断
          return {'key':v.id,'name':v.name,'canAllDeleted':v.serviceExist,'status':v.connect_status}
        })
      }
    })
  }

  handleHostImport(){
    this.props.dispatch({
      type:'host/handleHostImpVisible',
      payload:{
        importVisible:true
      }
    })
  }

  handleHostAllDelete(){
    const selectedRowKeys = this.props.host.selectedRowKeys
    const selectedRowItems = this.props.host.selectedRowItems;
    let loop = false;
    if(selectedRowKeys.length > 0){
      selectedRowItems.filter(v => v.canAllDeleted === true).map((v,k) =>{
        if(loop === true) return false;
        if(v.status === 1) {
          message.error(`你选择的 ${v.name} 主机下存在服务，不能删除`);
        }else {
          confirm({
            title : '提示',
            content : `当前${v.name}主机存在服务，并且状态异常，可以删除此主机，但不一定能删除成功`,
            onOk : () => {
              this.props.dispatch({
                type:'host/deleteAllHost',
                payload:{
                  host_ids:selectedRowKeys
                }
              })
            }
          })
        }
        loop = true
        return false
      })
      if(loop === true) return false
      confirm({
        title : '提示',
        content : `确定要批量删除主机吗？`,
        onOk : () => {
          this.props.dispatch({
            type:'host/deleteAllHost',
            payload:{
              host_ids:selectedRowKeys
            }
          })
        }
      })
    }else{
      message.error("请选择主机")
    }
  }

  handleHostImpCancel(){
    this.props.dispatch({
      type:'host/handleHostImpVisible',
      payload:{
        importVisible:false
      }
    })
  }

  handleHostImpOk(){
    const file = this.props.host.file;
    if(file){
      let data = new FormData();
      let extension = file.name.substr(file.name.lastIndexOf('.')+1);
      if(extension !== 'csv' && extension !== 'xls' && extension !== 'xlsx') {
        message.error('请导入csv、xls、xlsx的文件');
      }else {
        data.append('excel', file);
        this.props.dispatch({
          type:'host/importHost',
          payload:data
        })
      }
    }else{
      message.error('上传文件不能为空');
    }
  }

  handleHostFile(e){
    this.props.dispatch({
      type:'host/handleHostFile',
      payload:{
        file:e.target.files[0]
      }
    })
  }

  handleHostMachine(value){
    this.props.dispatch({
      type:'host/handleHostMachVisible',
      payload:{
        machineVisible:true
      }
    })
  }

  handleHostMachCancel(){
    this.props.dispatch({
      type:'host/handleHostMachVisible',
      payload:{
        machineVisible:false
      }
    })
  }

  handleRunningServices(dataSource){
    this.props.dispatch({
      type:'host/handleDatasource',
      payload:{
        dataSource:dataSource
      }
    })
    this.setState({
      serviceVisible:true
    })
  }

  handleServicesCancel(){
    this.props.dispatch({
      type:'host/handleDatasource',
      payload:{
        dataSource:[]
      }
    })
    this.setState({
      serviceVisible:false
    })
  }

  handleHostSetting(){
    this.setState({
      settingVisible:true
    })
  }

  handleSettingCancel(){
    this.setState({
      settingVisible:false
    })
  }

  handleSettingOk(){
    this.props.dispatch({type:'host/handleRecommit',payload:{recommitConfirm:true}})
    const keys = this.props.host.keys
    const settingUsingOk = this.props.host.settingUsingOk
    this.props.dispatch({
      type:"host/changeShowSettings",
      payload:{
        keys:keys
      }
    })
    this.props.dispatch({
      type:"host/handleHostSetting",
      payload:{
        setting:settingUsingOk
      }
    })
    this.props.dispatch({
      type:"host/handleReload",
    })
    this.setState({
      settingVisible:false
    })
  }

  handleChangeSettings(key,e){
    let keys = this.props.host.keys
    let settingUsingOk = this.props.host.settingUsingOk
    settingUsingOk = JSON.parse(JSON.stringify(settingUsingOk))
    e.target.checked ? keys.push(key) : keys = keys.filter(v => v !== key)
    settingUsingOk.filter(v => v.key === key)[0]['show'] = e.target.checked

    this.props.dispatch({
      type:"host/handleHostSetting",
      payload:{
        keys:keys,
      }
    })
    this.props.dispatch({
      type:"host/handleHostSettingUsingOk",
      payload:{
        settingUsingOk:settingUsingOk,
      }
    })
  }

  handleResetSettings(){
    this.props.dispatch({type:'host/handleRecommit',payload:{recommitReset:true}})
    this.props.dispatch({
      type:"host/resetSettings",
      payload:{
        keys:[]
      }
    })
    this.props.dispatch({
      type:"host/handleReload",
    })
    this.setState({
      settingVisible:false
    })
  }

  showIPModal(hostIP){
    this.props.dispatch({
      type:"host/handleHostIP",
      payload:{hostIP:hostIP}
    })
    this.setState({
      ipVisible:true
    })
  }

  handleIPCancel(){
    this.setState({
      ipVisible:false
    })
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

  render(){
    const { location, dispatch, host } = this.props
    const { keyword, placeholder, selectedRowKeys, selectedRowItems, importVisible, executeVisible, machineVisible,
      task, file, templates, groups, setting, settingUsingOk, keys, dataSource, hostIP, reload, recommitReset, recommitConfirm } = host

    const searchProps = [{
      keyword,
      placeholder,
      onSearch(value) {
        if (value.length >= 36) {  //校验是否大于36个字符
          return
        }
        dispatch({
          type: `host/handleFilter`,
          payload: {
            keyword:value
          },
        })
      },
      onChange :(e) =>{
        this.refs = {"inputSearch":e.target.value}
        if (e.target.value.length >= 36) {  //校验是否大于36个字符
          this.setState({
            validate: '请输入不多于36个字符！'
          })
          return
        }
        this.setState({//清空之前的validate
          validate: false
        })
      },
      validate: this.state.validate
    }]

    const buttonProps = [{
      tip:"设置",
      iconProps:{
        type:'setting'
      },
      props:{
        onClick: this.handleHostSetting
      }
    }]

    const filterProps = {
      searchProps,
      buttonProps,
      buttonSpan:8
    }

    // 新增 处理 进度条 + 百分比
    const ProgressNum = (text1,denominator1,type) => {
      const text = text1 === '' ? 0 : text1
      const denominator = denominator1 === '' ? 0 : denominator1
      let number = Number((Number(text)/Number(denominator)*100).toFixed(2))
      let title = ''
      let className = ''
      let errorNumber = undefined
      if(number < 30){
        className = 'bg-success'
      }else if(number < 80){
        className = 'bg-primary'
      }else if(number < 90){
        className = 'bg-warning'
      }else if(number <= 100){
        className = 'bg-error'
      }else if(number > 100){
        errorNumber = 100
        className = 'bg-error'
      }
      switch(type){
        case 'memory_rate' :
          title = "占比:"+ number + '%    ' + text + 'MB' + '/' + denominator + 'MB'
          if(denominator === 0) title = '已用内存:' + text + 'MB,' + '内存大小:' + denominator + 'MB.'
            break
        case 'disk_rate' :
          title = "占比:"+ number + '%    ' + text + 'G' + '/' + denominator + 'G'
          if(denominator === 0) title = '已用磁盘:' + text + 'G,' + '磁盘大小:' + denominator + 'G.'
          break
        case 'load_rate' :
          title = "占比:"+ number + '%    ' + text + '/' + 10
          if(denominator === 0) title = 'CPU 负载:' + text + ',' + '总负载:' + denominator + '.'
          break
      }
      return (
        <Row className={classnames(styles["host"], styles[className])}>
          <Tooltip title={title}>
            <Progress percent={errorNumber || number} showInfo={false}/>
            {/*<span className='progress-number'>{number}%</span>*/}
          </Tooltip>
        </Row>
      )
    }

    //处理ip的显示
    const ShowIP = (text,record) =>{
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
                      <span className="pull-right mgr-10 line-height-28">{HOST_IP[nodeType]}: </span>
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
        <Tooltip title="CPU 负载/总负载">
          <IconFont className="text-info" type="question-circle"/>
        </Tooltip>
      </span>

    let columns = [{
      title: '主机名', dataIndex: 'name', key: 'name',width:150,
      render:(text,record) => {
        return <Link to={`/cmdb/host/${record.id}`}>{text}</Link>
      }
    },
    {
      title: 'IP', dataIndex:'connect_ip', key:'connect_ip',width:120,
      render:(text,record) =>{
          return ShowIP(text,record)
      }
    },
    {
      title: '状态',dataIndex: 'connect_status', key: 'connect_status',width:100,className: 'text-center',
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
        {
          text: 'SSH 连接异常',
          value: '3'
        }
      ],
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
            desc = record.connect_info
            break
          case HOST_STATUS.HOST_SSH_ABNORMAL:
            status = 'error'
            desc = record.connect_info
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
        text = text === 0 ? '普通主机' : (text === 1 ? 'RHCS 主机' : 'RHCS 备机')
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
      title: '内存大小 (MB)',dataIndex: 'memory',key: 'memory',width:120,
      render:(text) =>{
        return<span>{!text ? "无" : text }</span>
      }
    },
    {
      title: diskTitle,dataIndex: 'free_disk',key: 'free_disk',width:150,
      render: (text,record)=>{
        return ProgressNum(Number(record.disk_size)-Number(text),record.disk_size,'disk_rate')
      }
    },
    {
      title: '磁盘大小 (G)',dataIndex: 'disk_size',key: 'disk_size',width:150,
      render:(text) =>{
        return<span>{!text ? "无" : text }</span>
      }
    },
    {
      title: loadTitle,dataIndex: 'cpu_load',key: 'cpu_load',width:150,
      render: (text)=>{
        return ProgressNum(text,10,'load_rate')
      }
    },
    {
      title: '运行服务数',dataIndex: 'running_services',key: 'running_services',width:100,className: 'text-center',
      render:(text,record) =>{
        if(text === 0 || text === undefined || text === ''){
          return <span>{text}</span>
        }else if(record.connect_status === 2 || record.connect_status === 3){
          return <Tooltip title="主机状态异常，服务列表无法正常显示"><a href="javascript:void(0);"
                             onClick={this.handleRunningServices.bind(this,record.serviceList)}>{text}</a></Tooltip>
        }else{
          return <a href="javascript:void(0);"
                    onClick={this.handleRunningServices.bind(this,record.serviceList)}>{text}</a>
        }
      }
    },
    {
      title: '城市',dataIndex: 'city',key: 'city',width:100,
      render:(text) =>{
        return<span>{!text ? "无" : text }</span>
      }
    },
    {
      title: '数据中心',dataIndex: 'idc',key: 'idc',width:100,
      render:(text) =>{
        return<span>{!text ? "无" : text }</span>
      }
    },
    {
      title: '优先级',dataIndex: 'priority',key: 'priority',width:100,
      render:(text) =>{
        return<span>{!text ? "无" : text }</span>
      }
    },
    {
      title: '权重',dataIndex: 'weight',key: 'weight',width:100,
      render:(text) =>{
        return<span>{!text ? "无" : text }</span>
      }
    },
    {
      title: '系统架构',dataIndex: 'os_arch',key: 'os_arch',width:150,
      render:(text) =>{
        return<span>{!text ? "无" : text }</span>
      }
    },
    {
      title: '系统版本',dataIndex: 'os_version',key: 'os_version',width:150,
      render:(text) =>{
        return<span>{!text ? "无" : text }</span>
      }
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
            desc = 'Agent 异常'
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
      render:(text) =>{
        return<span>{!text ? "无" : text }</span>
      }
    },
    {
      title: '磁盘',dataIndex: 'devices',key: 'devices',width:100,
      render:(text) =>{
        return<span>{!text ? "无" : text }</span>
      }
    },
    {
      title: 'CPU 型号',dataIndex: 'processor',key: 'processor',width:200,
      render:(text) =>{
        return<span>{!text ? "无" : text }</span>
      }
    },
    {
      title: '挂载分区',dataIndex: 'mounts',key: 'mounts',width:200,
      render:(text) =>{
        return<span>{!text ? "无" : text }</span>
      }
    },
    {
      title: '网卡',dataIndex: 'interfaces',key: 'interfaces',width:100,
      render:(text) =>{
        return<span>{!text ? "无" : text }</span>
      }
    },
    {
      title: '最大运行服务数',dataIndex: 'max_running_services',key: 'max_running_services',
      width:120,
      render:(text) =>{
      return<span>{!text ? "无" : text }</span>}
    }]

    let columnsProps = []
    setting.map((v1,k1) =>{
      if(v1.show){
        columnsProps.push(columns.filter(v2 => v2.key === v1.key)[0])
      }
    })
    let width = 0
    columnsProps.forEach((v) =>
        width += v.width
    )
    const scroll_width = columnsProps.length > 8 ? width : 0
    const scroll = { x: scroll_width}

    const hostTableProps = {
      fetch:{
        url:'/hosts',
        data:{
          name:keyword
        }
      },
      rowKey: 'id',
      title:() =>{
        return(
          <Row>
            <IconFont type='bulb' className="text-warning"/>&nbsp;
            提示：右侧设置按钮可配置主机列表展示字段
          </Row>
        )
      },
      columns:columnsProps,
      rowSelection:{
        type:'checkbox',
        selectedRowKeys: selectedRowKeys,
        onChange: this.handleHostChange
      },
      reload:reload,
      scroll:scroll
    }

    const importModalSetting = {
      title:'批量导入主机',
      visible: importVisible,
      onOk: this.handleHostImpOk,
      onCancel: this.handleHostImpCancel
    }

/*    const executeModalSetting = {
      title:'批量执行',
      visible: executeVisible,
      onOk: this.handleHostExeOk,
      onCancel: this.handleHostExeCancel,
    }*/

    const machineModalSetting = {
      title:`主机已创建的实例列表`,
      visible: machineVisible,
      width:300,
      onCancel: this.handleHostMachCancel,
      footer:[]
    }

    const machineTableProps = {
      fetch:{
        url:`/machines/${13}/instances`,
      },
      rowKey: 'id',
      showHeader: false,
      pagination: false,
      columns:[{
        dataIndex: 'instance_name',
        key: 'instance_name',
      },{
        dataIndex: 'run_status',
        key: 'run_status',
        render: (text) => {
          let className = text === 1 ? 'text-success' : 'text-error'
          text = text === 1 ? '运行' : '停止'
          return (<span className={className}>{text}</span>)
        }
      },{
        title: '操作',
        render : (text) => {
          return (<Link to="">查看</Link>)
        }
      }],
    }

    const servicesModalSetting = {
      title:this.state.serviceTitle,
      visible: this.state.serviceVisible,
      onCancel: this.handleServicesCancel,
      onOk: this.handleServicesCancel,
      dataSource:dataSource
    }

    const settingModalProps = {
      title:this.state.settingTitle,
      visible: this.state.settingVisible,
      onCancel: this.handleSettingCancel,
      onOk: this.handleSettingOk,
      settingUsingOk: settingUsingOk,
      handleChangeSettings: this.handleChangeSettings,
      handleResetSettings: this.handleResetSettings,
      recommitReset: recommitReset,
      recommitConfirm: recommitConfirm
    }

    const ipModalProps = {
      title:this.state.ipTitle,
      visible: this.state.ipVisible,
      onCancel: this.handleIPCancel,
      onOk: this.handleIPCancel,
      hostIP:hostIP
    }

    return(
      <Row className={styles.host}>
        <Row className="inner-cont">
          <Row className="mgrb">
            <Filter {...filterProps}/>
          </Row>
          <DataTable {...hostTableProps} />
        </Row>
        <Modal {...importModalSetting}>
          <div className="machine-list-download">
            <Row>
              <Col span="12">
                <input className="ant-input" style={{padding:'2px 7px'}}
                       type="file" onChange={this.handleHostFile}/>
              </Col>
              <Col span="8">
                <div className="text-right">
                  <a href="/api/v2/hosts/download/example" type="ghost" size="large">下载导入模板</a>
                </div>
              </Col>
            </Row>
          </div>
        </Modal>
        <Modal {...machineModalSetting}>
          <DataTable {...machineTableProps} />
        </Modal>
        <ServicesModal {...servicesModalSetting}/>
        <SettingModal {...settingModalProps}/>
        <IPModal {...ipModalProps}/>
      </Row>
    )
  }
}

Host.propTypes = {
  host: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    host: state['host'],
    loading: state.loading.effects
  }
}

export default connect(mapStateToProps)(Host)
