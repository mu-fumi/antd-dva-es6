/**
 * Created by wengyian on 2017/12/1.
 */

import Base from 'routes/base'
import PropTypes from 'prop-types'
import {Row, Col, Select, message, Tooltip, Button, Modal, Card, Spin} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon, TablePanel, NodeRunBadge,} from 'components'
import {routerRedux, Link, browserHistory,} from 'dva/router'
import {classnames, constant, TimeFilter} from 'utils'
// import Json from 'utils/json'
import _ from 'lodash'
import styles from './summary.less'
import SwitchMasterModal from './switchMasterModal'
import RelationChart from './relationChart'
import Graph from './graph'
import Func from './func'
import CapProgress from './capProgress'

const {CLUSTER_STATE, RELATE_TYPE} = constant

function BasicTable(params){

  const {basic = {}, id, relateType} = params

  const belongTitle = <Tooltip title="业务 - 应用">
    所属 <IconFont className="text-info" type="question-circle"/>
  </Tooltip>
  const cpuTitle = <Tooltip title="平均/最大">
    CPU 利用率 <IconFont className="text-info" type="question-circle"/>
  </Tooltip>
  const memoryTitle = <Tooltip title="内存占用量/内存总量">
    内存占用量 <IconFont className="text-info" type="question-circle"/>
  </Tooltip>

  let showName = '', showDataIndex = '', showDesc = '', graphTag = ''
  switch (relateType){
    case RELATE_TYPE.cluster :
      showName = '集群名称'
      showDataIndex = 'cluster_name'
      showDesc = '集群描述'
      graphTag = 'cluster_id'
          break
    case RELATE_TYPE.instance :
      showName = '实例名称'
      showDataIndex = 'instance_name'
      showDesc = '实例描述'
      graphTag = 'instance_id'
          break
    case RELATE_TYPE.set:
      showName = '实例组名称'
      showDataIndex = 'set_name'
      showDesc = '实例组描述'
      graphTag = 'set_id'
          break
  }

  let columns = [{
    name: showName,
    dataIndex: showDataIndex
  }, {
    name: showDesc,
    dataIndex: 'desc'
  }, {
    name: '运行状态',
    dataIndex: 'run_status',
    render: (text, record) => {
      let prompt = ''
      let className = ''
      switch (text) {
        case CLUSTER_STATE.RUNNING :
          prompt = '运行中'
          className = 'text-success'
          break
        case CLUSTER_STATE.UPDATING :
          prompt = '升级中'
          className = 'text-info'
          break
        case CLUSTER_STATE.ADJUSTING :
          prompt = '规模调整中'
          className = 'text-info'
          break
        case CLUSTER_STATE.CREATING :
          prompt = '创建中'
          className = 'text-info'
          break
        case CLUSTER_STATE.DELETING :
          prompt = '删除中'
          className = 'text-warning'
          break
        case CLUSTER_STATE.ABNORMAL :
          prompt = '异常'
          className = 'text-error'
          break
      }

      return (
        <Link to={`/graphs?${graphTag}=${id}`} target="_blank">
          <Tooltip title="查看监控">
            <span className={className}>{prompt}</span>
            &nbsp;<IconFont type="iconfont-trend" style={{marginTop: '-3px'}} className={className}/>
          </Tooltip>
        </Link>
      )
    }
  }, {
    name: '版本',
    dataIndex: 'version'
  }, {
    name: belongTitle,
    dataIndex: 'belong',
    render: (text, record) => {
      // todo 链接到所属页面 链接到相应应用页面 没有 app_id 怎么搞一个呢
      // const arr = text.split('-')
      // const app = arr[arr.length - 1]
      const app_id = record.application_id
      return <Link to={`/cmdb/app/${app_id}/detail`} target="_blank">{text}</Link>
    }
  }, {
    name: '使用套件',
    dataIndex: 'stack',
    render: (text, record) => {
      // todo 链接到使用套件
      return <Link to={`/cmdb/component/stack-view?stack_id=${record.stack_id}`} target="_blank">{text}</Link>
    }
  }, {
    name: cpuTitle,
    dataIndex: 'cpu',
    render: (text, record) => {
      if(text === null || text === undefined){
        return ''
      }
      text = text.toString()
      let avg = text.split('/')[0]
      let max = text.split('/')[1]
      const avgClass = Func.getColor(parseInt(avg))
      const maxClass = Func.getColor(parseInt(max))
      // return <Link to="">
      return <Row className={styles['inline-block']}>
        <span className={avgClass}>{avg}</span>
        <span>/</span>
        <Tooltip title={record.cpu_max_node}>
          <span className={maxClass}>{max}</span>
        </Tooltip>
      </Row>
    }
  }, {
    name: memoryTitle,
    dataIndex: 'mem',
    render: (text, record) => {
      if(text){
        const used = text.split('/')[0]
        const total = text.split('/')[1]
        let usedObj = Func.splitMem(used)
        let totalObj = Func.splitMem(total)
        if (usedObj.unit !== totalObj.unit) {
          usedObj = Func.convertToG(usedObj)
          totalObj = Func.convertToG(totalObj)
        }
        return <CapProgress used={usedObj} total={totalObj} className={styles["mem-progress"]}/>
      }else{
        return '暂无数据'
      }
    }
  }, {
    name: '架构',
    dataIndex: 'arch'
  }, {
    name: '故障切换',
    dataIndex: 'failover'
  }, {
    name: '账号数',
    dataIndex: 'accounts',
    render: (text, record) => {
      // todo 链接到账号权限
      // return <Link to="" target="_blank">{text}个</Link>
      return text + '个'
    }
  }, {
    name: '数据库数',
    dataIndex: 'databases',
    render: (text, record) => {
      // todo 链接到数据库管理
      // return <Link to="/databases" target="_blank">{text}个</Link>
      return text + '个'
    }
  }, {
    name: '访问地址',
    dataIndex: 'access_addr'
  }]
  let dataSource = {}
  for (let key in basic) {
    dataSource[key] = basic[key]
  }
  // basic.forEach((item, key) => {
  //   columns.push({
  //     name: item.name,
  //     dataIndex: item.key
  //   })
  //   dataSource[item.key] = item.value
  // })
  // console.log('dataSource===>', dataSource)
  const tablePanelProps = {
    title: '基本信息',
    columns,
    dataSource,
  }
  return <TablePanel {...tablePanelProps}/>
}

BasicTable.propTypes = {
  params : PropTypes.object
}

export default BasicTable
