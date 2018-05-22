import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Link } from 'dva/router'
import NProgress from 'nprogress'

import { Layout, IconFont, SockComponent } from 'components'
import { classnames } from 'utils'
import { Layout as LayoutComponent, Menu, Breadcrumb, Icon, Spin } from 'antd'

// 国际化。3以上版本默认英文
import { LocaleProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';

import 'styles/skin.less'


const { Footer } = LayoutComponent
const { styles, Header, Sider, Content } = Layout

//const { Header, Aside, Footer, Container, styles } = Layout

const App = ({
               children, app, loading, dispatch, location
             }) => {

  const { user, latestMsgs, gobackBtn, currentMenu, topMenus, overviewMenus,
    pageBtns, pageTips, setting, loggedIn } = app

  if(!loading){
    NProgress.done()
  }

  const settingProps = {
    ...setting,
    onCancel:() =>{
      dispatch({ type: 'app/handleSettingModal', payload:{visible:false} })
    },
    showSettingProps(){
      dispatch({ type: 'app/handleSettingModal', payload:{visible:true} })
    }
  }

  const headerProps = {
    topMenus: topMenus,
    user:user,
    latestMsgs: latestMsgs,
    overviewMenus: overviewMenus,
    setting:settingProps,
    logout () {
      dispatch({ type: 'app/logout' })
    },
    onClear (allMsgId){
      dispatch({
        type: 'app/clearMsg',
        payload:{
          ids:allMsgId
        }
      })
    },
  }

  const siderProps = {
    currentMenu:currentMenu
  }

  const contentProps = {
    children:children,
    gobackBtn: gobackBtn,
    currentMenu: currentMenu,
    pageBtns: pageBtns,
    pageTips: pageTips,
  }

  return (
    <LocaleProvider locale={zh_CN}>
      <LayoutComponent className={styles.layout}>
        <Header {...headerProps} />
        <LayoutComponent.Content className={styles.content}>
          <LayoutComponent className="ant-layout-has-sider">
            <Sider {...siderProps } />
            <Content {...contentProps} />
          </LayoutComponent>
        </LayoutComponent.Content>
        <Footer className="text-center">
          HCFDBaaS &copy; {(new Date().getFullYear())}
        </Footer>
        <SockComponent
          url={window.DS.WS_URL}
          user={user}
          loggedIn={loggedIn}
          dispatch={dispatch}
          location={location}
        />
      </LayoutComponent>
    </LocaleProvider>
  )
}

App.propTypes = {
  children: PropTypes.element.isRequired,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  app: PropTypes.object,
  loading: PropTypes.bool,
}


export default connect(({ app, loading }) => ({ app, loading: loading.global }))(App)
