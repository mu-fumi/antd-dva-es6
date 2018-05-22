/**
 *
 * @copyright(c) 2017
 * @created by lizzy
 * @package dbaas-ui
 * @version :  2017-08-22 10:41 $
 */

import Base from 'routes/base'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Modal, Badge, Tooltip, Icon } from 'antd'
import styles from './sqlPublish.less'
import { DataTable, Layout, Filter, ProgressIcon, IconFont } from 'components'
import { Link, routerRedux } from 'dva/router'
import { constant, classnames, Cache } from 'utils'
import SqlModal from './sqlModal'
import _ from 'lodash'

const cache = new Cache()
const modelKey = 'golive/sqlPublish'
const { SQL_PUBLISH_STATUS, SQL_PUBLISH_MEANING_STATUS, SQL_PUBLISH_STATUS_TABLE } = constant
const SQL_PUBLISH_STATUS_MEANING = _.invert(SQL_PUBLISH_MEANING_STATUS)

const confirm = Modal.confirm

class SqlPublish extends Base {
  constructor() {
    super()
    this.state = {
      visible: false,
      text: '',
      sql: '',
      modalType: '详情',
      key: (+ new Date()),
      validate: false,
    }
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {activeName : 'SQL发布', selectedKey : 'SQL发布sql-publish'},
      defer : true,
      fire: [Base.DidMount],
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire: [Base.WillUnmount],
    })
    this.pageBtns = {
      element: () => {
        return <Row>
          <Col className="pageBtn">
            <Link to="/sql-publish/create" onClick={this.clearSqlId} className="text-info">
              <IconFont type="plus"/>新建
            </Link>
          </Col>
          <Col className="pageBtn" onClick={this.handleReload}>
            <a href="javascript:void(0);">
              <IconFont type="reload"/>刷新
            </a>
          </Col>
          <Col className="pageBtn" onClick={this.handleReset}>
            <a href="javascript:void(0);">
              <IconFont type="iconfont-reset"/>重置筛选条件
            </a>
          </Col>
        </Row>
      }
    }

    this.handleReload = this.handleReload.bind(this)
    this.clearSqlId = this.clearSqlId.bind(this)
  }

  handleReload = () => {  // onchange时的值存起来，刷新时读取
    if(this._keywords === null || this._keywords === undefined){
      this._keywords = ''
    }
    if (this._keywords.length < 2 && this._keywords.length > 0) {  //  一个字符时不进行搜索
      return
    }
    this.props.dispatch({
      type : `${modelKey}/handleKeywords`,
      payload : this._keywords
    })
    this.props.dispatch({
      type : `${modelKey}/handleReload`
    })
  }

  clearSqlId = () => {  //  不知道为什么离开页面的时候有时候会再次触发handleSqlID，此处强行在进入新建页的时候清掉
    cache.put('currentSqlId', '')
  }

  handleReset = () => {
    this.setState({  // 还原验证状态，才能在search的componentWillReceiveProps中监听到变化，否则重置后，验证失效
      validate: false
    })
    this.props.dispatch({
      type : `${modelKey}/resetFilter`
    })
    this.props.dispatch({
      type : `${modelKey}/handlePickerDefaultValue`,
      payload: []
    })
    this.setState({
      key: (+ new Date())
    })
  }

  render() {

    const {location, dispatch, sqlPublish} = this.props
    const { reload, filter, pickerDefaultValue, users, currentPage } = sqlPublish
    const { keywords, created_at, end_at, user_id, status } = filter
    const placeholder = '关键字搜索'

    const searchProps = [{
      keyword: keywords,  //  最底层的组件search里面是keyword，注意不要写成keywords
      placeholder,
      onSearch: (value) => {
        if (value.length < 2 && value.length > 0) {  //  一个字符时不进行搜索
          return
        }
        dispatch({
          type: `${modelKey}/handleFilter`,
          payload: {keywords: value},
        })
        dispatch ({
          type: `${modelKey}/setCurrentPage`,
          payload: 1
        })
      },
      onChange : (e) => {
        this._keywords = e.target.value  // onchange时的值存起来，刷新时读取
        if (e.target.value.length < 2 && e.target.value.length > 0) {  //  一个字符时报错
          this.setState({
            validate: '请输入至少两个字符！'
          })
          return
        }
        this.setState({
          validate: false
        })
      },
      validate: this.state.validate //  validate = '请输入至少两个字符' / false / 其他任何字符串
    }]

    const rangePickerProps = [
      {
        label: '提交时间',
        props: {
          allowClear: true,
          defaultValue: pickerDefaultValue,
          onChange(value, dataString) {
            // console.log(value, dataString)
            dispatch({
              type: `${modelKey}/handleFilter`,
              payload: {
                created_at: dataString[0],
                end_at: dataString[1],
              },
            })
            dispatch({
              type: `${modelKey}/handlePickerDefaultValue`,
              payload: value
            })
            dispatch ({
              type: `${modelKey}/setCurrentPage`,
              payload: 1
            })
          }
        }
      }
    ]

    const selectProps = [
      {
        label: '状态',
        options: SQL_PUBLISH_STATUS,
        props: {
          defaultValue: status,
          onChange(value) {
            dispatch({
              type: `${modelKey}/handleFilter`,
              payload: {status: value},
            })
            dispatch ({
              type: `${modelKey}/setCurrentPage`,
              payload: 1
            })
          },
        }
      }, {
        label: '提交人',
        options: users,
        props: {
          defaultValue: user_id,
          onChange(value) {
            dispatch({
              type: `${modelKey}/handleFilter`,
              payload: {user_id: value},
            })
            dispatch ({
              type: `${modelKey}/setCurrentPage`,
              payload: 1
            })
          }
        }
      }
    ]

    const filterProps = {
      searchProps,
      rangePickerProps,
      selectProps,
    }

    const showContent = (text, modalType) => {
      this.setState({
        visible: true,
        text: text,
        modalType: modalType
      })
    }

    const showSQL = (sql, operation, modalType) => {
      this.setState({
        visible: true,
        sql,
        operation,
        text: '',
        modalType
      })
    }

    const toEdit = (record) => {
      dispatch({
        type: `${modelKey}/toEdit`,
        payload: record.id
      })
    }

    const closeSql = (record) => {
      confirm({
        title: '确定要关闭此 SQL ?',
        onOk() {
          dispatch ({
            type: `${modelKey}/closeSql`,
            payload: {
              sqlID: record.id
            }
          })
          dispatch ({
            type: `${modelKey}/handleReload`,
          })
        },
        onCancel() {

        },
      })
    }

    const getShowHistory = (record) => {
      switch (record.status) {
        case SQL_PUBLISH_MEANING_STATUS['ROLLBACK_SUCCEED']:
        case SQL_PUBLISH_MEANING_STATUS['ROLLBACK_FAILED']:
        case SQL_PUBLISH_MEANING_STATUS['PUBLISH_FAILED']:
        case SQL_PUBLISH_MEANING_STATUS['PUBLISH_SUCCEED']:
        case SQL_PUBLISH_MEANING_STATUS['PUBLISH_SUCCEED_CLOSED']:
        case SQL_PUBLISH_MEANING_STATUS['PUBLISH_FAILED_CLOSED']:
          return true
          break
        default:
          return false
      }
    }

    const getShowCloseSql = (record) => {
      switch (record.status) {
        case SQL_PUBLISH_MEANING_STATUS['ROLLBACK_SUCCEED']:
        case SQL_PUBLISH_MEANING_STATUS['ROLLBACK_FAILED']:
        case SQL_PUBLISH_MEANING_STATUS['PUBLISH_SUCCEED_CLOSED']:
        case SQL_PUBLISH_MEANING_STATUS['PUBLISH_FAILED_CLOSED']:
          return false
          break
        // case SQL_PUBLISH_MEANING_STATUS['PUBLISH_SUCCEED']:
        //   if (record.ignore_backup && record.ignore_check) { // if对之前没有break的case都生效
        //     return true
        //   }
        //   return false
        //   break
        default:
          return true
      }
    }

    const toEditorHistory = (record) => {  //  有历史优先跳历史
      const showHistory = getShowHistory(record)
      showHistory ? dispatch(routerRedux.push({ pathname: `sql-publish/${record.id}/detail` })) : toEdit(record)
    }

    const fetchDataTableProps = {
      bordered: true,
      fetch: {
        url: '/sql-audit',
        data: filter
      },
      title: () => {
        return (
          <span className='tips'>
            <Icon type="bulb"/>
            <span>提示：异步备份、发布及回滚任务在后台执行，请刷新列表查看最新状态。</span>
          </span>
        )
      },
      columns: [
        {title: 'ID', dataIndex: 'id', sorter: true, width: '80px', render: (text, record) => {
          return <a href="javascript:void(0);" onClick={toEditorHistory.bind(this, record)}>{text || 'ID不存在'}</a>
        }},
        {title: '实例', dataIndex: 'nodes', width: '250px', render: (text) => {
          // 实例有可能已经被删除
          const instances = text.length === 0 ? '实例不存在' : (<ul>{text.map((v) => {return <li key={v.id}>{v.name}</li>})}</ul>)
          return <a onClick={showContent.bind(this, instances, '实例')}>{instances}</a>
        } },
        {title: 'SQL 语句', dataIndex: 'content.content', render: (text, record) => {
          return <a className={styles['query-sql']}
                    onClick={showSQL.bind(this, text, record.operation, 'SQL 语句')}>
                    {text}</a>
        } },

        {title: '状态', dataIndex: 'status', width: '150px', render: (text, record) => {
          let status = '';
          switch (text) {
            case SQL_PUBLISH_MEANING_STATUS['BACKUP_FAILED']:
            case SQL_PUBLISH_MEANING_STATUS['ROLLBACK_FAILED']:
            case SQL_PUBLISH_MEANING_STATUS['RETRY_FAILED']:
            case SQL_PUBLISH_MEANING_STATUS['PUBLISH_FAILED']:
              status = 'error'
              break
            case SQL_PUBLISH_MEANING_STATUS['PUBLISHING']:
            case SQL_PUBLISH_MEANING_STATUS['RETRYING']:
            case SQL_PUBLISH_MEANING_STATUS['IN_ROLLBACK']:
            case SQL_PUBLISH_MEANING_STATUS['IN_BACKUP']:
              status = 'processing'
              break
            case SQL_PUBLISH_MEANING_STATUS['PUBLISH_SUCCEED_CLOSED']:
            case SQL_PUBLISH_MEANING_STATUS['PUBLISH_FAILED_CLOSED']:
              status = 'default'
              break;
            case SQL_PUBLISH_MEANING_STATUS['PUBLISH_WITHOUT_CHECK']:
              status = 'warning'
              break;
            default:
              status = 'success'
          }
          // console.log(record.info)
          let info = record.info ? (Object.keys(record.info) || []).map((v)=>{return record.info[v]}).join('') : ''
          info = record.info ?
            (<span>
              <span className='status-tip'>{info}</span>
              <br/>
              <span>请点击“编辑”或“历史”查看详情。</span>
            </span>)
            :
            (<span>
              <span>请点击“编辑”或“历史”查看详情。</span>
            </span>)
          return status === 'error' ?
            <Tooltip key={record.id} title={info} overlayClassName={styles['tooltips']}>
              <Badge status={status}/>
              {SQL_PUBLISH_STATUS_TABLE[SQL_PUBLISH_STATUS_MEANING[text]]}
            </Tooltip>
            :
            <span>
              <Link to={`sql-publish/${record.id}/detail`} status={status}>
              {SQL_PUBLISH_STATUS_TABLE[SQL_PUBLISH_STATUS_MEANING[text]]}
              </Link>
            </span>
        }},
        {title: '备注', dataIndex: 'remark', width: '150px', render: (text) => {
          return <a className={styles['query-sql']} onClick={showContent.bind(this, text, '备注详情')}>{text || '无'}</a>
        } },
        {title: '提交人', dataIndex: 'user.user_name', width: '100px', render: (text) => {
          return <span>{text || '提交人不存在'}</span>
        }},
        {title: '提交时间', dataIndex: 'created_at', width: '150px', sorter: true},
        {title: '发布时间', dataIndex: 'publish_time', width: '150px', sorter: true, render: (text) => {
          return <span>{text || '尚未发布'}</span>
        }},
        {title: '更新时间', dataIndex: 'updated_at', width: '150px', sorter: true},
        {
          title: '操作', dataIndex: '', width: '150px', render: (text, record) => {
          const showHistory = getShowHistory(record)
          const showCloseSql = getShowCloseSql(record)
          // 任何实例的rollbackDetail的任何一行有回滚sql就可以回滚
          const rollbackDetail = record['details']['backup_info'] ? JSON.parse(record['details']['backup_info']) : {}
          const rollbackSql = Object.keys(rollbackDetail).map(v => rollbackDetail[v].map(k => k.sql).join('')).join('')
          const publishSucceed = record.status === SQL_PUBLISH_MEANING_STATUS['PUBLISH_SUCCEED'] &&
            rollbackSql // 未跳过备份的发布成功三个按钮都有
          return (
            <span>
              <span style={{ display: publishSucceed ? "" : (showHistory ? "none" : "")}}>
                <a href="javascript:void(0);" onClick={toEdit.bind(this, record)}
                   disabled={(record.user || {}).id === cache.get('uid')}>编辑</a>
              </span>
              <span style={{ display: publishSucceed ? "" : (showHistory ? "" : "none")}}>
                <span className='ant-divider' style={{ display: publishSucceed ? "" : "none" }}/>
                <Link to={`sql-publish/${record.id}/detail`}>历史</Link>
              </span>
              <span style={{ display: showCloseSql ? "" : "none"}}>
                 <span className='ant-divider'/>
                <a href="javascript:void(0);" onClick={closeSql.bind(this, record)}>关闭</a>
              </span>
            </span>
          )
        }}
      ],
      rowKey: 'id',
      reload: reload,
      scroll: {x: 1600},
      setCurrentPage: (currentPage) => {
        dispatch ({
          type: `${modelKey}/setCurrentPage`,
          payload: currentPage
        })
      },
      currentPage: currentPage
    }

    const onOkorCancel = () => {
      this.setState({
        visible: false,
      })
    }

    const sqlModalProps = {
      visible: this.state.visible,
      text: this.state.text, // 备注，实例
      sql: this.state.sql,  // sql
      operation: this.state.operation,
      modalType: this.state.modalType,
      onOk: onOkorCancel,
      onCancel: onOkorCancel
    }

    return (
      <Row className={styles['sql-publish']}>
        <Row style={{marginBottom: 16}}>
          <Filter key={this.state.key} {...filterProps} />
        </Row>
        <DataTable {...fetchDataTableProps} />
        <SqlModal {...sqlModalProps} />
      </Row>
    )
  }
}

SqlPublish.propTypes = {
  sqlPublish: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=>{
  return {
    sqlPublish: state[modelKey],
  }
})(SqlPublish)
