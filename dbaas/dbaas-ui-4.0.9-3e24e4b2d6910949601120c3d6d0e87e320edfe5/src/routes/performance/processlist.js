/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-05-17 10:21 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Icon, message, Progress,Table } from 'antd'
import styles from './processlist.less'

let commonColumns = [
  {title: 'SQL 语句', dataIndex: 'target', width: '30%' },
  {title: '连接数量', dataIndex: 'counts'},
  {title: '运行中的数量', dataIndex: 'active_counts'},
  {title: '运行的总时间(s)', dataIndex: 'time'},
  {title: '最大运行时间(s)', dataIndex: 'max_time'},
]

const keys = ['COMMAND', 'USER', 'HOST', 'DB', 'STATE']
let list = {}

keys.map((key)=>{
  let titles = []
  switch (key){
    default:
    case 'COMMAND':
      titles[0] = '正在执行的 SQL'
      break
    case 'USER':
      titles[0] = '正在执行的用户'
      titles[1] = '用户名'
      break
    case 'HOST':
      titles[0] = '正在连接的主机'
      titles[1] = '客户端'
      break
    case 'DB':
      titles[0] = '正在连接访问的DB'
      titles[1] = '客户端'
      break
    case 'STATE':
      titles[0] = '连接状态'
      titles[1] = 'State 信息'
      break
  }
  let currentColumns = JSON.parse(JSON.stringify(commonColumns))
  if(titles[1]){
    currentColumns[0].title = titles[1]
  }
  currentColumns[0].render = (text) => <div className="wrap-break">{text}</div>

  list[key] = {
    title: titles[0],
    columns: currentColumns
  }
})

const ProcessList = ({ dataSources = {}, time = '', onShow }) =>{
    const dataSourceKeys = Object.keys(dataSources)
    const total = dataSources[dataSourceKeys[0]] ?
      dataSources[dataSourceKeys[0]].map((v) => v.counts).reduce( (prev, curr) => prev + curr ) : 0

    return (
      <Col span="24" className={styles.processlist}>
        <div className="table-wrapper">
        <div className="table-container">
          <div className="table-title card-title">
            <h3 className="inline-block">PROCESSLIST 分析
              <span>时间点: {time} { total > 0 ? `, 共计 ${total} 个, 5 个维度` : '' } </span>
            </h3>
            <a className="pull-right" onClick={onShow.bind(this)}>查看详细</a>
          </div>
          <div className="table-content">
            { dataSourceKeys.length > 0 ? dataSourceKeys.map((v, k)=>{
              const title = v in list ? list[v].title : ''
              const dataSource = dataSources[v]
              const columns = v in list ? list[v].columns : commonColumns
              return (
                <Row key={k} type="flex" align="middle" className="row">
                  <Col span="8" className="col">
                    <div>{title}</div>
                  </Col>
                  <Col span="16" className="col">
                    <Table rowKey="id" dataSource={dataSource} columns={columns} pagination={false} />
                  </Col>
                </Row>
              )
            }) : (<div className="ant-table-placeholder"><Icon type="frown-o" />暂无数据</div>)
            }
          </div>
        </div>
        </div>
      </Col>
    )
}

ProcessList.propTypes = {
  dataSources: PropTypes.object,
  time: PropTypes.string,
  onShow: PropTypes.func,
}

export default ProcessList