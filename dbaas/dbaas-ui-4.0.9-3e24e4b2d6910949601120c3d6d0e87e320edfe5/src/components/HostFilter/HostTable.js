/**
 * Created by wengyian on 2017/8/7.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { classnames, Logger } from 'utils'
import { DataTable, Search, IconFont } from 'components'
import { Row, Col, Tooltip, Checkbox, Badge, Progress, Tag, Icon } from 'antd'
import { HOST_LIST, HOST_STATUS, HOST_IP } from 'utils/constant'
import { Link } from 'dva/router'
// import styles from './HostFilter.less'
import styles from '../../routes/cmdb/host/host.less'

const CheckboxGroup = Checkbox.Group

class HostTable extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      idToShow:[],
    }
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


  render() {

    const setSeleted = (selected, changeRows) => {
      const needAll = this.props.isAllParams || false
      let oldSelected = this.props.selectedMachines || []
      if(selected){
        if(needAll){
          oldSelected.push(...changeRows)
        }else{
          oldSelected.push(...changeRows.map((v)=>{return v.connect_ip}))
        }
      }else{
        if(needAll){
          changeRows.forEach(v => {
            oldSelected = oldSelected.filter( val => val.id != v.id)
          })
        }else{
          changeRows.forEach(v => {
            oldSelected = oldSelected.filter( val => val != v.connect_ip)
          })
        }
      }
      if(this.props.onChange){
        this.props.onChange(oldSelected)
      }
      // debugger
    }


    const rowSelection = {
      onSelect : (record, selected, selectedRows) => {
        setSeleted(selected, [record])
      },
      onSelectAll : (selected, selectedRows, changeRows) => {
        setSeleted(selected, changeRows)
      },
      type : this.props.isRadio ? 'radio' : 'checkbox', //默认多选,
    };


    // 新增 处理 进度条 + 百分比
    const ProgressNum = (text1,denominator1,type) => {
      const text = text1 === '' ? 0 : text1
      const denominator = denominator1 === '' ? 0 : denominator1
      let number = Number((Number(text)/Number(denominator)*100).toFixed(2))
      let title = ''
      let className = ''
      if(number < 30){
        className = 'bg-success'
      }else if(number < 80){
        className = 'bg-primary'
      }else if(number < 90){
        className = 'bg-warning'
      }else{
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
          if(denominator === 0) title = 'CPU负载:' + text + ',' + '总负载:' + denominator + '.'
          break
      }
      return (
        <Row className={classnames(styles["host"], styles[className])}>
          <Tooltip title={title}>
            <Progress percent={number} showInfo={false}/>
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
        <Tooltip title="CPU负载/总负载">
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
            text: 'Agent异常',
            value: '2'
          },
          {
            text: 'SSH连接异常',
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
          text = text === 0 ? '普通主机' : (text === 1 ? 'RHCS主机' : 'RHCS备机')
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
        title: '内存大小(MB)',dataIndex: 'memory',key: 'memory',width:120,
      },
      {
        title: diskTitle,dataIndex: 'free_disk',key: 'free_disk',width:150,
        render: (text,record)=>{
          return ProgressNum(Number(record.disk_size)-Number(text),record.disk_size,'disk_rate')
        }
      },
      {
        title: '磁盘大小(G)',dataIndex: 'disk_size',key: 'disk_size',width:150,
      },
      {
        title: loadTitle,dataIndex: 'cpu_load',key: 'cpu_load',width:150,
        render: (text)=>{
          return ProgressNum(text,10,'load_rate')
        }
      },
      {
        title: '运行服务数',dataIndex: 'running_services',key: 'running_services',width:100,
        render:(text,record) =>{
          if(text === 0 || text === undefined || text === ''){
            return <span>{text}</span>
          }else{
            // return <a href="javascript:void(0);"
            //           onClick={this.handleRunningServices.bind(this,record.serviceList)}>{text}</a>
            return <a href="javascript:void(0);" >{text}</a>
          }
        }
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
        title: 'Agent状态',dataIndex: 'agent_status',key: 'agent_status',width:130,className:'text-center',
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
            text: 'Agent异常',
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
        title: 'CPU型号',dataIndex: 'processor',key: 'processor',width:200,
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

    let width = 0
    /******** 20180110 Firefox 下 隐藏列的宽度也会渲染出来 chorme 不会 ************/
    /******** 不使用 display：none 来控制了 ************/
    /******** 直接从 columns 里面剔除要隐藏的列 ************/

    let newColumns = []
    columns.forEach(val => {
      if(this.props.columns.indexOf(val['dataIndex']) !== -1) {
        newColumns.push(val)
        width += val.width
      }
    })

    let fetchData = { name : this.props.filter}
    if(this.props.fetchFilter !== undefined){
      fetchData = {...fetchData, ...this.props.fetchFilter}
    }

    const fetchDataTableProps = {
      fetch: {
        url: "/hosts",
        data: fetchData
      },
      columns: newColumns,
      scroll:  { x: width},
      rowKey: 'id',
      rowSelection: rowSelection
    }


    return (
      <DataTable {...fetchDataTableProps} />
    )
  }
}

HostTable.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  isAllParams : PropTypes.bool,
  isRadio : PropTypes.bool,
  fetchFilter : PropTypes.object,
}

export default HostTable
