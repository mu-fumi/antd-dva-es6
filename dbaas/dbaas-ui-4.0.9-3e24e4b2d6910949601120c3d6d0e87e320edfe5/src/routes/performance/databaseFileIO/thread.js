import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Button, Icon, message } from 'antd'

import { DataTable, Layout, Filter, ProgressIcon, Card } from 'components'
import { constant, TimeFilter } from 'utils'

const { SORTER_ORDER, THREAD } = constant

class Thread extends React.Component {

  render() {

    const {
      threadChartLoading, currentNode, handleThreadSorter, threadSorter, threadFilter, threadReload, threadBytesChart,
      threadLatencyChart, handleThreadReload, handleCurrentThread, getThreadChart, threadCardShow
    } = this.props

    const timeRange = {
      '30分钟': 'last_30_minutes',
      '3小时': 'last_3_hours',
      '12小时': 'last_12_hours',
      '24小时': 'last_24_hours',
      '七天': 'last_7_days'
    }

    const filter = {
      hostname: currentNode,
      time: threadReload,
    }

    const cardProps = {
      loading: threadChartLoading,
      radioProps: [{
        buttons: timeRange,
        props:{
          value: threadFilter['radio'],
          onChange: (e) =>{
            getThreadChart({time: e.target.value})
          }
        }
      }],
      pickerProps:[{
        props: {
          // key: +new Date(),
          defaultValue: threadFilter['picker'],
          onOk(value) {
            getThreadChart({time: TimeFilter.toUnix(value)})
          }
        }
      }],
      chartProps: [threadBytesChart, threadLatencyChart]
    }

    const tableProps =
      {
        bordered: true,
        title: () => (
          <Row type="flex" align="middle">
            <Col span={14}>
              <Icon type="bulb" />
              <span>提示：</span>
              <span className="sorter">1. 点击表格单行可查看对应线程趋势图</span>
              <span className="sorter">2. 当前排序列：{THREAD[threadSorter[0]]}，排序方式：{SORTER_ORDER[threadSorter[1]]}</span>
            </Col>
            <Col span={10} className="text-right">
              <span className="mgr-16">
              {TimeFilter.format(threadReload)}
              </span>
              <Button onClick={handleThreadReload.bind(this)}>
                <Icon type="reload"/>
                刷新
            </Button>
            </Col>
          </Row>
        ),
        fetch: {
          url: '/performance/io/thread',
          data: filter,
          required: ['hostname']
        },
        columns: [
          { title: 'Account', dataIndex: 'user', sorter: true},
          { title: 'I/O 次数', dataIndex: 'total_count', sorter: true },
          { title: 'I/O 总延迟', dataIndex: 'total_latency', sorter: true },
          { title: '平均 I/O 延迟', dataIndex: 'avg_latency', sorter: true },
          { title: '最大I/O延迟', dataIndex: 'max_latency', sorter: true }
          ],
        rowKey: 'id',
        reload: threadReload,
        handleSorter: handleThreadSorter,
        onRow: (record) => {
          handleCurrentThread(record.user)
          getThreadChart()
        }
      }

    return (
      <Row>
        <DataTable {...tableProps} className="mgt-16"/>
          {threadCardShow ?
            <Card {...cardProps}/> : ''
          }
      </Row>
    )
  }
}

Thread.propTypes = {
  thread: PropTypes.object,
  loading: PropTypes.bool
}

export default Thread
