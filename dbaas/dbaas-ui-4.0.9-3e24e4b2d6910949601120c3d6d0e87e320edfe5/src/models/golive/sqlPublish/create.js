import { uploadSql, checkSql, saveSql, sqlDetail, backupSql, retrySql, rollbackSql, getSqlPublishProgress,
  publishSql, closeSql, getInstanceBackupTables, updateSql, getInstances, getBackupTables } from 'services/sqlPublish'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'
import { routerRedux } from 'dva/router'
import { constant, Cache } from 'utils'

const cache = new Cache()

const { SQL_PUBLISH_BACKUP_TYPE, SQL_PUBLISH_MEANING_STATUS } = constant
window.stopProgress = false

const states = {
  sql: '',
  other: '',  // 多余sql语句
  file: [],
  checkPassed: false,
  checkResult: '',
  instances: [],  // 待选实例
  selectedRowKeys: [],
  selectedInstances: [], // 选中实例行信息
  selectedInstanceNames: '',
  selectedInstanceIdsToNames: {},  // 选中实例id到name的映射
  backupTables: [], // 备选待选库表(目前暂时是库)
  selectedBackupTable: '',   // 选中库表(目前暂时是库)
  remarks: '',
  sqlID: '',
  checkButtonLoading: false,
  pageLoading: false,
  jumpCheck: false,
  jumpBackup: false,
  disablePublish: true,
  publishDetails: {},
  publishProgress: '',
  publishStatus: 'active',
  currentStep: 0,
  showProgressBar: false,
  status: 0,
  lastBackupAt: '',
  inProgress: false,
  visited: false,   //  防止循环监听sqlPublish/:id/step
}

export default {
  namespace: 'golive/sqlPublish/create',
  state: states,
  reducers: {
    reset () {
      return JSON.parse(JSON.stringify(states))
    },
    handleReload (state) {
      return {
        ...state,
        reload: (+new Date()),
      }
    },
    handleFilter (state, action) {
      return {
        ...state,
        filter: {
          ...state.filter,
          ...action.payload
        }
      }
    },
    handleSql (state, action) {
      return {
        ...state,
        sql: action.payload
      }
    },
    handleFile (state, action) {
      return {
        ...state,
        file: action.payload
      }
    },
    handleOther (state, action) {
      return {
        ...state,
        other: action.payload
      }
    },
    handleCheckResult (state, action) {
      return {
        ...state,
        checkResult: action.payload
      }
    },
    handleCheckPassed (state, action) {
      return {
        ...state,
        checkPassed: action.payload
      }
    },
    handleCheckButtonLoading (state, action) {
      return {
        ...state,
        checkButtonLoading: action.payload
      }
    },
    handleInstances (state, action) {
      return {
        ...state,
        instances: action.payload
      }
    },
    handleSelectChange (state, action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handleBackupTables (state, action) {
      return {
        ...state,
        backupTables: action.payload
      }
    },
    handleSelectedBackupTable (state, action) {
      return {
        ...state,
        selectedBackupTable: action.payload
      }
    },
    handleRemarks (state, action) {
      return {
        ...state,
        remarks: action.payload
      }
    },
    handleSqlID (state, action) {
      cache.put('currentSqlId', action.payload)  //  每次更新id存入缓存，以便页面刷新时使用
      return {
        ...state,
        sqlID: action.payload
      }
    },
    handlePageLoading (state, action) {
      return {
        ...state,
        pageLoading: action.payload
      }
    },
    handleJumpCheck (state, action) {
      return {
        ...state,
        jumpCheck: action.payload
      }
    },
    handleJumpBackup (state, action) {
      return {
        ...state,
        jumpBackup: action.payload
      }
    },
    handleDisablePublish (state, action) {
      return {
        ...state,
        disablePublish: action.payload
      }
    },
    handlePublishDetails (state, action) {
      return {
        ...state,
        publishDetails: action.payload
      }
    },
    handlePublishProgressBar (state, action) {
      return {
        ...state,
        publishProgress: action.payload
      }
    },
    handlePublishStatus (state, action) {
      return {
        ...state,
        publishStatus: action.payload
      }
    },
    handleCurrentStep (state, action) {
      return {
        ...state,
        currentStep: action.payload
      }
    },
    nextStep (state, action) {
      return {
        ...state,
        currentStep: state.currentStep + 1
      }
    },
    prevStep (state, action) {
      return {
        ...state,
        currentStep: state.currentStep - 1
      }
    },
    handleShowProgressBar (state, action) {
      return {
        ...state,
        showProgressBar: action.payload
      }
    },
    handleStatus (state, action) {
      // console.log(action.payload)
      return {
        ...state,
        status: action.payload
      }
    },
    handleLastBackupAt (state, action) {
      return {
        ...state,
        lastBackupAt: action.payload
      }
    },
    handleInProgress (state, action) {
      return {
        ...state,
        inProgress: action.payload
      }
    },
    handleVisited (state, action) {
      return {
        ...state,
        visited: action.payload
      }
    },
  },
  effects: {
    *getInstances({payload}, {put, call}) {
      const res = yield call(getInstances)
      if (res.code === 0) {
        const instances = res.data.data.map((v) => {
          return {id: v.id, name: v.instance_name}
        })
        yield put({
          type: 'handleInstances',
          payload: instances
        })
      } else {
        message.error(res.error || res.msg)
      }
    },
    *getBackupTables({payload}, {put, call}) {
      const res = yield call(getBackupTables, payload)
      if (res.code === 0) {
        const backupTables = Object.keys(res.data ? res.data : {})
        yield put({
          type: 'handleBackupTables',
          payload: backupTables
        })
      } else {
        message.error(res.error || res.msg)
      }
    },
    *checkSql({payload}, {put, call, select}) {
      yield put({  // 检查按钮loading
        type: 'handleCheckButtonLoading',
        payload: true
      })
      const { selectedRowKeys, selectedBackupTable } = yield select(state => state['golive/sqlPublish/create'] )
      const { sql } = payload
      const res = yield call(checkSql, {sql, node: selectedRowKeys, use_db: selectedBackupTable})
      if (res.code === 0) {
        yield put({
          type: 'handleCheckResult',
          payload: res.data.result
        })
        yield put({  // 检查按钮loading
          type: 'handleCheckButtonLoading',
          payload: false
        })
        if (res.data.success) {
          yield put({
            type: 'handleCheckPassed',
            payload: true
          })
          yield put({
            type: 'handleDisablePublish',
            payload: false
          })
        } else {
          yield put({
            type: 'handleCheckPassed',
            payload: false
          })
          yield put({
            type: 'handleDisablePublish',
            payload: true
          })
        }
      } else {
        message.error(res.error || res.msg)
        yield put({  // 检查按钮loading
          type: 'handleCheckButtonLoading',
          payload: false
        })
      }
    },
    *saveSql({payload}, {put, call, select}) {
      yield put({
        type: 'handlePageLoading',
        payload: true
      })  // 检查时下一步按钮loading
      const { selectedRowKeys, sqlID, remarks, jumpCheck, jumpBackup, checkResult, selectedBackupTable } = yield select((state) => {
        return state['golive/sqlPublish/create']
      })
      const { sql } = payload
      const params = {sql, node: selectedRowKeys, remark: remarks, ignore_check: jumpCheck ? 1 : 0,
        ignore_backup: jumpBackup ? 1 : 0, check_result: checkResult,
        // use_db: selectedBackupTable
      }

      // 调试用
      // yield put({
      //   type: 'nextStep',
      // })
      // 新建和修改接口拆分
      const res = sqlID ? yield call(updateSql, {...params, id: sqlID}) : yield call(saveSql, params)
      yield put({
        type: 'handlePageLoading',
        payload: false
      })
      if (res && res.code === 0) {
        if (!sqlID) {   // 新建页生成ID
          yield put({
            type: 'handleSqlID',
            payload: res.data.id
          })
        }
        yield put({
          type: 'nextStep',
        })
      } else {
        res && message.error(res.error || res.msg)  // 无res时说明是接口错误，在request里面会进行报错处理
      }
    },
    *sqlDetail({payload}, {put, call, select}) {
      const sqlID = payload
      const res = yield call(sqlDetail, {id: sqlID})
      if (res.code === 0) {
        yield put({
          type: 'handleStatus',
          payload: res.data.status
        })
        yield put({
          type: 'handleSql',
          payload: res.data.content.content
        })
        yield put({
          type: 'handleSelectedBackupTable',
          payload: res.data.use_db
        })
        yield put({
          type: 'handlePublishDetails',
          payload: res.data.details
        })
        const selectedInstances = res.data.nodes
        const selectedRowKeys = []
        const selectedInstanceIdsToNames = {}
        let selectedInstanceNames = []
        selectedInstances.map(v => {
          selectedRowKeys.push(v.id)
          selectedInstanceNames.push(v.name)
          selectedInstanceIdsToNames[v.id] = v.name
        })
        selectedInstanceNames = selectedInstanceNames.join(', ')
        yield put({
          type: 'handleSelectChange',
          payload: {
            selectedRowKeys,
            selectedInstances,
            selectedInstanceNames,
            selectedInstanceIdsToNames
          }
        })
        yield put({
          type: 'handleRemarks',
          payload: res.data.remarks
        })
      } else {
        message.error(res.error || res.msg)
        yield put(routerRedux.push({
          pathname: '/sql-publish',
        }))
      }
    },
    *publishSql({payload}, {put, call, select}) {
      const {sqlID} = yield select((state) => {
        return state['golive/sqlPublish/create']
      })

      const res = yield call(publishSql, {id: sqlID})
      yield put({
        type: 'handlePageLoading',
        payload: false
      })
      if (res && res.code === 0) {  // 网关超时时无res
        yield put({  // 更新status，供发布页面显示发布结果
          type: 'handleStatus',
          payload: SQL_PUBLISH_MEANING_STATUS['PUBLISHING']
        })
        // yield put({  // 为了跟sqlDetail一致，都在model中更新status，然后在route中发起progress
        //   type: 'handlePublishProgress',
        // })
      } else {
        res && message.error(res.error || res.msg)  // 网关超时等情况无res
      }
    },
    *handlePublishProgress({payload = {}}, {put, call, select}) {
      const {sqlID} = yield select((state) => {
        return state['golive/sqlPublish/create']
      })
      yield put({
        type: 'handlePublishProgressBar', // 还原进度条
        payload: 0
      })
      yield put({
        type: 'handlePublishStatus',
        payload: 'active',
      })

      yield put({
        type: 'handleInProgress',
        payload: true
      })

      const delay = timeout => {
        return new Promise(resolve => {
          setTimeout(resolve, timeout)
        })
      }
      window.stopProgress = false
      window.fakeProgress = 0
      while (!window.stopProgress) {  // while配合delay是官方解决方案
        yield call(delay, 1000)
        const res = yield call(getSqlPublishProgress, {id: sqlID, type: 'publish'})
        if (res && res.code === 0) {
          if (res.data === '1.00') {  // data为1应该为发布成功或失败
            window.stopProgress = true
            window.fakeProgress = null
            const res1 = yield call(sqlDetail, {id: sqlID})
            if (res1 && res1.code === 0) {
              const status = res1.data.status
              const lastBackupAt = res1.data.last_backup_at
              const publishDetails = res1.data.details
              yield put({  //  每次循环都应更新status
                type: 'handleStatus',
                payload: status
              })

              yield put({  //  每次循环都应更新publishDetails
                type: 'handlePublishDetails',
                payload: publishDetails
              })
              yield put({  // 更新lastBackupAt，供回滚弹窗使用
                type: 'handleLastBackupAt',
                payload: lastBackupAt
              })

              yield put({
                type: 'handleInProgress',
                payload: false
              })
            } else {
              res && message.error(res.error || res.msg)
            }
          } else {        // 发布中获取进度
            if (window.fakeProgress < 18) {
              window.fakeProgress ++
            }
            yield put({
              type: 'handlePublishProgressBar',
              payload: Math.floor(res.data === "0.00" ? 5 * window.fakeProgress : res.data * 100)
            })
            yield put({
              type: 'handlePublishStatus',
              payload: 'active',
            })
          }
        } else {
          window.stopProgress = true // 出现错误则停止请求
          window.fakeProgress = null
          res && message.error(res.error || res.msg)
        }
      }
    },
    *rollbackSql({payload}, {put, call, select}) {
      const {sqlID} = yield select((state) => {
        return state['golive/sqlPublish/create']
      })
      const res = yield call(rollbackSql, {id: sqlID})
      yield put({
        type: 'handlePageLoading',
        payload: false
      })
      if (res && res.code === 0) {  // 网关超时时无res
        yield put({  // 更新status，供发布页面显示发布结果
          type: 'handleStatus',
          payload: SQL_PUBLISH_MEANING_STATUS['IN_ROLLBACK']
        })
        // yield put({  // 为了跟sqlDetail一致，都在model中更新status，然后在route中发起progress
        //   type: 'handleRollbackProgress',
        // })
      } else {
        res && message.error(res.error || res.msg)
      }
    },
    *handleRollbackProgress({payload = {}}, {put, call, select}) {
      const {sqlID, inProgress} = yield select((state) => {
        return state['golive/sqlPublish/create']
      })
      yield put({
        type: 'handlePublishProgressBar', // 还原进度条
        payload: 0
      })
      yield put({
        type: 'handlePublishStatus',  // 还原进度条状态
        payload: 'active',
      })
      yield put({
        type: 'handleInProgress',
        payload: true
      })

      const delay = timeout => {
        return new Promise(resolve => {
          setTimeout(resolve, timeout)
        })
      }
      window.stopProgress = false
      window.fakeProgress = 0
      while (!window.stopProgress) {  // while配合delay是官方解决方案
        yield call(delay, 1000)
        const res = yield call(getSqlPublishProgress, {id: sqlID, type: 'rollback'})
        if (res && res.code === 0) {
          if (res.data === '1.00') {  // data为1应该为回滚成功或失败，如果是status是11，其实是异常情况
            window.stopProgress = true
            window.fakeProgress = null
            const res1 = yield call(sqlDetail, {id: sqlID})
            if (res1 && res1.code === 0) {
              const status = res1.data.status
              const publishDetails = res1.data.details
              yield put({  //  每次循环都应更新status
                type: 'handleStatus',
                payload: status
              })

              yield put({  //  每次循环都应更新status
                type: 'handlePublishDetails',
                payload: publishDetails
              })

              yield put({
                type: 'handleInProgress',
                payload: false
              })
            } else {
              res && message.error(res.error || res.msg)
            }
          } else {  // 回滚中获取进度
            if (window.fakeProgress < 18) {
              window.fakeProgress ++
            }
            yield put({
              type: 'handlePublishProgressBar',
              payload: Math.floor(res.data === "0.00" ? 5 * window.fakeProgress : res.data * 100)
            })
            yield put({
              type: 'handlePublishStatus',
              payload: 'active',
            })
          }
        } else {
          window.stopProgress = true // 出现错误则停止请求
          window.fakeProgress = null
          res && message.error(res.error || res.msg)
        }
      }
    },
    *closeSql({payload}, {put, call, select}) {
      yield put({
        type: 'handlePageLoading',
        payload: true
      })
      const {sqlID} = yield select((state) => {
        return state['golive/sqlPublish/create']
      })
      const res = yield call(closeSql, {id: sqlID})
      yield put({
        type: 'handlePageLoading',
        payload: false
      })
      if (res && res.code === 0) {
        message.success('此发布已关闭！')
      } else {
        res && message.error(res.error || res.msg)
      }
    },
    *toEdit({payload}, {put, call, select}) {  //  编辑页内重定向
      const { id, inputStep } = payload
      const res = yield call(sqlDetail, {id})
      if (res.code === 0) {
        let step = null
        const status = res.data.status
        if (status === SQL_PUBLISH_MEANING_STATUS['UPLOAD_SUCCEED']) {  // step = inputStep = 1,2,3时，已经到达正确step，不再进行页面跳转，否则会死循环
          step = 1
        } else if (
          // status === SQL_PUBLISH_MEANING_STATUS['PUBLISH_FAILED'] ||
          status === SQL_PUBLISH_MEANING_STATUS['PUBLISH_SUCCEED'] ||
          status === SQL_PUBLISH_MEANING_STATUS['PUBLISHING'] ||
          // status === SQL_PUBLISH_MEANING_STATUS['ROLLBACK_SUCCEED'] ||
          status === SQL_PUBLISH_MEANING_STATUS['IN_ROLLBACK']
          // ||
          // status === SQL_PUBLISH_MEANING_STATUS['ROLLBACK_FAILED']
        ) {
          step = 2
        }
        if (step === null) {
          message.error('无法编辑当前 SQL！')
          yield put(routerRedux.push({
            pathname: '/sql-publish',
          }))
        } else if (inputStep !== step ) {
          yield put(routerRedux.push({
            pathname: `/sql-publish/${id}/${step}`,
          }))
        }
        if (step) {
          yield put({
            type: 'handleCurrentStep',
            payload: Number(step)
          })
        }
      } else {
        message.error('无法编辑当前 SQL！')
        yield put(routerRedux.push({
          pathname: '/sql-publish',
        }))
      }
    },
  },
  subscriptions: {
    setup ({dispatch, history}) {
      dispatch({type: 'getInstances'})
      history.listen(({pathname,search}) => {
        let fullPath = pathname + search
        if (/sql-publish(\/)create/.test(fullPath)) {  // 新建页获取对应id
          dispatch({    // 先统一清空内容，有id的再跳转到对应id的编辑页
            type: 'reset',
          })
          const currentSqlId = cache.get('currentSqlId')
          if (currentSqlId) {
            dispatch({  //  防止手动跳转到不能去的地方
              type: 'toEdit',
              payload: {
                id: currentSqlId,
                inputStep: 0   // step=1,2,3时不进行跳转操作
              }
            })
          }
        }
        if (/sql-publish(\/)(\d+)(\/)(\d+)$/.test(fullPath)) {  // 编辑页获取对应id
          const path = pathToRegexp('/sql-publish/:id(\\d+)/:step(\\d+)').exec(fullPath)
          dispatch({
            type: 'reset',
          })
          dispatch({
            type: 'handleSqlID',
            payload: path[1]
          })

          dispatch({  //  防止手动跳转到不能去的地方
            type: 'toEdit',
            payload: {
              id: path[1],
              inputStep: Number(path[2])
            }
          })
          dispatch({
            type: 'sqlDetail',
            payload: path[1]
          })
          // dispatch({  //  这里改currentstep可能超过3
          //   type: 'handleCurrentStep',
          //   payload: Number(path[2])
          // })
          // dispatch({  // 跳转备份页须调取各实例待选备份表, 考虑到上一步下一步的时候并没有更新路径中的step，所以一进入页面就请求
          //   type: 'getInstanceBackupTables'
          // })
        }
      })
    }
  }
}
