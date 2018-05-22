/**
 * Created by wengyian on 2017/7/27.
 */
import Base from 'routes/base'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Card, Icon, message, Tag, Button, Modal, Tooltip } from 'antd'
import { DataTable, TimeFilter as Time, IconFont, ProgressIcon } from 'components'
import { browserHistory, Link } from 'dva/router'
import { classnames, TimeFilter } from 'utils'
import styles from './schedulers.less'
import _ from 'lodash'
import { SCHEDULE_PROGRESS_ICON } from 'utils/constant'

const modelKey = 'work/schedulers/detail'

class Detail extends Base{

  constructor(){
    super()

    this.setGobackBtn()
    this.push({
      type :  'app/handleCurrentMenu',
      payload : {activeName : '任务详情', selectedKey : '定时任务schedulers'},
      defer : true,
      fire : [Base.DidMount]
    })
    this.push({
      type :  'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
  }

  render(){
    const { location, dispatch, detail, loading } = this.props

    const { ID, scheduleInfo } = detail

    const dataTableProps = {
      fetch : {
        url : `/crontab/${ID}/history`
      },
      columns: [
        { title: '最近执行的工具任务', dataIndex: 'name', key:'name', render: (text, record) => {
          return <Link to={`/message/job/${record.id}`} target="_blank">{text}</Link>
        }},
        { title: '结果', dataIndex: 'progress', key:'progress', render: (text, record) => {
          let type = SCHEDULE_PROGRESS_ICON[text]
          return <Link to={`/message/job/${record.id}`} target="_blank">
            <ProgressIcon type={type}/>
          </Link>
        }},
        { title: '执行用户', dataIndex: 'user', key:'user_name',
          render : (text, record) => {
            return <span>{text.user_name}</span>
          }
        },
        { title: '执行开始时间', dataIndex: 'created_at', sorter: true, key:'created_at' },
        { title: '耗时(s)', dataIndex: 'time_comsuming', key:'time_comsuming'}
      ],
      rowKey: 'id',
    }


    const statusContent = () => {
      let type = SCHEDULE_PROGRESS_ICON[scheduleInfo.progress]
      return <ProgressIcon type={type}/>
    }
    return (
      <Row className={styles['detail']}>
        <Row className={styles['pd-8']}>
          <Col span="3">
            <div className={styles["title-logo"]}>
              <span>{scheduleInfo.name ? scheduleInfo.name.slice(0,1) : ''}</span>
            </div>
          </Col>
          <Col span="20">
            <Col span="10" className={styles["item"]}>
              创建者 :{scheduleInfo.user_name || ''}
            </Col>
            <Col span="10" className={styles["item"]}>
              启用情况 : {scheduleInfo.pause === 0 ? '已启用' : '已禁用'}
            </Col>
            <Col span="10" className={styles["item"]}>
              定时策略 :{scheduleInfo.need_repeat === 1 ? '周期性任务' : scheduleInfo.need_repeat === 0 ? '一次性任务' : ''}
            </Col>
            <Col span="10" className={styles["item"]}>
              状态 : {statusContent()}
            </Col>
            <Col span="20" className={styles["item"]}>
              执行时间 : {scheduleInfo.need_repeat === 1 ? scheduleInfo.schedule : scheduleInfo.next_run_at}
            </Col>
            <Col span="20" className={styles["item"]}>
              目标 IP :{scheduleInfo.ips || ''}
            </Col>
          </Col>
        </Row>
        <Row>
          <DataTable {...dataTableProps}/>
        </Row>
      </Row>
    )
  }
}

Detail.propTypes = {
  detail: PropTypes.object,
  location : PropTypes.object,
  loading : PropTypes.bool,
  dispatch : PropTypes.func
}

export default connect((state)=>{
  return {
    loading: state.loading.models[modelKey],
    detail: state[modelKey],
  }
})(Detail)
