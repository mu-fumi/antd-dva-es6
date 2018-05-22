import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Icon, message, Progress, Tooltip, Input } from 'antd'

import { DataTable, Layout, Filter, ProgressIcon, Card } from 'components'
import { Link } from 'dva/router'
import { constant, TimeFilter, classnames, Logger  } from 'utils'

import styles from './overview.less'

const model = 'performance/overview'

class OverView extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    Logger.info('create current load timer')
    this.timer = setInterval(()=>{
      this.props.dispatch({type: `${model}/getCurrentLoad`})}, 5*1000)
  }

  componentWillUnmount() {
    Logger.info('timer cleared')
    clearInterval(this.timer)
  }

  componentWillReceiveProps (nextProps) {
    if(this.props.performance.currentNode !== nextProps.performance.currentNode){
      this.props.dispatch({type: `${model}/getCurrentLoad`})
      this.props.dispatch({type: `${model}/getLoadLine`})
      this.props.dispatch({type: `${model}/getTimeCostLine`})
      this.props.dispatch({type: `${model}/handleTopFilter`, payload: {}})
    }
  }

  render() {
    const { loadLineCardLoading, timeCostLineCardLoading, overview, dispatch, performance } = this.props

    const { currentLoad , loadLine, timeCostLine, loadFilter, topFilter, timeCostFilter, nic, bandwidth } = overview
    const { currentNode, timeRange } = performance

    const loadCard = {
      loading: false,
      titleText:
        <span>
          <span className="text-bold">当前负载</span>
          <span className="nic-bandwidth" style={{display: nic ? '' : 'none'}}>当前网卡：{nic},</span>
          <span className="nic-bandwidth" style={{display: bandwidth ? '' : 'none'}}>当前网络带宽：{bandwidth}Mbps</span>
        </span>,
      chartProps: currentLoad,
      pickerProps: []
    }

    const loadLineEffect = `${model}/getLoadLine`
    const loadLineCard = {
      loading: loadLineCardLoading,
      radioProps: [{
        buttons: timeRange,
        props: {
          value: loadFilter['radio'],
          onChange: (e) => {
            dispatch({type: loadLineEffect, payload: {time: e.target.value }})
          }
        }
      }],
      pickerProps: [{
        props: {
          // key: +new Date(),  // 这里加key，任一model的变化都会更新key，picker会重新渲染，影响操作
          defaultValue: loadFilter['picker'],
          onOk(value) {
            dispatch({
              type: loadLineEffect,
              payload: {time: TimeFilter.toUnix(value)},
            })
          }
        }
      }],
      chartProps: loadLine,
    }

    // console.log(loadLineCard.pickerProps[0].props.defaultValue)

    const timeCostLineEffect = `${model}/getTimeCostLine`
    const timeCostLineCard = {
      loading: timeCostLineCardLoading,
      radioProps: [{
        buttons: timeRange,
        props: {
          value: timeCostFilter['radio'],
          onChange: (e) => {
            dispatch({type: timeCostLineEffect, payload: {time: e.target.value }})
          }
        }
      }],
      pickerProps: [{
        props: {
          // key: +new Date(),
          defaultValue: timeCostFilter['picker'],
          onOk(value) {
            dispatch({
              type: timeCostLineEffect,
              payload: {time: TimeFilter.toUnix(value)},
            })
          }
        }
      }],
      chartProps: timeCostLine,
    }

    let fetches = []

    const filter = {
      hostname: currentNode,
      time: topFilter['radio'] || TimeFilter.toUnix(topFilter['picker']),
    }

    if(currentNode){
      fetches = [
        '/performance/top/stage', '/performance/top/digest',
        '/performance/top/session', '/performance/top/waits'].map((v) =>{
        return {
          url: v,
          data: filter,
          required: ['hostname']
        }
      })
    }

    const topEffect = `${model}/handleTopFilter`

    // 新增 处理 进度条 + 百分比
    const ProgressNum = (num) => {
      return (
        <Row>
          <Progress percent={num} showInfo={false} className={styles['progress-bar']}/>
          <span className={styles['progress-number']}>{num}%</span>
        </Row>
      )
    }

    const topCard = {
      radioProps: [{
        buttons: timeRange,
        props: {
          value: topFilter['radio'],
          onChange: (e) => {
            dispatch({type: topEffect, payload: {time: e.target.value}})
          }
        }
      }],
      pickerProps: [{
        props: {
          // key: +new Date(),
          defaultValue: topFilter['picker'],
          onOk(value) {
            dispatch({
              type: topEffect,
              payload: {time: TimeFilter.toUnix(value)},
            })
          }
        }
      }],
      tableProps: [
        {
          span: 12,
          title: () => {
            return <h3>TOP stage</h3>
          },
          size: "small",
          bordered: true,
          fetch: fetches[0],
          columns: [
            {title: '事件名', dataIndex: 'event_name', width:'50%', render: (text) => {
              return <span className="wrap-break">{text}</span>
            }},
            {title: '次数', dataIndex: 'exec_count'},
            {title: '耗时 (s)', dataIndex: 'time_cost'},
            {
              title: '耗时百分比(%)', dataIndex: 'time_cost(%)', render: (text) => {
              // return <Progress percent={text} />
              return ProgressNum(text)
            }
            }
          ],
          rowKey: 'id',
          reload: topFilter['reload'],
          pagination: false
        }
        ,
        {
          span: 12,
          title: () => {
            return <h3>TOP SQL</h3>
          },
          size: "small",
          bordered: true,
          fetch: fetches[1],
          columns: [
            {title: 'SQL ID', dataIndex: 'digest', render: (text, record) => {
              return <Tooltip overlayClassName={classnames('wrap-break', styles['sql-text'])} title={record.query}>
                       <Link target="_blank" to={`/performance/query-analyzer?digest=${text}&time=${filter.time}`}>
                         {text}
                       </Link>
                     </Tooltip>
             }
            },
            {title: '次数', dataIndex: 'exec_count'},
            {title: '耗时 (s)', dataIndex: 'time_cost'},
            {
              title: '耗时百分比(%)', dataIndex: 'time_cost(%)', render: (text) => {
              // return <Progress percent={text}/>
              return ProgressNum(text)
            }
            }
          ],
          rowKey: 'id',
          reload: topFilter['reload'],
          pagination: false
        },
        {
          span: 12,
          title: () => {
            return <h3>TOP session</h3>
          },
          size: "small",
          bordered: true,
          fetch: fetches[2],
          columns: [
            {title: '用户名', dataIndex: 'user'},
            {title: '主机名', dataIndex: 'host'},
            {title: '次数', dataIndex: 'exec_count'},
            {title: '耗时 (s)', dataIndex: 'time_cost'},
            {
              title: '耗时百分比(%)', dataIndex: 'time_cost(%)', render: (text) => {
              // return <Progress percent={text}/>
              return ProgressNum(text)
            }
            }
          ],
          rowKey: 'id',
          reload: topFilter['reload'],
          pagination: false
        },
        {
          span: 12,
          title: () => {
            return <h3>TOP wait</h3>
          },
          size: "small",
          bordered: true,
          fetch: fetches[3],
          columns: [
            {title: '事件名', dataIndex: 'event_name'},
            {title: '次数', dataIndex: 'exec_count'},
            {title: '耗时 (s)', dataIndex: 'time_cost'},
            {
              title: '耗时百分比(%)', dataIndex: 'time_cost(%)', render: (text) => {
              // return <Progress percent={text}/>
              return ProgressNum(text)
            }
            }
          ],
          rowKey: 'id',
          reload: topFilter['reload'],
          pagination: false
        }
      ]
    }

    return (
      <Row className={styles.overview}>
        <Card className={styles['current-load']} { ...loadCard } />
        <Card { ...loadLineCard } />
        <Card { ...timeCostLineCard } />
        <Card className={styles['top']}  { ...topCard } />
      </Row>
    )
  }
}

OverView.propTypes = {
  overview: PropTypes.object,
  loadLineCardLoading: PropTypes.bool,
  timeCostLineCardLoading: PropTypes.bool,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  performance: PropTypes.object,
}

export default connect((state)=> {
  return {
    loadLineCardLoading: state.loading.effects['performance/overview/getLoadLine'],
    timeCostLineCardLoading: state.loading.effects['performance/overview/getTimeCostLine'],
    overview: state[model],
    performance: state['performance']
  }
})(OverView)
