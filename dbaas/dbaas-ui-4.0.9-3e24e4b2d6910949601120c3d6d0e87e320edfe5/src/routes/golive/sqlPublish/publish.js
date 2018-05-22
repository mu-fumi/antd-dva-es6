/**
 *
 * @copyright(c) 2017
 * @created by  lizzy
 * @package dbaas-ui
 * @version :  2017-08-16 10:41 $
 * 加动态key后，codemirror使用表单自带验证会一直报onchange of undefined，validateStatus控制help信息的颜色，用state存取和更新code编辑器才不会卡。。。
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Alert, Modal, Col, Progress, Button, Tabs, Table, Card } from 'antd'
import { DataTable, Layout, Search, ProgressIcon, IconFont } from 'components'
import CodeMirror from 'react-codemirror'
import { classnames, Cache, constant } from 'utils'
require('codemirror/lib/codemirror.css')
require('codemirror/mode/sql/sql') // 语法高亮
import _ from 'lodash'
import styles from './create.less'
import ShowMoreModal from './ShowMoreModal'

const TabPane = Tabs.TabPane
const info = Modal.info
const confirm = Modal.confirm
const modelKey = 'golive/sqlPublish/create'
const { SQL_PUBLISH_BACKUP_TYPE, SQL_PUBLISH_MEANING_STATUS } = constant
const backupTypes = _.invert(SQL_PUBLISH_BACKUP_TYPE)

class Publish extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      visible: false,  // 实例选择modal
      showMoreModalVisible: false,  // 检查结果modal
      text: '',
      modalType: '',
    }
  }
  componentWillReceiveProps(nextProps) {  // 新建时进行发布/回滚或者从列表页进入编辑页（正在发布/回滚在这里统一处理）
    if (this.props.create.status !== 10 && nextProps.create.status === 10) {
      // console.log('handlePublishProgress', this.props.create.status)
      this.props.dispatch({
        type: `${modelKey}/handlePublishProgress`,
      })
    }
    if (this.props.create.status !== 12 && nextProps.create.status === 12) {
      // console.log('handleRollbackProgress', this.props.create.status)
      this.props.dispatch({
        type:  `${modelKey}/handleRollbackProgress`,
      })
    }
  }


  render () {
    const {
      dispatch,
      create,
    } = this.props

    const {status, sql, selectedInstanceNames, selectedInstanceIdsToNames, publishDetails, publishProgress, publishStatus, showProgressBar, inProgress, lastBackupAt, selectedBackupTable} = create

    const publishResult = publishDetails['publish_info'] ? JSON.parse(publishDetails['publish_info']) : {}
    const rollbackDetail = publishDetails['backup_info'] ? JSON.parse(publishDetails['backup_info']) : {}
    const rollbackResult = publishDetails['rollback_info'] ? JSON.parse(publishDetails['rollback_info']) : {}

    // publishDetails的数据格式：
    // "details": {
    //   "backup_info": "{\"266\":[{\"db\":\"mysql\",\"table\":\"t_role15\",\"sql\":\"DROP TABLE `mysql`.`t_role15`;\"}]}",
    //     "check_info": "{\"266\":{\"rc\":0,\"stderr\":\"\",\"stdout\":\"[[3, \\\"CHECKED\\\", 0, \\\"Audit completed\\\", \\\"None\\\", \\\"use mysql\\\", 0, \\\"'0_0_0'\\\", \\\"None\\\", \\\"0\\\", \\\"\\\"]]\\n\"}}",
    //     "publish_info": "{\"266\":[{\"ID\":1,\"stage\":\"RERUN\",\"errlevel\":0,\"stagestatus\":\"Execute Successfully\",\"errormessage\":\"None\",\"SQL\":\"use `mysql`\",\"sequence\":\"'1519975088_4144376_0'\",\"backup_dbname\":\"None\",\"effect_db\":\"\",\"effect_table\":\"\",\"operation\":\"\",\"execute_time\":\"0.000\"},{\"ID\":2,\"stage\":\"EXECUTED\",\"errlevel\":1,\"stagestatus\":\"Execute Successfully\\nBackup successfully\",\"errormessage\":\"Set charset to one of 'utf8mb4' for table 't_role15'.\\nSet comments for table 't_role15'.\\nColumn 'id' in table 't_role15' have no comments.\",\"SQL\":\"CREATE TABLE `t_role15` ( `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY) COLLATE=utf8_unicode_ci ENGINE=InnoDB \",\"sequence\":\"'1519975088_4144376_1'\",\"backup_dbname\":\"172_16_20_198_3314_mysql\",\"effect_db\":\"mysql\",\"effect_table\":\"t_role15\",\"operation\":\"CREATETABLE\",\"execute_time\":\"0.030\",\"rollback\":[\"DROP TABLE `mysql`.`t_role15`;\"]}]}",
    //     "rollback_info": "{\"266\":{\"success\":true,\"sql\":[{\"db\":\"mysql\",\"table\":\"t_role15\",\"sql\":\"DROP TABLE `mysql`.`t_role15`;\"}],\"error\":\"\"}}"
    // },

    let options = {
      lineNumbers: true,
      mode: 'text/x-sql',
      readOnly: true,
      cursorBlinkRate: -1
    }

    const publishInfo = (
      <div>
        {/*<div className="title">发布信息确认：</div>*/}
        <div className="edit">
          发布的 SQL:
          <CodeMirror key={sql} value={sql} options={options}
                      className="code-mirror"/>
        </div>
        <div className="label">
          <span>发布到实例：</span>
          {selectedInstanceNames || '实例已不存在'}
        </div>
      </div>
    )

    // console.log((rollbackDetail['266'] || []).map(k => k.sql).join('\n'))

    const rollbackInfo = (
      <div className="rollback-info">
        <Card title="回滚信息：" style={{ width: '100%' }}>
          <Tabs defaultActiveKey="1" >
            {
              Object.keys(rollbackDetail).length === 0 ?
                <div>致命错误！</div>
                :
                Object.keys(rollbackDetail).map(v => <TabPane tab={selectedInstanceIdsToNames[v]} key={v}>
                  <div>
                    <div>回滚语句：</div>
                    <CodeMirror key={(rollbackDetail[v] || []).map(k => k.sql).join('\n')} value={(rollbackDetail[v] || []).map(k => k.sql).join('\n')} options={options}
                                className="code-mirror"/>
                  </div>
                  <div className="mgt-16">
                    <div>已发布 SQL 语句：</div>
                    <CodeMirror key={sql} value={sql} options={options}
                                className="code-mirror"/>
                  </div>
                </TabPane>)
            }
          </Tabs>
        </Card>
      </div>
    )

    const showMore = (text, modalType) => {
      this.setState({
        showMoreModalVisible: true,
        text,
        modalType
      })
    }

    const onOkorCancel = () => {
      this.setState({
        showMoreModalVisible: false,
      })
    }

    const showMoreModalProps = {
      visible: this.state.showMoreModalVisible,
      text: this.state.text,
      modalType: this.state.modalType,
      onOk: onOkorCancel,
      onCancel: onOkorCancel
    }


    const getPublishFailureTable = (publishInfo) => {
      const columns = [{
        title: 'ID',
        dataIndex: 'ID',
        key: 'ID',
        width: 100,
      }, {
        //   title: '阶段',
        //   dataIndex: 'stage',
        //   key: 'stage',
        // }, {
        title: '错误等级',
        dataIndex: 'errlevel',
        key: 'errlevel',
        width: 150,
      }, {
        //   title: '阶段状态',
        //   dataIndex: 'stagestatus',
        //   key: 'stagestatus',
        // }, {
        title: '错误信息',
        dataIndex: 'errormessage',
        key: 'errormessage',
        width: 200,
        render: (text) => {
          let showText = text
          if (text !== 'None') {
            showText = <span className="text-error">{text}</span>
          }
          return <a className={styles['show-more']}
                    onClick={showMore.bind(this, text, '错误信息')}>
            {showText}</a>
        }
      }, {
        title: '当前检查的 SQL',
        dataIndex: 'SQL',
        key: 'SQL',
        width: 350,
        render: (text) => {
          return <a className={styles['show-more']}
                    onClick={showMore.bind(this, text, '当前检查的 SQL')}>
            {text}</a>
        }
      }, {
        title: '序号',
        dataIndex: 'sequence',
        key: 'sequence',
        width: 100,
      }, {
        title: '备份库名',
        dataIndex: 'backup_dbname',
        key: 'backup_dbname',
        width: 200,
      }, {
      //   title: '操作库',
      //   dataIndex: 'effect_db',
      //   key: 'effect_db',
      // }, {
      //   title: '操作表',
      //   dataIndex: 'effect_table',
      //   key: 'effect_table',
      // }, {
      //   title: '操作',
      //   dataIndex: 'operation',
      //   key: 'operation',
      // }, {
        title: '执行时长',
        dataIndex: 'execute_time',
        key: 'execute_time',
        width: 200,
      }]
      return <div>
          <Table dataSource={publishInfo} columns={columns} scroll={{x: 1400}} />
          <ShowMoreModal {...showMoreModalProps} />
        </div>
    }


    const publishFailureInfo = (
      <div>
        <Card title="失败详情：" style={{ width: '100%' }}>
          {
            Object.keys(publishResult).length === 0 ?
            <div>致命错误！</div>
            :
          <Tabs>
            {
              Object.keys(publishResult).map(v => <TabPane tab={selectedInstanceIdsToNames[v]} key={v}>
                {getPublishFailureTable(publishResult[v] || [])}
              </TabPane>)
            }
          </Tabs>
          }
        </Card>
      </div>
    )

    // const getRollbackFailureTable = (rollbackInfo) => {
    //   const columns = [{
    //     title: 'ID',
    //     dataIndex: 'ID',
    //     key: 'ID',
    //   }, {
    //     title: '回滚库',
    //     dataIndex: 'db',
    //     key: 'db',
    //   }, {
    //     title: '回滚表',
    //     dataIndex: 'table',
    //     key: 'table',
    //   }, {
    //     title: '回滚语句',
    //     dataIndex: 'sql',
    //     key: 'sql',
    //   }, {
    //     title: '错误信息',
    //     dataIndex: 'error',
    //     key: 'error',
    //   }]
    //   return <Table dataSource={rollbackInfo} columns={columns} />
    // }

    // const getRollbackFailureTable = (rollbackInfo) => {
    //   const columns = [{
    //     title: 'SQL 语句执行记录',
    //     dataIndex: 'sql',
    //     key: 'sql',
    //   }, {
    //     title: '回滚结果',
    //     dataIndex: 'error',
    //     key: 'error',
    //   }]
    //   const dataSource = [{
    //     key: 1,
    //     sql: rollbackInfo['execute'].join('\n'),
    //     error: rollbackInfo['error']
    //   }]
    //   return <Table dataSource={dataSource} columns={columns} />
    // }

    const rollbackFailureInfo = (
      <div>
        <Card title="失败详情：" style={{ width: '100%' }}>
        {
          Object.keys(rollbackResult).length === 0 ?
          <div>致命错误！</div>
          :
        <Tabs>
          {
            Object.keys(rollbackResult).map(v => <TabPane tab={selectedInstanceIdsToNames[v]} key={v}>
              <div>
                <div>{rollbackResult[v]['error'] ? rollbackResult[v]['error'] : '回滚成功'}</div>
                {/*{getRollbackFailureTable(rollbackResult[v] || [])}*/}
                <div className="mgt-16">
                  <div>SQL 语句执行记录:</div>
                  <CodeMirror key={v} value={rollbackResult[v]['execute'].join('\n')} options={options}
                              className="code-mirror"/>
                </div>
              </div>
            </TabPane>)
          }
        </Tabs>
        }
        </Card>
      </div>
    )

    const getPublishResultAlert = (message, type) => {
      return <Alert
        message={message}
        type={type}
        showIcon
      />
    }


    const handleProgress = (
      <div className="label mgt-16">
        <span>进度：</span>
        <Progress percent={publishProgress || 0} status={publishStatus} />
      </div>
    )

    const publishSql = () => {
      if (inProgress) {
        info({
          title: '提示',
          content: '当前有备份或发布任务正在执行，请稍后再试！',
          onOk() {
          },
          onCancel() {
          },
        })
        return
      } else {
        confirm({
          title: '确定要发布 SQL ?',
          // content: '',
          onOk() {
            dispatch ({
              type: `${modelKey}/publishSql`,
            })
          },
          onCancel() {

          },
        })
      }
    }

    const rollbackContent = (
      <div>
        <p>请确认已认真核对回滚语句，并了解回滚操作对数据所产生的影响。</p>
        <p>回滚操作不会再次对数据进行备份，确定要操作吗？</p>
      </div>
    )

    const rollbackSql = () => {
      if (inProgress) {
        info({
          title: '提示',
          content: '当前有备份或发布任务正在执行，请稍后再试！',
          onOk() {
          },
          onCancel() {
          },
        })
      } else {
        confirm({
          title: '警告',
          content: rollbackContent,
          width: 700,
          className: styles['rollback-modal'],
          onOk() {
            dispatch({
              type: `${modelKey}/rollbackSql`,
            })
          },
          onCancel() {

          },
        })
      }
    }

    const prev = () => {
      dispatch ({
        type: `${modelKey}/prevStep`,
      })
    }

    const handleStatus = (status) => {  // 此处使用dispatch发起progress，因为progress中会更新status，因此进入死循环
      switch (status) {
        case SQL_PUBLISH_MEANING_STATUS['PUBLISHING']:
          return <div>
            {publishInfo}
            {handleProgress}
            {getPublishResultAlert('发布任务已在后台执行，您可以在本页面等待，也可以稍候在 SQL 发布列表查看进度及结果。', 'info')}
          </div>
          break
        case SQL_PUBLISH_MEANING_STATUS['PUBLISH_SUCCEED']:
          // message.success('发布成功！')
          // 任何实例的rollbackDetail的任何一行有回滚sql就可以回滚
          const rollbackSqlExists = Object.keys(rollbackDetail).map(v => rollbackDetail[v].map(k => k.sql).join('')).join('')
          if (rollbackSqlExists) {
            return <div>
              {rollbackInfo}
              {getPublishResultAlert('发布成功！', 'success')}
              <Button className="mgr-8" onClick={rollbackSql}>
                回滚
              </Button>
            </div>
          } else {
            return <div>
              {publishInfo}
              {getPublishResultAlert('发布成功！', 'success')}
            </div>
          }
          break
        case SQL_PUBLISH_MEANING_STATUS['PUBLISH_FAILED']:
          // message.error('发布失败！')
          return <div>
            {publishInfo}
            {getPublishResultAlert('发布失败！', 'error')}
            {publishFailureInfo}
          </div>
          break
        case SQL_PUBLISH_MEANING_STATUS['IN_ROLLBACK']:
          return <div>
            {rollbackInfo}
            {handleProgress}
            {getPublishResultAlert('回滚任务已在后台执行，您可以在本页面等待，也可以稍候在 SQL 发布列表查看进度及结果。', 'info')}
          </div>
          break
        case SQL_PUBLISH_MEANING_STATUS['ROLLBACK_SUCCEED']:
          // message.success('回滚成功！')
          return <div>
            {rollbackInfo}
            {getPublishResultAlert('回滚成功！', 'success')}
          </div>
          break
        case SQL_PUBLISH_MEANING_STATUS['ROLLBACK_FAILED']:
          // message.error('回滚失败！')
          return <div>
            {rollbackInfo}
            {getPublishResultAlert('回滚失败！', 'error')}
            {rollbackFailureInfo}
          </div>
          break
        default:
          return <div>
            {publishInfo}
            <Col className="buttons mgt-16">
              <Button onClick={prev} className="mgr-8">
                上一步
              </Button>
              <Button onClick={publishSql} className="mgr-8">
                发布
              </Button>
            </Col>
          </div>
      }
    }

    return (
      <div className="upload publish">
        {handleStatus(status)}
      </div>
    )
  }
}

Publish.propTypes = {
  create: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=>{
  return {
    create: state[modelKey],
  }
})(Publish)
