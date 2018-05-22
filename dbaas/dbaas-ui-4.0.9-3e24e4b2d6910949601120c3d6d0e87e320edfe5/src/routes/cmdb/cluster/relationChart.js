/**
 * Created by wengyian on 2017/9/12.
 */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, Select, message, Tooltip, Button, Modal, Card} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon,} from 'components'
import {routerRedux, Link, browserHistory,} from 'dva/router'
import {classnames, constant, TimeFilter} from 'utils'
import _ from 'lodash'
import styles from './relationChart.less'
import JsPlumbComponent from 'components/JsPlumb/JsPlumb'
import {
  commonSettings, defaultSettings,
  connectorStyle, connectorOverlays, disabledConnectorOverlays
} from 'components/JsPlumb/JsPlumb-settings'

class RelationChart extends React.Component {
  constructor(props) {
    super(props)

  }

  componentWillReceiveProps(nextProps) {

  }

  render() {
    const {nodes = {}} = this.props
    // console.log('nodes===>', nodes)
    let connections = []
    let newNodes = {}
    let existGateWay = false
    let existMaster = false
    let existSlave = false
    let existNodeGuard = false
    Object.keys(nodes).forEach((key, i) => {
      nodes[key].forEach(item => {
        connections.push({
          from: item.id.toString(),
          to: item.pid.toString()
        })
        let content = ''
        let className = item.alive == 0 ? '' : styles["icon-alive-error"]
        switch (item.type_meanings) {
          case 'MASTER' :
            // console.log('master')
            existMaster = true
            content = <IconFont type="iconfont-commdbsign" className={classnames(className, styles["icon-chart"])}/>
            break
          case 'SLAVE' :
            // console.log('slave')
            existSlave = true
            content = <IconFont type="iconfont-commdbr" className={classnames(className, styles["icon-chart"])}/>
            break
          case 'GATEWAY' :
            // console.log('gateway')
            existGateWay = true
            existNodeGuard = true

            const src = item.alive == 0
              ? require('/../public/images/gw_default.png') : require('/../public/images/gw_red.png')
              // ? require('../../../images/gw_default.png') : require('../../../images/gw_red.png')
            content = <img src={src} alt="" className={styles["icon-chart"]}/>
            // content = <IconFont type="iconfont-44zidongshixianshujuwangguan" className={styles["icon-chart"]}/>
            break
        }

        // console.log('newNodes[key]===>', newNodes[key])
        if (!newNodes[key]) {
          newNodes[key] = []
        }
        newNodes[key].push({
          id: item.id.toString(),
          tooltip: item.name,
          alive: item.alive,
          type: "transform",
          content,
          style: {
            top: 30 + (key - 1) * 90 + 'px',
            left: ''
          }
        })
      })
    })
    // console.log('newNodes===>', newNodes)

    // 计算每个节点的位置
    const container = document.getElementById('jsPlumb-container')
    let containerWidth = 0
    if (container) {
      containerWidth = parseInt(window.getComputedStyle(container).width)
    }
    // console.log('containerWidth===>', containerWidth)
    let width = existGateWay ? 80 : 40
    Object.values(newNodes).forEach((item, key) => {
      const length = item.length

      item.forEach((v, i) => {
        width = (v.type_meanings === 'GATEWAY' && width > 40) ? 40 : 80
        const offset = (containerWidth - length * width ) / (length + 1)
        v.style.left = offset * ( i + 1) + width * i + 'px'
        const className = v.alive === 0 ? styles["alive-success"]
          : styles["alive-error"]
        let newContent = ''
        // 是否需要添加 nodeguard 图片
        if(existGateWay && key!== 'gateway'){
          const src = v.alive === 0 ?
            // require('../../../images/ng_default.png') : require('../../../images/ng_red.png')
            require('/../public/images/ng_default.png') : require('/../public/images/ng_red.png')
          newContent = <img src={src} alt="" className={styles["icon-chart"]}/>
          // newContent = <IconFont type="iconfont-dunpai" className={styles["icon-chart"]} />
        }
          // if (existGateWay) {
          let oldContent = v.content
          v.content = <Row className={className}>
            {oldContent}
            {newContent}
          </Row>
        // }
      })
    })

    let targetNodes = []
    Object.values(newNodes).forEach(item => {
      targetNodes = targetNodes.concat(item)
    })

    const data = {
      nodes: targetNodes,
      connections,
    }


    // return null
    // let dataNodes = {master: [], slave: [], gateway: [], vip: [], '丛机': []}
    // //  todo 暂时未处理 丛机要干嘛 vip 要干嘛
    // let dataConnections = []
    // nodes.length && nodes.forEach(item => {
    //   let node_type = '丛机'
    //   let content = ''
    //   let type = ''
    //   // 主机
    //   if (item.node_type === 1) {
    //     node_type = 'master'
    //     type = 'source'
    //     content = <IconFont type="iconfont-commdbsign" className={styles["icon-chart"]}/>
    //   } else if (item.node_type === 2 || item.node_type === 5 || item.node_type === 6) {
    //     node_type = 'slave'
    //     type = 'sink'
    //     content = <IconFont type="iconfont-commdbr" className={styles["icon-chart"]}/>
    //   } else if (item.node_type === 3 || item.node_type === 7) {
    //     node_type = 'gateway'
    //     type = 'source'
    //     content = <IconFont type="iconfont-44zidongshixianshujuwangguan" className={styles["icon-chart"]}/>
    //   } else if (item.node_type === 4) {
    //     node_type = 'vip'
    //     // todo 未赋值 type
    //   }
    //   // content = ''
    //   dataNodes[node_type].push({
    //     id: item.id.toString(),
    //     tooltip: item.node_addr,
    //     content: content,
    //     type: type,
    //     pid : item.pid.toString(),
    //     alive : item.alive
    //   })
    // })
    //
    //
    // // 获取 容器的宽度
    // const container = document.getElementById('jsPlumb-container')
    // let containerWidth = 0
    // if (container) {
    //   containerWidth = parseInt(window.getComputedStyle(container).width)
    // }
    // let width = dataNodes.gateway.length ? 86 : 40
    //
    // const existGateway = !!dataNodes.gateway.length
    // const existSlave = !!dataNodes.slave.length
    // Object.keys(dataNodes).forEach(key => {
    //   if(key === 'vip'){
    //     // return
    //     // todo 不知道要显示什么
    //   }else{
    //     const top = key === 'gateway' ? '30px'
    //       : (key === 'master' ? '120px' : '210px')
    //     const length = dataNodes[key].length
    //     width = (key === 'gateway' && width > 40) ? 46 : 86
    //     const offset = (containerWidth - length * width ) / (length + 1)
    //     dataNodes[key].forEach((v, i) => {
    //       v.style = {
    //           top : top,
    //           left : offset * ( i + 1) + width * i + 'px'
    //       }
    //       if(key === 'master'){
    //         if(existGateway && existSlave){
    //           v.type = 'transform'
    //         }
    //       }else{
    //         key != '丛机' &&
    //         dataConnections.push({
    //           from : key === 'gateway' ? v.id : v.pid,
    //           to : key === 'gateway' ? v.pid : v.id
    //         })
    //       }
    //
    //       const className = v.alive === 0 ? styles["alive-success"]
    //         : styles["alive-error"]
    //       if(existGateway){
    //         let oldContent = v.content
    //         v.content = <Row className={className}>
    //           {oldContent}
    //           {key !== 'gateway' && <IconFont type="iconfont-dunpai" className={styles["icon-chart"]}/>}
    //         </Row>
    //       }
    //     })
    //   }
    // })
    //
    // // console.log('dataNodes===>', dataNodes)
    // let newNodes = [...dataNodes.gateway, ...dataNodes.master,
    //   ...dataNodes.slave, ...dataNodes.vip]
    //
    // // console.log('newNodes===>', newNodes)
    // // console.log('dataConnections===>', dataConnections)
    //
    // const data = {
    //   nodes : newNodes,
    //   connections : dataConnections
    // }
    // console.log('data===>', data)


    // todo dataNodes 转化为 下面的格式
    // const data = {
    //   nodes: [
    //     {
    //       id: '1',
    //       tooltip: 'Source Node',
    //       type: 'source',
    //       style: {
    //         top: '50px',
    //         left: '40%',
    //       },
    //       content: '主机'
    //     }, {
    //       id: '2',
    //       tooltip: 'Sink Node',
    //       type: 'sink',
    //       style: {
    //         top: '120px',
    //         left: '10%',
    //       },
    //       content: '备机'
    //     }, {
    //       id: '3',
    //       tooltip: 'Sink Node',
    //       type: 'sink',
    //       style: {
    //         top: '120px',
    //         left: '70%',
    //       },
    //       content: '备机'
    //     }
    //   ],
    //   connections: [
    //     {
    //       from: '1',
    //       to: '3'
    //     }, {
    //       from: '1',
    //       to: '2'
    //     }
    //   ]
    // }


    const settings = {
      source: {
        isSource: true,
        anchor: ["Top", "Right"],
        ...commonSettings,
        connectorStyle,
        endpointStyle: {},
        connectorOverlays: []
      },
      sink: {
        isTarget: true,
        anchor: ["Top", "Left"],
        endpointStyle: {},
        connectorOverlays: [],
        ...commonSettings
      },
      default: {
        // gap 表示连接线和元素之间的距离 当不需要显示 endpoints 时 直接设置为0 默认就是0
        Connector: ['Flowchart', {gap: 0, stub: [10, 15], alwaysRespectStubs: true}],
        ConnectionsDetachable: false //是否可以拆分连接
      },
      transformSource: {
        isSource: true,
        isTarget : true,
        anchor: ["Right", "Top"],
        ...commonSettings,
        connectorStyle,
        endpointStyle: {},
        connectorOverlays: []
      },
      transformSink: {
        isTarget: true,
        isSource : true,
        anchor: ["Left", "Top"],
        endpointStyle: {},
        connectorOverlays: [],
        ...commonSettings
      }
    }
    // console.log('data===>', JSON.stringify(data))
    const jsPlumbProps = {
      settings,
      data,
    }
    let masterTip = existMaster
      ? <span className={styles["mgr-32"]}><span className={styles["txt-icon"]}>#</span> 主机</span>
      : ''
    let slaveTip = existSlave
      ? <span className={styles["mgr-32"]}><span className={styles["txt-icon"]}>R</span> 备机</span>
      : ''
    let gatewayTip = existGateWay
      ? <span className={styles["mgr-32"]}><span className={styles["txt-icon"]}>G</span> 网关</span>
      : ''
    let nodeguardTip = existNodeGuard
      ? <span className={styles["mgr-32"]}><span className={styles["txt-icon"]}>N</span> nodeguard</span>
      : ''
    return (
      <Row>
        <JsPlumbComponent {...jsPlumbProps} className={styles["h400"]}/>
        <Row className={styles["txt-tip"]} >
          {masterTip}{slaveTip}{gatewayTip}{nodeguardTip}
        </Row>
      </Row>
    )
  }
}

RelationChart.propTypes = {}

export default RelationChart
