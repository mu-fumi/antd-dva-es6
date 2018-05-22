/**
 * Created by wengyian on 2017/9/4.
 */

import Base from 'routes/base'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, Select, message, Tag, Button, Modal} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon} from 'components'
import {routerRedux, Link} from 'dva/router'
import {classnames} from 'utils'
import _ from 'lodash'
import {constant, TimeFilter} from 'utils'
import * as moment from 'moment'
import TaskState from './taskState'
import styles from './index.less'

class Offline extends Base{
  constructor(props){
    super(props)

    this.push({
      type : 'app/handleCurrentMenu',
      payload : {activeName : '下线历史',selectedKey : '下线offline'},
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount],
    })

    this.pageBtns = {
      element: () => {
        return <Row>
          <Col className="pageBtn">
            <Link to="/offline/types?tag=cluster" className="text-info">
              <IconFont type="iconfont-xiaxian"/>下线集群
            </Link>
          </Col>
          <Col className="pageBtn">
            <Link to="/offline/types?tag=instance" className="text-info">
              <IconFont type="iconfont-xiaxian"/>下线实例
            </Link>
          </Col>
          <Col className="pageBtn">
            <Link to="/offline/types?tag=set" className="text-info">
              <IconFont type="iconfont-xiaxian"/>下线实例组
            </Link>
          </Col>
          <Col className="pageBtn" onClick={this.handleReload}>
            <a href="javascript:;">
              <IconFont type="reload"/>刷新
            </a>
          </Col>
        </Row>
      }
    }

    this.push({
      type : `offline/initFilter`,
    })

    this.handleReload = this.handleReload.bind(this)
  }

  componentWillReceiveProps(nextProps){

  }

  handleReload(){
    if(this._keywords === undefined || this._keywords === null){
      this._keywords = ''
    }
    this.props.dispatch({
      type : 'offline/handleFilter',
      payload : {keyword : this._keywords}
    })
    this.props.dispatch({
      type : 'offline/handleReload'
    })
  }

  render(){
    const { offline, dispatch } = this.props
    const { filter, reload } = offline

    const searchProps = [{
      placeholder : '关键字搜索',
      onSearch : (value) => {
        dispatch({
          type : 'offline/handleFilter',
          payload : { keyword : value}
        })
      },
      onChange : (e) => {
        this._keywords = e.target.value
      }
    }]

    const rangePickerProps = [{
      label : '时间',
      props : {
        onChange: (value, dateString) => {
          let time = TimeFilter.toUnix(value)
          dispatch({
            type: 'offline/handleFilter',
            payload: {
              time: time
            }
          })
        },
        onOk: (value) => {
          let time = TimeFilter.toUnix(value)
          dispatch({
            type: 'offline/handleFilter',
            payload: {
              time: time
            }
          })
        }
      }
    }]

    const filterProps = {
      searchProps,
      rangePickerProps,
    }

    const dataTableProps = {
      fetch : {
        url : '/offline/history',
        data : filter
      },
      reload : reload,
      columns: [{
        title: '用户',
        dataIndex: 'user',
      },{
        title: '业务',
        dataIndex: 'business',
      },{
        title: '应用',
        dataIndex: 'app',
      },{
        title: '下线内容',
        dataIndex: 'name',
      },{
        title: '下线时间',
        dataIndex: 'time',
        sorter : (a, b) => new Date(a.time) - new Date(b.time),
        width : 220
      },{
        title: '状态',
        dataIndex: 'state',
        render : (text, record) => {
          // if(record.job_history_id == 0){
          //   return <ProgressIcon type={text}/>
          // }else{
          //   return <Link to={`/job/${record.job_history_id}`}>
          //     <ProgressIcon type={text}/>
          //   </Link>
          // }
          return <TaskState type={text} id={record.job_history_id}/>
        }
      }],
      rowKey : 'id'
    }

    return (
      <Row>
        <Row className={styles["mgtb-8"]}>
          <Filter {...filterProps}/>
        </Row>
        <DataTable {...dataTableProps}/>
      </Row>
    )
  }
}

Offline.propTypes = {

}

export default connect((state) => {
  return {
    loading : state.loading.models['offline'],
    offline : state['offline']
  }
})(Offline)

