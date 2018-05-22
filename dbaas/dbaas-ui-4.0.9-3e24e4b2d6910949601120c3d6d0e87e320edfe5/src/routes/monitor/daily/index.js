/**
 *
 * @copyright(c) 2017
 * @created by lizzy
 * @package dbaas-ui
 * @version :  2017-08-22 10:41 $
 */

import Base from 'routes/base'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Modal, Badge, Tooltip, Icon, message } from 'antd'
import styles from './index.less'
import { DataTable, Layout, Filter, ProgressIcon, IconFont } from 'components'
import { Link, routerRedux } from 'dva/router'
import { constant, classnames, Cache, Gate, disabledDate } from 'utils'
import ReportModal from './ReportModal'
import SettingModal from '../full/settingModal'
import _ from 'lodash'
import queryString from 'query-string'

const cache = new Cache()
const modelKey = 'monitorDaily'
const { DAILY_CHECK,MONITORING_OPTION_STATE } = constant

const confirm = Modal.confirm

class Daily extends Base {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      key: (+ new Date()),
      id: '',
      listCheck: Gate.can('list_daily_check'),
      executeCheck: Gate.can('exec_daily_check'),
      executeSetting: Gate.can('report_daily_setting'),
      settingModalVisible: false,
      settingModalKey: (+ new Date())
    }
    this.state.listCheck || props.dispatch(routerRedux.push('/exception/403'))  // 没有列表权限则跳转403
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {activeName : '巡检日报', selectedKey : '巡检日报daily-check'},
      defer : true,
      fire: [Base.DidMount],
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire: [Base.WillUnmount],
    })
    this.pageBtns = {
      element: () => {
        return <Row>
          <Col className="pageBtn" onClick={this.showModal} style={{display: this.state.executeCheck ? '' : 'none'}}>
            <a href="javascript:void(0);" className="text-info">
              <IconFont type="plus"/>生成报告
            </a>
          </Col>
          <Col className="pageBtn" onClick={this.handleSettingModal} style={{display: this.state.executeSetting ? '' : 'none'}}>
            <a href="javascript:void(0);">
              <IconFont type="setting"/>配置信息
            </a>
          </Col>
          <Col className="pageBtn" onClick={this.handleReset}>
            <a href="javascript:void(0);">
              <IconFont type="iconfont-reset"/>重置筛选条件
            </a>
          </Col>
          <Col className="pageBtn" onClick={this.handleReload}>
            <a href="javascript:void(0);">
              <IconFont type="reload"/>刷新
            </a>
          </Col>
        </Row>
      }
    }
    this.showModal = this.showModal.bind(this)
    this.handleReload = this.handleReload.bind(this)
    this.handleSettingModal = this.handleSettingModal.bind(this)
    this.handleCasChange = this.handleCasChange.bind(this)
    this.clearQuery = this.clearQuery.bind(this)
    this.getApps = this.getApps.bind(this)
    this.getRelateList = this.getRelateList.bind(this)
  }
  getRelateList(data){
    this.props.dispatch({
      type : `${modelKey}/getRelateList`,
      payload : data
    })
  }
  getApps(data) {
    this.props.dispatch({
      type: `${modelKey}/getApps`,
      payload: data
    })
  }
  componentWillUnmount () {
    super.componentWillUnmount()
    this.handleReset()
  }

  showModal = () => {
    this.setState({
      visible: true
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
  handleReload = () => {  // onchange时的值存起来，刷新时读取
    this.props.dispatch({
      type : `${modelKey}/handleReload`
    })
  }

  handleReset = () => {
    this.props.dispatch({
      type : `${modelKey}/resetFilter`
    })
    this.props.dispatch({
      type : `${modelKey}/handlePickerDefaultValue`, // 重置时间选择器
      payload: []
    })
    this.props.dispatch ({  // 切换页面时保持分页
      type: `${modelKey}/setCurrentPage`,
      payload: 1
    })
    this.setState({
      key: (+ new Date())
    })
  }

  handleSettingModal = () => {
    this.setState({
      settingModalVisible: true
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

    const { dispatch, daily } = this.props
    const { reload, pickerDefaultValue, publishRange, currentPage,
      instances, grayList, settingModalValue,businessOptions,
      stackOptions,selectedBaseInfo,apps,relateList,nodes,
      progress,stack_id,relate_id,app_id,business_id,keyword
    } = daily
    // console.log(instances)
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
    const rangePickerProps = [
      {
        label: '生成时间',
        props: {
          allowClear: true,
          defaultValuedefaultValue: pickerDefaultValue,
          // format: "YYYY-MM-DD",
          disabledDate: disabledDate,
          onChange(value, dataString) {
            console.log(value, dataString)
            dispatch({
              type: `${modelKey}/handlePublishRange`,  // 接口参数
              payload: dataString
            })
            dispatch({
              type: `${modelKey}/handlePickerDefaultValue`,  // picker的defaultValue，便于跳转别的页面然后从别的页面返回本页时保留筛选条件
              payload: value
            })
            dispatch ({
              type: `${modelKey}/setCurrentPage`,
              payload: 1
            })
          }
        }
      }
    ]

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
          //this.clearQuery()
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
      selectProps,
    }

    const viewReport = (record) => {
      const url = window.DS.API_URL
      if (record.progress == 1) {
        window.open(`${url}/reports/${record.id}`);
      } else if (record.progress == 0) {
        message.info('生成巡检日报报告任务进行中，请稍候查看');
      } else if (record.progress == 2) {
        this.props.dispatch({
          type: `${modelKey}/getReportError`,
          payload: record.id
        }).then(res => {
          // console.log(res)
          if (res && res.code === 0) {
            let msg = ''
            let id = res.data.link;
            msg = res.data.error_info;
            let path = '/job/' + id
            Modal.info({
              title: '错误原因',
              content: <div>
                {msg}。
                <br/>
                <a className="text-info" href={path} target="_blank">查看详情</a> {/*此处不是路由上下文，不能使用link*/}
              </div>
            })
          }
        })
      } else if (record.progress == 3) {
        message.error('生成巡检日报报告任务超时，请重新生成报告');
      }
    }

    const fetchDataTableProps = {
      // bordered: true,
      fetch: {
        url: '/reports',
        data: {
          publish_range: publishRange,
          progress: progress,
          stack_id:stack_id,
          report_type: DAILY_CHECK,
          relate_id:relate_id,
          business_id:business_id,
          app_id:app_id,
          keyword:keyword
        }
      },
      columns: [
        {
          title: '生成时间', dataIndex: 'created_at', render: (text) => {
          if (!text) {
            return <span>无</span>
          }
          return <span>{text}</span>
        }},
        {
          title: '节点', dataIndex: 'node_name', render: (text) => {
          if (!text) {
            return <span>无</span>
          }
          return <span>{text}</span>
        }},
        {
          title: '所属', dataIndex: 'belongs_to', render: (text) => {
          if (!text) {
            return <span>无</span>
          }
          return <span>{text}</span>
        }},
        {
          title: '所属套件', dataIndex: 'stack_name', render: (text) => {
          if (!text) {
            return <span>无</span>
          }
          return <span>{text}</span>
        }},
        {
          title: '状态',
          dataIndex: 'progress',
          render: (text) => {
            let t = text == 0 ? '生成中' : text == 1 ? '完成' : text === 2 ? '错误' : '超时';
            let className = text == 0 ? 'text-warning' : text == 1 ? 'text-success' : text === 2 ? 'text-error' : 'text-deep-warning';
            return <span className = { className } > { t } </span>;
          }
        },
        {
          title: '操作',
          dataIndex: '',
          render: (text, record) => {
            return (
              <span >
                <span>
                    <a href="javascript:void(0);" className="text-info" onClick = { viewReport.bind(this, record, false) }>
                    查看
                    </a>
                </span>
            </span>
            );
          }
        }
      ],
      rowKey: 'id',
      reload: reload,
      setCurrentPage: (currentPage) => {
        dispatch ({
          type: `${modelKey}/setCurrentPage`,
          payload: currentPage
        })
      },
      currentPage: currentPage
    }

    const onReportModalOk = (data) => {
      dispatch({
        type: `${modelKey}/generateReport`,
        payload: data
      })
      this.setState({
        visible: false,
      })
    }

    const onrReportModalCancel = () => {
      this.setState({
        visible: false,
      })
    }

    const reportModalProps = {
      visible: this.state.visible,
      selectedBaseInfo,
      businesses:businessOptions,
      apps,
      instances,
      relateList,
      nodes,
      getApps: this.getApps,
      getRelateList : this.getRelateList,
      onOk: onReportModalOk,
      onCancel: onrReportModalCancel,
      getNodes: (id,relateType) => {
          dispatch({
            type: `${modelKey}/getNodes`,
            payload: {
              relate_id: id,
              relate_type: relateType
            }
          })
      }
    }

    const onSettingModalOk = (data) => {
      this.props.dispatch({
        type: `${modelKey}/handleSettingModal`,
        payload: {
          method: 'post',
          data: data
        }
      }).then(() => {
        this.setState({
          settingModalKey: (+ new Date()),
          settingModalVisible: false
        })
      })
    }

    const onSettingModalCancel = () => {
      this.setState({
        settingModalVisible: false
      })
    }

    const settingModalProps = {
      visible: this.state.settingModalVisible,
      onCancel: onSettingModalCancel,
      onOk: onSettingModalOk,
      selectedBaseInfo,
      businesses:businessOptions,
      apps,
      relateList,
      grayList,
      settingModalValue,
      getApps: this.getApps,
      getRelateList : this.getRelateList,
      getGrayList:() => {
        dispatch({
          type: `${modelKey}/getGrayList`,
        })
      },
      key: this.state.settingModalKey
    }


    return (
      <Row className={styles['daily']}>
        <Row className={styles['filter-container']}>
          <Filter key={this.state.key} {...filterProps} />
        </Row>
        <DataTable {...fetchDataTableProps} />
        <ReportModal {...reportModalProps} />
        <SettingModal {...settingModalProps} />
      </Row>
    )
  }
}

Daily.propTypes = {
  daily: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=>{
  return {
    daily: state[modelKey],
  }
})(Daily)
