/**
 * Created by wengyian on 2018/3/26.
 */
import Base from 'routes/base'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, Select, message, Tag, Button, Modal} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon, ProgressBadge} from 'components'
import {routerRedux, Link,} from 'dva/router'
import {classnames, Logger, Gate} from 'utils'
import _ from 'lodash'
import {constant, TimeFilter, disabledDate} from 'utils'
import * as moment from 'moment'
import ReportModal from './modal'
import styles from './index.less'

const confirm = Modal.confirm
const Option = Select.Option
// const modelKey = 'monitor/quickCheck'
const modelKey = 'quickCheck'
const {NODE_TYPE_CHECK} = constant

class Quick extends Base {
  constructor(props) {
    super(props)

    const execGate = Gate.can('exec_health_check_quick')
    const listGate = Gate.can('list_health_check_quick')

    listGate || props.dispatch(routerRedux.push('/exception/403'))

    this.pageBtns = {
      element: () => {
        return <Row>
          { execGate && <Col className="pageBtn" onClick={this.handleReport}>
            <a href="javascript:;" className="text-info">
              <IconFont type="file-text"/>生成报告
            </a>
          </Col>
          }
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

    this.state = {
      key: (+new Date())
    }

    this.push({
      type: `${modelKey}/handleResetFilter`,
      fire: [Base.WillUnmount]
    })

    this.handleReport = this.handleReport.bind(this)
    this.handleResetFilter = this.handleResetFilter.bind(this)
    this.handleFilter = this.handleFilter.bind(this)
    this.handleReload = this.handleReload.bind(this)
    this.setModalVisible = this.setModalVisible.bind(this)
    this.handleModalOk = this.handleModalOk.bind(this)
  }

  handleReload() {
    this.props.dispatch({
      type: `${modelKey}/handleReload`
    })
  }

  handleResetFilter() {
    this.props.dispatch({
      type: `${modelKey}/handleResetFilter`
    })
    this.setState({
      key: (+new Date())
    })
  }

  handleFilter(data) {
    this.props.dispatch({
      type: `${modelKey}/handleFilter`,
      payload: data
    })
  }

  handleReport() {
    this.props.dispatch({
      type: `${modelKey}/setModalVisible`,
      payload: true
    })
  }

  seeReport(record) {
    const url = window.DS.API_URL
    if (record.progress === 1) {
      window.open(`${url}/reports/${record.id}`);
    } else if (record.progress == 0) {
      message.info('生成一键检查报告任务进行中，请稍候查看');
    } else if (record.progress === 2) {
      const { dispatch } = this.props
      dispatch({
        type: `${modelKey}/getReportError`,
        payload: record.id
      })
    } else if (record.progress === 3) {
      message.error('生成一键检查报告任务超时，请重新生成报告');
    }
  }

  setModalVisible(bool) {
    this.props.dispatch({
      type: `${modelKey}/setModalVisible`,
      payload: bool
    })
  }

  handleModalOk(data) {
    const { dispatch } = this.props
    dispatch({
      type: `${modelKey}/generateReport`,
      payload: data
    }).then((res) => {
      if (res.code === 0) {
        Modal.info({
          title: '生成一键检查报告任务已经提交',
          content: '提交成功,本次任务已在后台执行,耗时较长,您稍候可以在任务列表查看进度及结果',
          okText: '知道了',
          onOk: () => {
            dispatch({
              type: `${modelKey}/setModalVisible`,
              payload: false
            })
            dispatch({
              type: `${modelKey}/handleReload`
            })
          }
        })
      } else {
        message.error(res.error || res.msg)
      }
    })
  }

  render() {
    const {quickCheck, dispatch} = this.props
    const {filter, reload, modalVisible, nodes} = quickCheck
    const searchProps = [{
      placeholder: '节点名或主机名',
      onSearch: (value) => {
        dispatch({
          type: `${modelKey}/handleFilter`,
          payload: {
            node_name: value
          }
        })
      }
    }]

    const rangePickerProps = [{
      label: '生成时间',
      props: {
        disabledDate: disabledDate,
        onChange: (value) => {
          // 时间要处理成 2018-03-01 16:08:34,2018-03-09 16:08:34 这样
          let time = value.map(v => TimeFilter.format(v / 1000)).join(',')
          dispatch({
            type: `${modelKey}/handleFilter`,
            payload: {
              publish_range: time
            }
          })
        },
        onOk: (value) => {
          let time = value.map(v => TimeFilter.format(v / 1000)).join(',')
          dispatch({
            type: `${modelKey}/handleFilter`,
            payload: {
              publish_range: time
            }
          })
        }
      }
    }]

    let selectOptions = {'全部': ''}
    NODE_TYPE_CHECK.forEach(v => {
      selectOptions[v] = v
    })

    const selectProps = [{
      label: '节点类型',
      options: selectOptions,
      props: {
        onChange: (value) => {
          dispatch({
            type: `${modelKey}/handleFilter`,
            payload: {
              node_type: value
            }
          })
        }
      }
    }]

    const filterProps = {
      searchProps,
      rangePickerProps,
      selectProps
    }

    const dataTableProps = {
      fetch: {
        url: '/reports',
        data: filter
      },
      columns: [{
        title: '生成时间',
        dataIndex: 'created_at',
      }, {
        title: '节点',
        dataIndex: 'node_name'
      }, {
        title: '节点类型',
        dataIndex: 'node_type',
      }, {
        title: '状态',
        dataIndex: 'progress',
        render: (text) => {
          let t = text == 0 ?
            '生成中' : text == 1 ?
              '完成' : text === 2 ?
                '错误' : '超时'
          let className = text == 0 ?
            'text-warning' : text == 1 ?
              'text-success' : 'text-error'
          return <span className={className}>{t}</span>;
        }
      }, {
        title: '操作',
        render: (text, record) => {
          return (
            <span >
              <a className="text-info"
                href='javascript:void(0);'
                target="_blank"
                onClick={this.seeReport.bind(this, record)}>
                查看
              </a>
            </span>
          );
        }
      }],
      reload: reload,
      rowKey: 'id',
      /*
      dataSource: [{
        id: 1,
        node_type: 'mySql',
        node_name: 'test',
        progress: 0,
        created_at: '111-22-22 11:11:11'
      },{
        id: 2,
        node_type: 'mySql',
        node_name: 'test',
        progress: 1,
        created_at: '111-22-22 11:11:11'
      },{
        id: 3,
        node_type: 'mySql',
        node_name: 'test',
        progress: 2,
        created_at: '111-22-22 11:11:11'
      },{
        id: 4,
        node_type: 'mySql',
        node_name: 'test',
        progress: 3,
        created_at: '111-22-22 11:11:11'
      }]
      */
    }


    const reportModalProps = {
      title: '选择一键检查节点',
      visible: modalVisible,
      nodes: nodes,
      onCancel: () => this.setModalVisible(false),
      onOk: this.handleModalOk
    }

    return (
      <Row className={styles["quick-check"]}>
        <Row className={styles['filter-container']}>
          <Filter key={this.state.key} {...filterProps}/>
        </Row>
        <DataTable {...dataTableProps}/>
        <ReportModal {...reportModalProps}/>
      </Row>
    )
  }
}

Quick.propTypes = {
  quick: PropTypes.object,
  location: PropTypes.object,
  loading: PropTypes.bool,
  dispatch: PropTypes.func
}

export default connect((state) => {
  return {
    loading: state.loading.models[modelKey],
    quickCheck: state[modelKey]
  }
})(Quick)
