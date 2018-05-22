/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-07-31 10:02 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Layout } from 'antd'
import { browserHistory, Link } from 'dva/router'
import { IconFont, ProgressIcon, WebSocket } from 'components'

import styles from './Content.less'

const connect = (mapProps) => (wrappedElement) => {
  if (wrappedElement && typeof wrappedElement !== 'function') {
    throw new Error(`type is invalid -- expected a class/function, but got: ${typeof wrappedElement} `)
  }

  if(typeof wrappedElement === 'function' && typeof mapProps === 'function'){
    return wrappedElement(mapProps())
  }
  return ''
}

const Content = ({children, gobackBtn, currentMenu, pageBtns, pageTips}) => {

  return (
    <Layout.Content className={styles.content}>
      <div className="content-header">
        <h3 className="content-title">
          { connect(()=> gobackBtn.props)(gobackBtn.element)}
          { currentMenu.activeName }
        </h3>
        { connect(()=> pageTips.props)(pageTips.element)}
        <div className="content-btns">
          { connect(()=> pageBtns.props)(pageBtns.element)}
        </div>
      </div>
      <div className="content-inner">
        { children }
      </div>
    </Layout.Content>
  )
}

Content.propTypes = {
  children: PropTypes.element.isRequired,
  gobackBtn: PropTypes.object,
  currentMenu: PropTypes.object,
  pageBtns: PropTypes.object,
  pageTips: PropTypes.object,
}

export default Content
