/**
 * Created by wengyian on 2017/10/23.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { classnames, constant } from 'utils'
import { Tooltip, Badge, Row } from 'antd'
import { DataTable, NodeRunBadge } from 'components'
import styles from './NodeBadge.less'

const { CLUSTER_NODE_STATE } = constant

export default class NodeBadge extends React.Component{

  render(){
    let { type = 0, node_list = {}} = this.props
    let status = ''
    switch (type){
      default :
      case CLUSTER_NODE_STATE.NORMAL :
        status = 'success'
        break
      case CLUSTER_NODE_STATE.PARTIAL_ABNORMAL :
        status = 'warning '
        break
      case CLUSTER_NODE_STATE.ABNORMAL :
        status = 'error '
        break
    }


    let promptContent = Object.keys(node_list).map((v, i) => {
      return <tr key={i}><td>{v}</td><td><NodeRunBadge type={node_list[v]}/></td></tr>
    })
    if(promptContent.length == 0){
      promptContent = <tr><td colSpan="2">暂无数据</td></tr>
    }

    const prompt = (
      <Row>
        <table className={styles['status_table']} cellPadding="4" cellSpacing="0">
          <tbody>
          <tr>
            <td>节点</td>
            <td>状态</td>
          </tr>
          { promptContent }
          </tbody>
        </table>
      </Row>
    )

    return (
      <Tooltip title={prompt} overlayClassName={styles["tooltip"]}>
      <span style={{cursor : 'pointer'}} >
        <Badge status={status}></Badge>
      </span>
      </Tooltip>
    )
  }
}

NodeBadge.propTypes = {
  type : PropTypes.number,
  // node_list : PropTypes.object,
  node_list : PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object
  ]),
}
