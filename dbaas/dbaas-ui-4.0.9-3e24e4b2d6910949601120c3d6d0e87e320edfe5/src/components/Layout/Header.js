/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-07-28 15:02 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Layout, Row, Col,Menu, Avatar, Badge, Popover, Dropdown, message } from 'antd'
import { Link } from 'dva/router'
import { IconFont, MessageIcon } from 'components'

import styles from './Header.less'
import SettingModal from './SettingModal.js'

const Header = ({topMenus, overviewMenus, user, logout, latestMsgs, setting, onClear}) => {

  let allMsg = [];
  let iconMsgText = '';

  const msgs = !latestMsgs.length ? [] : latestMsgs;
  let handleClickMenu = e => e.key === 'logout' ? logout() : (e.key === 'setting' ? setting.showSettingProps() : '')
  const topMenu = topMenus && topMenus.map((v)=> {
      return <Menu.Item key={v.key}>
        <Link to={`${v.path}`}>
          {v.name}
        </Link>
      </Menu.Item>
    })

  const notifyMenu = msgs.map((data, index)=> {
    return <Menu.Item key={index} >
      { data.id ? (
        <Link to={`/job/${data.link_id.split('/')[data.link_id.split('/').length-1]}`} >
          <span className="message-content">
            <MessageIcon type={ data.type } className="icon"/>
            <span>{data.title}</span>
          </span>
          <span className="message-time" >{data.human_time}</span>
        </Link>
      ) : (
        <span className="no-message">没有最新消息</span>
      )
      }
    </Menu.Item>
  })

  allMsg = msgs.map((v,k)=> {
    return {
      ids: v.id
    }
  })
  if(msgs.length !== 0){
    iconMsgText = '清空';
  }else {
    iconMsgText = '暂无';
  }

  const overviewMenu = (
    <Menu className="overview-menu">
      <Menu.Item key="0">
        { overviewMenus.map((menu, index) => {
          return (
            <dl key={index}>
              <dt>
                <Link to={`${menu.path}`}>
                  {menu.name}
                </Link>
              </dt>
              {menu.children.map((v, i)=> {
                return <dd key={i}>
                  <IconFont type={`iconfont-${v.icon}`}/>
                  <Link to={`${v.path}`}>
                    {v.name}
                  </Link>
                </dd>
              })}
            </dl>
          )
        })
        }
      </Menu.Item>
    </Menu>
  )

  const settingModalProps = {
    ...setting
  }

  const userName = () => {
    if (user.name) {
      if ( /( |^)[a-z]/g.test(user.name) ) {
        return user.name.ucfirst()[0]  // 字母开头取大写首字母
      } else {
        return String(user['name'])[0]  // 数字开头取数字
      }
    } else {
      return ''
    }
  }

  return (
    <Layout.Header className={styles.header}>
      <div className={styles.logo} id="logo">
        <Link to="/">
          <img alt="logo" src="https://t.alipayobjects.com/images/rmsweb/T1B9hfXcdvXXXXXXXX.svg"/>
        </Link>
        <Dropdown
          overlay={overviewMenu}
          placement="bottomCenter"
          trigger={['click']}
          style={{top: "56px"}}
          overlayClassName="popover-menu"
          autoAdjustOverflow={false}
          getPopupContainer={() => document.getElementById('logo')}
        >
          <Link className={styles.overview} to="/">
            <IconFont type='iconfont-th'/>
          </Link>
        </Dropdown>
      </div>
      <Menu
        theme="dark"
        mode="horizontal"
        className={styles.menu}
      >
        { topMenu }
      </Menu>
      <Menu theme="dark"
            mode="horizontal"
            className={styles.profile}
            onClick={handleClickMenu}
      >

        {/*消息列表*/}
        <Menu.SubMenu className={styles["profile-item"]}
                      title={
                        <Badge dot={ !!latestMsgs.length }>
                          <IconFont type="notification"/>
                        </Badge>
                      }
        >
          { notifyMenu }
          <Menu.Item key="message" className="message-all">
            <a href="javascript:void(0);" onClick={() =>onClear(allMsg)} >
              {iconMsgText}消息
            </a>
            {/* <Link to="/cmdb/message">
             查看全部消息
             </Link>*/}
          </Menu.Item>
        </Menu.SubMenu>


        <Menu.SubMenu className={styles["profile-item"]}
                      title={
                        <a href="javascript:void(0);" onClick={() =>setting.showSettingProps()} className="item-link">
                          <Avatar className="avatar">
                            { userName() }
                          </Avatar>
                          <IconFont type="down"/>
                        </a>
                      }
        >
          <Menu.Item key="setting">
            <span href="javascript:void(0);">
              账户设置
            </span>
          </Menu.Item>
          <Menu.Item key="logout">
            <span>注销</span>
          </Menu.Item>
        </Menu.SubMenu>
      </Menu>
      <SettingModal {...settingModalProps}/>
    </Layout.Header>
  )
}

Header.propTypes = {
  user: PropTypes.object,
  logout: PropTypes.func,
  onClear:PropTypes.func,
  latestMsgs: PropTypes.array,
  topMenus: PropTypes.array,
  overviewMenus: PropTypes.array,
  setting: PropTypes.object,
}

export default Header
