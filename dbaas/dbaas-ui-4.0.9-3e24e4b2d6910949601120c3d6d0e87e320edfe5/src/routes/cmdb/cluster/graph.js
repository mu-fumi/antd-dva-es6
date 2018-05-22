/**
 * Created by wengyian on 2017/10/30.
 */

import PropTypes from 'prop-types'
import {Row, Col, Select, message, Tooltip, Button, Modal, Card} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon, TablePanel} from 'components'
import {routerRedux, Link, browserHistory,} from 'dva/router'
import {classnames, constant, TimeFilter} from 'utils'
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


export default class Graph extends React.Component {

  constructor(props) {
    super(props)

    this.canvas = null

    this.state = {
      hName: '',
      top: 0,
      left: 0,
      exist: {}
    }
    this.init = this.init.bind(this)
    this.drawCircle = this.drawCircle.bind(this)
    this.drawLayer = this.drawLayer.bind(this)
    this.findConnection = this.findConnection.bind(this)
    this.getTip = this.getTip.bind(this)
    this.drawInstance = this.drawInstance.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.nodes, this.props.nodes)) {
      this.initCanvas()
    }
  }

  initCanvas = () => {
    // console.log('initCanvas')

    const container = document.getElementById('summary_graph')
    const cw = window.getComputedStyle(container).width
    this.canvas = new fabric.Canvas('graph', {
      width: parseInt(cw),
      selection: false,
    })
    this.canvas.on('mouse:over', function (options) {
      // console.log('over options===>', options)
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
      // console.log('out options===>', options)
      this.setState({
        hName: '',
        left: 0,
        top: 0,
      })
    }.bind(this))
    this.init()
  }

  componentDidMount() {
    this.initCanvas()

    const _this = this
    window.onresize = function(){ //重汇canvas 大小
      _this.initCanvas()
    }
  }

  componentWillUnmount(){
    window.onresize = null
  }

  drawCircle() {
    const w = this.canvas.getWidth()
    const h = this.canvas.getHeight()

    // console.log('w===>', w)
    const cLeft = w / 2
    // cTop cLeft 代表的是 圆心  画圆时记得把 originX 和 originY 改为 center
    let cTop = ( h - 80 ) / 2 + 40 // 70 用来显示下面的标志和节点预留的20 啥代表啥， 40 表示上面的预留位置
    let cRadius = (w - 40 * 2) / 2 //30 表示离左右的距离
    cRadius = cRadius > (cTop - 40) ? (cTop - 40) : cRadius
    const width = 40, height = 40 //默认每个的大小
    // console.log('this.props.nodes===>', this.props.nodes)
    const nodeKey = Object.keys(this.props.nodes)
    let node = this.props.nodes[nodeKey[0]]

    const length = node.length

    // 奇数个节点时，初始节点在坐标 x : left , y : top - radius
    // 偶数个节点是， 初始节点坐标 ： x : left + radius * cos(deg) y : top - radius * sin(deg) deg 为了两个节点的弧度差的一半

    let circle = new fabric.Circle({
      radius: cRadius,
      top: cTop,
      left: cLeft,
      strokeWidth: 1,
      fill: 'transparent',
      stroke: '#000',
      evented : false
      // strokeDashArray: [10],
      // originX : 'center',
      // originY : 'center',
    })
    this.canvas.add(circle)

    let initRadian = 0 //初始弧度
    let intervalRadian = 2 * Math.PI / length
    if (length % 2 === 0) {
      initRadian = intervalRadian / 2
    }

    let nodesParams = node.map((v, i) => {
      let radian = initRadian + intervalRadian * i
      const nLeft = cLeft + cRadius * Math.sin(radian)
      const nTop = cTop - cRadius * Math.cos(radian)
      return {
        ...v,
        left: nLeft,
        top: nTop,
      }
    })

    nodesParams.map((v, i) => {
      let url = this.getImgUrl({
        type: v.type_meanings,
        alive: v.alive
      })
      const _this = this
      const img = new fabric.Image.fromURL(url, function (oImg) {
        oImg.set({
          top: v.top,
          left: v.left,
          width: 40, //默认的宽度和高度
          height: 40,
          hName: v.name
        })
        _this.canvas.add(oImg)
      })

      // 去掉连线
      // if (v.pid) {
      //   const pidNode = nodesParams.find(val => val.id == v.pid)
      //   let coords = [0, 0, 0, 0] // x1, y1 , x2, y2
      //   // 当两个节点存在高度差时，从 高的下面 往低的上面连线
      //   if (Math.abs(pidNode.top - v.top) > 5) {
      //     if (v.top < pidNode.top) {
      //       coords[1] = v.top + 20
      //       coords[0] = v.left
      //       coords[3] = pidNode.top
      //       if (v.left > pidNode.left) {
      //         coords[2] = pidNode.left + 20
      //       } else {
      //         coords[2] = pidNode.left - 20
      //       }
      //     } else {
      //       coords[1] = v.top
      //       coords[3] = pidNode.top + 20
      //       coords[2] = pidNode.left
      //       if (pidNode.left > v.left) {
      //         coords[0] = v.left + 20
      //       } else {
      //         coords[0] = v.left - 20
      //       }
      //     }
      //   } else {
      //     coords[1] = v.top
      //     coords[3] = pidNode.top
      //     if (v.left < pidNode.left) {
      //       coords[0] = v.left + 20
      //       coords[2] = pidNode.left - 20
      //     } else {
      //       coords[0] = v.left - 20
      //       coords[2] = pidNode.left + 20
      //     }
      //   }
      //   const color = this.getColor(v.alive)
      //   const line = new fabric.Line(coords, {
      //     stroke: color,
      //     strokeWidth: 2,
      //   })
      //   _this.canvas.add(line)
      // }
    })

    // const tipRect = new fabric.Rect({
    //   rx : 5,
    //   ry : 5,
    //   fill : '#0FACF3',
    //   width : 20,
    //   height : 20,
    // })
    // const tipIcon = new fabric.Text('#', {
    //   fontSize : 12,
    //   fill : '#fff',
    //   fontFamily : "Microsoft YaHei",
    // })
    // const tipGroup = new fabric.Group([tipRect, tipIcon], {
    //   top : h - 20,
    //   left : w / 2 - 15
    // })
    // this.canvas.add(tipGroup)
    // const tipText = new fabric.Text('主机', {
    //   top: h - 20,
    //   left: w / 2 + 15,
    //   fontSize: 14,
    //   fill : '#666'
    // })
    // this.canvas.add(tipText)
    this.setState({
      exist: {
        master: true
      }
    })

  }

  /***************20171201 新增画实例 ****************/
  /*************** 实例只有一台机器，画上就好了 ****************/
  drawInstance(){
    const w = this.canvas.getWidth()
    const h = this.canvas.getHeight()
    const {nodes} = this.props
    let instance = {}
    /*******20171220 实例就一台 居中好了******/
    const top = h / 2;
    const left = w / 2
    Object.keys(nodes).forEach(v => {
      const currentNodes = nodes[v]
      instance = currentNodes[0] || instance
    })

    const nodeUrl = this.getImgUrl({
      type: instance.type_meanings,
      alive: instance.alive,
    })

    const _this = this
    const img = new fabric.Image.fromURL(nodeUrl, function (oImg) {
      oImg.set({
        top: top,
        left: left,
        width: 40, //默认的宽度和高度
        height: 40,
        hName: instance.name
      })
      _this.canvas.add(oImg)
    })
    this.setState({
      exist: {
        master: true
      }
    })
  }

  setPosition() {

  }

  getImgUrl = ({type, alive}) => {
    let url = ''
    // 老大说 拓扑图只有异常和运行 两种状态
    switch (type) {
      case 'MASTER' :
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
        break
      case 'SLAVE' :
        switch (alive) {
          case NODE_STATE.RUNNING:
            url = require('/../public/images/dbr_default.jpg')
            break;
          default:
            url = require('/../public/images/dbr_red.jpg')
        }
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


  drawLayer() {
    const w = this.canvas.getWidth()
    const h = this.canvas.getHeight()
    const {nodes} = this.props

    // 考虑到分层情况
    let nodeParams = {}
    let exist = {}
    const lnh = 50 //隔一层的节点高度差
    // 给每个节点分配位置 顺便考虑是否有 gateway 头部预留 40px 位置 画笔在中心 所以+60  24为中心到边的距离
    Object.keys(nodes).forEach((v, i) => {
      let curentNodes = nodes[v]
      const length = curentNodes.length
      const perWidth = w / (length + 1)
      const top = 60 + (v - 1) * (lnh + 24 * 2)
      nodeParams[v] = []
      curentNodes.forEach((val, index) => {
        if (val.type_meanings.toUpperCase() === 'GATEWAY') {
          exist['NODEGUARD'] = true
        }
        exist[val.type_meanings] = true
        const left = perWidth * (index + 1)
        nodeParams[v].push({
          ...val,
          top: top,
          left: left
        })
      })
    })
    // 给每个节点指定内容
    Object.keys(nodeParams).forEach((v, i) => {
      nodeParams[v].map(val => {
        const existGateWay = exist.GATEWAY
        let nodeGuardUrl = ''
        let rw = 48 // rect 的宽度
        const color = this.getColor(val.alive)
        if (existGateWay) {
          if (val.type_meanings.toUpperCase() !== 'GATEWAY') {
            nodeGuardUrl = this.getImgUrl({
              type: 'NODEGUARD',
              alive: val.alive
            })
          }
          rw = 88
        }
        const rect = new fabric.Rect({
          width: rw,
          height: 48,
          fill: 'transparent',
          strokeWidth: 1,
          strokeDashArray: [5],
          stroke: color,
          rx: 5,
          ry: 5
        })

        const nodeUrl = this.getImgUrl({
          type: val.type_meanings,
          alive: val.alive,
        })
        const _this = this
        new fabric.Image.fromURL(nodeUrl, function (oImg) {
          const nodeImg = oImg.set({
            width: 40,
            height: 40,
          })
          if (nodeGuardUrl !== '') {
            new fabric.Image.fromURL(nodeGuardUrl, function (oImg) {
              nodeImg.set({
                left: -22
              })
              const nodeGuardImg = oImg.set({
                width: 40,
                height: 40,
                left: 22
              })
              _this.canvas.add(new fabric.Group([rect, nodeImg, nodeGuardImg], {
                top: val.top,
                left: val.left,
                hName: val.name,
              }))
            })
          } else {
            _this.canvas.add(new fabric.Group([rect, nodeImg], {
              top: val.top,
              left: val.left,
              hName: val.name,
            }))
          }
        })
      })
    })

    // console.log('nodeParams===>', nodeParams)

    // 根据pid 连接每个节点
    // 计算每个节点上面的连线，分出同层和分同层的， 同层级的从上面连线，非同级的 从上面的节点下面往 下面的节点上面连
    // 默认 从中间划线 但是如果同一面线条多余1 需要计算每条线的位置和折线高度
    // connectionNodes = [{}, {}]  {id : , pid : , left, top,layer, sameLayer, diffLayer,}
    let connectionNodes = []
    let allNodes = []
    Object.keys(nodeParams).forEach(key => {
      nodeParams[key].forEach(v => {
        allNodes.push({
          ...v,
          layer: key
        })
      })
    })
    // console.log('allNodes===>', allNodes)
    Object.keys(nodeParams).forEach((key, i) => {
      nodeParams[key].forEach(v => {
        const {topLayer = [], bottomLayer = [], isTopLayer, isSameLayer} = this.findConnection(v.id, v.pid, key, allNodes)
        connectionNodes.push({
          ...v,
          layer: key,
          topLayer,
          bottomLayer,
          isTopLayer,
          isSameLayer
        })
      })
    })
    // console.table(connectionNodes)

    connectionNodes.map((v, i) => {
      let path = []
      // 找出目标点
      const pNode = connectionNodes.find(val => val.id === v.pid)
      if (!pNode) {
        return
      }
      // 初始转折点 高度为 4, 每次加2, 高度校正 24, 节点高度 48
      // 新修改：折线固定位置 不同层从高度差的中间折 同层就 -ih
      const iH = 8, perH = 4, oT = 24, iNH = 48
      // x0, y0, x1, y1, x2, y2, x3, y3 折线的坐标
      const w = exist.GATEWAY ? 88 : 48
      const layerKey = v.isTopLayer ? 'topLayer' : 'bottomLayer'
      const pLayerKey = v.isTopLayer ? ( v.isSameLayer ? 'topLayer' : 'bottomLayer') : 'topLayer'
      const pw = w / (v[layerKey].length + 1) //间隔宽度
      const lx = v.left - w / 2 //id node 的左上角的 x
      const ly = v.top - oT // id node 的左上角 y
      const index = v[layerKey].indexOf(v.pid)
      const pIndex = pNode[pLayerKey].indexOf(v.id)
      const ppw = w / (pNode[pLayerKey].length + 1) // pid 的 间隔宽度
      const lpx = pNode.left - w / 2
      const lpy = pNode.top - oT
      // debugger
      let x0, y0, x1, y1, x2, y2, x3, y3
      x0 = x1 = lx + pw * (index + 1)
      x3 = x2 = lpx + ppw * (pIndex + 1)

      if (v.isSameLayer) {
        y0 = ly
        // y1 = y0 - iH - perH * index
        y1 = y0 - iH
        y2 = y1
        y3 = lpy
      } else {
        if (v.isTopLayer) {
          y0 = ly
          // y1 = y0 - iH - perH * index
          y1 = y0 - lnh / 2
          y2 = y1
          y3 = lpy + iNH
        } else {
          y0 = ly + iNH
          // y1 = y0 + iH + perH * index
          y1 = y0 + lnh / 2
          y2 = y1
          y3 = lpy
        }
      }

      path = [{x: x0, y: y0}, {x: x1, y: y1}, {x: x2, y: y2}, {x: x3, y: y3}]
      const color = this.getColor(v.alive)
      // 划折线时需要把画笔中心还给 left , top 不然不好找中心位置在哪
      const polyline = new fabric.Polyline(path, {
        fill: 'transparent',
        stroke: color,
        strokeWidth: 1,
        originX: 'left',
        originY: 'top',
      })
      // console.info('polyline==>', polyline)
      this.canvas.add(polyline)
    })

    // let tipContent = ''
    // const iconObj = {
    //   'MASTER': '#',
    //   'SLAVE': 'R',
    //   'NODEGUARG': 'N',
    //   'GATEWAY': 'G'
    // }
    //
    // const iconName = {
    //   'MASTER': '主机',
    //   'SLAVE': '备机',
    //   'NODEGUARG': 'nodeguard',
    //   'GATEWAY': '网关'
    // }
    //
    // console.log('exist===>', exist)
    //
    //
    //
    // Object.keys(exist).forEach(v => {
    //   switch (exist[v]) {
    //     case true:
    //       tipContent += '，  ' +  iconObj[v] + '：  ' + v
    //       break
    //     case false:
    //       break
    //   }
    // })
    // tipContent = tipContent.replace(/^，/, '')
    // const tipText = new fabric.Text(tipContent, {
    //   top: h - 20,
    //   left: w / 2,
    //   fontSize: 16
    // })
    // this.canvas.add(tipText)

    this.setState({
      exist: exist
    })

  }

  findConnection(id, pid, layer, arr) {
    // topLayer bottomLayer 分别表示在节点的 上面和下面的点的集合
    // isTopLayer 表示是否从上面发起连接 isSameLayer 表示pid 是否是同一层
    let topLayer = [], bottomLayer = [], isTopLayer, isSameLayer = false
    // 找出自己的 pid 是在那一层
    const pidNode = arr.find(v => v.id === pid)
    const idNode = arr.find(v => v.id === id)
    if (pidNode) {
      if (pidNode.layer === layer) {
        isTopLayer = true
        isSameLayer = true
        topLayer.push(pid)
      } else {
        if (idNode.top < pidNode.top) {
          isTopLayer = false
          bottomLayer.push(pid)
        } else if (idNode.top > pidNode.top) {
          isTopLayer = true
          topLayer.push(pid)
        }
      }
    }
    // 找出自己作为 别人的 pid 是否同层 此时不修改 isTopLayer
    const filterArr = arr.filter(v => v.pid === id)
    if (filterArr.length) {
      filterArr.forEach(v => {
        if (v.layer === layer) {
          topLayer.push(v.id)
        } else {
          if (idNode.top < v.top) {
            bottomLayer.push(v.id)
          } else if (idNode.top > v.top) {
            topLayer.push(v.id)
          }
        }
      })
    }
    return { //排序方便后面排位置
      topLayer: topLayer.sort((a, b) => a - b),
      bottomLayer: bottomLayer.sort((a, b) => a - b),
      isTopLayer,
      isSameLayer
    }
  }

  init() {
    let {nodes, relateType} = this.props
    if(relateType === RELATE_TYPE.instance){
      this.drawInstance()
    }else{
      const nodesArr = Object.keys(nodes)
      if (nodesArr.length === 1) {
        this.canvas.clear()
        this.drawCircle()
      } else {
        this.canvas.clear()
        this.drawLayer()
      }
    }


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

Graph.propTypes = {
  nodes: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object
  ])
}
