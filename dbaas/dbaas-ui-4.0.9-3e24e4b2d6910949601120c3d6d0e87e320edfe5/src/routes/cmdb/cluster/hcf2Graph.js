/**
 * Created by wengyian on 2018/3/7.
 */
import React from 'react'
import PropTypes from 'prop-types'
import {Row, Col, Select, message, Tooltip, Button, Modal, Card} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon, TablePanel} from 'components'
import {routerRedux, Link, browserHistory,} from 'dva/router'
import {classnames, constant, TimeFilter, Logger} from 'utils'
import _ from 'lodash'
import styles from './summary.less'
import {fabric} from 'fabric'

const {NODE_STATE, RELATE_TYPE} = constant

// 修改绘制的是 画笔位置 锁住左右移动  不让可操作 和 不显示操作边框
// 画布上面空 20（因为画笔在中心 所以算起来为40） 下面空 30
// fabric evented : false 不会触发事件

fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center'
fabric.Object.prototype.lockMovementX = fabric.Object.prototype.lockMovementY = true
fabric.Object.prototype.hasControls = false
fabric.Object.prototype.hasBorders = false
fabric.Object.prototype.hoverCursor = 'default'

export default class HCFGraph extends React.Component {
  static lnh = 50 //  每层高度差
  static nw = 40 // 每个节点的宽度
  static nh = 40 // 每个节点的高度
  static reservedH = 40 // 顶部的预留高度
  static ngutter = 4 // 相邻节点或边框的距离
  constructor(props) {
    super(props)

    this.canvas = null
    this.state = {
      hName: '',
      top: 0,
      left: 0,
      exist: {}
    }

    this.initCanvas = this.initCanvas.bind(this)
    this.init = this.init.bind(this)
    this.drawHCF = this.drawHCF.bind(this)
    this.drawBackend = this.drawBackend.bind(this)
    this.drawSpider = this.drawSpider.bind(this)
    this.getImgUrl = this.getImgUrl.bind(this)
    this.getColor = this.getColor.bind(this)
    this.drawConnection = this.drawConnection.bind(this)
    this.getTip = this.getTip.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.nodes, this.props.nodes)) {
      this.initCanvas()
    }
  }

  componentDidMount() {
    this.initCanvas()
    const _this = this
    window.onresize = function() {
      _this.initCanvas()
    }
  }

  componentWillUnmount() {
    window.onresize = null
  }

  initCanvas() {
    const container = document.getElementById('summary_graph')
    const cw = window.getComputedStyle(container).width
    this.canvas = new fabric.Canvas('graph', {
      width: parseInt(cw),
      selection: false,
    })
    this.canvas.on('mouse:over', function (options) {
      if (options.target && options.target.hName) {
        const {hName, left, top, height} = options.target
        this.setState({
          hName: hName,
          left: left,
          top: top - height / 2 - 10
        })
      }
    }.bind(this))
    this.canvas.on('mouse:out', function (options) {
      this.setState({
        hName: '',
        left: 0,
        top: 0,
      })
    }.bind(this))
    this.init()
  }

  init() {
    this.canvas.clear()
    this.drawHCF()
  }

  drawHCF() {
    const w = this.canvas.getWidth()
    const h = this.canvas.getHeight()
    const { nodes } = this.props

    // 考虑分层
    let nodeParams = {}
    /*
    * {
    *   backend: {
    *     chunk1: {
    *       nodes: [],
    *       top: ,
    *       left: ,
    *       width: ,
    *     }
    *   }
    *   spider: {
    *   }
    * }
    * */
    let exist = {}
    // 每个节点 40px
    // 给每个节点分配位置， 头部预留 40px 画笔位置在中心
    Object.keys(nodes).forEach((v, i) => {
      if (v === 'spider') {
        const spiders = nodes[v]
        const top = HCFGraph.reservedH + HCFGraph.nh / 2 //spider 层在最上面 只有预留高度和自身的一半
        /*
        * spider 的组成都是单个的 不需要去计算每个spider 的宽度
        * */
        // spider 不需要虚线框包围
        const perSpiderWidth = (w - HCFGraph.nw  * spiders.length) / (spiders.length + 1)
        // Logger.info('perSpiderWidth===>', perSpiderWidth)
        nodeParams.spider = []
        spiders.forEach((val, index) => {
          nodeParams.spider.push({
            ...val,
            width: HCFGraph.nw,
            height: HCFGraph.nh,
            left: perSpiderWidth * (index + 1) + HCFGraph.nw * index + HCFGraph.nw / 2,
            top: top
          })
        })
        this.drawSpider(nodeParams.spider)
      } else if ( v === 'backend') {
        nodeParams['backend'] = {}
        let nodesWidth = 0 // 某一层节点所占宽度
        const backendKey = Object.keys(nodes.backend) // 每个 chunk 的名字
        const top = HCFGraph.reservedH + (HCFGraph.nh + 2 * HCFGraph.ngutter) * 1.5 + HCFGraph.lnh // 预留高度 + spider层和半个backend层 + 层间距
        backendKey.forEach(val => {
          const length = nodes.backend[val].length
          const width = length * HCFGraph.nw + (length + 1) * HCFGraph.ngutter
          nodesWidth += width
          nodeParams.backend[val] = {
            nodes: nodes.backend[val],
            width: width,
            top: top
          }
        })
        // Logger.info('nodesWidth===>', nodesWidth)
        const leftWidth = w - nodesWidth // 剩余空间 均分
        const perChunkGutter = leftWidth / (backendKey.length + 1) // 每个 chunk 的距离
        // 计算每个 chunk 的 left
        // Logger.info('nodeParams===>', nodeParams)
        // Logger.info('perChunkGutter===>', perChunkGutter)
        backendKey.forEach((val, i) => {
          let left = 0
          if (i === 0) {
            left = perChunkGutter + nodeParams.backend[val].width / 2
          } else {
            for (let k = i; k >= 0; k--) {
              if (k === i) {
                left += perChunkGutter + nodeParams.backend[backendKey[k]].width / 2
              } else {
                left += perChunkGutter + nodeParams.backend[backendKey[k]].width
              }
            }
          }
          nodeParams.backend[val].left = left
        })
        this.drawBackend(nodeParams.backend)
      }
    })
    this.drawConnection(nodeParams)
  }

  drawConnection(nodeParams) {
    const {backend, spider} = nodeParams
    const backendKeys = Object.keys(backend)
    spider.forEach(v => {
      let x0, y0, x1, y1
      x0 = v.left
      y0 = v.top + HCFGraph.nh / 2
      backendKeys.forEach(val => {
        // Logger.info('backend[val]===>', backend[val])
        const {top, left} = backend[val]
        y1 = top - (HCFGraph.nh + 2 * HCFGraph.ngutter) / 2
        x1 = left
        const path = [{x: x0, y: y0}, {x: x1, y: y1}]
        const color = ''
        const polyline = new fabric.Polyline(path, {
          fill: 'transparent',
          stroke: '#0FACF3', // 没想好用啥色 是否需要去判断两端的可用状态
          strokeWidth: 1,
          originX: 'left',
          originY: 'top'
        })
        this.canvas.add(polyline)
      })
    })
  }

  drawSpider(spider) {
    spider.forEach(v => {
      const nodeUrl = this.getImgUrl({
        type: v.type_meanings,
        alive: v.alive
      })
      // Logger.info('nodeUrl===>', nodeUrl)
      const _this = this
      new fabric.Image.fromURL(nodeUrl, function(oImg) {
        const nodeImg = oImg.set({
          width: v.width,
          height: v.height,
          top: v.top,
          left: v.left,
          hName: v.name
        })
        // Logger.info('nodeImg===>', nodeImg)
        // Logger.info('_this.canvas===>', _this.canvas)
        _this.canvas.add(nodeImg)
      })
    })
  }

  drawBackend(backend) {
    const backendKeys = Object.keys(backend)
    backendKeys.forEach(v => {
      const { nodes, left, width, top } = backend[v]
      const rect = new fabric.Rect({
        width: width,
        height: HCFGraph.nh + 2 * HCFGraph.ngutter,
        fill: 'transparent',
        strokeWidth: 1,
        strokeDashArray: [5],
        stroke: '#0FACF3',
        rx: 5,
        ry: 5
      })
      const _this = this
      const nodeGraphGroup = []
      let renderNodes = 0
      nodes.forEach((val, i) => {
        const nodeUrl = this.getImgUrl({
          type: val.type_meanings,
          alive: val.alive
        })
        const leftOffset = HCFGraph.ngutter * (i + 1) + HCFGraph.nw * i + HCFGraph.nw / 2 - width / 2
        const node = new fabric.Image.fromURL(nodeUrl, function (oImg) {
          const nodeImg = oImg.set({
            width: HCFGraph.nw,
            height: HCFGraph.nh,
            hName: val.name,
            left: leftOffset
          })
          renderNodes++
          nodeGraphGroup.push(nodeImg)
          // Logger.info('nodeGraphGroup===>', nodeGraphGroup)
          /*
          *  new fabric.Image.fromURL 后面的 function 方法是图片加载完成只会执行
          *  有延迟 如果使用 forEach 的 i 来作为次数比对 可能出现到最后一个节点了 但是前面的界面未加载完
          *  所有使用 累加 每加载成功一个节点图片就累加一次
          *  累积数等于节点总数后就可以当成一个 group 绘制了
          * */
          if (renderNodes === nodes.length) {
            const group = new fabric.Group(nodeGraphGroup.concat(rect), {
              left: left,
              top: top,
              hName: v
            })
            _this.canvas.add(group)
          }
        })
      })
    })
  }

  getImgUrl = ({type, alive}) => {
    let url = ''
    let { exist } = this.state
    // 老大说 拓扑图只有异常和运行 两种状态
    switch (type) {
      case 'MASTER' :
      case 'SPIDER' :
        switch (alive) {
          // case 1:
          // case -1:
          //   url = require('/../public/images/dbm_default.jpg')
          //   break;
          case NODE_STATE.RUNNING:
            url = require('/../public/images/dbm_blue.jpg')
            break;
          default :

            // case -2:
            // case -3:
            url = require('/../public/images/dbm_red.jpg')
        }
        exist.master = true
        this.setState({
          exist: exist
        })
        break
      case 'SLAVE' :
        switch (alive) {
          case NODE_STATE.RUNNING:
            url = require('/../public/images/dbr_default.jpg')
            break;
          default:
            url = require('/../public/images/dbr_red.jpg')
        }
        exist.slave = true
        this.setState({
          exist: exist
        })
        break
      case 'GATEWAY' :
        switch (alive) {
          // case 1:
          // case -1:
          case NODE_STATE.RUNNING:
            url = require('/../public/images/gw_default.png')
            break;
          // case -2:
          // case -3:
          default:
            url = require('/../public/images/gw_red.png')
        }
        exist.gateway = true
        this.setState({
          exist: exist
        })
        break
      case 'NODEGUARD' :
        switch (alive) {
          // case 1:
          // case -1:
          case NODE_STATE.RUNNING:
            url = require('/../public/images/ng_default.png')
            break;
          // case -2:
          // case -3:
          default:
            url = require('/../public/images/ng_red.png')
        }
        exist.nodeguard = true
        this.setState({
          exist: exist
        })
        break
    }
    return url
  }

  getColor = (alive) => {
    let color = ''
    switch (alive) {
      case NODE_STATE.RUNNING:
      case NODE_STATE.RESTARTING:
      case NODE_STATE.CREATING:
        color = '#0FACF3'
        break
      case NODE_STATE.ABNORMAL:
      case NODE_STATE.DELETING:
        color = '#f04134'
        break
    }
    return color
  }


  getTip() {
    let {exist = {}} = this.state
    let content = [] // 0 主机 1备机 2 丛机 3 网关 4 nodeguard
    Object.keys(exist).map(v => {
      switch (v.toUpperCase()) {
        case 'MASTER' :
          content.push(<span key="master">
            <span className={styles['rect-blue']}>#</span>
            <span className={styles['mg-icon']}>主机</span>
          </span>)
          break
        case 'SLAVE' :
          content.push(<span key="slave">
            <span className={styles['rect-grey']}>R</span>
            <span className={styles['mg-icon']}>备机</span>
          </span>)
          break
        case 'GATEWAY' :
          content.push(<span key="gateway">
            <span className={styles['rect-grey']}>G</span>
            <span className={styles['mg-icon']}>网关</span>
          </span>)
          break
        case 'NODEGUARD' :
          content.push(<span key="nodeguard">
            <span className={styles['rect-grey']}>N</span>
            <span className={styles['mg-icon']}>nodeguard</span>
          </span>)
          break
      }
    })
    return <Row className="text-center">{content}</Row>
  }

  render() {
    return (
      <Row className={styles["container"]}>
        <canvas height="460" id="graph"/>
        {this.getTip()}
        <div className={styles["tooltip"]}
             style={{
               top: this.state.top,
               left: this.state.left,
               display: (this.state.hName ? '' : 'none')
             }}>
          {this.state.hName}
        </div>
      </Row>
    )
  }
}
