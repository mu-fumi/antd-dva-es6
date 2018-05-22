/**
 * Created by wengyian on 2018/3/27.
 */
/**
 * Created by wengyian on 2018/3/26.
 */
import Base from 'routes/base'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, Select, message, Tag, Button, Modal} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon, ProgressBadge} from 'components'
import {routerRedux, Link,} from 'dva/router'
import {classnames, Logger, Gate, disabledDate} from 'utils'
import _ from 'lodash'
import {constant, TimeFilter} from 'utils'
import * as moment from 'moment'
import ReportModal from './modal'
import SettingModal from './settingModal'
import styles from './index.less'
import queryString from 'query-string'

const { MONITORING_OPTION_STATE} = constant
const confirm = Modal.confirm
const Option = Select.Option
const modelKey = 'fullCheck'

class Full extends Base {
  constructor(props) {
    super(props)

    const execGate = Gate.can('exec_health_check_full')
    const listGate = Gate.can('list_health_check_full')
    const settingGate = Gate.can('report_health_setting')

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
          { settingGate && <Col className="pageBtn" onClick={() => this.setSettingModalVisible(true)}>
            <a href="javascript:;">
              <IconFont type="setting"/>配置信息
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
      key: (+new Date()),
      settingModalKey: (+new Date()),
    }

    this.push({
      type: `${modelKey}/handleResetFilter`,
      fire: [Base.WillUnmount]
    })
    this.push({
      type: `${modelKey}/resetState`,
      fire: [Base.WillUnmount]
    })
    this.handleReport = this.handleReport.bind(this)
    this.handleResetFilter = this.handleResetFilter.bind(this)
    this.handleFilter = this.handleFilter.bind(this)
    this.handleReload = this.handleReload.bind(this)
    this.setModalVisible = this.setModalVisible.bind(this)
    this.handleModalOk = this.handleModalOk.bind(this)
    this.setSettingModalVisible = this.setSettingModalVisible.bind(this)
    this.handleSettingModalOk = this.handleSettingModalOk.bind(this)
    this.handleCasChange = this.handleCasChange.bind(this)
    this.clearQuery = this.clearQuery.bind(this)
    this.getAppId = this.getAppId.bind(this)
    this.getSetVal = this.getSetVal.bind(this)
    this.getApps = this.getApps.bind(this)
    this.getRelateList = this.getRelateList.bind(this)
    this.getClusters = this.getClusters.bind(this)
    this.clearRelate = this.clearRelate.bind(this)

  }

  clearRelate(){
    this.props.dispatch({
      type : `${modelKey}/clearRelate`
    })
  }
  clearQuery() {
    const {location} = this.props
    const {search, pathname} = location

    const query = queryString.parse(search)
    if (Object.keys(query).length) {
      this.props.dispatch(
        routerRedux.replace(pathname)
      )
      this.props.dispatch({
        type: `${modelKey}/clearQuery`,
        payload: query
      })
    }
  }
  getClusters(data) {
    this.props.dispatch({
      type: `${modelKey}/getClusters`,
      payload: data
    })
  }
  getApps(data) {
    this.props.dispatch({
      type: `${modelKey}/getApps`,
      payload: data
    })
  }
  getRelateList(data){
    this.props.dispatch({
      type : `${modelKey}/getRelateList`,
      payload : data
    })
  }
 /* getNodeId(nodeId) {
    this.props.dispatch({
      type: `${modelKey}/getApps`,
      payload: nodeId
    })
  }*/
  getAppId(AppId) {
    this.props.dispatch({
      type: `${modelKey}/getClusters`,
      payload: AppId
    })
  }
  // 所属
  getSetVal(setval) {
    if(setval === '0'){
      this.props.dispatch({
        type: `${modelKey}/getClusters`,
        payload: setval
      })
    }else {
      this.props.dispatch({
        type: `${modelKey}/getSets`,
        payload: setval
      })
    }

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
      message.info('生成实时巡检报告任务进行中，请稍候查看');
    } else if (record.progress === 2) {
      const { dispatch } = this.props
      dispatch({
        type: `${modelKey}/getReportError`,
        payload: record.id
      })
    } else if (record.progress === 3) {
      message.error('生成实时巡检报告任务超时，请重新生成报告');
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
          title: '生成实时巡检报告任务已经提交',
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

  handleSettingModalOk(data) {
    this.props.dispatch({
      type: `${modelKey}/handleSettingModal`,
      payload: {
        method: 'post',
        data: data
      }
    }).then(() => {
      this.setState({
        settingModalKey: (+ new Date())
      })
    })
  }

  setSettingModalVisible(bool) {
    this.props.dispatch({
      type: `${modelKey}/setSettingModalVisible`,
      payload: bool
    })
  }
  handleCasChange(data) {
    this.clearQuery()
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
      type: `${modelKey}/handleFilter`,
      payload: {
        ...params,
        relate_id,
        relate_type,
      }
    })
  }

  render() {
    const {fullCheck, dispatch} = this.props
    const {filter, reload, modalVisible,stackOptions, businessOptions,
      settingModalVisible, grayList, settingModalValue, apps,selectedBaseInfo,relateList,nodes,isShow } = fullCheck

    const searchProps = [{
      placeholder: '节点名、所属、所属套件',
      onSearch: (value) => {
        dispatch({
          type: `${modelKey}/handleFilter`,
          payload: {
            keyword: value
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

    const cascaderProps = [{
      label: '所属',
      props: {
        onChange: this.handleCasChange,
        length: 3,
        options: businessOptions
      },
    }]


    const selectProps = [{
      label: '所属套件',
      options: stackOptions,
      props: {
        onChange: (value) => {
          this.clearQuery()
          dispatch({
            type: `${modelKey}/handleFilter`,
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
          this.clearQuery()
          dispatch({
            type: `${modelKey}/handleFilter`,
            payload: {
              progress: value
            }
          })
        }
      }
    }]

    const filterProps = {
      searchProps,
      rangePickerProps,
      cascaderProps,
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
        title: '类型',
        dataIndex: 'report_type',
        render: (text) => {
          return text === 'deep' ? '深层次' : '基础'
        }
      },{
        title: '所属',
        dataIndex: 'belongs_to'
      },
        {
          title: '所属套件',
          dataIndex: 'stack_name'
        },{
        title: '状态',
        dataIndex: 'progress',
        render: (text) => {
          let t = text == 0 ?
            '运行中' : text == 1 ?
              '完成' : text === 2 ?
                '失败' : '超时'
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
    }
    const reportModalProps = {
      title: '生成实时诊断',
      visible: modalVisible,
      nodes: businessOptions,
      appNodes:apps,
      getApps: this.getApps,
      getClusters: this.getClusters,
      getRelateList : this.getRelateList,
      selectedBaseInfo,
      relateList,
      node:nodes,
      onCancel: () => this.setModalVisible(false),
      getRelate:(id,relateType) => {
        dispatch({
          type: `${modelKey}/getNodes`,
          payload: {
            relate_id: id,
            relate_type: relateType
          }
        })
      },
      onOk: this.handleModalOk,

    }
    const settingModalProps = {
      visible: settingModalVisible,
      onCancel: () => this.setSettingModalVisible(false),
      onOk: this.handleSettingModalOk,
      selectedBaseInfo,
      businesses:businessOptions,
      apps:apps,
      grayList,
      isShow,
      relateList,
      getApps: this.getApps,
      getRelateList : this.getRelateList,
      settingModalValue,
      clearRelate : this.clearRelate,
      key: this.state.settingModalKey,
     /* getGrayList:() => {
        dispatch({
          type: `${modelKey}/getGrayList`,
        })
      },*/
    }

    return (
      <Row className={styles["full-check"]}>
        <Row className={styles['filter-container']}>
          <Filter key={this.state.key} {...filterProps}/>
        </Row>
        <DataTable {...dataTableProps}/>
        <ReportModal {...reportModalProps}/>
        <SettingModal {...settingModalProps}/>
      </Row>
    )
  }
}

Full.propTypes = {
  fullCheck: PropTypes.object,
  location: PropTypes.object,
  loading: PropTypes.bool,
  dispatch: PropTypes.func
}

export default connect((state) => {
  return {
    loading: state.loading.models[modelKey],
    fullCheck: state[modelKey]
  }
})(Full)
