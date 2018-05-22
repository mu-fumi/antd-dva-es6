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
import { Row, Col, Modal, Badge, Tooltip, Icon, message,Popover,Menu } from 'antd'
import styles from './index.less'
import { DataTable, Layout, Filter, ProgressIcon, IconFont } from 'components'
import { Link, routerRedux } from 'dva/router'
import { constant, classnames, Cache, Gate, disabledDate } from 'utils'
import ReportModal from './ReportModal'

const cache = new Cache()
const modelKey = 'monitorFestival'
const { FESTIVAL_CHECK,MONITORING_OPTION_STATE } = constant

const confirm = Modal.confirm

class Festival extends Base {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      key: (+ new Date()),
      id: '',
      listCheck: Gate.can('list_festival_check'),
      executeCheck: Gate.can('exec_festival_check'),
      retryCheck: Gate.can('retry_festival_check'),
    }
    this.state.listCheck || props.dispatch(routerRedux.push('/exception/403'))  // 没有列表权限则跳转403
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {activeName : '节前巡检', selectedKey : '节前巡检festival-check'},
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
    this.getCluster = this.getCluster.bind(this)
    this.getInstance = this.getInstance.bind(this)
    this.getSet = this.getSet.bind(this)
    this.getApps = this.getApps.bind(this)
    this.getRelateList = this.getRelateList.bind(this)
  }

  componentWillUnmount () {
    super.componentWillUnmount()
    this.handleReset()
  }
  getCluster() {
    this.props.dispatch({
      type : `${modelKey}/getCluster`,
    })
  }
  getInstance() {
    this.props.dispatch({
      type : `${modelKey}/getInstance`,
    })
  }
  getRelateList(data){
    this.props.dispatch({
      type : `${modelKey}/getRelateList`,
      payload : data
    })
  }
  getSet() {
    this.props.dispatch({
      type : `${modelKey}/getSet`,
    })
  }
  getApps(data) {
    this.props.dispatch({
      type: `${modelKey}/getApps`,
      payload: data
    })
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
      type : `${modelKey}/handlePublishRange`, // model层的值
      payload: []
    })
    this.props.dispatch({
      type: `${modelKey}/handleState`,  // 重置状态
      payload: ''
    })
    this.props.dispatch({
      type : `${modelKey}/handlePickerDefaultValue`, // 重置和切换页面回来的默认值
      payload: []
    })
    this.props.dispatch ({  // 切换页面时保持分页
      type: `${modelKey}/setCurrentPage`,
      payload: 1
    })
    this.setState({  // 更新key才能重新读取defaultvalue值
      key: (+ new Date())
    })
  }


  render() {

    const { dispatch, festival } = this.props
    const { reload, pickerDefaultValue, publishRange, currentPage,progress,clusters,sets,instances
      ,businessOptions,apps,selectedBaseInfo} = festival

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
    };

    const showProgressContent = (record,type) => {
        if(type === 'finish') {
          return record.total_list.length > 3
            ? (<Menu className={styles['items']}>
              {
                record.total_list.map( (data,index) => {
                  return (
                    <Menu.Item key={index} className={styles['items-item']}>
                     <span>
                       <span>{data}</span>
                     </span>
                    </Menu.Item>
                  )
                })
              }
            </Menu>)
            : (<Menu className={styles['items-1']}>
              {
                record.total_list.map( (data,index) => {
                  return (
                    <Menu.Item key={index} className={styles['items-item']}>
                     <span>
                       <span>{data}</span>
                     </span>
                    </Menu.Item>
                  )
                })
              }
            </Menu>);
        } else if(type === 'unfinish') {
         return record.unfinish_list.length === 0
           ? (<div>没有未完成任务</div>)
            : (<Menu className={styles['items']}>
                 {
                   record.unfinish_list.map( (data,index) => {
                     return (
                       <Menu.Item key={index} className={styles['items-item']}>
                                  <span>
                                    <span>{data}</span>
                                  </span>
                       </Menu.Item>
                     );
                   })
                 }
               </Menu>);
        }

    }

    const viewReport = (record, download, e) => {
      e.preventDefault();

      const url = window.DS.API_URL;
      let text = download ? '下载' : '查看';
      if (record.progress == 1) {
        window.open(`${url}reports/${record.id}${download ? '/download' : ''}`);
      } else if (record.progress == 0) {
        message.info(`生成节前巡检报告任务进行中，请稍候${text}`);
      } else if (record.progress == 2) {
        Modal.info({
          title: '错误原因',
          content:
            <span>
              节前巡检报告生成失败!
            </span>
        });

      } else if (record.progress == 3) {
        message.error('生成节前巡检报告任务超时，请重新生成报告');
      }
    }

    const retryReport = (record) => {
      Modal.confirm({
        title: '提示',
        content: '确定要重新生成节前巡检报告吗？',
        onOk: () => {
          dispatch({
            type: `${modelKey}/handleRetrying`,
            payload: true
          })
          dispatch({
            type: `${modelKey}/generateReport`,
            payload: {retry: 1, report_type: FESTIVAL_CHECK, fest_id: record.id}
          })

        },
        onCancel: () => {
        }
      })
    }

    const fetchDataTableProps = {
      // bordered: true,
      fetch: {
        url: '/reports',
        data: {
          publish_range: publishRange,
          report_type: FESTIVAL_CHECK,
          progress: progress,
        }
      },
      columns: [
        {title: '生成时间', dataIndex: 'created_at'},
        {title: '巡检开始时间', dataIndex: 'begin_at', render: (text) => {
          if (!text) {
            return <span>无</span>
          }
          return <span>{text}</span>
        }},
        {title: '巡检结束时间', dataIndex: 'end_at',
          render: (text) => {
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
        },{
          title:'节点数',
          dataIndex: '',
          render: (text,record) => {
            return (
              <span>
                {
                record.fest_total &&
                 <span>
                   <Popover content={showProgressContent(record,'finish')} title="已完成任务" trigger="hover">
                      <a href="javascript:void(0);" className="text-success">
                         已完成:{record.fest_total}
                      </a>
                   </Popover>
                 </span>
                }
                {
                record.fest_unfinish > 0 ?
                 <span>
                   <Popover content={showProgressContent(record,'unfinish')} title="未完成任务" trigger="hover">
                      <span className = "ant-divider"/>
                      <a href="javascript:void(0);" className="text-error">
                          未完成:{record.fest_unfinish}
                      </a>
                   </Popover>
                 </span>
                  :
                  <span>
                      <span className = "ant-divider"/>
                      <a href="javascript:void(0);" className="text-error">
                          未完成:{record.fest_unfinish}
                      </a>
                  </span>
                }
              </span>
            )
          }
        }
        ,
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
                <span style={{display: (this.state.retryCheck && record.retry) ? '' : 'none'}}>
                    <span className = "ant-divider"/>
                    <a href="javascript:void(0);" className="text-info" onClick = {retryReport.bind(this, record) }>
                    重试
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
        payload: { ...data, report_type: FESTIVAL_CHECK }
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
      selectedBaseInfo,
      businesses:businessOptions,
      getApps: this.getApps,
      apps,
      getRelateList:this.getRelateList,
      getCluster: this.getCluster,
      getInstance: this.getInstance,
      getSet: this.getSet,
      clusters,
      instances,
      sets,
      onOk: onOk,
      onCancel: onCancel,
    }

    return (
      <Row>
        <Row className={styles['filter-container']}>
          <Filter key={this.state.key} {...filterProps} />
        </Row>
        <DataTable {...fetchDataTableProps} />
        <ReportModal {...reportModalProps} />
      </Row>
    )
  }
}

Festival.propTypes = {
  festival: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=>{
  return {
    festival: state[modelKey],
  }
})(Festival)
