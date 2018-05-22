/**
 * Created by zhangmm on 2017/7/3.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './list.less'
import { DataTable, Filter , IconFont } from 'components'
import { Link } from 'dva/router'
import { Row , Col, Badge, Tooltip } from 'antd'
import { classnames, constant } from 'utils'

const { PACKAGE_STATUS } = constant

class List extends Base{

  constructor(props){
    super(props)

    this.state = {//用于检验搜索输入
      validate: false
    }

    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '程序包管理', selectedKey: '程序包管理packages'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
    this.push({
      type: 'package/list/resetFilter',
      fire: [Base.WillUnmount]
    })
    this.pageBtns = {
      element: ()=>{
        return (<Row>
          <Col className="pageBtn">
            <Link to="/packages/create" className="text-info">
              <IconFont type="plus"/>新增程序包
            </Link>
          </Col>
          <Col className="pageBtn" onClick={this.handlePackageReload}>
            <a href="javascript:void(0);">
              <IconFont type="reload"/>刷新
            </a>
          </Col>
        </Row>)
      }
    }
    this.handlePackageReload = this.handlePackageReload.bind(this)
  }

  handlePackageReload(){
    if (this.refs.inputSearch && this.refs.inputSearch.length >= 36) { //校验是否大于36个字符
      return
    }
    this.props.dispatch({
      type:'package/list/handleKeyword',
      payload:{keyword:this.refs.inputSearch}
    })
    this.props.dispatch({
      type : `package/list/handleReload`
    })
  }

  render(){
    const {loading, location, dispatch, list} = this.props
    const { keyword , placeholder, reload } = list

    const searchProps = [{
      keyword,
      placeholder,
      onSearch(value) {
        if (value.length >= 36) {  //校验是否大于36个字符
          return
        }
        dispatch({
          type: `package/list/handleFilter`,
          payload: {
            keyword:value
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
      searchProps,
     /* buttonProps,*/
    }

    const tableProps = {
      fetch:{
        url:'/packages',
        data:{
          package_name:keyword
        }
      },
      rowKey: 'id',
      columns:[{
        title: '程序包名',
        dataIndex: 'package_name',
        key: 'package_name',
        className: 'min-w-150',
        sorter:true,
        render:(text , record) => {
          return <Link to={`/packages/${record.id}`}>{text}</Link>
        }
      },
      {
        title: '最新版本',
        dataIndex: 'latest_version',
        key: 'latest_version',
        className: 'min-w-150',
        sorter:true,
/*        render:(text,record) => {
          return <Link to={`/packages/${record.id}/tree/${record.latest_version}`}>{text}</Link>
        }*/
        render:(text) =>{
          return<span>{!text ? "无" : text }</span>
        }
      },
/*      {
        title: '状态',
        dataIndex: 'package_status',
        key: 'package_status',
        className: 'text-center',
        filters: [
          {
            text: '无版本',
            value: '1'
          },
          {
            text: '正常',
            value: '2'
          },
          {
            text: '异常',
            value: '3'
          }
        ],
        render:(text,record) =>{
          let status = ''
          let prompt = ''
          switch (text){
            case PACKAGE_STATUS.NO_VERSION :
              status = 'default'
              prompt = '无版本'
              break
            case PACKAGE_STATUS.NORMAL :
              prompt = '正常'
              status = 'success'
              break
            case PACKAGE_STATUS.ERROR :
              prompt = record.package_info
              status = 'error'
              break
            default:
              prompt = '无提示状态'
              status = 'error'
              break
          }
          return <Tooltip title={prompt}>
              <span style={{cursor : 'pointer'}}>
                <Badge status={status}></Badge>
              </span>
          </Tooltip>
        }
      },*/
      {
        title: '创建者',
        dataIndex: 'user_name',
        key: 'user_name',
        sorter:true,
        className: 'min-w-150',
        render:(text) =>{
          return<span>{!text ? "无" : text }</span>
        }
      },
      {
        title: '备注',
        dataIndex: 'memo',
        key: 'memo',
        className: 'min-w-150',
        render:(text) =>{
          return<span>{!text ? "无" : text }</span>
        }
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
        className: 'min-w-200',
        sorter:true,
        render:(text) =>{
          return<span>{!text ? "无" : text }</span>
        }
      },
      {
        title: '最后更新',
        dataIndex: 'updated_at',
        key: 'updated_at',
        className: 'min-w-200',
        sorter:true,
        render:(text) =>{
          return<span>{!text ? "无" : text }</span>
        }
      }],
      reload:reload
    }

    return(
      <Row className={styles.list}>
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

List.propTypes = {
  list: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    list: state['package/list'],
    loading: state.loading.effects
  }
}

export default connect(mapStateToProps)(List)
