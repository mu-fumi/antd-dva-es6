/**
 * Created by wengyian on 2018/3/26.
 */

import {message, Modal, Row} from 'antd'
import { getReportError, generateReport, getNodes,getNodesQuick } from 'services/report'
import pathToRegexp from 'path-to-regexp'
import {Logger} from 'utils'

export default {
  // 如果namespace 带 / ，那么 effects 返回的就不是 promise 对象了
  // namespace: 'monitor/quickCheck',
  namespace: 'quickCheck',
  state: {
    reload: (+ new Date()),
    filter: {
      publish_range: '',
      report_type: 'quick',
      node_name: '',
      node_type: ''
    },
    modalVisible: false,
    nodes: {}
  },
  reducers: {
    handleReload(state){
      return{
        ...state,
        reload:(+new Date())
      }
    },

    handleResetFilter(state, action) {
      return {
        ...state,
        filter: {
          publish_range: '',
          report_type: 'quick',
          node_name: '',
          node_type: ''
        }
      }
    },

    handleFilter(state, action) {
      return {
        ...state,
        filter: {
          ...state.filter,
          ...action.payload
        }
      }
    },

    setModalVisible(state, action) {
      return {
        ...state,
        modalVisible: action.payload
      }
    },

    setNodes(state, action) {
      return {
        ...state,
        nodes: action.payload
      }
    }
  },
  effects: {
    *getReportError({
      payload
     }, { call, put}){
      const res = yield call(getReportError, payload)
      if (res.code === 0) {
        const { error_info, link } = res.data
        const content = <Row>
          <Row>{error_info}</Row>
          <Row>
            <a className="text-info" href={`/job/${link}`} target="_blank">查看详情</a>
          </Row>
        </Row>
        Modal.info({
          title: '错误原因',
          content,
        })
      } else {
        message.error(res.error || res.msg)
      }
    },

    *generateReport({
      payload
    }, { call, put }){
      return yield call(generateReport, payload)
      /*
      if (res.code === 0) {
        Logger.info('111')
        Modal.info({
          title: '生成一键检查报告任务已经提交',
          content: '提交成功,本次任务已在后台执行,耗时较长,您稍候可以在任务列表查看进度及结果',
          okText: '知道了',
          onOk: () => {}
        })
      } else {
        message.error(res.error || res.msg)
      }
      */
    },

    *getNodes({
      payload
    }, { call, put }){
      const res = yield call(getNodesQuick)
      if (res.code === 0) {
        yield put({
          type: 'setNodes',
          payload: res.data
        })
      }
    }
  },
  subscriptions: {
    setup({dispatch, history}){
      history.listen(({pathname, search}) => {
        const match = pathToRegexp('/checkup/quick').exec(pathname)
        if (match) {
          dispatch({
            type: 'getNodes'
          })
        }
      })
    }
  }
}

