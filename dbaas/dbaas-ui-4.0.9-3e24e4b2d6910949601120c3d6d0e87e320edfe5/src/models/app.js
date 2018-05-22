import { login, logout,clearMsg, getlatestMsgs, editSetting} from 'services/app'
import jwtDecode from 'jwt-decode';
import { Logger, Cache, matchPath } from 'utils';

import { message, Modal, Row } from 'antd'
import { routerRedux } from 'dva/router'
import pathToRegexp from 'path-to-regexp'

const cookie = new Cache('cookie')
const cache = new Cache()

// import { socketService } from 'services/websocket'

const getMenus = (menus) => {
  menus = menus || cache.get('menus', {})
  const { tree, overview, top, page } = menus

  return {
    treeMenus: tree || {}, //层级关系的菜单:一级--二级--三级
    overviewMenus: overview || [], //总览菜单, 没有二级菜单,直接:一级--三级
    topMenus: top || [], //一级菜单
    pageMenus: page || {}, //三级菜单
  }
}

export default {
  namespace: 'app',
  state: {
    loggedIn: false,
    user: {
      name: 'User',
      email: '',
      uid: ''
    },
    loginLoading: false,
    latestMsgs: [],
    currentMenu: {
      topName: '', // 当前选中的一级
      tree: [], // 选中的二级、三级(tree[].children), 左侧 sider 需要遍历这个
      activeName: '', // 选中的三级
      activeKey: '', // 选中的三级
      selectedKey: '', // 指定高亮key
    },
    pageTips: {
      props: {},
      element: null
    },
    pageBtns: {
      props: {},
      element: null
    },
    gobackBtn: {
      props: {}, element: null
    },
    setting:{
      title:'账户设置',
      visible:false,
      old_password: '',
      password:'',
      password_confirmation:''
    },

    ...getMenus()
  },

  reducers: {
    loginSuccess (state, action) {
      return {
        ...state,
        ...action.payload,
        loggedIn: true,
        loginLoading: false
      }
    },
    logoutSuccess (state, action) {
      return {
        ...state,
        ...action.payload,
        loggedIn: false,
        loginLoading: false
      }
    },
    clearMsgSuccess (state,action) {
      return {
        ...state,
        latestMsgs:[]
      }
    },

    latestMsgs (state) {
      cookie.forget('token')
      return {
        ...state,
        loggedIn: false,
      }
    },

    loginFail (state) {
      return {
        ...state,
        loggedIn: false,
        loginLoading: false,
      }
    },

    handleNotify (state, action) {
      return {
        ...state,
        latestMsgs: action.payload
      }
    },

    showLoginLoading (state) {
      return {
        ...state,
        loginLoading: true,
      }
    },

    handleGobackBtn (state, action){
      return {
        ...state,
        gobackBtn: {
          ...state.gobackBtn,
          ...action.payload,
        }
      }
    },

    handleCurrentMenu (state, action){
      const currentMenu = {
        ...state.currentMenu,
        ...action.payload,
      }
      return {
        ...state,
        currentMenu: currentMenu
      }
    },

    handlePageBtns (state, action){
      return {
        ...state,
        pageBtns: {
          ...state.pageBtns,
          ...action.payload,
        }
      }
    },
    handlePageTips (state, action){
      return {
        ...state,
        pageTips: {
          ...state.pageTips,
          ...action.payload,
        }
      }
    },
    handleSettingModal (state,action){
      return {
        ...state,
        setting: {
          ...state.setting,
          ...action.payload
        }
      }
    },
  },
  effects: {
    *login ({
              payload,
            }, { call, put }) {

      yield put({type: 'showLoginLoading'})
      const res = yield call(login, payload)
      const { code, data, msg } = res

      if (code === 0) {
        const tokenInfo = jwtDecode(data.token)
        // console.log(tokenInfo)
        const expires = (tokenInfo.exp - (+new Date() / 1000)) / 60
        cookie.put('token', data.token)
        cookie.put('username', tokenInfo.user_name, expires)
        cookie.put('uid', tokenInfo.uid, expires)
        cache.put('permissions', data.permissions, expires)
        cache.put('menus', data.menus, expires)
        /*** 20180404 新增email 管理websocket的***/
        cache.put('email', tokenInfo.email, expires)

        yield put({
          type: 'loginSuccess',
          payload: {
            user: {
              name: tokenInfo.user_name,
              /*** 20180404 新增email 管理websocket的***/
              email: tokenInfo.email,
              uid: tokenInfo.uid
            },
            ...getMenus(data.menus)
          }
        })
        //browserHistory.push('/dashboard') // 登录成功跳转首页
        yield put(routerRedux.push({
          pathname: '/dashboard',
        }))
      } else {
        yield put({
          type: 'loginFail',
        })
        message.error(msg)
      }
    },
    *loggedIn ({
                 payload,
               }, { put, select }) {
      const token = cookie.get('token')

      if(!token){
        //browserHistory.push('/login')
        yield put(routerRedux.push({
          pathname: '/login',
        }))
      }

      yield put({
        type: 'loginSuccess',
        payload: {
          user: {
            name: cookie.get('username'),
            uid: cookie.get('uid'),
            email: cache.get('email')
          },
          ...getMenus()
        }
      })
    },
    *logout ({
               payload,
             }, { call, put }) {
      const res = yield call(logout, payload)

      if (res.code === 0) {
        yield put({
          type: 'logoutSuccess',
        })
        window.location.href = '/login'
      } else {
        message.error(res.error || res.msg)
      }
    },
    *clearMsg ({
                 payload,
               }, { call, put }) {
      if(payload.ids.length !== 0){
        const res = yield call(clearMsg, payload);
        if (res.code === 0) {
          yield put({
            type: 'clearMsgSuccess'
          })
          message.success('执行操作成功！')
        } else {
          message.error(res.error || res.msg)
        }
      }else {
        message.error('没有消息啦！')
      }
    },
    *getlatestMsgs ({
                      payload,
                    }, { call, put }) {
      const res = yield call(getlatestMsgs, payload);
      if (res.code === 0) {
        yield put({
          type: 'handleNotify',
          payload: res.data
        })
      }else{

      }
    },
    *editSetting({payload} , {call , put}){
      let res = yield call(editSetting , payload)
      if(res.code === 0){
        //yield put({type:'resetSetting'})
        yield put ({type:'handleSettingModal',payload:{visible:false}})
        Modal.info({
          title: '提示',
          content: (
            <Row>
              <span>新密码设置成功，请在下次登录时使用新密码进行登录。</span>
            </Row>
          ),
          onOk() {},
        })
      }else{
        message.error(res.msg)
      }
    },
  },
  subscriptions: {
    setup ({ dispatch, history }) {
      history.listen(({ pathname }) => {
        // console.log('pathname===>', pathname)
        if(pathname === '/login' || pathname === '/logout'){
          console.log('login');
          return
        }
        dispatch({type: 'loggedIn'})
        dispatch({type: 'getlatestMsgs'})


        //根据 path 找出对应菜单
        //遍历三级菜单, 进行 pathToRegexp, match, 则 填充 currentMenu
        const { pageMenus, treeMenus } = getMenus()

        let match = null
        let missPaths = []

        const pluck = ({ name, parent, key }) =>({name, parent, key})

        if (pathname in pageMenus) { //能直接找到最好
          match = pluck(pageMenus[pathname])
        } else {
          const pageMenuKeys = Object.keys(pageMenus);

          for (let i = 0; i < pageMenuKeys.length; i++) {
            const item = pageMenus[pageMenuKeys[i]]
            const path = item.path.trim('/')
            pathname = pathname.trim('/')

            if (pathToRegexp(path).exec(pathname)) {
              //匹配 /aa/:bb
              match = pluck(item)
              break
            } else if (pathToRegexp(path + '(.*)').exec(pathname)) {
              // 扩大范围
              // @todo 匹配度,来定优先级
              // 如 path: /aa/bb/add , 都会匹配到: /aa/bb 、/aa/bb/add
              // 如果先遇到 /aa/bb,会匹配成功,跳出循环, /aa/bb/add 将不会被匹配到
              match = pluck(item)
              break
            } else {
              // 无能为力了
              missPaths.push(path)
            }
          }
        }
        if (!match || !match.parent) {
          console.log('pathToRegexp not match, pathname:', pathname, '\nmissPaths:', missPaths)
          return false
        }

        dispatch({
          type: 'handleCurrentMenu',
          payload: {
            topName: treeMenus[match.parent]['name'],
            tree: treeMenus[match.parent]['children'],
            activeName: match.name,
            activeKey: match.key,
          }
        })
      })
    },

    socket({dispatch}){
      // return socketService(window.DS.WS_URL, data => {
      //   Logger.info('进来了')
      // })
    }
  }
}
