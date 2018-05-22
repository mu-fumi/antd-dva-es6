/**
 * Created by wengyian on 2017/9/4.
 */

import Base from 'routes/base'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, Select, message, Tag, Button, Modal,Tooltip } from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon} from 'components'
import {routerRedux, Link} from 'dva/router'
import {classnames,constant,TimeFilter} from 'utils'
import _ from 'lodash'
import * as moment from 'moment'
import styles from './history.less'
import TaskState from './taskState_history'

const {MONITORING_OPTION_STATE} = constant
class History extends Base{

  constructor(props){
    super(props)
    this.state = {
      key: (+ new Date())
    }
    this.setGobackBtn()
    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '节点历史记录', selectedKey: '节点管理node'},
      fire: [Base.DidMount]
    })
    this.push({
      type: 'app/handleCurrentMenu',
      payload: {selectedKey: ''},
      fire: [Base.WillUnmount]
    })

    this.pageBtns = {
      element: () => {
        return <Row>
          <Col className="pageBtn" onClick={this.handleResetFilter}>
            <a href="javascript:;">
              <IconFont type="iconfont-reset"/>重置筛选条件
            </a>
          </Col>
          <Col className="pageBtn" onClick={this.handleReload}>
            <a href="javascript:;">
              <IconFont type="reload"/>刷新
            </a>
          </Col>
        </Row>
      }
    }

    this.push({
      type : `history/initFilter`,
    })

    this.handleReload = this.handleReload.bind(this)
    this.handleResetFilter = this.handleResetFilter.bind(this)
    this.handleCasChange = this.handleCasChange.bind(this)
  }

  componentWillReceiveProps(nextProps){

  }

  handleCasChange(data) {
    const key = ['business_id', 'app_id', 'relate_id-relate_type',]
    let params = {
      business_id: '',
      app_id: '',
      'relate_id-relate_type': '',
    }
    data.forEach((v, i) => {
      params[key[i]] = v
    })
    let relate_id = '', relate_type = ''
    if (params['relate_id-relate_type'] !== '') {
      relate_id = params['relate_id-relate_type'].split('-')[0]
      relate_type = params['relate_id-relate_type'].split('-')[1]
    }
    delete params['relate_id-relate_type']
    params.application_id = params.app_id
    delete params.app_id
    this.props.dispatch({
      type: 'history/handleFilter',
      payload: {
        ...params,
        relate_id,
        relate_type,
      }
    })
  }
  handleResetFilter() {
    this.props.dispatch({
      type: 'history/handleResetFilter'
    })
    this.setState({
      key: (+new Date())
    })
  }
  handleReload(){
    this.props.dispatch({
      type : 'history/handleReload'
    })
    this.setState({
      key: (+ new Date())
    })
  }

  render(){
    const { history, dispatch } = this.props
    const { filter, reload,stackOptions,businessOptions,pickerDefaultValue } = history
    const searchProps = [{
      placeholder : '节点名',
      onSearch : (value) => {
        dispatch({
          type : 'history/handleFilter',
          payload : { keyword : value}
        })
      },
      onChange : (e) => {
        this._keywords = e.target.value
      }
    }]

    const rangePickerProps = [{
      label : '时间',
      props : {
        allowClear: true,
        defaultValuedefaultValue: pickerDefaultValue,
        onChange: (value, dateString) => {
          let time = TimeFilter.toUnix(value)
          dispatch({
            type: 'history/handleFilter',
            payload: {
              time: time
            }
          })
        },
        onOk: (value) => {
          let time = TimeFilter.toUnix(value)
          dispatch({
            type: 'history/handleFilter',
            payload: {
              time: time
            }
          })
        }
      }
    }]
    stackOptions['全部'] = ''
    const selectProps = [{
      label: '所属套件',
      options: stackOptions,
      props: {
        onChange: (value) => {
          dispatch({
            type: 'history/handleFilter',
            payload: {
              stack_id: value
            }
          })
        }
      }
    }, {
      label: '状态',
      options: MONITORING_OPTION_STATE,
      props: {
        onChange: (value) => {
          dispatch({
            type: 'history/handleFilter',
            payload: {
              state: value
            }
          })
        }
      }
    }]
    const cascaderProps = [{
      label: '所属',
      props: {
        onChange: this.handleCasChange,
        length: 3,
        options: businessOptions
      },
    }]
    const filterProps = {
      searchProps,
      rangePickerProps,
      selectProps,
      cascaderProps,
    }

    const dataTableProps = {
      fetch : {
        url : '/nodes/history',
        data : filter
      },
      reload : reload,
      columns: [{
        title: '用户',
        dataIndex: 'user',
      },{
        title: '业务',
        dataIndex: 'business',
      },{
        title: '应用',
        dataIndex: 'app',
      },{
        title: '节点名',
        dataIndex: 'host_name',
      },{
        title: '类型',
        dataIndex: 'type',
      },{
        title: '所属',
        dataIndex: 'belong',
      },{
        title: '所属套件',
        dataIndex: 'stack',
      },{
        title: '节点历史内容',
        dataIndex: 'job_name',
        width : 300,
        render : (text) => {
          if(!text){
            return <span>无</span>
          }else {
            return <span>{text}</span>
          }
        }
      },{
        title: '操作时间',
        dataIndex: 'time',
        sorter : (a, b) => new Date(a.time) - new Date(b.time),
        width : 200
      },{
        title: '状态',
        dataIndex: 'state',
        render : (text, record) => {
          console.log(text)
        /*  let txt = text === 0 ? '运行中' : text === 1 ? '完成' : text === 2 ? '失败' : '超时';
          let className = text === 0 ? 'text-warning' : text === 1 ? 'text-success' : 'text-error'
          let job_id = record.job_history_id;
          // return <TaskState type={text} id={record.job_history_id}/>
          return (
            record.sync !== 1 ?
              (<Tooltip title="同步任务暂无任务详情"><span className={className} style={{cursor:'pointer'}}>
                {txt}
              </span></Tooltip>) :
              (<Tooltip title="异步任务查看任务详情"><span style={{cursor:'pointer'}}>
                 <Link to={`/job/${job_id}`} className={className}>
                   {txt}
                 </Link>
              </span></Tooltip>)
          )*/
          return <TaskState type={text} id={record.job_history_id} sync_val={record.sync} />
        }
      }],
      rowKey : 'id',
      scroll: {x: 1500}
    }

    return (
      <Row className={styles["history"]}>
          <Row className={styles["mgtb-8"]}>
            <Filter key={this.state.key} {...filterProps}/>
          </Row>
          <DataTable {...dataTableProps} />
      </Row>
    )
  }
}

History.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  loading: PropTypes.bool,
  dispatch: PropTypes.func
}

export default connect((state) => {
  return {
    loading : state.loading.models['history'],
    history : state['history']
  }
})(History)

