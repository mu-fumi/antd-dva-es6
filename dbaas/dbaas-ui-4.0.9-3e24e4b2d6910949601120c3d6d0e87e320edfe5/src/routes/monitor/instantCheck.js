/**
 *
 * @copyright(c) 2017
 * @created by lizzy
 * @package dbaas-ui
 * @version :  2017-7-31 14:24 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Form, Select, Input, Button, Pagination  } from 'antd'
import { Filter, Card, Chart, IconFont } from 'components'
import TagBox from './tagBox'

import { TimeFilter, constant } from 'utils'

import LazyLoad from 'react-lazyload'
import styles from './trend.less'

const modelKey = 'monitor/instantCheck';

const FormItem = Form.Item
const Option = Select.Option

const formItemLayout = {
  labelCol : {
    span : 2
  },
  wrapperCol : {
    span : 10
  }
}

class InstantCheck extends React.Component {

  state = {
    checked: true,
    mysqlClassName: 'tag-box',
    osClassName: 'tag-box',
    spreadMysqlTags: false,
    spreadOsTags: false,
    showMore: false,
    key: 1
  }

  componentDidMount() {
    this.props.dispatch({
      type : 'app/handleReturnButton',
      payload : ''
    })
  }

  render() {
    const {
      instanceCheck,
      dispatch,
      form: {
        getFieldDecorator,
        validateFields,
        getFieldsValue,
        setFieldsValue,
      }
    } = this.props;

    // const {  } = instanceCheck

    // const cardProps = {
    //   tableProps: [
    //     {
    //       bordered: true,
    //       fetch: {
    //         url: '/performance/block/list',
    //         data: filter,
    //         required: ['hostname']
    //       },
    //       columns: [
    //         { title: '阻塞开始时间', dataIndex: 'blocking_trx_started', key:'blocking_trx_started', sorter: true, width: 160 },
    //         { title: '锁定的表', dataIndex: 'locked_table', key:'locked_table', sorter: true, width: 150},
    //         { title: '锁定索引', dataIndex: 'lock_index', key:'lock_index', sorter: true, width: 150},
    //         { title: '锁定类型', dataIndex: 'lock_type', key:'lock_type', sorter: true, width: 100 },
    //         { title: '进程 ID', dataIndex: 'waiting_pid', key:'waiting_pid', sorter: true, width: 100 },
    //         { title: '事务 ID', dataIndex: 'waiting_trx_id', key:'waiting_trx_id', sorter: true, width: 100 },
    //         { title: '当前 SQL', dataIndex: 'waiting_query', key:'waiting_query', sorter: true, width: 250 },
    //         { title: '等待时长', dataIndex: 'wait_age', key:'wait_age', sorter: true, width: 100 },
    //         { title: '等待事务执行时长', dataIndex: 'waiting_trx_age', key:'waiting_trx_age', sorter: true, width: 160 },
    //         // { title: '查询响应时间指数', dataIndex: 'next_backup_time', key:'next_backup_time', sorter: true },
    //         { title: '等待事务修改行数', dataIndex: 'waiting_trx_rows_modified', key:'waiting_trx_rows_modified', sorter: true, width: 160 },
    //         { title: '等待行锁数量', dataIndex: 'waiting_trx_rows_locked', key:'waiting_trx_rows_locked', sorter: true, width: 140 },
    //         { title: '等待锁类型', dataIndex: 'waiting_lock_mode', key:'waiting_lock_mode', sorter: true, width: 120 },
    //         { title: '阻塞进程 ID', dataIndex: 'blocking_pid', key:'blocking_pid', sorter: true, width: 120 },
    //         { title: '阻塞事务 ID', dataIndex: 'blocking_trx_id', key:'blocking_trx_id', sorter: true, width: 100 },
    //         { title: '阻塞 SQL', dataIndex: 'blocking_query', key:'blocking_query', sorter: true, width: 250 },
    //         { title: '阻塞事务执行时长', dataIndex: 'blocking_trx_age', key:'blocking_trx_age', sorter: true, width: 150 },
    //         { title: '阻塞事务修改行数', dataIndex: 'blocking_trx_rows_modified', key:'blocking_trx_rows_modified', sorter: true, width: 150 },
    //         { title: '阻塞行锁数量', dataIndex: 'blocking_trx_rows_locked', key:'blocking_trx_rows_locked', sorter: true, width: 120},
    //         { title: '阻塞锁类型', dataIndex: 'blocking_lock_mode', key:'blocking_lock_mode', sorter: true, width: 120 },
    //       ],
    //       rowKey: 'id',
    //       scroll: {x: 3000},
    //       // reload: tableTimeFilter['reload'],
    //       handleSorter: handleSorter
    //     }
    //   ]
    // }

    return (
      <Row className={styles.trend}>
          <Row className="search-box">
            <Row className="search">

            </Row>
          </Row>
          {/*<Card { ...cardProps }>       </Card>*/}
      </Row>
    )
  }
}

InstantCheck.propTypes = {
  instanceCheck: PropTypes.object,
  dispatch: PropTypes.func,
};

export default connect((state)=> {
  return {
    instantCheck: state[modelKey],
  }
})(Form.create()(InstantCheck))
