
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './event.less'
import { DataTable, Filter } from 'components'
import { Row , message} from 'antd'


class Events extends React.Component {

  render() {

    const {dispatch, location, events, loading} = this.props
    //存放已读数据的id

    //描述DataTable的数据
    const tableProps = {
      bordered: true,
      fetch: {
        url: '/dashboard/issues?limit=undefined'
      },
      columns: [{
        title: '主机',
        dataIndex: 'host',
        key: 'host',
      }, {
        title: '告警信息',
        dataIndex: 'description',
        key: 'description',
      }, {
        title: '最后修改时间',
        dataIndex: 'last_change',
        key: 'last_change',
      }, {
        title: '历时',
        dataIndex: 'human_last_change',
        key: 'human_last_change',
      }, {
        title: '状态',
        dataIndex: 'acknowledged',
        key: 'acknowledged',
      }, {
        title: '备注',
        dataIndex: 'name',
        key: 'name',
      }],
      rowKey: 'id',
      // reload: reload
    }

    //定义刷新的按钮，触发刷新
    // const filterProps = {
    //   buttonProps: [{
    //     label: '标记为已读',
    //     iconProps: {
    //       type: ''
    //     },
    //     props: {
    //       onClick() {
    //         console.log(isRead)
    //         if (isRead.length < 1) {
    //           message.error('本页没有未阅读的消息')
    //         } else {
    //           dispatch({type: `monitor/events/getRead`, payload: {ids: isRead}});
    //         }
    //       }
    //     }
    //   }, {
    //     label: '刷新',
    //     iconProps: {
    //       type: 'reload'
    //     },
    //     props: {
    //       onClick() {
    //         dispatch({type: `monitor/events/handleReload`})
    //       }
    //     }
    //   }]
    // }

    return (
      <Row className={styles.list}>
        <Row className={styles['console-title']}>
          {/*<Filter {...filterProps} />*/}
        </Row>
        <DataTable {...tableProps} />
      </Row>
    )
  }
}

Events.propTypes = {
  events: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    events: state['monitor/events'],
    //loading: state.loading.effects
  }
}

export default connect(mapStateToProps)(Events)
