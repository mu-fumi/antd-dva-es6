/**
 * Created by zhangmm on 2017/10/30.
 */
import { deleteDatabase, getNodes, getUrl } from 'services/database'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'database',
  state:{
    nodes:{},
    chooseLogin:'',
    placeholder : '根据关键词搜索业务',
    keyword : '',
    reload:(+ new Date())
  },
  reducers:{
    handleReload:(state) => {
      return {
        ...state,
        reload:(+ new Date())
      }
    },
    handleFilter (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handleNodes (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handleChooseLogin (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    resetFilter(state) {
      return {
        ...state,
        keyword : ''
      }
    },
  },
  effects:{
    *deleteDatabase({payload} , {call , put}){
      let res = yield call(deleteDatabase , payload)
      if(res.code === 0){
        message.success("数据库删除成功")
        yield put({type:"handleReload"})
      }else{
        message.error(res.msg)
      }
    },
    *getNodes({payload} , {call , put}){
      let res = yield call(getNodes , payload)
      if(res.code === 0){
        let nodes = {}
        if('nodes' in res.data){
          res.data['nodes'].forEach((node)=>{
            let nodeType = ''
            switch (node.node_type) {
              case 1:
                nodeType = '主机'
                break
              case 2:
              case 6:
                nodeType = '备机'
                break
              case 3:
              case 7:
                //case 4:
                nodeType = '网关'
                break
              case 5:
                nodeType = '从机'
                break
              default :
                break
            }
            if(nodeType !== ''){
              nodes[nodeType] = nodeType in nodes ? nodes[nodeType] : []
              nodes[nodeType].push(`${node.node_ip}:${node.node_port}`)
            }
          })
        }
        yield put({
          type:"handleNodes",
          payload:{
            nodes:nodes,
            chooseLogin: nodes['主机'][0]
          }
        })
      }else{
        message.error(res.msg)
      }
    },
    *getUrl({payload} , {call , put}){
      let res = yield call(getUrl , payload)
      if(res.code === 0){
        let el = document.createElement('a')
        let a = document.createElement('a')
        document.body.appendChild(el)
        el.href = res.data.url
        el.target = '_blank'
        el.appendChild(a)
        a.click()
        document.body.removeChild(el)
      }else{
        message.error(res.msg)
      }
    },
  },
  subscriptions:{
  }
}
