/**
 * Created by zhangmm on 2017/8/19.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './app.less'
import { DataTable, Filter , IconFont } from 'components'
import { Link , routerRedux } from 'dva/router'
import { Row , Col , Modal, Tooltip } from 'antd'
const confirm = Modal.confirm

class App extends Base{
  constructor(props){
    super(props)

    this.state = {//用于检验搜索输入
      validate: false
    }

    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '应用管理', selectedKey: '应用管理application'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
    this.push({
      type: 'application/resetFilter',
      fire: [Base.WillUnmount]
    })
    this.pageBtns = {
      element: ()=>{
        return (<Row>
          <Col className="pageBtn">
            <Link to="/cmdb/app/add" className="text-info">
              <IconFont type="plus"/>新增应用
            </Link>
          </Col>
          <Col className="pageBtn" onClick={this.handleAppReload}>
            <a href="javascript:void(0);">
              <IconFont type="reload"/>刷新
            </a>
          </Col>
        </Row>)
      }
    }
    this.handleAppReload = this.handleAppReload.bind(this)
    this.handleAppQuery = this.handleAppQuery.bind(this)
  }

  handleAppReload(){
    if (this.refs.inputSearch && this.refs.inputSearch.length >= 36) { //校验是否大于36个字符
      return
    }
    this.props.dispatch({
      type:'application/handleKeyword',
      payload:{name:this.refs.inputSearch}
    })
    this.props.dispatch({
      type : `application/handleReload`
    })
  }

  handleAppQuery() {
    const {location} = this.props
    const { query, pathname } = location
    routerRedux.replace(pathname)
  }

  render(){
    const { dispatch, app } = this.props
    const { placeholder, reload, filter } = app
    const {keyword} = filter

    const searchProps = [{
      keyword,
      placeholder,
      onSearch :(value) => {
        if (value.length >= 36) {  //校验是否大于36个字符
          return
        }
        this.handleAppQuery()
        dispatch({
          type: `application/handleKeyword`,
          payload: {
            name:value
          },
        })
      },
      onChange :(e) =>{
        this.refs = {"inputSearch":e.target.value}
        if (e.target.value.length >= 36) {  //校验是否大于36个字符
          this.setState({
            validate: '请输入不多于36个字符！'
          })
          return
        }
        this.setState({//清空之前的validate
          validate: false
        })
      },
      validate: this.state.validate
    }]

    const filterProps = {
      searchProps
    }

    const tableProps = {
      fetch:{
        url:'/applications',
        data:filter
      },
      rowKey: 'id',
      columns:[{
        title: '应用名',
        dataIndex: 'name',
        key: 'name',
        sorter:true,
        width:100,
        render:(text,record) =>{
          return (
            <Link to={`/cmdb/app/${record.id}/detail`}>{text}</Link>
          )
        }
      },
      {
        title: '负责人',
        dataIndex: 'user_name',
        key: 'user_name',
        width:100,
        render:(text) =>{
          return<span>{!text ? "无" : text }</span>
        }
      },
      {
        title: '所属业务',
        dataIndex: 'business_name',
        key: 'business_name',
        width:100,
        render:(text,record) =>{
          return<Link target="_blank" to={`/cmdb/business/${record.business_id}/detail`}>{text}</Link>
        }
      },
      {
        title: '集群/实例组/实例',
        dataIndex: 'resource',
        key: 'resource',
        width:150,
        render:(text,record) =>{
          return(<span>
            <Tooltip title='集群数'>
              {
                text['cluster'] === 0 ?
                  <span>{text['cluster']}</span>
                  :
                  <Link target='_blank' to={`/cmdb/cluster?app_id=${record.id}&business_id=${record.business_id}`}>
                    {text['cluster']}
                    </Link>
              }
            </Tooltip>
            <span> / </span>
            <Tooltip title='实例组数'>
              {
                text['set'] === 0 ?
                  <span>{text['set']}</span>
                  :
                  <Link target='_blank' to={`/cmdb/instance-group?app_id=${record.id}&business_id=${record.business_id}`}>
                    {text['set']}
                    </Link>
              }
            </Tooltip>
            <span> / </span>
            <Tooltip title='实例数'>
              {
                text['instance'] === 0 ?
                  <span>{text['instance']}</span>
                  :
                  <Link target='_blank' to={`/cmdb/instance?app_id=${record.id}&business_id=${record.business_id}`}>
                    {text['instance']}
                    </Link>
              }
            </Tooltip>
          </span>)
        }
      },
      {
        title: '备注',
        dataIndex: 'desc',
        key: 'desc',
        sorter:true,
        width:200,
        render:(text) =>{
          return<span>{!text ? "无" : text }</span>
        }
      },
      {
        title: '最后更新时间',
        dataIndex: 'updated_at',
        key: 'updated_at',
        sorter:true,
        width:150,
        render:(text) =>{
          return<span>{!text ? "无" : text }</span>
        }
      }],
      reload:reload,
    }

    return(
      <Row className={styles.app}>
        <Row className="inner-cont">
          <Row className="mgrb">
            <Filter {...filterProps} />
          </Row>
          <DataTable {...tableProps} />
        </Row>
      </Row>
    )
  }
}

App.propTypes = {
  app: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    app: state['application'],
    loading: state.loading.effects
  }
}

export default connect(mapStateToProps)(App)
