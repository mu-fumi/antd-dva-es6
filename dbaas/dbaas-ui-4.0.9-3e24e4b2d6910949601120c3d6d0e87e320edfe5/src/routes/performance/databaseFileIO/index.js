import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Tabs } from 'antd'

import { DataTable, Layout, Filter, ProgressIcon } from 'components'
import { constant, TimeFilter } from 'utils'

import styles from './index.less'

import File from './file'
import WaitType from './waitType'
import Thread from './thread'

const TabPane = Tabs.TabPane
const modelKey = 'performance/databaseFileIO'

class DatabaseFileIO extends React.Component {
  componentWillReceiveProps (nextProps) {
    if(this.props.performance.currentNode !== nextProps.performance.currentNode){
      this.props.dispatch({type: `${modelKey}/getFileChart`})
      this.props.dispatch({type: `${modelKey}/getWaitTypeChart`})
      this.props.dispatch({type: `${modelKey}/getThreadChart`})
    }
  }

  render() {

    const { fileChartLoading, waitTypeChartLoading, threadChartLoading, databaseFileIO, dispatch, performance } = this.props
    const {
      fileCardShow, fileFilter, fileReload, fileBytesChart, fileLatencyChart, waitTypeCardShow, waitTypeFilter,
      waitTypeReload, waitTypeBytesChart, waitTypeLatencyChart, threadCardShow, threadFilter, threadReload,
      threadBytesChart, threadLatencyChart, fileSorter, waitTypeSorter, threadSorter
    } = databaseFileIO
    const { currentNode } = performance

    const fileProps = {
      fileCardShow,
      fileChartLoading,
      currentNode,
      fileSorter,
      fileFilter,
      fileReload,
      fileBytesChart,
      fileLatencyChart,
      handleFileReload(){
        dispatch({ type: `${modelKey}/handleFileReload`})
      },
      handleCurrentFile(payload){
        dispatch({ type: `${modelKey}/handleCurrentFile`, payload: payload })
      },
      getFileChart(payload){
        dispatch({ type: `${modelKey}/getFileChart`, payload: payload })
      },
      handleFileSorter(sorter){
        dispatch({
          type: `${modelKey}/handleTableSorter`,
          payload: {fileSorter: sorter[0] ? sorter : ['total_latency', 'descend']}
        })
      }
    }

    const waitTypeProps = {
      waitTypeCardShow,
      waitTypeChartLoading,
      currentNode,
      waitTypeSorter,
      waitTypeFilter,
      waitTypeReload,
      waitTypeBytesChart,
      waitTypeLatencyChart,
      handleWaitTypeReload(){
        dispatch({ type: `${modelKey}/handleWaitTypeReload`})
      },
      handleCurrentIOType(payload){
        dispatch({ type: `${modelKey}/handleCurrentIOType`, payload: payload })
      },
      getWaitTypeChart(payload){
        dispatch({ type: `${modelKey}/getWaitTypeChart`, payload: payload })
      },
      handleWaitTypeSorter(sorter){
        dispatch({
          type: `${modelKey}/handleTableSorter`,
          payload: {waitTypeSorter: sorter[0] ? sorter : ['total_latency', 'descend']}
        })
      }
    }

    const threadProps = {
      threadCardShow,
      threadChartLoading,
      currentNode,
      threadSorter,
      threadFilter,
      threadReload,
      threadBytesChart,
      threadLatencyChart,
      handleThreadReload(){
        dispatch({ type: `${modelKey}/handleThreadReload`})
      },
      handleCurrentThread(payload){
        dispatch({ type: `${modelKey}/handleCurrentThread`, payload: payload })
      },
      getThreadChart(payload){
        dispatch({ type: `${modelKey}/getThreadChart`, payload: payload })
      },
      handleThreadSorter(sorter){
        dispatch({
          type: `${modelKey}/handleTableSorter`,
          payload: {threadSorter: sorter[0] ? sorter : ['total_latency', 'descend']}
        })
      }
    }

    return (
      <Tabs defaultActiveKey="1" className={styles['tab']}>
        <TabPane tab="文件" key="1"><File {...fileProps}/></TabPane>
        <TabPane tab="等待类型" key="2"><WaitType {...waitTypeProps}/></TabPane>
        <TabPane tab="线程" key="3"><Thread {...threadProps}/></TabPane>
      </Tabs>
    )
  }
}

DatabaseFileIO.propTypes = {
  databaseFileIO: PropTypes.object,
  fileChartLoading: PropTypes.bool,
  waitTypeChartLoading: PropTypes.bool,
  threadChartLoading: PropTypes.bool,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  performance: PropTypes.object,
}

export default connect((state)=> {
  return {
    fileChartLoading: state.loading.effects['performance/databaseFileIO/getFileChart'],
    waitTypeChartLoading: state.loading.effects['performance/databaseFileIO/getWaitTypeChart'],
    threadChartLoading: state.loading.effects['performance/databaseFileIO/getThreadChart'],
    databaseFileIO: state[modelKey],
    performance: state['performance']
  }
})(DatabaseFileIO)
