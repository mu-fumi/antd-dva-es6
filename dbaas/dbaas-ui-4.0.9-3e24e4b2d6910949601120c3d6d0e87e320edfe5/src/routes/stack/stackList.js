/**
 * Created by wengyian on 2017/7/5.
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
import { CLUSTER_STATUS, CLUSTER_STATUS_ICON } from 'utils/constant'
import * as moment from 'moment'
import ServiceModal from './serviceModal'

import styles from './stack.less'

const modelKey = 'stack/stackList'

import queryString from 'query-string'

class StackList extends Base{

  constructor(props){
    super(props)

    this.pageBtns = {
      element : () => {
        return <Row>
          {/***************20171218 注释掉组件管理里面的编辑 **********************/}
          {/********* 暂时不需要了 留着以防万一 *********/}
          {/*<Col className="pageBtn">*/}
            {/*<Link to="/cmdb/component/addStack" className="text-info">*/}
              {/*<IconFont type="plus"/>新建*/}
            {/*</Link>*/}
          {/*</Col>*/}
          <Col className="pageBtn" onClick={this.handleStackReload}>
            <a href="javascript:;">
              <IconFont type="reload"/>刷新
            </a>
          </Col>
        </Row>
      }
    }

    this.setGobackBtn()
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {activeName : '套件列表', selectedKey : '组件管理component'},
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })

    this.showService = this.showService.bind(this)
    this.deleteStack = this.deleteStack.bind(this)
    this.handleStackReload = this.handleStackReload.bind(this)
    this.clearQuery = this.clearQuery.bind(this)
  }

  handleStackReload(){
    if(this._keywords === undefined || this._keywords === null){
      this._keywords = ''
    }
    this.clearQuery()
    this.props.dispatch({
      type : `${modelKey}/handleFilter`,
      payload : {keyword : this._keywords}
    })
    this.props.dispatch({
      type : `${modelKey}/handleStackReload`
    })
  }

  showService(record){
    const { dispatch } =  this.props
    dispatch({
      type : `${modelKey}/showServiceModal`
    })
    dispatch({
      type : `${modelKey}/setStackInfo`,
      payload : {
        id : record.id,
        name : record.name
      }
    })
  }

  deleteStack(record){
    const { dispatch } = this.props
    Modal.confirm({
      title : '提示',
      content : '确定要删除套件吗？',
      onOk : () => {
        dispatch({
          type : `${modelKey}/deleteStack`,
          payload : record.id
        })
      },
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
    const { dispatch, stackList } = this.props

    const { filter, stackReload, serviceVisible, stackInfo, stackTags } = stackList

    const placeholder = '根据名称和描述搜索'

    const _this = this

    const searchProps = [{
      placeholder,
      onSearch : (value) => {
        _this.clearQuery()
        dispatch({
          type : `${modelKey}/handleFilter`,
          payload : {keyword : value}
        })
      },
      onChange : (e) => {
        this._keywords = e.target.value
      }
    }]

    let tagsOptions = {'全部' : ''}
    stackTags.forEach((val, i) => {
      tagsOptions[val] = val
    })

    const selectProps = [{
      label : '套件类型',
      options: tagsOptions,
      props : {
        onChange : (value) => {
          _this.clearQuery()
          dispatch({
            type : `${modelKey}/handleFilter`,
            payload: {tag : value}
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
    //       browserHistory.push('/components/addStack')
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
        url : '/stack/summary',
        data : filter,
      },
      reload : stackReload,
      columns : [
        {
          title : '名称',
          dataIndex : 'name',
        },{
          title : '版本',
          dataIndex : 'version',
        },{
          title : '标签',
          dataIndex : 'tag',
        },{
          title : '描述',
          dataIndex : 'description',
        },{
          title : '套件操作',
          render : (text, record) => {
            return (
              <span>
              <a href="javascript:;" onClick={() => this.showService(record)}>查看服务</a>
                {/***************20171218 注释掉组件管理里面的编辑 **********************/}
                {/********* 暂时不需要了 留着以防万一 *********/}
              {/*<span className="ant-divider"></span>*/}
              {/*<Link to={`/cmdb/component/editStack/${record.id}`}>编辑套件</Link>*/}
              {/*<span className="ant-divider"></span>*/}
              {/*<a href="javascript:;" onClick={() => this.deleteStack(record)}>删除套件</a>*/}
            </span>
            )
          }
        },
      ],
      rowKey : 'id'
    }

    const serviceModalSettings = {
      visible : serviceVisible,
      stackInfo,
      deleteService : (id) => {
        dispatch({
          type : `${modelKey}/deleteService`,
          payload : id
        })
      },
      onCancel : () => {
        dispatch({
          type : `${modelKey}/hideServiceModal`
        })
      },
      footer : null
    }

    return (
      <Row className={styles["stackList"]}>
        <Row className={styles["filter-style"]}>
          <Filter {...filterProps} />
        </Row>
        <DataTable {...fetchDataTableProps} />
        <ServiceModal {...serviceModalSettings}/>
      </Row>
    )
  }
}

StackList.propTypes = {
  stackList : PropTypes.object,
  loading : PropTypes.bool,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=>{
  return {
    loading: state.loading.models[modelKey],
    stackList: state[modelKey],
  }
})(StackList)


