/**
 *
 * @copyright(c) 2017
 * @created by  lizzy
 * @package dbaas-ui
 * @version :  2017-08-16 10:41 $
 * 加动态key后，codemirror使用表单自带验证会一直报onchange of undefined，
 * validateStatus控制help信息的颜色，
 * 用state存取和更新code编辑器才不会卡。。。
 * 此页面初始从model获取ddl和dml，onchange时更新到state，下一步时再更新到model
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Icon, Form, Input, Col, Button, Select, Checkbox, Collapse, Modal, Tabs, Table } from 'antd'
import { DataTable, Layout, Search, ProgressIcon, IconFont } from 'components'
import CodeMirror from 'react-codemirror'
import { classnames } from 'utils'
import InstanceSelectModal from './instanceSelectModal'
import ShowMoreModal from './ShowMoreModal'
import styles from './create.less'
require('codemirror/lib/codemirror.css')
require('codemirror/mode/sql/sql') // 语法高亮


const FormItem = Form.Item
const Panel = Collapse.Panel
const TabPane = Tabs.TabPane
const Option = Select.Option
const { TextArea } = Input
const modelKey = 'golive/sqlPublish/create'

class CheckSql extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      sql : this.props.create.sql,
      errorMsg: null,
      validateStatus: 'success',
      visible: false,  // 实例选择modal
      showMoreModalVisible: false,  // 检查结果modal
      text: '',
      modalType: '',
    }
  }

  componentDidMount() {
     this.props.dispatch({
      type: `${modelKey}/handleCheckResult`,
      payload: ''
    })
  }

  componentWillReceiveProps(nextProps) {  // 初始model里面的sql为空，需要在props时更新为接口的数据
    if (this.props.create.sql !== nextProps.create.sql) {
      this.setState({
        sql: nextProps.create.sql,
      })
    }
  }

  render () {

    const {
      dispatch,
      create,
    } = this.props

    const {sql, other, checkResult, checkPassed, checkButtonLoading, sqlID, selectedRowKeys, selectedInstances, selectedInstanceNames, selectedInstanceIdsToNames, backupTables, selectedBackupTable, remarks, jumpCheck, jumpBackup, disablePublish} = create

    const { getFieldDecorator, validateFields } = this.props.form

    const handleCodeChange = (value) => {
      this.setState({
        sql: value
      })
      validateCode(this.state.sql)
      // sql有变动就要重新检查，不能直接下一步
      dispatch ({
        type: `${modelKey}/handleDisablePublish`,
        payload: true
      })
    }

    const validateCode = (check) => {
      if (check) {
        this.setState({
          errorMsg: null,
          validateStatus: 'success',
        })
      } else {
        this.setState({
          errorMsg: '请填写 SQL 语句！',
          validateStatus: 'error',
        })
      }
    }

    const next = () => {
      validateFields((err) => {
        validateCode(this.state.sql)
        if (!this.state.sql) {
          return false
        }
        if (err) {
          return false
        }
        dispatch({
          type: `${modelKey}/handleSql`,
          payload: this.state.sql
        })
        dispatch ({
          type: `${modelKey}/saveSql`,
          payload: {
            sql: this.state.sql,
          }
        })
      })
    }

    const handleSelectedBackupTable = (value) => {
      dispatch({
        type: `${modelKey}/handleSelectedBackupTable`,
        payload: value
      })
    }

    const handleRemarks = (e) => {
      dispatch({
        type: `${modelKey}/handleRemarks`,
        payload: e.target.value
      })
    }

    const selectInstance = () => {
      this.setState({
        visible: true
      })
    }

    const onOk = (selectedInstances, selectedRowKeys) => {

      // 实例有变动就要重新检查，不能直接下一步 TODO: 与已选实例对比看是否有变化，无变化则不需重新检查
      dispatch ({
        type: `${modelKey}/handleDisablePublish`,
        payload: true
      })

      const selectedInstanceIdsToNames = {} // 注意初始值是{}
      let selectedInstanceNames = []
      selectedInstances.forEach((v) => {
        selectedInstanceIdsToNames[v.id] = v.node_name ? v.node_name + ':' + v.port : v.name
        selectedInstanceNames.push(v.node_name ? v.node_name + ':' + v.port : v.name) // 编辑的接口返回的是name，node接口即table里面的行，是node_name，好在id字段相同
      })
      // console.log(selectedInstances, selectedInstanceIdsToNames)
      selectedInstanceNames = selectedInstanceNames.join(', ')
      this.props.form.setFieldsValue({
        instances: selectedInstanceNames
      })
      dispatch ({
        type: `${modelKey}/handleSelectChange`,
        payload: {
          selectedRowKeys: selectedRowKeys,
          selectedInstances: selectedInstances,
          selectedInstanceNames: selectedInstanceNames,
          selectedInstanceIdsToNames: selectedInstanceIdsToNames
        }
      })
      // dispatch ({  //  暂时不要备份库了。。
      //   type: `${modelKey}/getBackupTables`,
      //   payload: {
      //     node_id: selectedRowKeys[0],
      //   }
      // })
      this.setState({
        visible: false
      })
    }

    const instanceSelectModalProps = {
      visible: this.state.visible,
      selectedRowKeys,
      selectedInstances, // node_name可能重复，因此要保存行信息，用id比较
      onOk,
      onCancel: () => {
        this.setState({
          visible: false
        })
      }
    }

    const handleJump = (keyword, method, e) => {
      // console.log(keyword, method, e)
      if (e.target.checked) {
        Modal.confirm({
          title: "提示",
          content: `您选择了跳过${keyword}，是否确认操作？`,
          onOk() {
            dispatch ({
              type: `${modelKey}/${method}`,
              payload: true
            })
          }
        })
      } else {
        dispatch ({
          type: `${modelKey}/${method}`,
          payload: false
        })
      }
    }

    const handelJumpCheck = (e) => {
      handleJump('检查', 'handleJumpCheck', e)
      if (e.target.checked) {
        dispatch ({
          type: `${modelKey}/handleDisablePublish`,
          payload: false
        })
      } else {
        dispatch ({
          type: `${modelKey}/handleDisablePublish`,
          payload: true
        })
      }
    }

    const checkSql= () => {
      validateFields((err) => {
        validateCode(this.state.sql)
        if (!this.state.sql) {
          return false
        }
        if (err) {
          return false
        }
        dispatch ({
          type: `${modelKey}/checkSql`,
          payload: {
            sql: this.state.sql
          }
        })
      })
    }

    // const checkResult1 = {
    //   '1': {
    //     'stdout': [
    //       [1, "CHECKED", 0, "Audit completed", "None", "use mysql", 0, "'0_0_0'", "None", "0"],
    //       [2, "CHECKED", 0, "Audit completed", "None", "use mysql", 0, "'0_0_0'", "None", "0"],
    //       [3, "CHECKED", 0, "Audit completed", "None", "use mysql", 0, "'0_0_0'", "None", "0"],
    //       [4, "CHECKED", 0, "Audit completed", "None", "use mysql", 0, "'0_0_0'", "None", "0"],
    //       [5, "CHECKED", 0, "Audit completed", "None", "use mysql", 0, "'0_0_0'", "None", "0"],
    //       [6, "CHECKED", 0, "Audit completed", "None", "use mysql", 0, "'0_0_0'", "None", "0"],
    //       [7, "CHECKED", 0, "Audit completed", "None", "use mysql", 0, "'0_0_0'", "None", "0"],
    //       [8, "CHECKED", 0, "Audit completed", "None", "use mysql", 0, "'0_0_0'", "None", "0"],
    //       [9, "CHECKED", 0, "Audit completed", "None", "use mysql", 0, "'0_0_0'", "None", "0"],
    //       [10, "CHECKED", 0, "Audit completed", "None", "use mysql", 0, "'0_0_0'", "None", "0"],
    //       [11, "CHECKED", 0, "Audit completed", "None", "use mysql", 0, "'0_0_0'", "None", "0"],
    //       [12, "CHECKED", 0, "Audit completed", "None", "use mysql", 0, "'0_0_0'", "None", "0"],
    //     ]
    //   },
    //   '2': {
    //     'stdout': [
    //       [1, "CHECKED", 0, "Audit completed", "None", "use mysql", 0, "'0_0_0'", "None", "0"],
    //       [2, "CHECKED", 0, "Audit completed", "None", "use mysql", 0, "'0_0_0'", "None", "0"],
    //       [3, "CHECKED", 0, "Audit completed", "None", "use mysql", 0, "'0_0_0'", "None", "0"],
    //       [4, "CHECKED", 0, "Audit completed", "None", "use mysql", 0, "'0_0_0'", "None", "0"],
    //       [5, "CHECKED", 0, "Audit completed", "None", "use mysql", 0, "'0_0_0'", "None", "0"],
    //       [6, "CHECKED", 0, "Audit completed", "None", "use mysql", 0, "'0_0_0'", "None", "0"],
    //       [7, "CHECKED", 0, "Audit completed", "None", "use mysql", 0, "'0_0_0'", "None", "0"],
    //       [8, "CHECKED", 0, "Audit completed", "None", "use mysql", 0, "'0_0_0'", "None", "0"],
    //       [9, "CHECKED", 0, "Audit completed", "None", "use mysql", 0, "'0_0_0'", "None", "0"],
    //       [10, "CHECKED", 0, "Audit completed", "None", "use mysql", 0, "'0_0_0'", "None", "0"],
    //       [11, "CHECKED", 0, "Audit completed", "None", "use mysql", 0, "'0_0_0'", "None", "0"],
    //       [12, "CHECKED", 0, "Audit completed", "None", "use mysql", 0, "'0_0_0'", "None", "0"],
    //     ]
    //   }
    // }

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

    const getTable = (stdout) => {
      const dataSource = []
      try {
        (Array.isArray(JSON.parse(stdout)) ? JSON.parse(stdout) : []).map(v => {
          dataSource.push({
            key: v[0],
            ID: v[0],
            stage: v[1],
            errlevel: v[2],
            stagestatus: v[3],
            errormessage: v[4],
            SQL: v[5],
            Affected_rows: v[6],
          })
        })
        const columns = [{
          title: 'ID',
          dataIndex: 'ID',
          key: 'ID',
          width: 100,
        }, {
          title: '阶段',
          dataIndex: 'stage',
          key: 'stage',
          width: 100,
        }, {
          title: '错误等级',
          dataIndex: 'errlevel',
          key: 'errlevel',
          width: 150,
        }, {
          title: '阶段状态',
          dataIndex: 'stagestatus',
          key: 'stagestatus',
          width: 200,
        }, {
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
          width: 300,
          render: (text) => {
            return <a className={styles['show-more']}
                      onClick={showMore.bind(this, text, '当前检查的 SQL')}>
              {text}</a>
        } }, {
          title: '影响行数',
          dataIndex: 'Affected_rows',
          key: 'Affected_rows',
          width: 150,
        }, {
        }]
        return <div>
            <Table dataSource={dataSource} columns={columns} scroll={{x: 1200}}/>
          <ShowMoreModal {...showMoreModalProps} />
          </div>
      }
      catch (e) {
        return <span>{stdout}</span>
      }
    }

    // console.log(Object.keys(checkResult))

    const checkResultInfo = (
      checkResult &&
        <div>
          审核结果：{ checkPassed ? '通过' : '未通过' }
          <Tabs>
            {
              (Object.keys(checkResult) || []).map(v => <TabPane tab={selectedInstanceIdsToNames[v]} key={v}>
                {getTable(checkResult[v]['stdout'])}
              </TabPane>)
            }
          </Tabs>
        </div>
    )

    const text = (
      <p style={{ paddingLeft: 24 }}>
        {other}
      </p>
    )

    const filterSql = other ?
      (<Collapse className="edit">
        <Panel header="以下内容不是合法的 SQL 语句，已被过滤" key="1">
          {text}
        </Panel>
      </Collapse>)
      :
      ''

    const sqlLabel = (<span>
                          <span className="star mgr-4">*</span>
                          <span>SQL 语句</span>
                        </span>
    )

    return (
      <div className="upload">
        <Form>
          <div className="edit">
            <FormItem label={sqlLabel} help={this.state.errorMsg} validateStatus={this.state.validateStatus}>
              <CodeMirror key={sql} value={this.state.sql} options={{ lineNumbers: true, mode: 'text/x-sql' }}
                          onChange={handleCodeChange.bind(this)} className="code-mirror"/>
            </FormItem>
          </div>
          { filterSql }
          <div>
            <FormItem label="请选择实例：">
              { getFieldDecorator('instances', {
                initialValue : selectedInstanceNames,
                rules : [{
                  required : true,
                  message : '请选择实例'
                }]
              })(
                <TextArea rows={1} disabled={true}/>
              )}
            </FormItem>
            <InstanceSelectModal {...instanceSelectModalProps}/>
            <div className="button-wrapper mgb-16">
              <Button onClick={selectInstance}>
                <IconFont type="plus"/>
                实例
              </Button>
            </div>
            {/*<FormItem className="mgp-8" label="数据库：">*/}
              {/*<div className="tool-tip remarks">*/}
                {/*<Icon type="bulb"/>*/}
                {/*<span>提示：在多个数据库上同时发布时，所选的第一个数据库实例将作为库表结构的数据来源*/}
{/*。请确保 SQL 语句所涉及到的库表结构在多个实例上完全一致！</span>*/}
              {/*</div>*/}
              {/*{ getFieldDecorator('use_db', {*/}
                {/*initialValue : selectedBackupTable,*/}
                {/*onChange: handleSelectedBackupTable,*/}
                {/*rules : [{*/}
                  {/*required : true,*/}
                  {/*message : '请选择备份数据库'*/}
                {/*}]*/}
              {/*})(*/}
                {/*<Select>*/}
                  {/*{*/}
                    {/*(backupTables || []).map(v => {*/}
                      {/*return <Option key={v}>{v}</Option>*/}
                    {/*})*/}
                  {/*}*/}
                {/*</Select>*/}
              {/*)}*/}
            {/*</FormItem>*/}
            <FormItem className="mgp-8" label="备注：">
              <div className="tool-tip remarks">
                <Icon type="bulb"/>
                <span>提示：备注内容长度须大于10个字符，小于255个字符。</span>
              </div>
              { getFieldDecorator('remarks', {
                initialValue : remarks,
                onChange: handleRemarks,
                rules : [{
                  required : true,
                  message : '请填写备注'
                }]
              })(
                <TextArea rows={4} maxLength={255} minLength={10}/>
              )}
            </FormItem>
          </div>
          <div className="text-error result mgt-16" style={{display: checkResult ? '' : 'none'}}>
            { checkResultInfo }
          </div>
          <Button className="mgt-16 mgb-16" onClick={checkSql} loading={checkButtonLoading}>
            检查
          </Button>
          {/*<FormItem className="button-margin">*/}
            {/*<Checkbox onChange={handelJumpCheck} checked={jumpCheck}>跳过检查</Checkbox>*/}
          {/*</FormItem>*/}
          {/*<FormItem className="button-margin">*/}
            {/*<Checkbox onChange={handleJump.bind(this, '备份', 'handleJumpBackup')} checked={jumpBackup}>跳过备份</Checkbox>*/}
          {/*</FormItem>*/}
          <Col>
            <Button onClick={this.props.prev} disabled={sqlID}>
              上一步
            </Button>
            <Button className="mgl-8" onClick={next} disabled={disablePublish}>
              下一步
            </Button>
          </Col>
        </Form>
      </div>
    )
  }
}

CheckSql.propTypes = {
  create: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=>{
  return {
    create: state[modelKey],
  }
})(Form.create()(CheckSql))
