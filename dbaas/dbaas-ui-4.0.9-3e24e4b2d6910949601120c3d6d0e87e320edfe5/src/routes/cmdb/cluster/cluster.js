/**
 * Created by zhangmm on 2017/9/2.
 */
import Base from 'routes/base'
import React from 'react'
import {connect} from 'dva'
import PropTypes from 'prop-types'
import styles from './cluster.less'
import {DataTable, Filter, IconFont, StateIcon, NodeBadge} from 'components'
import {Link, routerRedux} from 'dva/router'
import {Row, Col, Modal, Tag, Tooltip, Button, Badge} from 'antd'
import {constant, classnames} from 'utils'
import Json from 'utils/json'
import CapProgress from './capProgress'
import Func from './func'
const confirm = Modal.confirm
const {CLUSTER_STATE, CLUSTER_STATE_OPTIONS, RELATE_TYPE} = constant

import queryString from 'query-string'


class Cluster extends Base {
  constructor(props) {
    super(props)
    // this.handleClusterDelete = this.handleClusterDelete.bind(this)
    this.handleClusterReload = this.handleClusterReload.bind(this)
    this.handleOffLine = this.handleOffLine.bind(this)
    this.handleCasChange = this.handleCasChange.bind(this)
    this.updateStatus = this.updateStatus.bind(this)
    this.clearQuery = this.clearQuery.bind(this)

    this.pageBtns = {
      element: () => {
        return (
          <Row>
            <Col className="pageBtn">
              <Link to="/deploy/create?tag=cluster" className="text-info">
                <IconFont type="plus"/>新建集群
              </Link>
            </Col>
            <Col className="pageBtn">
              <Link to="/configs/modify" target="_blank" className="text-info">
                <IconFont type="iconfont-changeconfig"/>配置变更
              </Link>
            </Col>
            <Col className="pageBtn" onClick={this.handleOffLine}>
              <a href="javascript:void(0);" className="text-info">
                <IconFont type="iconfont-xiaxian"/>下线
              </a>
            </Col>
            <Col className="pageBtn" onClick={this.handleClusterReload}>
              <a href="javascript:void(0);">
                <IconFont type="reload"/>刷新
              </a>
            </Col>
          </Row>)
      }
    }

    this.push({
      type: 'cluster/resetFilter',
      fire: [Base.WillUnmount]
    })

    this.push({
      type : 'cluster/resetDefaultBelongs',
      fire: [Base.WillUnmount]
    })
  }

  // handleClusterDelete(value) {
  //   confirm({
  //     title: '提示',
  //     content: `确定要删除${value.name}集群吗？`,
  //     onOk: () => {
  //       this.props.dispatch({
  //         type: `cluster/deleteCluster`,
  //         payload: {
  //           id: value.id
  //         }
  //       })
  //     }
  //   })
  // }

  handleOffLine() {
    const {dispatch, cluster} = this.props
    const {selectedIds} = cluster
    // browserHistory.push(`/offline/types?tag=cluster&ids=${selectedIds.join(',')}`)
    window.open(`/offline/types?tag=cluster&ids=${selectedIds.join(',')}`)
    // dispatch(
    //   routerRedux.push({
    //     pathname : '/offline/types',
    //     query : {
    //       tag : 'cluster',
    //       ids : selectedIds.join(',')
    //     }
    //   })
    // )
  }

  handleClusterReload() {
    if (this._keywords === undefined || this._keywords === null) {
      this._keywords = ''
    }
    this.clearQuery()
    this.props.dispatch({
      type: 'cluster/handleFilter',
      payload: {keyword: this._keywords}
    })
    this.props.dispatch({
      type: `cluster/handleReload`
    })
  }

  handleHoverNode(id) {
    this.props.dispatch({
      type: 'cluster/getNodeStatus',
      payload: id
    })
  }

  onSelect(record, selected, selectedRows) {
    const {dispatch} = this.props
    dispatch({
      type: 'cluster/setSelectedIds',
      payload: {
        rows: record,
        bool: selected,
        radio: true
      }
    })
  }

  onSelectAll(selected, selectedRows, changeRows) {
    const {dispatch} = this.props
    dispatch({
      type: 'cluster/setSelectedIds',
      payload: {
        rows: changeRows,
        bool: selected,
        radio: false
      }
    })
  }

  handleCasChange(data) {
    const key = ['business_id', 'app_id']
    let params = {
      business_id: '',
      app_id: '',
    }
    data.forEach((v, i) => {
      params[key[i]] = v
    })
    this.clearQuery()
    this.props.dispatch({
      type: 'cluster/handleFilter',
      payload: {...params}
    })
  }

  // 进度条
  progressNum = (num) => {
    let number = Number(num)
    return (
      <Row>
        <Progress percent={number} showInfo={false} className={styles['progress-bar']}/>
        <span className='progress-number'>{number}%</span>
      </Row>
    )
  }

  updateStatus(id) {
    this.props.dispatch({
      type: 'cluster/updateStatus',
      payload: id
    })
  }

  /********  20171220 获取url 参数筛选*********/
  // 清空 filter 中url 带过来的参数
  clearQuery() {
    const {location} = this.props
    const {search, pathname} = location

    const query = queryString.parse(search)
    if (Object.keys(query).length) {
      this.props.dispatch(
        routerRedux.replace(pathname)
      )
      this.props.dispatch({
        type: 'cluster/clearQuery',
        payload: query
      })
    }
  }

  render() {
    const {location, dispatch, cluster} = this.props
    const {
      filter, placeholder, reload, businessOptions,
      selectedIds, relateType, defaultBelongs, belongsOptions
    } = cluster

    const _this = this
    const searchProps = [{
      placeholder,
      onSearch(value) {
        _this.clearQuery()
        dispatch({
          type: `cluster/handleFilter`,
          payload: {
            keyword: value
          },
        })
      },
      onChange: (e) => {
        this._keywords = e.target.value
      }
    }]

    const cascaderProps = [{
      label: '所属',
      props: {
        onChange: this.handleCasChange,
        length: 2,
        options: belongsOptions,
        defaultValue : defaultBelongs,
      },
    }]


    const selectProps = [
      //   {
      //   label : '业务',
      //   options : businessOptions,
      //   props : {
      //     onChange : (value) => {
      //       dispatch({
      //         type : 'cluster/handleFilter',
      //         payload : {
      //           business_id : value
      //         }
      //       })
      //     }
      //   }
      // }, {
      //   label : '应用',
      //   options : appOptions,
      //   props : {
      //     onChange : (value) => {
      //       dispatch({
      //         type : 'cluster/handleFilter',
      //         payload : {
      //           app_id : value
      //         }
      //       })
      //     }
      //   }
      // },
      {
        label: '状态',
        options: CLUSTER_STATE_OPTIONS,
        props: {
          onChange: (value) => {
            _this.clearQuery()
            dispatch({
              type: 'cluster/handleFilter',
              payload: {
                status: value
              }
            })
          }
        }
      }]

    const filterProps = {
      searchProps,
      cascaderProps,
      selectProps
    }

    const belongTitle = <Tooltip title="业务 - 应用">
      所属 <IconFont className="text-info" type="question-circle"/>
    </Tooltip>
    const cpuTitle = <Tooltip>
      CPU 利用率
      {/*<IconFont className="text-info" type="question-circle"/>*/}
    </Tooltip>
    const memoryTitle = <Tooltip title="内存占用量/内存总量">
      内存占用量 <IconFont className="text-info" type="question-circle"/>
    </Tooltip>

    let columns = [{
      title: '名称',
      dataIndex: 'cluster_name',
      render: (text, record) => {
        // let nameHtml = <Tooltip title={text}><Row className={styles['name']}>{text}</Row></Tooltip>
        // 使用 tooltip 得处理 内容超出tooltip 的问题
        // const name = text.length > 50 ? nameHtml : text
        return <Row className={styles['name-container']}>
          <Link to={`/cmdb/cluster/${record.id}`}>{text}</Link>
          &nbsp;
          <Link to={`/graphs?cluster_id=${record.id}`} target="_blank">
            <Tooltip title="查看监控">
              <IconFont type="iconfont-trend"/>
            </Tooltip>
          </Link>
        </Row>
      }
    }, {
      title: belongTitle,
      dataIndex: 'belong',
    }, {
      title: '状态',
      dataIndex: 'run_status',
      className: 'text-center',
      render: (text, record) => {
        return <StateIcon type={text}/>
      }
    }, {
      title: '节点状态',
      dataIndex: 'nodes_status',
      className: 'text-center',
      render: (text, record) => {
        return <NodeBadge type={text} node_list={record.node_list}/>
      }
    }, {
      title: '节点数量',
      dataIndex: 'nodes_count',
      className: 'text-center',
      render: (text, record) => {
        // todo 跳转到节点管理 并筛选出此集群
        return <Link to={`/nodes?relate_id=${record.id}&relate_type=0`} target="_blank">{text}</Link>
      }
    }, {
      title: cpuTitle,
      dataIndex: 'cpu_avg',
      render: (text, record) => {
        // return <CapProgress percent={text}/>

        let avg = text
        let max = record.cpu_max
        const avgClass = Func.getColor(parseInt(avg))
        const maxClass = Func.getColor(parseInt(max))
        const title = record.cpu_max_node
        return <span >
            <span>平均：<span className={avgClass}>{avg}</span></span>
            <span>，</span>
            <Tooltip title={title}><span>最大： <span className={maxClass}>{max}</span></span></Tooltip>
          </span>
      }
    }, {
      title: memoryTitle,
      dataIndex: 'mem_used',
      render: (text, record) => {
        // return <CapProgress percent={text}/>

        if (text === null || text === undefined) {
          return ''
        }
        const used = text
        let usedObj = Func.splitMem(text)
        // const max = record.memory_max
        const total = record.mem_total
        let totalObj = Func.splitMem(total)
        if (usedObj.unit !== totalObj.unit) {
          usedObj = Func.convertToG(usedObj)
          totalObj = Func.convertToG(totalObj)
        }
        // const avgClass = Func.getColor(avgObj.num / totalObj.num * 100)
        // const maxClass = Func.getColor(maxObj.num / totalObj.num * 100)

        return <CapProgress used={usedObj} total={totalObj}/>

        // return (
        //   <Row>
        //     <span>avg：<span className={avgClass}>{avg}</span></span>
        //     <span> ，</span>
        //     <span>max：<span className={maxClass}>{max}</span></span>
        //   </Row>
        // )
      }
    }, {
      title: '架构',
      dataIndex: 'arch'
    }, {
      title: '版本',
      dataIndex: 'version'
    }, {
      title: '上次更新时间',
      dataIndex: 'updated_status_at',
      render: (text, record) => {
        const need_update = record.need_update === 1 ? true : false
        let time = record.message
        const title = time ? `节点状态大约已有${time}未上报，请点击按钮来更新` : ''
        return <Row>
          {text}
          {
            need_update ? <Tooltip title={title}>
              <span
                onClick={() => this.updateStatus(record.id)}
                style={{cursor: 'pointer', marginLeft: '4px', verticalAlign: 'text-bottom'}}
              >
                 <IconFont type="iconfont-shujutongbu" className="text-info"/>
              </span>
            </Tooltip>
              : ''
          }
        </Row>
      }
    }]


    const tableProps = {
      fetch: {
        url: '/deploy/cluster/list',
        data: filter
      },
      columns: columns,
      reload: reload,
      rowSelection: {
        onSelect: this.onSelect.bind(this),
        onSelectAll: this.onSelectAll.bind(this),
        selectedRowKeys: selectedIds
      },
      rowKey: 'id',
    }

    return (
      <Row className={styles.cluster}>
        <Row className="inner-cont">
          <Row className="mgrb">
            <Filter {...filterProps} />
          </Row>
          <DataTable {...tableProps} />
        </Row>
      </Row>
    )
  }
}

Cluster.propTypes = {
  cluster: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    cluster: state['cluster'],
    loading: state.loading.effects
  }
}

export default connect(mapStateToProps)(Cluster)
