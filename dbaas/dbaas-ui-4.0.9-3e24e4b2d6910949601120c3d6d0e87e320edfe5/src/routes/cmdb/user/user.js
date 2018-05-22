/**
 * Created by zhangmm on 2017/8/19.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './user.less'
import { DataTable, Filter , IconFont } from 'components'
import { Link , browserHistory } from 'dva/router'
import { Row , Col , Modal } from 'antd'
const confirm = Modal.confirm

class User extends Base{
  constructor(props){
    super(props)

    this.state = {//用于检验搜索输入
      validate: false
    }

    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '用户管理', selectedKey: '用户管理user'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
    this.push({
      type: 'user/resetFilter',
      fire: [Base.WillUnmount]
    })
    this.handleUserDelete = this.handleUserDelete.bind(this)
    this.handleUserReload = this.handleUserReload.bind(this)
    this.pageBtns = {
      element: ()=>{
        return (<Row>
          <Col className="pageBtn">
            <Link to="/cmdb/user/add" className="text-info">
              <IconFont type="plus"/>新增用户
            </Link>
          </Col>
          <Col className="pageBtn" onClick={this.handleUserReload}>
            <a href="javascript:void(0);">
              <IconFont type="reload"/>刷新
            </a>
          </Col>
        </Row>)
      }
    }
  }

  handleUserDelete(value){
    confirm({
      title : <span className="wrap-break">确定要删除 <span className="text-bold-italic">{value.user_name}</span> 用户吗？</span>,
      content : <span className="wrap-break">删除用户会删除该用户下的所有内容</span>,
      onOk : () => {
        this.props.dispatch({
          type : `user/deleteUser`,
          payload : {
            id : value.id
          }
        })
      }
    })
  }

  handleUserReload(){
    if (this.refs.inputSearch && this.refs.inputSearch.length >= 36) { //校验是否大于36个字符
      return
    }
    this.props.dispatch({
      type:'user/handleKeyword',
      payload:{keyword:this.refs.inputSearch}
    })
    this.props.dispatch({
      type : `user/handleReload`
    })
  }

  render(){
    const { location, dispatch, user } = this.props
    const { keyword, placeholder, reload } = user

    const searchProps = [{
      keyword,
      placeholder,
      onSearch(value) {
        if (value.length >= 36) {  //校验是否大于36个字符
          return
        }
        dispatch({
          type: `user/handleFilter`,
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
      searchProps
    }

    const tableProps = {
      fetch:{
        url:'/users',
        data:{
          name:keyword
        }
      },
      rowKey: 'id',
      columns:[{
        title: '用户名',
        dataIndex: 'user_name',
        key: 'user_name',
        className: 'min-w-200',
      },
      {
        title: '昵称',
        dataIndex: 'nick_name',
        key: 'nick_name',
        className: 'min-w-200',
        render:(text) =>{
          return<span>{!text ? "无" : text }</span>
        }
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
        className: 'min-w-200',
        render:(text) =>{
          return<span>{!text ? "无" : text }</span>
        }
      },
      {
        title: '角色',
        dataIndex: 'role_name',
        key: 'role_name',
        className: 'min-w-200',
        render:(text) =>{
          return<span>{!text ? "无" : text }</span>
        }
      },
      {
        title: '状态',
        dataIndex: 'active',
        key: 'active',
        className: 'min-w-50',
        render: (text) =>{
          let className = text === 1 ? 'text-success' : 'text-error'
          text = text === 1 ? '正常' : '禁用'
          return (<span className={className}>{text}</span>)
        }
      },
      {
        title: '操作',
        className: 'min-w-100',
        render : (text) => {
          return (
            <span>
          <span>
            <Link to={`/cmdb/user/edit/${text.id}`}>编辑</Link>
          </span>
            <span className="ant-divider"/>
          <span>
            <a href="javascript:void(0);" onClick={() => this.handleUserDelete(text)}>删除</a>
          </span>
        </span>
          )
        }
      }],
      reload:reload
    }

    return(
      <Row className={styles.user}>
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

User.propTypes = {
  user: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    user: state['user'],
    loading: state.loading.effects
  }
}

export default connect(mapStateToProps)(User)
