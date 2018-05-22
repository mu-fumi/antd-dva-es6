/**
 * Created by wengyian on 2017/6/22.
 */

import React from 'react'
import PropTypes from 'prop-types'

import classnames from 'classnames'
import styles from './JsPlumb.less'
import { Row, Tooltip } from 'antd'

import { jsPlumb } from 'jsplumb'
import { getSettings } from './JsPlumb-settings'
import _ from 'lodash'

class JsPlumbComponent extends React.Component{

  constructor(props){
    super(props)

    let settings = getSettings()
    // console.log('props.settings===>', props.settings)
    props.settings && (settings = {...settings, ...props.settings})


    // if(props.settings){
    //   this.settings = Object.assign({}, props.settings)
    // }else{
    //   this.settings = getSettings()
    // }

    // console.log('props===>', props)

    this.state = {
      data : props.data || {},
      canDraggable : props.canDraggable || false,
      settings : settings
    }

    this.renderGraph = this.renderGraph.bind(this)
    this.addEndpoints = this.addEndpoints.bind(this)
    this.makeNodesDraggable = this.makeNodesDraggable.bind(this)
    this.renderConnections = this.renderConnections.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  componentWillReceiveProps(nextProps){
    if(!_.isEqual(nextProps.data, this.state.data) ||
      nextProps.canDraggable != this.state.canDraggable ||
      !_.isEqual(nextProps.settings, this.state.settings)
    ){
      let settings = getSettings()
      this.setState({
        data : nextProps.data,
        canDraggable: nextProps.canDraggable,
        settings : {...settings, ...nextProps.settings}
      }, () => {
        this.renderGraph()
      })

      // this.instance.deleteEveryEndpoint()

      // this.addEndpoints()
    }
  }

  renderGraph(){
    if(!this.instance) return
    this.addEndpoints()
    this.state.canDraggable && this.makeNodesDraggable()
    this.renderConnections()
    this.instance.repaintEverything()
    // console.log('instance===>', this.instance.getConnections())
  }

  makeNodesDraggable(){
    let nodes = document.querySelectorAll('#jsPlumb-container .jsPlumb-node')
    this.instance.draggable(nodes, {
      start: () => {
        // console.log('Starting to drag')
      },
      stop: (dragEndEvent) => {
        //todo 反馈操作 比如反馈新位置


        this.instance.repaintEverything()
      },
      containment : true
    });
    this.instance.repaintEverything()
  }

  addEndpoints(){
    let { nodes = [] } = this.state.data
    this.instance.deleteEveryEndpoint()
    // this.instance.detachEveryConnection();
    nodes.forEach( (node) => {
      let type = node.type
      // console.log('node.id===>', node.id)
      // console.log('this.state.settings===>', this.state.settings)
      switch(type) {
        case 'source' :
          this.instance.addEndpoint(node.id, this.state.settings.source, {uuid: node.id})
          break
        case 'sink' :
          this.instance.addEndpoint(node.id, this.state.settings.sink, {uuid: node.id})
          break
        default :
          this.instance.addEndpoint(node.id, this.state.settings.transformSource, {
            uuid: `Left${node.id}`,
          });
          this.instance.addEndpoint(node.id, this.state.settings.transformSink, {
            uuid: `Right${node.id}`,
          });
      }
    })
    // console.log('this.instance===>', this.instance)
  }

  renderConnections(){
    // console.log('instance===>', this.instance.getConnections())

    let connectsFromInstance = this.instance.getConnections().map( conn => ({
      from : conn.sourceId,
      to : conn.targetId
    }))

    // console.log('connectsFromInstance===>', connectsFromInstance)

    let { nodes, connections } = this.state.data
    if(!connections){ return }
    // if(connections.length === connectsFromInstance.length) { return }
    connections.forEach( connection => {
      let sourceNode = nodes.find(node => node.id === connection.from);
      let targetNode = nodes.find(node => node.id === connection.to);
      if (!sourceNode || !targetNode) {
        return;
      }
      let sourceId =
        sourceNode.type === 'transform' ? 'Left' + connection.from : connection.from;
      let targetId =
        targetNode.type === 'transform' ? 'Right' + connection.to : connection.to;
      let connObj = {
        uuids: [sourceId, targetId],
        detachable: true,
      };
      this.instance.connect(connObj);
    })
  }

  componentDidMount(){
    jsPlumb.ready(() => {
      const settings = this.state.settings.default
      let container = document.querySelector('#jsPlumb-container')
      jsPlumb.setContainer(container)
      this.instance = jsPlumb.getInstance(settings)
    })
    this.renderGraph()
  }

  handleClick(){
    if(this.props.onNodeClick){
      this.props.onNodeClick()
    }
  }

  render(){

    const loadNodes = () => {
      const { nodes = []} = this.state.data
      // console.log('this.state.data===>', this.state.data)
      // console.log('nodes===>', nodes)
      return nodes.map((node, key) => {
        return (
          <div
            style={node.style}
            id={node.id} key={node.id}
            className={"jsPlumb-node"}
            onClick={this.handleClick}
          >
            <Tooltip title={node.tooltip}>{node.content}</Tooltip>
          </div>
        )
      })
    }

    const className = classnames(styles['jsPlumb-container'], this.props.className)

    return(
      <Row id="jsPlumb-container" className={className}>
        {loadNodes()}
      </Row>
    )
  }
}

JsPlumbComponent.propTypes = {
  data : PropTypes.object,
  settings : PropTypes.object
}

export default JsPlumbComponent



