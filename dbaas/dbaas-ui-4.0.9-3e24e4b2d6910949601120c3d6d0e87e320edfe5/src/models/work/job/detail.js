/**
 * Created by zhangmm on 2017/9/8.
 */
import { getJob, getJobProgress, retryJob } from 'services/job'
import { Link , routerRedux } from 'dva/router'
import { message, Modal } from 'antd'
import Json from 'utils/json'
import {constant} from 'utils'
import pathToRegexp from 'path-to-regexp'
const { PROGRESS_PENDING } = constant

export default {
  namespace:'job/detail',
  state:{
    jobId: '',
    name:'',
    progress:[],
    progress_status:'',
    created_at:'',
    finished_at:'',
    retry_count:'',
    succeed:'',
    format_output:'',
    origin_output:'',
    job_pid:'',
    time_cost: '',
  },
  reducers:{
    handleJob (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handleReset (state) {
      return {
        ...state,
        jobId: '',
        name:'',
        progress:[],
        progress_status:'',
        created_at:'',
        finished_at:'',
        retry_count:'',
        succeed:'',
        format_output:'',
        origin_output:'',
        job_pid:'',
        time_cost: '',
      }
    },
    handleProgress (state,action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handleJobId (state,action) {
      return {
        ...state,
        ...action.payload
      }
    },
  },
  effects:{
    *getJob({payload} , {call,put}){
      let res = yield call(getJob , payload)
      if(res.code === 0){
        let format_output = ''
        if(res.data.format_output || res.data.progress !== PROGRESS_PENDING){
          format_output = Json.loads(res.data.format_output)
          yield put({
            type:"handleJob",
            payload:{
              name:res.data.name,
              progress_status:res.data.progress,
              created_at:res.data.created_at,
              finished_at:res.data.finished_at,
              retry_count:res.data.retry_count,
              succeed:res.data.succeed,
              format_output:format_output,
              origin_output:res.data.origin_output,
              job_pid: res.data.job_pid,
              time_cost: res.data.time_cost
            }
          })
        }else{
          yield put({
            type:"handleJob",
            payload:{
              name:res.data.name,
              progress_status:res.data.progress,
              created_at:res.data.created_at,
              finished_at:res.data.finished_at,
              retry_count:res.data.retry_count,
              succeed:res.data.succeed,
              format_output:format_output,
              origin_output:res.data.origin_output,
              job_pid: res.data.job_pid,
              time_cost: res.data.time_cost
            }
          })
          // effect不结束，则全局loading为true，nprogress一直不done，可以使用dvaloading的hide来手动结束，也可以将while单独拆分为一个effect，则getJob这个effect能正常结束，全局loading可false
          // yield put({
          //   type: '@@DVA_LOADING/HIDE',
          //   payload:{
          //     namespace: "job/detail",
          //     actionType: 'job/detail/getJob'
          //   }
          // })
          yield put({
              type: 'getJobProgress',
              payload: {
                id: payload.id
              }
            })
        }
      }else{
        yield put(routerRedux.push({
          pathname: '/job',
        }))
        message.error(res.msg)
      }
    },
    *getJobProgress ({payload} , {call, put}){
      const delay = timeout => {
        return new Promise(resolve => {
          setTimeout(resolve, timeout)
        })
      }
      window.stopProgressFlag = true
      while(stopProgressFlag){
        yield call(delay, 3000)
        const res = yield call(getJobProgress , payload)
        if (res && res.code === 0) {
          yield put({
            type:"handleProgress",
            payload:{
              progress: res.data.outputs,
            }
          })
          if(res.data.progress !== PROGRESS_PENDING){
            window.stopProgressFlag = false  // progress不为pending状态，则停止请求
            yield put({
              type:"getJob",
              payload:{
                id: payload.id
              }
            })
            return false
          }
        } else {
          window.stopProgress = false // 出现错误则停止请求
          res && message.error(res.error || res.msg)
        }
      }
    },

    *retryJob({payload} , {call, select}){
      const { jobId } = yield select((state) => {
        return state['job/detail']
      })
      let res = yield call(retryJob, { ...payload, id: jobId })
      if(res.code === 0){
        Modal.info({
          title: '任务重新执行',
          content: <p>任务重新执行,本次任务已在后台执行,耗时较长,您稍候可以在任务列表查看进度及结果</p>,
          onOk: () => {

          }
        })
      }else{
        message.error(res.msg)
      }
    },
  },
  subscriptions:{
    setup ({ dispatch, history }) {
      history.listen(({pathname}) => {
        if (/job(\/)(\d+)$/.test(pathname)) {
          const path = pathToRegexp('/job/:id(\\d+)').exec(pathname)
          const id = path[1]
          dispatch({
            type : `handleJobId`,
            payload : {jobId: id}
          })
          dispatch({
            type : `getJob`,
            payload : {id: id}
          })
        }})
    }
  }
}
