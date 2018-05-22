/**
 * Created by zhangmm on 2017/10/30.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './database.less'
import { DataTable, Filter , IconFont } from 'components'
import { Link } from 'dva/router'
import { Row , Col , Modal } from 'antd'
import LoginModal from './loginModal.js'
const confirm = Modal.confirm

class Database extends Base{
  constructor(props){
    super(props)

    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '数据库管理', selectedKey: '数据库管理database'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
    this.push({
      type: 'database/resetFilter',
      fire: [Base.WillUnmount]
    })
    this.pageBtns = {
      element: ()=>{
        const id = 17185
        return (<Row>
          <Col className="pageBtn">
            <a href="javascript:void(0);" className="text-info" onClick={this.handleLoginInstance}>
              <IconFont type="plus"/>登录实例
            </a>
          </Col>
          <Col className="pageBtn">
            <Link className="text-info" to={`/databases/${id}/add`}>
              <IconFont type="plus"/>新增数据库
            </Link>
          </Col>
          <Col className="pageBtn"  onClick={this.handleDatabaseReload}>
            <a href="javascript:void(0);">
              <IconFont type="reload"/>刷新
            </a>
          </Col>
        </Row>)
      }
    }
    this.state = {
      title:'登录实例 - 选择登录节点',
      visible:false,
    }
    this.handleDatabaseReload = this.handleDatabaseReload.bind(this)
    this.handleDatabaseDelete = this.handleDatabaseDelete.bind(this)
    this.handleModalOk = this.handleModalOk.bind(this)
    this.handleModalCancel = this.handleModalCancel.bind(this)
    this.handleLoginInstance = this.handleLoginInstance.bind(this)
    this.changeClickNode = this.changeClickNode.bind(this)
  }

  componentWillMount(){
    const id = 17185
    this.props.dispatch({
      type:"database/getNodes",
      payload:{id:id}
    })
  }

  handleLoginInstance(){
    this.setState({
      visible:true
    })
  }

  handleDatabaseReload(){
    this.props.dispatch({
      type : `database/handleReload`
    })
  }

  handleDatabaseDelete(text){
    const id = 17185//todo
    confirm({
      title: '提示',
      content: `确认要删除${text.db_name}数据库`,
      onOk:() => {
        this.props.dispatch({
          type:"database/deleteDatabase",
          payload:{
            id:id,
            uid:text.id
          }
        })
      },
      onCancel:() => {
        console.log('Cancel')
      },
    })
  }

  handleModalOk(){
    const id = 17185
    const node = this.props.database.chooseLogin
    this.props.dispatch({
      type:"database/getUrl",
      payload:{
        id:id,
        node:node
      }
    })
    this.setState({
      visible:false
    })
  }

  handleModalCancel(){
    this.setState({
      visible:false
    })
  }

  changeClickNode(value){
    this.props.dispatch({
      type:"database/handleChooseLogin",
      payload:{chooseLogin:value}
    })
  }

  render(){
    const { location, dispatch, database } = this.props
    const { nodes, chooseLogin, keyword, placeholder, reload } = database

    const searchProps = [{
      keyword,
      placeholder,
      onSearch(value) {
        dispatch({
          type: `database/handleFilter`,
          payload: {
            keyword:value
          },
        })
      },
    }]

    const filterProps = {
      searchProps
    }

    const tableProps = {
      fetch:{
        url:`/instances/17185/databases`,
        data:{
          name:keyword
        }
      },
      rowKey: 'id',
      columns:[{
        title: '数据库名',
        dataIndex: 'db_name'
      }, {
        title: '字符集',
        dataIndex: 'charset',
        render:(text) =>{
          return<span>{!text ? "无" : text }</span>
        }

      }, {
        title: '绑定账号',
        dataIndex: 'accounts',
        render: (text) => {
          return <span>{text.join(',')}</span>;
        }
      }, {
        title: '备注',
        dataIndex: 'remark',
        render:(text) =>{
          return<span>{!text ? "无" : text }</span>
        }
      }, {
        title: '操作',
        render : (text) => {
          return (
            <span>
              <a href="javascript:void(0);"  onClick={() => this.handleDatabaseDelete(text)}>删除</a>
            </span>
          )
        }
      }],
      reload:reload
    }

    const modalProps  = {
      title:this.state.title,
      visible:this.state.visible,
      onOk:this.handleModalOk,
      onCancel:this.handleModalCancel,
      nodes:nodes,
      chooseLogin:chooseLogin,
      changeClickNode:this.changeClickNode
    }

    return(
      <Row className={styles.database}>
        <Row className="inner-cont">
          <Row className="mgrb">
            <Filter {...filterProps} />
          </Row>
          <DataTable {...tableProps} />
        </Row>
        <LoginModal {...modalProps}/>
      </Row>
    )
  }
}

Database.propTypes = {
  database: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    database: state['database'],
    loading: state.loading.effects
  }
}

export default connect(mapStateToProps)(Database)
