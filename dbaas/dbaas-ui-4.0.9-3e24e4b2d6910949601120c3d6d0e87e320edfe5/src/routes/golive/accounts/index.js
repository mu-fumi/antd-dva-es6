/**
 * Created by lizzy on 2018/4/19.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './index.less'
import { DataTable, Filter , IconFont, ProgressIcon, StateIcon } from 'components'
import { Link, routerRedux } from 'dva/router'
import { Row , Col , Modal, Icon, Tooltip, Table, Badge, Select } from 'antd'
import { classnames, TimeFilter, constant } from 'utils'
import ListStatusBadge from './ListStatusBadge'

const { ACCOUNT_MANAGEMENT, ACCOUNT_MANAGEMENT_ICON, ACCOUNT_STATUS } = constant
const modelKey = 'accounts'
const Option = Select.Option

class Accounts extends Base{
  constructor(props){
    super(props)

    this.push({
      type : 'app/handleCurrentMenu',
      payload : {activeName : '账号权限管理',selectedKey : '账号权限account'},
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount],
    })
    this.push({
      type : 'accounts/resetFilter',
      fire : [Base.WillUnmount]
    })
    // const btns = (
    //   Object.keys(ACCOUNT_MANAGEMENT).map(v => {
    //     return <Col key={v} className="pageBtn" onClick={() => this.handleManageType(v)}>
    //       <Link to="/accounts/manage" className="text-info">
    //         <IconFont type={ACCOUNT_MANAGEMENT_ICON[v]}/>{ACCOUNT_MANAGEMENT[v]}
    //       </Link>
    //     </Col>
    //   })
    // )

    this.pageBtns = {
      element: () => {
        return <Row>
          {/*{ btns }*/}
          <Col className="pageBtn">
            <Select className={styles['top-select']}
                    placeholder="选择操作类型"
                    onChange={this.handleManageType}
                    notFoundContent='暂无数据'>
              {
                ACCOUNT_MANAGEMENT && Object.keys(ACCOUNT_MANAGEMENT).map(v => {
                  return <Option key={v} value={v}>
                    {ACCOUNT_MANAGEMENT[v]}
                  </Option>
                })
              }
            </Select>
          </Col>
          <Col className="pageBtn" onClick={this.handleReload}>
            <a href="javascript:;">
              <IconFont type="reload"/>刷新
            </a>
          </Col>
        </Row>
      }
    }

  }

  handleManageType = (type) => {
    this.props.dispatch({
      type : `${modelKey}/handleManageType`,
      payload : type
    })
    // this.props.dispatch({
    //   type : `${modelKey}/handleCurrentStep`,
    //   payload : 0
    // })
    this.props.dispatch(
      routerRedux.push('/accounts/manage')
    )
  }

  handleReload = () => {  // onchange时的值存起来，刷新时读取
    if(this._keywords === null || this._keywords === undefined){
      this._keywords = ''
    }
    // if (this._keywords.length < 2 && this._keywords.length > 0) {  //  一个字符时不进行搜索
    //   return
    // }
    // this.props.dispatch({
    //   type : `${modelKey}/handleKeywords`,
    //   payload : this._keywords
    // })
    this.props.dispatch({
      type : `${modelKey}/handleReload`
    })
  }

  render() {

    const { accounts, dispatch } = this.props
    const { filter, reload, businessOptions, stackOptions, } = accounts

    const handleCasChange = (data) => {
      // this.clearQuery()
      // console.log('data===>', data)
      const key = ['business_id', 'app_id', 'relate_id-relate_type',]
      let params = {
        business_id: '',
        app_id: '',
        'relate_id-relate_type': '',
      }
      data.forEach((v, i) => {
        params[key[i]] = v
      })
      let relate_id = '', relate_type = ''
      if (params['relate_id-relate_type'] !== '') {
        relate_id = params['relate_id-relate_type'].split('-')[0]
        relate_type = params['relate_id-relate_type'].split('-')[1]
      }
      delete params['relate_id-relate_type']
      params.application_id = params.app_id
      delete params.app_id
      this.props.dispatch({
        type: `${modelKey}/handleFilter`,
        payload: {
          ...params,
          relate_id,
          relate_type,
        }
      })
    }

    const searchProps = [{
      placeholder : '关键字搜索',
      onSearch : (value) => {
        dispatch({
          type : `${modelKey}/handleFilter`,
          payload : { keywords : value}
        })
      },
      onChange : (e) => {
        this._keywords = e.target.value
      }
    }]

    const cascaderProps = [{
      label: '所属',
      props: {
        onChange: handleCasChange,
        length: 3,
        options: businessOptions
      },
    }]

    const selectProps = [
      {
        label: '所属套件',
        options: {'全部': '', ...stackOptions},
        props: {
          // defaultValue: user_id,
          onChange(value) {
            dispatch({
              type: `${modelKey}/handleFilter`,
              payload: {stack_id: value},
            })
            dispatch ({
              type: `${modelKey}/setCurrentPage`,
              payload: 1
            })
          }
        }
      }, {
        label: '状态',
        options: {'全部': '', ...ACCOUNT_STATUS},
        props: {
        // defaultValue: status,
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
      }
    ]

    const filterProps = {
      searchProps,
      selectProps,
      cascaderProps
    }

    const dataTableProps = {
      fetch : {
        url : '/db-account/history',
        data : filter
      },
      reload : reload,
      columns: [{
        title: '名称',
        dataIndex: 'database.name',
      },{
        title: '所属',
        dataIndex: 'database.belong',
      },{
        title: '套件',
        dataIndex: 'database.stack_name',
      },{
        title: '操作',
        dataIndex: 'action_type',
        render : (text) => {
          return ACCOUNT_MANAGEMENT[text]
        }
      },{
        title: '端口',
        dataIndex: 'port',
        width : 220
      },{
        title: '状态',
        dataIndex: 'status',
        render : (text, record) => {
          return <ListStatusBadge {...{type: text}}/>
        }
      },{
        title: '操作人',
        dataIndex: 'database.user_name',
      },{
        title: '操作时间',
        dataIndex: 'created_at',
        width : 220
    }],
      rowKey : 'id'
    }

    return (
      <Row className={styles["accounts"]}>
        <Row className="mgb-8">
          <Filter {...filterProps}/>
        </Row>
        <DataTable {...dataTableProps} />
      </Row>
    )
  }
}

function mapStateToProps(state) {
  return {
    accounts: state['accounts'],
    loading: state.loading.effects
  }
}

Accounts.propTypes = {
  configs: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect(mapStateToProps)(Accounts)
