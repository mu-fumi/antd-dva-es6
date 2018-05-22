/**
 * Created by liuting on 2017/9/2.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './logs.less'
import { DataTable, Filter , IconFont } from 'components'
import { Link } from 'dva/router'
import { Row , Col , Modal } from 'antd'
class Logs extends Base{
  constructor(props){
    super(props)
    this.push({
      type: 'logs/resetFilter',
      fire: [Base.WillUnmount]
    })
    this.pageBtns = {
      element: ()=>{
        return (
          <Row>
            <Col className="pageBtn" onClick={this.handlelogsReload}>
              <a href="javascript:void(0);">
                <IconFont type="reload"/>刷新
              </a>
            </Col>
          </Row>
        )
      }
    }
    this.handlelogsReload = this.handlelogsReload.bind(this);
  }
  handlelogsReload(){
    this.props.dispatch({
      type:'logs/handleKeyword',
      payload:{
        keyword: this._keyword
      }
    })
    this.props.dispatch({
      type : 'logs/handleReload'
    })
  }

  render(){
    const { location, dispatch, logs } = this.props;
    const { keyword, placeholder, reload } = logs;
    const searchProps = [{
      keyword,
      placeholder,
      onSearch(value) {
        dispatch({
          type: 'logs/handleFilter',
          payload: {
            keyword:value
          },
        })
      },
      onChange :(e) =>{
        this._keyword = e.target.value
      }
    }]
    const filterProps = {
      searchProps
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
      <Row className={styles.logs}>
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

Logs.propTypes = {
  logs: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}
function mapStateToProps(state) {
  return {
    logs: state['logs'],
    loading: state.loading.effects
  }
}

export default connect(mapStateToProps)(Logs)
