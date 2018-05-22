import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Button, Icon, message } from 'antd'

import { DataTable, Layout, Filter, ProgressIcon, Card } from 'components'
import { constant, TimeFilter } from 'utils'

const { SORTER_ORDER, WAIT_TYPE } = constant

class WaitType extends React.Component {

  render() {

    const {
      waitTypeChartLoading, currentNode, handleWaitTypeSorter, waitTypeSorter, waitTypeFilter, waitTypeReload,
      waitTypeBytesChart, waitTypeLatencyChart, handleWaitTypeReload, handleCurrentIOType, getWaitTypeChart, waitTypeCardShow
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
      time: waitTypeReload,
    }

    const cardProps = {
      loading: waitTypeChartLoading,
      radioProps: [{
        buttons: timeRange,
        props:{
          value: waitTypeFilter['radio'],
          onChange: (e) =>{
            getWaitTypeChart({ time: e.target.value })
          }
        }
      }],
      pickerProps:[{
        props: {
          // key: +new Date(),
          defaultValue: waitTypeFilter['picker'],
          onOk(value) {
            getWaitTypeChart({ time: TimeFilter.toUnix(value) })
          }
        }
      }],
      chartProps: [waitTypeBytesChart, waitTypeLatencyChart]
    }

    const tableProps =
      {
        bordered: true,
        title: () => (
          <Row type="flex" align="middle">
            <Col span={14}>
              <Icon type="bulb" />
              <span>提示：</span>
              <span className="sorter">1. 点击表格单行可查看对应 IO 类型趋势图</span>
              <span className="sorter">2. 当前排序列：{WAIT_TYPE[waitTypeSorter[0]]}，排序方式：{SORTER_ORDER[waitTypeSorter[1]]}</span>
            </Col>
            <Col span={10} className="text-right">
              <span className="mgr-16">
                {TimeFilter.format(waitTypeReload)}
              </span>
              <Button onClick={handleWaitTypeReload.bind(this)}>
                <Icon type="reload"/>
                刷新
              </Button>
            </Col>
          </Row>
        ),
        fetch: {
          url: '/performance/io/waits',
          data: filter,
          required: ['hostname']
        },
        columns: [
          { title: 'I/O 类型', dataIndex: 'event_name', sorter: true },
          { title: 'I/O 次数', dataIndex: 'total_count', sorter: true },
          { title: 'I/O 总延迟', dataIndex: 'total_latency', sorter: true },
          { title: '平均 I/O 延迟', dataIndex: 'avg_latency', sorter: true },
          { title: '最大 I/O 延迟', dataIndex: 'max_latency', sorter: true },
          { title: '读取 I/O 数', dataIndex: 'read_count', sorter: true },
          { title: '读取 I/O 延迟', dataIndex: 'read_latency', sorter: true },
          { title: '读取 I/O 总量', dataIndex: 'reads', sorter: true },
          { title: '平均 I/O 读取量', dataIndex: 'reads_avg', sorter: true },
          { title: '写入 I/O 数', dataIndex: 'write_count', sorter: true },
          { title: '写入 I/O 延迟', dataIndex: 'write_latency', sorter: true },
          { title: '写入 I/O 总量', dataIndex: 'writes', sorter: true },
          { title: '平均 I/O 写入量', dataIndex: 'writes_avg', sorter: true },
          { title: 'MISC I/O 延迟', dataIndex: 'misc_latency', sorter: true }
          ],
        rowKey: 'id',
        scroll: {x: 1500},
        reload: waitTypeReload,
        handleSorter: handleWaitTypeSorter,
        onRow: (record) => {
          handleCurrentIOType(record.event_name)
          getWaitTypeChart()
        }
      }

    return (
      <Row>
        <DataTable {...tableProps} className="mgt-16"/>
        {waitTypeCardShow ?
          <Card {...cardProps}/> : ''
        }
      </Row>
    )
  }
}

WaitType.propTypes = {
  waitType: PropTypes.object,
  loading: PropTypes.bool
}

export default WaitType
