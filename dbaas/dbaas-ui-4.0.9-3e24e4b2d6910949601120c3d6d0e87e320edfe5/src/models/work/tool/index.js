import { Menu } from 'utils'
import { list as nodeList } from 'services/node'
import { getToolTags, getTools, deleteTag, createTool, getToolDetail } from 'services/tool'
import { Modal, message } from 'antd'
import {update} from 'san-update'

import { Cache } from 'utils'
const cache = new Cache()

import pathToRegexp from 'path-to-regexp'

export default {
  namespace: 'work/tool',
  state: {
    tags: [],
    oftenUsedTools: [],
    tools: [],
    currentTools: [],  // 筛选出的工具
    tagID: '',         // 当前点击tag的ID
    keyword: '',
    resultTitle: '',    // 筛选结果
    loading: false
  },
  reducers: {
    getTags (state, action) {
      return {
        ...state,
        tags: action.payload
      }
    },
    deleteTags (state, action) {  // 用显示隐藏实现标签伪删除
      state.tags[action.payload].tagShow = false
      return {
        ...state,
        tags: state.tags.filter(item => item.tagShow === true)
      }
    },
    handleResultTitle (state, action) {  // 标签或关键字筛选结果
      return {
        ...state,
        resultTitle: action.payload
      }
    },
    updateTags (state, action) {  // 点击tag时高亮，再次点击回复颜色并取消选中
      state.tags = state.tags.map((v)=>{
        if (v.tag_name === action.payload) {
          v.tagChecked = !v.tagChecked
        } else {
          v.tagChecked = false
        }
        return {...v, tagChecked: v.tagChecked}
      })
      return {
        ...state,
        tags: state.tags
      }
    },
    handleOftenUsedTools (state, action) {
      return {
        ...state,
        oftenUsedTools: action.payload
      }
    },
    handleTools (state, action) {
      return {
        ...state,
        tools: action.payload
      }
    },
    handleCurrentTools (state, action) {
      return {
        ...state,
        currentTools: action.payload
      }
    },
    handleTagID (state, action) {
      return {
        ...state,
        tagID: action.payload
      }
    },
    handleKeyword (state, action) {
      return {
        ...state,
        keyword: action.payload
      }
    },
    checkScript (state) {
      return {
        ...state,
        scriptAvailable: false
      }
    },
    handleLoading (state) {
      return {
        ...state,
        loading: !state.loading
      }
    },
  },
  effects: {
     *getToolTags ({
      payload,
      }, { call, put }) {
       const res = yield call(getToolTags)
       res.data = (res.data || []).map((v)=>{
         return { ...v, tagShow: true, tagChecked: false }
       })
       if (res.code === 0) {
         yield put({
           type: 'getTags',
           payload: res.data
         })
         yield put({
           type: 'app/handlePageBtns',
           payload: {props: {disabled: true}}
         })
       }
     },
    *getOftenUsedTools ({
     payload
     }, { call, put }) {
       const res = yield call(getTools, {often: 1})
       if (res.code === 0) {
         yield put({
           type: 'handleOftenUsedTools',
           payload: res.data.data || []
         })
       }
     },
    // *getTools ({
    //  payload
    //  }, { call, put }) {
    //    const res = yield call(getTools)
    //    if (res.code === 0) {
    //      yield put({
    //        type: 'handleTools',
    //        payload: res.data.data
    //      })
    //    }
    //  },
    *getCurrentTools ({
     payload
     }, { call, put, select }) {
      const { tagID, keyword } = yield select((state) => { return state['work/tool']})
      const res = yield call(getTools, {tags: tagID, keyword})
      yield put({
        type: 'handleLoading'
      })
      if (res.code === 0) {
        yield put({
          type: 'handleCurrentTools',
          payload: res.data.data || []
        })
        yield put({
          type: 'handleLoading'
        })
      } else {
        yield put({
          type: 'handleLoading'
        })
      }
    },
    *deleteTag ({  // 这是真的删除tag了
     payload
     }, { call, put }) {
      const { id } = payload
       const res = yield call(deleteTag, {id})
       if (res.code === 0) {
        message.success('删除标签成功')
       } else {
        message.error(res.error || res.msg)
       }
     },
  },
  subscriptions: {
    setup ({ dispatch, history }) {
      history.listen(({pathname}) => {
        const match = pathToRegexp('/scripts').exec(pathname)
        if(match){
          dispatch({
            type: 'handleTagID',
            payload: ''
          })
          dispatch({
            type: 'handleKeyword',
            payload: ''
          })
          dispatch({type: 'getToolTags'})
          dispatch({type: 'getCurrentTools'})
          dispatch({type: 'getOftenUsedTools'})
        }
      })

    }
  },
};
