/**
 * Created by lulu on 2018/4/18.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './logBackup.less'
import { DataTable, Filter , IconFont } from 'components'
import { Link } from 'dva/router'
import { Row , Col , Modal } from 'antd'
import { disabledDate } from 'util'
class LogBackup extends Base{
  constructor(props) {
    super(props)
    this.push({
      type: 'logBackup/resetFilter',
      fire: [Base.WillUnmount]
    })
    this.pageBtns = {
      element: ()=>{
        return (
          <Row>
            <Col className="pageBtn">
              <Link to="/nodes/history" className="text-info">
                <IconFont type="iconfont-lishijilu"/>历史备份列表
              </Link>
            </Col>
            <Col className="pageBtn"  >
              <a href="javascript:void(0);">
                <IconFont type="setting"/>批量配置
              </a>
            </Col>
            <Col className="pageBtn" onClick={this.handleBackupReload}>
              <a href="javascript:void(0);">
                <IconFont type="reload"/>刷新
              </a>
            </Col>
          </Row>
        )
      }
    }
    this.handleBackupReload = this.handleBackupReload.bind(this);
  }
  handleBackupReload() {
    this.props.dispatch({
      type:'logBackup/handleKeyword',
      payload:{
        keyword: this._keyword
      }
    })
    this.props.dispatch({
      type : 'logBackup/handleReload'
    })
  }
  render(){
    const { location,logBackup,dispatch } = this.props;
    const { placeholder, keyword, reload, pickerDefaultValue, instances, node } = logBackup;
    const searchProps = [{
      keyword,
      placeholder,
      onSearch(value) {
        dispatch({
          type: 'logBackup/handleFilter',
          payload: {
            keyword:value
          },
        })
      },
      onChange :(e) =>{
        this._keyword = e.target.value
      }
    }]
    const rangePickerProps = [
      {
        label: '备份时间',
        props: {
          allowClear: true,
          defaultValue: pickerDefaultValue,
          // format: "YYYY-MM-DD",
          disabledDate: disabledDate,
          onChange(value, dataString) {
            dispatch({
              type: `logBackup/handlePublishRange`,  // 接口参数
              payload: dataString
            })
            dispatch({
              type: `logBackup/handlePickerDefaultValue`,  // picker的defaultValue，便于跳转别的页面然后从别的页面返回本页时保留筛选条件
              payload: value
            })
            dispatch ({
              type: `logBackup/setCurrentPage`,
              payload: 1
            })
          }
        }
      }
    ]

    let selectOptions = {'全部': ''}
    Object.keys(instances).forEach(v => {
      selectOptions[instances[v]] = v
    })
    const selectProps = [{
      label: '备份进度',
      options: selectOptions,
      props: {
        defaultValue: node,
        onChange: (value) => {
          dispatch({
            type: `logBackup/handleNode`,
            payload: value
          })
          dispatch ({  // page不重置为1，datatable会依次请求上一页，不断发请求
            type: `logBackup/setCurrentPage`,
            payload: 1
          })
        }
      }
    }]
    const filterProps = {
      searchProps,
      rangePickerProps,
      selectProps
    }
    const tableProps = {
      //fetch 获取数据
      fetch:{
        url:'/logs',
        data:{
          name:keyword,
          type:1
        }
      },
      rowKey: 'id',
      columns:[{
        title: '用户名',
        dataIndex: 'user_name',
        key: 'user_name',
        sorter:true,
        className: 'min-w-100',
        render:(text) =>{
          return<span>{!text ? "无" : text }</span>
        }
      },
        {
          title: 'IP',
          dataIndex: 'ip',
          key: 'ip',
          className: 'min-w-100',
          render:(text) =>{
            return<span>{!text ? "无" : text }</span>
          }
        },
        {
          title: '日志',
          dataIndex: 'note',
          key: 'note',
          className: 'max-w-280',
          render:(text) =>{
            return<span>{!text ? "无" : text }</span>
          }
        },
        {
          title: '平台',
          dataIndex: 'type',
          key: 'type',
          className: 'min-w-100',
          render:(text) =>{
            return<span>{!text ? "无" : text }</span>
          }
        },
        {
          title: '操作时间',
          dataIndex: 'created_at',
          key: 'created_at',
          sorter:true,
          className: 'min-w-180',
          render:(text) =>{
            return<span>{!text ? "无" : text }</span>
          }
        }],
      reload:reload,
    }
    return(
      <Row className={styles.backup}>
        <Row className="inner-cont">
          <Row className="mgrb">
            <Filter {...filterProps} />
          </Row>
          <DataTable  {...tableProps}/>
        </Row>
      </Row>
    )
  }
}

LogBackup.propTypes = {
  logBackup: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}
function mapStateToProps(state){
  return {
    logBackup: state['logBackup'],
    loading: state.loading.effects
  }
}
export default connect(mapStateToProps)(LogBackup)

