/**
 *
 * @copyright(c) 2017
 * @created by lizzy
 * @package dbaas-ui
 * @version :  2017-06-27 21:28 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { classnames, Logger } from 'utils'
import { DataTable, IconFont } from 'components'
import { Form, Input, InputNumber, Switch, Modal, Row, Col } from 'antd'
import styles from './iconModal.less'

const IconModal = ({
   visible,
   selectColor,
   selectedColor,
   selectIcon,
   selectedIcon,
   onOk,
   onCancel,
 })=>{
  const modalOpts = {
    title: '设置工具图标和样式',
    visible,
    onOk(){
      if (onOk){
        onOk()
      }
    },
    onCancel,
    wrapClassName: 'vertical-center-modal',
    width: '70%',
  }

  const colors = ['#31719f', '#167be0', '#6c9fcb', '#43bb22', '#ff7f00', '#e60014']
  const icons = ['wrench', 'bank', 'battery', 'book', 'calendar', 'ban', 'certificate', 'cloud', 'cog', 'cogs', 'comments', 'credit-card', 'cubes', 'database', 'desktop', 'feed', 'history', 'heartbeat', 'key', 'briefcase', 'recycle']

  const chooseColor = (color) => {
    if (selectColor) {
      selectColor(color)
    }
  }

  const chooseIcon = (icon) => {
    if (selectIcon) {
      selectIcon(icon)
    }
  }

  return (
    <Modal {...modalOpts} className={styles["icon-modal"]}>
      <Row>
        <Col span={24}>颜色:</Col>
        <Col span={24}>
          {
            colors.map((color) => {
              let className = 'hide'
              if (color === selectedColor) {
                className = ''
              }
              return <div key={color} className="color" style={{backgroundColor: color, boxShadow: color === selectedColor ? '0 0 0 1px' + color : ''}} onClick={chooseColor.bind(this, color)}>
                <IconFont className={className} type={'iconfont-check'}/>
              </div>
            })
          }
        </Col>
        <Col span={24}>图标：</Col>
        <Col span={24}>
          {
            icons.map((icon) => {
              let className1 = "icon-wrapper"
              let className2 = "check"
              if (icon ===  selectedIcon) {
                className1 = "icon-wrapper checked"
                className2 = "check show"
              }
              return (
                <div key={icon} className={className1} onClick={chooseIcon.bind(this, icon)}>
                  <IconFont type={'iconfont-' + icon} className='iconfont'/>
                  <IconFont className={className2} type={'iconfont-check'}/>
                  <span className="icon-name">{icon}</span>
                </div>
                )
            })
          }
        </Col>
        <Col span={24}>预览：</Col>
        <Col span={24} className="icon-group">
            <IconFont type="iconfont-hexagon1" style={{color: selectedColor}} className="bg-icon"/>
            <IconFont type={'iconfont-' + selectedIcon} className="tool-icon"/>
        </Col>
      </Row>
    </Modal>
  )
}

IconModal.propTypes = {
  selectColor: PropTypes.func,
  selectedColor: PropTypes.string,
  selectIcon: PropTypes.func,
  selectedIcon: PropTypes.string,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
}

export default IconModal
