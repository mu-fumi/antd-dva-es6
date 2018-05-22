import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Button, Icon, message } from 'antd'

import { DataTable, Layout, Filter, ProgressIcon, Card } from 'components'
import { constant, TimeFilter } from 'utils'

const { SORTER_ORDER, FILE } = constant

class File extends React.Component {

  render() {
    const { fileFilter, fileReload, fileBytesChart, fileLatencyChart, getFileChart, handleFileReload,
      handleCurrentFile, fileChartLoading, fileCardShow, currentNode, fileSorter, handleFileSorter
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
      time: fileReload,
    }

    const cardProps = {
      loading: fileChartLoading,
      radioProps: [{
        buttons: timeRange,
        props:{
          value: fileFilter['radio'],
          onChange: (e) =>{
            getFileChart({time: e.target.value})
          }
        }
      }],
      pickerProps:[{
        props: {
          // key: +new Date(),
          defaultValue: fileFilter['picker'],
          onOk(value) {
            getFileChart({time: TimeFilter.toUnix(value)})
          }
        }
      }],
      chartProps: [fileBytesChart, fileLatencyChart]
    }

    const tableProps =
      {
        bordered: true,
        display: fileCardShow,
        title: () => (
          <Row type="flex" align="middle">
            <Col span={14}>
              <Icon type="bulb" />
              <span>提示：</span>
              <span className="sorter">1. 点击表格单行可查看对应文件趋势图</span>
              <span className="sorter">2. 当前排序列：{FILE[fileSorter[0]]}，排序方式：{SORTER_ORDER[fileSorter[1]]}</span>
            </Col>
            <Col span={10} className="text-right">
              <span className="mgr-16">
                {TimeFilter.format(fileReload)}
              </span>
              <Button onClick={handleFileReload.bind(this)}>
                <Icon type="reload"/>
                刷新
              </Button>
            </Col>
          </Row>
        ),
        fetch: {
          url: '/performance/io/file',
          data: filter,
          required: ['hostname']
        },
        columns: [
          { title: '文件', dataIndex: 'file_name', width: 200, sorter: true},
          { title: 'I/O 次数', dataIndex: 'total_count', sorter: true},
          { title: 'I/O 总延迟', dataIndex: 'total_latency', sorter: true },
          { title: '平均 I/O 延迟', dataIndex: 'avg_latency', sorter: true },
          { title: '读取 I/O 数', dataIndex: 'read_count', sorter: true },
          { title: '读取 I/O 延迟', dataIndex: 'read_latency', sorter: true },
          { title: '写入 I/O 数', dataIndex: 'write_count', sorter: true},
          { title: '写入 I/O 延迟', dataIndex: 'write_latency', sorter: true },
          { title: 'MISC I/O 数', dataIndex: 'misc_count', sorter: true },
          { title: 'MISC I/O 延迟', dataIndex: 'misc_latency', sorter: true }
        ],
        rowKey: 'id',
        scroll: {x: 1500},
        reload: fileReload,
        handleSorter: handleFileSorter,
        onRow: (record) => {
          handleCurrentFile(record.file_name)
          getFileChart()
        }
      }

    return (
      <Row>
        <DataTable {...tableProps} className="mgt-16"/>
        {fileCardShow ?
          <Card {...cardProps}/> : ''
        }
      </Row>
    )
  }
}

File.propTypes = {
  file: PropTypes.object,
  loading: PropTypes.bool
}

export default File
