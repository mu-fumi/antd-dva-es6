import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Icon, Tooltip } from 'antd'
import styles from './queryAnalysis.less'

import { DataTable, Layout, Filter, ProgressIcon, Echart, Card } from 'components'
import QueryAnalysisModal from './queryAnalysisModal'

import { constant, TimeFilter, classnames } from 'utils'

const model = 'performance/queryAnalysis';
const { SORTER_ORDER, QUERY_ANALYSIS } = constant

class QueryAnalysis extends React.Component {
  componentWillReceiveProps (nextProps) {
    if(this.props.performance.currentNode !== nextProps.performance.currentNode){
      this.props.dispatch({type: `${model}/getLoadLine`})
    }
  }

  render() {
    const { loading, queryAnalysis, dispatch, performance } = this.props;
    const { chartData, queryTimeFilter, digest, sqlID, visible, queryAnalysisSorter } = queryAnalysis;
    const { currentNode } = performance;

    const timeRange = {
      '30分钟': 'last_30_minutes',
      '3小时': 'last_3_hours',
      '12小时': 'last_12_hours',
      '24小时': 'last_24_hours',
      '七天': 'last_7_days'
    };

    const loadLineEffect = `${model}/getLoadLine`;

    const filter = {
      hostname: currentNode,
      digest: digest,
      time: queryTimeFilter['radio'] || TimeFilter.toUnix(queryTimeFilter['picker']),
    }

    // const props = {"type":"miniLine","option":{"key":"avg_point","title":"查询分析图","unit":"ms","values":{"平均响应时间":[[1495655949,1039],[1495655953,1050],[1495656711,1000],[1495657222,975],[1495657223,970],[1495693466,771],[1495693528,768],[1495698328,722],[1495698332,721],[1495698833,705],[1495698836,702],[1495699378,679],[1495699380,677],[1495699709,670],[1495699712,668],[1495699735,657],[1495699753,655],[1495700042,649],[1495700045,647],[1495701421,641],[1495701446,639],[1495701560,1050],[1495701605,632]]},"start_time":"2017-05-19 16:49:33","end_time":"2017-05-26 16:49:33","max_value":1150, "min_value":1150}}

    const onclick = (record) => {
      dispatch({ type: `${model}/handleSqlID`, payload:{ sqlID: record.digest} })
      dispatch({ type: `${model}/showModal`})
    }

    const handleSorter = (sorter) => {
      dispatch({
        type: `${model}/handleTableSorter`,
        payload:{ queryAnalysisSorter: sorter[0] ? sorter : ['avg_latency', 'descend']}
      })
    }

    const cardProps = {
      loading: loading,
      radioProps: [{
        buttons: timeRange,
        props:{
          value: queryTimeFilter['radio'],
          onChange: (e) =>{
            dispatch({ type: loadLineEffect, payload:{ time: e.target.value} })
          }
        }
      }],
      pickerProps:[{
        props: {
          // key: +new Date(),
          defaultValue: queryTimeFilter['picker'],
          onOk(value) {
            dispatch({
              type: loadLineEffect, payload: {time: TimeFilter.toUnix(value)},
            })
          }
        }
      }],
      chartProps: [chartData],
      tableProps: [
        {
          bordered: true,
          title: () => {
            return (
              <span className={styles['tips']}>
                <Icon type="bulb" />
                <span>提示：</span>
                <span className="sorter">
                  当前排序列：{QUERY_ANALYSIS[queryAnalysisSorter[0]]}，排序方式：{SORTER_ORDER[queryAnalysisSorter[1]]}。
                </span>
              </span>
            )
          },
          fetch: {
            url: '/performance/statmenet/list',
            data: filter,
            required: ['hostname']
          },
          columns: [
            { title: 'SQL ID', dataIndex: 'digest', width: 280,
              filters: [{ text: '显示全部', value: 'all' }],
              filterIcon: <Icon type="filter" style={{ display: digest? '': 'none' }} />,
              filterMultiple: false,
              onFilter: (value) => {
                if (value === 'all') {
                  window.location.href = '/performance/query-analyzer'
                }
              },
            },
            { title: '查询语句', dataIndex: 'query', width: 300, sorter: true, render: (text, record) => {
              return <Tooltip overlayClassName={classnames('wrap-break', styles['sql-text'])} title={text}>
                       <a className={styles['query-sql']} onClick={onclick.bind(this, record)}>{text}</a>
                     </Tooltip>
            } },
            { title: '执行数', dataIndex: 'exec_counts', sorter: true},
            { title: '错误数', dataIndex: 'err_counts', sorter: true },
            { title: '告警数', dataIndex: 'war_counts', sorter: true },
            { title: '延迟 (ms)',
              children: [
                { title: '总延迟', dataIndex: 'total_latency', sorter: true, key:'total_latency' },
                { title: '最大', dataIndex: 'max_latency', sorter: true, key:'max_latency' },
                { title: '平均', dataIndex: 'avg_latency', sorter: true, key:'avg_latency' },
              ]
            },
            { title: '影响行数',
              children: [
                { title: '总数', dataIndex: 'rows_affected', sorter: true, key:'rows_affected'  },
                { title: '平均', dataIndex: 'rows_affected_avg', sorter: true, key:'rows_affected_avg'  }
              ]
            },
            { title: '发送行数', dataIndex: 'rows_sent', sorter: true, key:'rows_sent' },
            { title: '扫描行数', dataIndex: 'rows_examined', sorter: true, key:'rows_examined' },
            { title: '首次出现时间', dataIndex: 'FIRST_SEEN', sorter: true, key:'FIRST_SEEN' }
          ],
          rowKey: 'id',
          scroll: {x: 1800},
          handleSorter: handleSorter,
          // reload: queryTimeFilter['reload']
        }
      ]
    };

    const modalProps = {
      visible,
      sqlID,
      currentNode,
      time: queryTimeFilter['radio'] ||  TimeFilter.toUnix(queryTimeFilter['picker']),
      onOk() {
        dispatch({type: `${model}/hideModal`})
      },
      onCancel() {
        dispatch({type: `${model}/hideModal`})
      },
    }
    return (
      <Row>
          <Card {...cardProps} />
          <QueryAnalysisModal {...modalProps}/>
      </Row>
    )
  }
}

QueryAnalysis.propTypes = {
  queryAnalysis: PropTypes.object,
  loading: PropTypes.bool,
  location: PropTypes.object,
  dispatch: PropTypes.func,
};

export default connect((state)=> {
  return {
    loading: state.loading.effects['performance/queryAnalysis/getLoadLine'],
    queryAnalysis: state[model],
    performance: state['performance']
  }
})(QueryAnalysis)
