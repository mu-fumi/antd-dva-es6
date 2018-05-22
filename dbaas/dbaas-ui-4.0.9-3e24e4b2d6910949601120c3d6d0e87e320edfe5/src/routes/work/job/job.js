/**
 * Created by zhangmm on 2017/9/7.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './job.less'
import { DataTable, Filter , IconFont } from 'components'
import { Link } from 'dva/router'
import { Row , Col , Modal, Radio, Badge } from 'antd'
import { TimeFilter } from 'utils'

const confirm = Modal.confirm
const RadioButton = Radio.Button
const RadioGroup = Radio.Group

class Job extends Base{
  constructor(props){
    super(props)
    this.handleJobReload = this.handleJobReload.bind(this)
    this.pageBtns = {
      element: ()=>{
        return (<Row>
          <Col className="pageBtn" onClick={this.handleJobReload}>
            <a href="javascript:void(0);">
             <IconFont type="reload"/>刷新
            </a>
          </Col>
        </Row>)
      }
    }
    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '任务列表', selectedKey: '任务列表job'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
    this.state = {
      dateType: {
        '今天': 'today',
        '昨天': 'last_1_days',
        '近七天':'last_7_days',
        '近30天':'last_30_days'
      },
      ownerList: {
        '我的': '0',
        '全部': '1'
      }
    }
  }

  handleJobReload(){
    this.props.dispatch({
      type : `job/handleReload`
    })
  }

  render(){
    const { location, dispatch, job } = this.props
    const { keyword, placeholder, time, reload } = job

    const searchProps = [{
      keyword,
      placeholder,
      onSearch(value) {
        dispatch({
          type: `job/handleFilter`,
          payload: {
            keyword:value
          },
        })
      },
    }]

    const rangePickerProps = [
      {
        label : '查询时间段',
        props:{
          allowClear: true,
          onChange(value) {
            dispatch({
              type: `job/handleTimeFilter`,
              payload: {
                time : TimeFilter.toUnix(value)
              },
            })
          }
        },
      }
    ]

    const radioProps = [
      {
        label : '时间',
        options: this.state.dateType,
        props: {
          defaultValue:'today',
          onChange: (e) => {
            dispatch({
              type: 'job/handleTimeFilter',
              payload: {
                time: e.target.value
              }
            })
          }
        },
      }
    ]

    const filterProps = {
      searchProps,
      radioProps,
      rangePickerProps,
    }

    const tableProps = {
      fetch:{
        url:'/jobs',
        data:{
          name:keyword,
          time:time
        }
      },
      rowKey: 'id',
      columns:[{
        title: '任务名称',
        dataIndex: 'name',
        key: 'name',
        render : (text, record) => {
          return (
            <span>
              <Link to={`/job/${record.id}`}>{text}</Link>
            </span>
          )
        }
      },
      {
        title: '结果',
        dataIndex: 'progress',
        key: 'progress',
        render: (text) => {
          let className = ''
          let result = ''
          let status = ''
          switch (text) {
            case 0:
              className = 'text-info'
              result = '运行中'
              status = 'processing'
              break
            case 1:
              className = 'text-success'
              result = '完成'
              status = 'success'
              break
            case 2:
              className = 'text-error'
              result = '出错'
              status = 'error'
              break
            case 3:
              className = 'text-warning'
              result = '超时'
              status = 'warning'
              break
          }
          return (<span className={className}>
            <Badge status={status}/>
            {result}
            </span>)
        }
      },
      {
        title: '开始时间',
        dataIndex: 'created_at',
        key: 'created_at',
        sorter:true,
      },
      {
        title: '完成时间',
        dataIndex: 'finished_at',
        key: 'finished_at',
        sorter:true,
      },
      {
        title: '耗时',
        dataIndex: 'time_cost',
        key: 'time_cost',
      }],
      reload:reload
    }

    return(
      <Row className={styles.job}>
        <Row className="inner-cont">
          <Row className="mgrb">
            <Filter {...filterProps} />
          </Row>
          <DataTable {...tableProps} />
        </Row>
      </Row>
    )
  }
}

Job.propTypes = {
  job: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    job: state['job'],
    loading: state.loading.effects
  }
}

export default connect(mapStateToProps)(Job)
