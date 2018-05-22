
/**
 * Created by wengyian on 2017/6/26.
 */
import Base from 'routes/base'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Card, Icon, message, Tag, Button, Modal } from 'antd'
import { DataTable, Layout, Search, Filter, IconFont, ProgressIcon } from 'components'
import { routerRedux, Link, } from 'dva/router'
import { classnames } from 'utils'
import styles from './schedulers.less'
import _ from 'lodash'
import { constant, TimeFilter } from 'utils'
import * as moment from 'moment'
import queryString from 'query-string'

const modelKey = 'work/schedulers'

const confirm = Modal.confirm

const{ SCHEDULE_PROGRESS, SCHEDULE_PROGRESS_ICON } = constant

class Schedulers extends Base {

  constructor(){
    super()

    this.pageBtns = {
      element : () => {
        return <Row>
          <Col className="pageBtn">
            <Link to="/schedulers/add" className="text-info">
              <IconFont type="plus"/>新建
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
      type : `${modelKey}/resetFilter`,
      fire : [Base.WillUnmount]
    })

    this.handleDelete = this.handleDelete.bind(this)
    this.handlePause = this.handlePause.bind(this)
    this.handleReload = this.handleReload.bind(this)
  }

  handleReload(){
    if(this._keywords === undefined || this._keywords === null){
      this._keywords = ''
    }
    this.props.dispatch({
      type : `${modelKey}/handleFilter`,
      payload : {keywords : this._keywords}
    })
    this.props.dispatch({
      type : `${modelKey}/handleReload`
    })
  }

  handleDelete(record){
    confirm({
      title : '提示',
      content : '确定要删除此定时任务吗？',
      onOk : () => {
        this.props.dispatch({
          type : `${modelKey}/deleteSchedule`,
          payload : record.id
        })
      }
    })
  }

  handlePause(record){
    let pause = record.pause === 0 ? 1 : 0
    confirm({
      title : '提示',
      content : '确定要修改此定时任务的状态吗？',
      onOk : () => {
        this.props.dispatch({
          type : `${modelKey}/changeScheduleStatus`,
          payload : {
            id : record.id,
            pause : pause
          }
        })
      }
    })
  }

  render(){
    const { schedulers, dispatch, location } = this.props

    const { filter, users, reload } = schedulers

    const query = queryString.parse(location.search);
    const { field = '', keyword = '' } = query
    const placeholder = '搜索 任务、工具名称'

    const searchProps = [{
      field,
      keyword,
      placeholder,
      onSearch(value){
        dispatch({
          type : `${modelKey}/handleFilter`,
          payload : {keywords: value}
        })
      },
      onChange : (e) => {
        this._keywords = e.target.value
      }
    }]


    const rangePickerProps = [
      {
        label : '最后修改时间',
        props:{
          allowClear: true,
          onChange(value, dataString) {
            dispatch({
              type: `${modelKey}/handleFilter`,
              payload: {
                edit_begin_time : dataString[0],
                edit_end_time : dataString[1],
              },
            })
          }
        },
      }
    ]

    const selectProps = [
      {
        label: '最后修改者',
        options: users,
        props:{
          onChange(value) {
            dispatch({
              type: `${modelKey}/handleFilter`,
              payload: {
                editor : value
              },
            })
          }
        }
      },{
        label: '状态',
        options: SCHEDULE_PROGRESS,
        props:{
          onChange(value) {
            dispatch({
              type: `${modelKey}/handleFilter`,
              payload: {
                status : value
              },
            })
          }
        }
      }
    ]

    const filterProps = {
      searchProps,
      rangePickerProps,
      selectProps,
      // buttonProps,
    }

    const fetchDataTableProps = {
      bordered : true,
      fetch : {
        url : '/crontab',
        data : filter,
      },
      columns : [
        {
          title : '任务名称',
          dataIndex : 'name',
          render : (text, record) => {
            return <Link to={`/schedulers/detail/${record.id}`}>{text}</Link>
          }
        },{
          title : '脚本工具',
          dataIndex : 'tool_name',
          render : (text, record) => {
            return <Link to={`/tool/${record.tool_id}`} target="_blank">{text}</Link>
          }
        },{
          title : '定时策略',
          dataIndex : 'schedule',
        },{
          title : '最后修改',
          dataIndex : 'user_name',
        },{
          title : '最后修改时间',
          dataIndex : 'updated_at',
          sorter : (a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        },{
          title : '状态',
          dataIndex : 'progress',
          render : (text, record) => {
            let type = SCHEDULE_PROGRESS_ICON[text]
            return <ProgressIcon type={type} />
          }
        },{
          title : '操作',
          render : (text, record) => {
            let lastContent = record.pause === 0 ? '禁用' : '启用'
            return (
              <span>
              <span>
                <Link to={`/schedulers/${record.id}`}>编辑</Link>
              </span>
              <span>
                <span className="ant-divider" />
                <a href="javascript:;" onClick={() => this.handleDelete(record)}>删除</a>
              </span>
              <span>
                <span className="ant-divider" />
                <a href="javascript:;" onClick={() => this.handlePause(record)}>{lastContent}</a>
              </span>
            </span>
            )
          }
        },
      ],
      rowKey : 'id',
      reload : reload
    }

    // console.log(new Date().getTime())

    return (
      <Row className={styles['schedulers']}>
        <Row style={{ marginBottom: 16 }}><Filter {...filterProps} /></Row>
        <DataTable {...fetchDataTableProps} />
      </Row>
    )
  }
}

Schedulers.propTypes = {
  schedulers : PropTypes.object,
  location : PropTypes.object,
  loading : PropTypes.bool,
  dispatch : PropTypes.func
}

export default connect((state)=>{
  return {
    loading: state.loading.models[modelKey],
    schedulers: state[modelKey],
  }
})(Schedulers)

