/**
 * Created by wengyian on 2017/9/4.
 */
import { message, Modal } from 'antd'
import { getDeploy, offline } from 'services/offline'
import { routerRedux } from 'dva/router'
import pathToRegexp from 'path-to-regexp'
import { constant } from 'utils'
import queryString from 'query-string'

const { RELATE_TYPE } = constant


export default {
  namespace : 'offline/types',
  state : {
    filter : {
      keyword : '',
      // client_id : 1,
    },
    reload : 0,
    tag : 'cluster',//默认 cluster 还有 set instance
    selectedItem : [],
    tipModalVisible : false,
    force : false,
    relateType : 0,
    spinning : false
  },
  reducers : {
    handleFilter(state, action){
      return {
        ...state,
        filter : {
          ...state.filter,
          ...action.payload
        }
      }
    },

    clearFilter(state, action){
      return {
        ...state,
        filter : {
          keyword : '',
          // cluster_id : 1,
        }
      }
    },

    handleTag(state, action){
      return {
        ...state,
        tag : action.payload
      }
    },

    setSelected(state, action){
      const { selected, changeRows } = action.payload
      let newSelectedItem = [...state.selectedItem]
      if(selected){
        // newSelectedItem.push(...changeRows)
        changeRows.forEach(v => {
          newSelectedItem.push(v.id)
        })
      }else{
        changeRows.forEach(v => {
          newSelectedItem = newSelectedItem.filter( val => val != v.id)
        })
      }
      return {
        ...state,
        selectedItem : newSelectedItem
      }
    },

    handleReload(state, action){
      return {
        ...state,
        reload : (+ new Date())
      }
    },

    toggleTipModalVisible(state, action){
      const visible = state.tipModalVisible
      return {
        ...state,
        tipModalVisible: !visible
      }
    },

    setSpinningFalse(state, action){
      return {
        ...state,
        spinning: false
      }
    },


    setSpinningTrue(state, action){
      return {
        ...state,
        spinning: true
      }
    },

    setSelectedIds(state, action){
      return {
        ...state,
        selectedItem : action.payload
      }
    },

    setForce(state, action){
      return {
        ...state,
        force : action.payload
      }
    },

    setRelateType(state, action){
      return {
        ...state,
        relateType : action.payload
      }
    }

  },
  effects : {
    *offline({
      payload
    }, { put, call }){
      // const data = {...payload}
      // const showModal = data.showModal
      // delete data.showModal
      const res = yield call(offline, payload)

      yield put({
        type : 'setSpinningFalse'
      })

      if(res.code == 0){
        // message.success('下线任务已在后台执行，您可以稍候在下线历史列表查看进度及结果。')
        // yield put(routerRedux.push('/offline'))
        yield put({
          type : 'toggleTipModalVisible'
        })
        yield put({
          type : 'setForce',
          payload : false
        })
      }else{
        message.error(res.error || res.msg)
      }
    }
  },
  subscriptions : {
    // 判断 url 带的参数 来决定请求那个  cluster: 集群，instance：实例，set：实例组
    setup({dispatch, history}){
      history.listen(({pathname, search}) => {
        let match = pathToRegexp('/offline/types').exec(pathname)
        if(match){
          const query = queryString.parse(search)
          const tag = query.tag || 'cluster'
          let ids = query.ids || ''
          ids = ids ? ids.split(',').map( v => parseInt(v)) : []
          dispatch({
            type : 'handleTag',
            payload : tag
          })
          // todo 处理 ids 为选中项
          dispatch({
            type : 'setSelectedIds',
            payload : ids
          })
          /**************20171204 适配实例的下线****************/
          dispatch({
            type : 'setRelateType',
            payload : RELATE_TYPE[tag]
          })
        }
      })
    }
  }
}
