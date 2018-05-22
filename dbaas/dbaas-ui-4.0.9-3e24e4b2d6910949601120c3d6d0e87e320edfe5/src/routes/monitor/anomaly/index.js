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
import _ from 'lodash'

const cache = new Cache()
const modelKey = 'monitorAnomaly'
const { ANOMALY_CLASSIFY } = constant

const {MONITORING_OPTION_STATE} = constant
const confirm = Modal.confirm

class Anomaly extends Base {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      key: (+ new Date()),
      id: '',
      listCheck: Gate.can('list_anomaly_classify'),
      executeCheck: Gate.can('exec_anomaly_classify'),
    }
    this.state.listCheck || props.dispatch(routerRedux.push('/exception/403'))  // 没有列表权限则跳转403
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {activeName : '异常分类', selectedKey : '异常分类anomaly-classify'},
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

  handleReload = () => {  // onchange时的值存起来，刷新时读取
    this.props.dispatch({
      type : `${modelKey}/handleReload`
    })
  }

  handleReset = () => {
    this.props.dispatch({
      type: `${modelKey}/handlePublishRange`,  // 接口参数
      payload: []
    })
    this.props.dispatch({
      type: `${modelKey}/handleState`,  // 重置状态
      payload: ''
    })
    this.props.dispatch({
      type : `${modelKey}/handlePickerDefaultValue`,
      payload: []
    })
    this.props.dispatch ({
      type: `${modelKey}/setCurrentPage`,
      payload: 1
    })
    this.setState({
      key: (+ new Date())
    })
  }


  render() {

    const { dispatch, anomaly } = this.props
    const { reload, pickerDefaultValue, publishRange, currentPage,progress } = anomaly
    console.log('progress',progress)

    const rangePickerProps = [
      {
        label: '生成时间',
        props: {
          allowClear: true,
          defaultValue: pickerDefaultValue,
          format: "YYYY-MM-DD",
          disabledDate: disabledDate,
          onChange(value, dataString) {
            // console.log(value, dataString)
            const publishRange = dataString.map(v => v.split(' ')[0])
            dispatch({
              type: `${modelKey}/handlePublishRange`,  // 接口参数
              payload: publishRange
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

    const selectProps = [{
      label: '状态',
      options: MONITORING_OPTION_STATE,
      props: {
        onChange: (value) => {
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
      rangePickerProps,
      selectProps,
    }

    const viewReport = (record, download, e) => {
      e.preventDefault()
      console.log(record)
      const url = window.DS.API_URL
      let text = download ? '下载' : '查看'
      if (record.progress == 1) {
        window.open(`${url}/reports/${record.id}${download ? '/download' : ''}`);
      } else if (record.progress == 0) {
        message.info(`生成异常分类报告任务进行中，请稍候${text}`);
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
        message.error('生成异常分类报告任务超时，请重新生成报告');
      }
    }

    const fetchDataTableProps = {
      // bordered: true,
      fetch: {
        url: '/reports',
        data: {
          publish_range: publishRange,
          report_type: ANOMALY_CLASSIFY,
          progress:progress
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
          title: '巡检时间', dataIndex: 'inspected_at', render: (text) => {
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
                <span>
                    <span className = "ant-divider"/>
                    <a href="javascript:void(0);" className="text-info" onClick = { viewReport.bind(this, record, true) }>
                    下载
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

    const onOk = (data) => {
      dispatch({
        type: `${modelKey}/generateReport`,
        payload: { ...data, report_type: ANOMALY_CLASSIFY }
      })
      this.setState({
        visible: false,
      })
    }

    const onCancel = () => {
      this.setState({
        visible: false,
      })
    }

    const reportModalProps = {
      visible: this.state.visible,
      onOk: onOk,
      onCancel: onCancel,
    }

    return (
      <Row className={styles['anomaly']}>
        <Row className={styles['filter-container']}>
          <Filter key={this.state.key} {...filterProps} />
        </Row>
        <DataTable {...fetchDataTableProps} />
        <ReportModal {...reportModalProps} />
      </Row>
    )
  }
}

Anomaly.propTypes = {
  anomaly: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=>{
  return {
    anomaly: state[modelKey],
  }
})(Anomaly)
