/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-07-31 10:02 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Layout, Row, Col, Menu, Avatar, Badge, Dropdown } from 'antd'
import { Link } from 'dva/router'
import { IconFont, ProgressIcon } from 'components'

import styles from './Sider.less'

const Sider = ({currentMenu}) => {
  const makeItem = (item)=>{
    return (
      <Menu.Item key={item.name + item.key}>
        <IconFont type={`iconfont-${item.icon}`} />
        <Link to={`${item.path}`}>
          {item.name}
        </Link>
      </Menu.Item>
    )
  }
  const selectedKey = currentMenu.selectedKey ? currentMenu.selectedKey : currentMenu.activeName + currentMenu.activeKey
  return (
    <Layout.Sider className={styles.sider} width={220}>
      <h2 className="sider-header">
        { currentMenu.topName }
      </h2>
      <Menu
        mode="inline"
        defaultSelectedKeys={[selectedKey]}
        selectedKeys={[selectedKey]}
        // style={{ height: '100%' }}  //  antd3 中 height：100% 会导致menu下部超出
        className="sider-container"
      >
        { currentMenu.tree.map((item, index)=>{
          if(item.children && Array.isArray(item.children)){
            return <Menu.ItemGroup key={index} title={<span>{item.name}</span>}>
              { item.children && item.children.map((v, i)=>{
                return makeItem(v)
              })}
            </Menu.ItemGroup>
          }else{
            return makeItem(item)
          }
        })}
      </Menu>
    </Layout.Sider>
  )
}

Sider.propTypes = {
  currentMenu: PropTypes.object,
}

export default Sider
