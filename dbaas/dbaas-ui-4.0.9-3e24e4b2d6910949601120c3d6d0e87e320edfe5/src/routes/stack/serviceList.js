/**
 * Created by wengyian on 2017/7/20.
 */

import Base from 'routes/base'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Card, Icon, message, Tag, Button, Modal } from 'antd'
import { DataTable, Layout, Search, Filter, IconFont } from 'components'
import { routerRedux, Link } from 'dva/router'
import { classnames } from 'utils'
import _ from 'lodash'
import { constant, TimeFilter } from 'utils'
import { SERVICE_TYPE } from 'utils/constant'

import queryString from 'query-string'

import styles from './service.less'

const modelKey = 'stack/serviceList'

class ServiceList extends Base{

  constructor(props){
    super(props)

    this.setGobackBtn()

    this.pageBtns = {
      element : () => {
        return <Row>
          {/***************20171218 注释掉组件管理里面的编辑 **********************/}
          {/********* 暂时不需要了 留着以防万一 *********/}
          {/*<Col className="pageBtn">*/}
            {/*<Link to="/cmdb/component/createService" className="text-info">*/}
              {/*<IconFont type="plus"/>新建*/}
            {/*</Link>*/}
          {/*</Col>*/}
          <Col className="pageBtn" onClick={this.handleReload}>
            <a href="javascript:;">
              <IconFont type="reload"/>刷新
            </a>
          </Col>
        </Row>
      }
    }
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {activeName : '服务列表', selectedKey : '组件管理component'},
      defer : true,
    })

    this.push({
      type : `${modelKey}/resetFilter`,
    })


    this.deleteService = this.deleteService.bind(this)
    this.handleReload = this.handleReload.bind(this)
    this.clearQuery = this.clearQuery.bind(this)
  }

  handleReload(){
    if(this._keywords === undefined || this._keywords === null){
      this._keywords = ''
    }
    this.clearQuery()
    this.props.dispatch({
      type : `${modelKey}/handleFilter`,
      payload : {keyword : this._keywords}
    })
    this.props.dispatch({
      type : `${modelKey}/handleReload`
    })
  }

  deleteService(record){
    const { dispatch } = this.props
    Modal.confirm({
      title : '提示',
      content : '确定要删除本服务吗？',
      onOk : () => {
        dispatch({
          type : `${modelKey}/deleteService`,
          payload : record.id
        })
      }
    })
  }

  /********  20171220 获取url 参数筛选*********/
  // 清空 filter 中url 带过来的参数
  clearQuery() {
    const {location} = this.props
    const {search, pathname} = location

    const query = queryString.parse(search)
    if (Object.keys(query).length) {
      this.props.dispatch(
        routerRedux.replace(pathname)
      )
      this.props.dispatch({
        type: `${modelKey}/clearQuery`,
        payload: query
      })
    }
  }

  render(){
    const { dispatch, serviceList } = this.props

    const { filter, reload, } = serviceList

    const _this = this

    const searchProps = [{
      placeholder : '名称或描述搜索',
      onSearch : (value) => {
        _this.clearQuery()
        dispatch({
          type : `${modelKey}/handleFilter`,
          payload : { keyword : value}
        })
      },
      onChange : (e) => {
        this._keywords = e.target.value
      }
    }]

    const selectOPtions = {...SERVICE_TYPE, "全部" : ''}

    const selectProps = [{
      label : '服务类型',
      options : selectOPtions,
      props : {
        onChange : (value) => {
          _this.clearQuery()
          dispatch({
            type : `${modelKey}/handleFilter`,
            payload : {type : value}
          })
        }
      }
    }]

    // const buttonProps = [{
    //   label : '新建',
    //   iconProps: {
    //     type: 'plus'
    //   },
    //   props:{
    //     type : 'primary',
    //     onClick : () => {
    //       browserHistory.push('/components/addService')
    //     }
    //   }
    // }]

    const filterProps = {
      searchProps,
      selectProps,
      // buttonProps
    }



    const fetchDataTableProps = {
      fetch : {
        url : '/service/list',
        data : filter
      },
      columns : [{
        title : '服务名',
        dataIndex : 'name',
        render : (text, record) => {
          return <Link to={`/cmdb/component/service-view/${record.id}`}>{text}</Link>
        }
      },{
        title : '版本',
        dataIndex : 'version'
      },{
        title : '类型',
        dataIndex : 'type',
        render : (text, record) => {
          return (
            <span>{text === 'Y' ? '监控存活' : '不监控存活'}</span>
          )
        }
      },{
        title : '描述',
        dataIndex : 'description'
      },
      /***************  20171218 组件管理的操作入口都不要了  ***************/
        // {
        // title : '操作',
        // render : (text, record) => {
        //   return (
        //     <span>
        //         <Link to={`/cmdb/component/editService/${record.id}`}>编辑</Link>
        //         <span className="ant-divider"></span>
        //         <a href="javascript:;" onClick={() => this.deleteService(record)}>删除</a>
        //       </span>
        //   )
        // }
      // }
      ],
      rowKey : 'id',
      reload : reload,
    }

    return (
      <Row className={styles["serviceList"]}>
        <Row className={styles["filter-style"]}>
          <Filter {...filterProps} />
        </Row>
        <DataTable {...fetchDataTableProps} />
      </Row>
    )
  }
}

ServiceList.propTypes = {
  serviceList : PropTypes.object,
  loading : PropTypes.bool,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state) => {
  return {
    loading : state.loading.models[modelKey],
    serviceList : state[modelKey]
  }
})(ServiceList)
