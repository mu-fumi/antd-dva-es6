/**
 * Created by wengyian on 2017/9/7.
 */

import Base from 'routes/base'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, Select, message, Tooltip, Button, Modal, Card, Spin} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon, TablePanel, NodeRunBadge,} from 'components'
import {routerRedux, Link,} from 'dva/router'
import {classnames, constant, TimeFilter} from 'utils'
// import Json from 'utils/json'
import _ from 'lodash'
import styles from './summary.less'
import SwitchMasterModal from './switchMasterModal'
import RelationChart from './relationChart'
import Graph from './graph'
import Func from './func'
import CapProgress from './capProgress'
import BasicTable from './basicTable'
import NodeTable from './nodeTable'
import ClusterOther from './clusterOther'
import ChartContent from './chartContent'

const {CLUSTER_STATE} = constant
const modelKey = 'cmdb/cluster/summary'

class Monitor extends Base {
  constructor(props) {
    super(props)

    this.setGobackBtn()

    this.push({
      type: 'app/handleCurrentMenu',
      fire: [Base.DidMount],
      payload: {activeName: '概览', selectedKey: '集群管理cluster'}
    })
    this.push({
      type : 'app/handleCurrentMenu',
      fire : [Base.WillUnmount],
      payload : { selectedKey: ''}
    })

    this.push({
      type: `${modelKey}/handleReload`,
      fire: [Base.DidMount]
    })
    this.push({
      type: `${modelKey}/clearTimer`,
      fire: [Base.WillUnmount]
    })

    this.push({
      type: `${modelKey}/clearCluster`,
      fire: [Base.WillUnmount]
    })

    this.push({
      type : `${modelKey}/setSpinning`,
      payload : true,
      fire : [Base.WillUnmount],
      clear : false
    })

    this.clusterOther = this.clusterOther.bind(this)
    this.nodeTable = this.nodeTable.bind(this)
    this.chartContent = this.chartContent.bind(this)
    this.tablePanel = this.tablePanel.bind(this)
    this.updateStatus = this.updateStatus.bind(this)
  }


  tablePanel() {
    const {monitor} = this.props
    const {cluster, clusterId, loading} = monitor
    const basic = cluster.basic || []

    const belongTitle = <Tooltip title="业务 - 应用">
      所属 <IconFont className="text-info" type="question-circle"/>
    </Tooltip>
    const cpuTitle = <Tooltip >
      CPU 利用率
      {/*<IconFont className="text-info" type="question-circle"/>*/}
    </Tooltip>
    const memoryTitle = <Tooltip title="内存占用量/内存总量">
      内存占用量 <IconFont className="text-info" type="question-circle"/>
    </Tooltip>

    let columns = [{
      name: '集群名称',
      dataIndex: 'cluster_name'
    }, {
      name: '集群描述',
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
          <Link to={`/graphs?cluster_id=${clusterId}`} target="_blank">
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
        const arr = text.split('-')
        const app = arr[arr.length - 1]
        return <Link to={`/cmdb/app?app=${app}`} target="_blank">{text}</Link>
      }
    }, {
      name: '使用套件',
      dataIndex: 'stack',
      render: (text, record) => {
        // todo 链接到使用套件
        return <Link to={`/cmdb/component/stack-view?stack=${text}`} target="_blank">{text}</Link>
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
        return <Link to="">
          <span className={avgClass}>{avg}</span>
          <span>/</span>
          <Tooltip title={record.cpu_max_node}>
            <span className={maxClass}>{max}</span>
          </Tooltip>
        </Link>
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
        return <Link to="" target="_blank">{text}个</Link>
      }
    }, {
      name: '数据库数',
      dataIndex: 'databases',
      render: (text, record) => {
        // todo 链接到数据库管理
        return <Link to="/databases" target="_blank">{text}个</Link>
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

  clusterOther() {
    const {monitor} = this.props
    const {cluster} = monitor
    let other = cluster.other
    if (!other) {
      return
    }
    // console.log('other===>', other)
    // const {table_name, value} = other
    const {value} = other
    let columns = []
    const table_name = '集群状态指标'
    value[0] && Object.keys(value[0]).forEach(val => {
      if (val === 'item') {
        columns.unshift({
          title: '监控项',
          dataIndex: val
        })
      } else {
        columns.push({
          title: val,
          dataIndex: val,
          render: (text, record) => {
            const className = Func.getMonitorClass(text)
            return <span className={className}>{text}</span>
          }
        })
      }
    })
    let dataSource = value

    const dataTableProps = {
      columns,
      dataSource,
      title: () => table_name,
      bordered: true,
      rowKey: 'item',
      pagination: false,
      size: 'small'
    }

    return (
      <Row className={styles["mgt-16"]}>
        <DataTable {...dataTableProps}/>
      </Row>
    )
  }

  updateStatus(){
    const { monitor = {}, dispatch } = this.props
    const { clusterId } = monitor
    dispatch({
      type : `${modelKey}/setUpdating`,
      payload : true
    })
    dispatch({
      type : `${modelKey}/updateStatus`,
      payload : clusterId
    })
  }

  nodeTable() {
    const {monitor} = this.props
    const {cluster, updating} = monitor
    let nodeAlive = cluster.nodeAlive
    const disabled = cluster.basic && (cluster.basic.run_status === CLUSTER_STATE.CREATING ? true : false)
    let tableTitle = (
      <Row type="flex" justify="space-between">
        <Col className={styles["lh-26"]}>节点状态</Col>
        <Col>
          <Button
            disabled={disabled}
            size="small" type="primary"
            loading={updating}
            onClick={() => this.updateStatus()}
          >更新状态
          </Button>
        </Col>
      </Row>
    )
    const tableProps = {
      title: () => tableTitle,
      columns: [{
        title: '节点名',
        dataIndex: 'name',
        render: (text, record) => {
          // todo 链接到节点页面
          return <Link to={`/nodes?node_id=${record.id}`} target="_blank">{text}</Link>
        }
      }, {
        title: '类型',
        dataIndex: 'type_meanings'
      }, {
        title: '服务',
        dataIndex: 'service',
        render: (text, record) => {
          // todo 链接到服务页面 服务id 在哪里哦
          return <Link to={`/cmdb/component/service-view?keywords=${text}`} target="_blank">{text}</Link>
        }
      }, {
        title: '状态',
        dataIndex: 'alive',
        className: styles["txt-c"],
        render: (text) => {
          return <NodeRunBadge type={text}/>
        }
      }],
      pagination: false,
      bordered: true,
      size: 'small',
      dataSource: nodeAlive,
      rowKey: 'id',
    }
    return <Row className={styles["mgt-32"]}>
      <DataTable {...tableProps}/>
    </Row>
  }

  chartContent() {
    const {monitor} = this.props
    const {cluster} = monitor


    if (!cluster.topology) {
      return null
    }

    let relationChartProps = {
      nodes: cluster.topology,
    }

    // if(Object.keys(cluster.topology).length === 1){
    return <Graph {...relationChartProps}/>
    // }else{
    //   return <RelationChart {...relationChartProps} />
    // }
  }


  render() {
    const {monitor, dispatch} = this.props
    const {cluster, clusterId, spinning = true, relateType} = monitor

    const baseTableProps = {
      basic : cluster.basic,
      id :clusterId,
      relateType : relateType
    }

    const nodeTableProps = {
      nodeAlive : cluster.nodeAlive,
      disabled : cluster.basic && (cluster.basic.run_status === CLUSTER_STATE.CREATING ? true : false),
      updating : monitor.updating,
      updateStatus : this.updateStatus
    }

    const clusterOtherProps = {
      other : cluster.other
    }
    const chartContentProps = {
      nodes : cluster.topology,
      relateType,
    }

    return (
      <Row className={styles["summary"]}>
        <Spin spinning={spinning} size="large">
          <Row>
            <Col span="12">
              <Row className={styles["info"]}>
                <BasicTable {...baseTableProps}/>
                {/*{this.tablePanel()}*/}
              </Row>
              <Row className={styles["info"]}>
                {/*{this.nodeTable()}*/}
                <NodeTable {...nodeTableProps}/>
              </Row>
            </Col>
            <Col span="11" offset={1} className={styles["graph"]}>
              <Row className={classnames(styles["pd-8"], styles["clear-float"])}>
                集群关系图
              </Row>
              <Row className={styles["jsPlumb"]} id="summary_graph">
                {/*{this.chartContent()}*/}
                <ChartContent {...chartContentProps}/>
              </Row>
            </Col>
          </Row>
          <Row className={styles["info"]}>
            {/*{this.clusterOther()}*/}
            <ClusterOther {...clusterOtherProps}/>
          </Row>
        </Spin>

      </Row>
    )
  }
}

Monitor.propTypes = {
  monitor: PropTypes.object,
  location: PropTypes.object,
  loading: PropTypes.bool,
  dispatch: PropTypes.func
}

export default connect((state) => {
  return {
    loading: state.loading.models[modelKey],
    monitor: state[modelKey]
  }
})(Monitor)
