import { generateReport, getMysqlNodes, getReportError } from 'services/report'
import { Modal, message } from 'antd'

export default {
  namespace:'monitorAnomaly',
  state:{
    reload:(+ new Date()),
    pickerDefaultValue: [],  // picker的defaultValue，便于跳转别的页面然后从别的页面返回本页时保留筛选条件
    publishRange: [],
    currentPage: 1,
    progress: '', //状态
  },
  reducers:{
    handleReload (state) {
      return {
        ...state,
        reload: (+ new Date()),
      }
    },
    handleFilter(state, action) {
      return {
        ...state,
        progress: action.payload.progress
      }
    },
    handlePublishRange (state, action) {
      return {
        ...state,
        publishRange : action.payload
      }
    },
    handleState (state, action) {
      return {
        ...state,
        progress : action.payload
      }
    },
    handlePickerDefaultValue (state, action) {
      return {
        ...state,
        pickerDefaultValue: action.payload
      }
    },
    setCurrentPage (state, action) {
      return {
        ...state,
        currentPage: action.payload
      }
    },
  },
  effects:{
    *generateReport ({ payload = {} }, { put, call, select }) {
      // console.log(payload)
      const res = yield call(generateReport, payload)

      if (res && res.code === 0) { // 跟节前巡检一致，放在model层，有问题一个地方改

        Modal.info({
          title: '生成异常分类报告任务已经提交',
          content: < p > 提交成功,
            本次任务已在后台执行,
            耗时较长,
            您稍候可以在任务列表查看进度及结果 </p>,
          onOk: () => {
          },
          onCancel: () => {
          }
        })
        yield put({
          type: 'handleReload',
        })
      } else {
        res && message.error(res.error || res.msg)
      }
    },
    *getReportError ({ payload = {} }, { put, call, select }) {
      // console.log(payload)
      return yield call(getReportError, payload)
    },
  },
  subscriptions:{
    setup ({ dispatch, history }) {

    }
  },
}
