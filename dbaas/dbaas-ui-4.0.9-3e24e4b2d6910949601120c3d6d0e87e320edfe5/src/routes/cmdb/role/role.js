/**
 * Created by zhangmm on 2017/8/19.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './role.less'
import { DataTable, Filter , IconFont } from 'components'
import { Link } from 'dva/router'
import { Row , Col , Modal, Tag, Icon } from 'antd'
const confirm = Modal.confirm

class Role extends Base{
  constructor(props){
    super(props)

    this.state = {//用于检验搜索输入
      validate: false,
      icon:''
    }

    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '角色管理', selectedKey: '角色管理role'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
    this.push({
      type: 'role/resetFilter',
      fire: [Base.WillUnmount]
    })
    this.pageBtns = {
      element: ()=>{
        return (<Row>
          <Col className="pageBtn">
            <Link to="/cmdb/role/add" className="text-info">
              <IconFont type="plus"/>新增角色
            </Link>
          </Col>
          <Col className="pageBtn" onClick={this.handleRoleReload}>
            <a href="javascript:void(0);">
              <IconFont type="reload"/>刷新
            </a>
          </Col>
        </Row>)
      }
    }
    this.handleRoleDelete = this.handleRoleDelete.bind(this)
    this.handleRoleReload = this.handleRoleReload.bind(this)
    this.handleIconStyle = this.handleIconStyle.bind(this)
  }

  handleRoleDelete(value){
    confirm({
      title : <span className="wrap-break">确定要删除 <span className="text-bold-italic">{value.name}</span> 角色吗？</span>,
      content : <span className="wrap-break">删除角色会删除该角色下的所有内容</span>,
      onOk : () => {
        this.props.dispatch({
          type : `role/deleteRole`,
          payload : {
            id : value.id
          }
        })
      }
    })
  }

  handleRoleReload(){
    if (this.refs.inputSearch && this.refs.inputSearch.length >= 36) { //校验是否大于36个字符
      return
    }
    this.props.dispatch({
      type:'role/handleKeyword',
      payload:{keyword:this.refs.inputSearch}
    })
    this.props.dispatch({
      type : `role/handleReload`
    })
  }

  handleIconStyle(id){
    let iconId = this.state.icon === id ? '' : id
    this.setState({
      icon:iconId
    })
  }

  render(){
    const { location, dispatch, role } = this.props
    const { keyword, placeholder, reload } = role

    const searchProps = [{
      keyword,
      placeholder,
      onSearch(value) {
        if (value.length >= 36) {  //校验是否大于36个字符
          return
        }
        dispatch({
          type: `role/handleFilter`,
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

    const PermissionsIcon = (text,record) =>{
      let classname = "tag-hidden"
      let iconType = "plus-square-o"
      if(record.id === this.state.icon){
        classname = "tag-show"
        iconType = "minus-square-o"
      }
      return(
        <Row className='icon-hover'>
          {
            text.length > 4 ?
              <Col span={2}>
                <Icon type={iconType} className="icon-display"
                      onClick={() =>this.handleIconStyle(record.id)}/>
              </Col>
              :
              <Col span={2}>
              </Col>
          }
          <Col span={22} className={classname}>
            {
              text.map((item, key) => {
                let icon_content = item.level === 1 ?
                  <IconFont type="iconfont-gaoji" className="icon"/> : ''
                return(
                  <Tag className="tag" key={item.id}>
                    {icon_content}{item.display_name}
                  </Tag>
                )
              })
            }
          </Col>
        </Row>
      )
    }

    const permissionTitle = <span className="per-title">权限</span>

    const tableProps = {
      fetch:{
        url:'/roles',
        data:{
          name:keyword
        }
      },
      rowKey: 'id',
      columns:[{
        title: '角色名',
        dataIndex: 'name',
        key: 'name',
        className: 'min-w-200',
      },
      {
        title: '备注',
        dataIndex: 'description',
        key: 'description',
        className: 'min-w-200',
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
        title: '修改时间',
        dataIndex: 'updated_at',
        key: 'updated_at',
        className: 'min-w-200',
        sorter:true,
        render:(text) =>{
          return<span>{!text ? "无" : text }</span>
        }
      },
      {
        title: permissionTitle,
        dataIndex: 'permissions',
        key: 'permissions',
        width:'600px',
        //className:'tag-hidden',
        render : (text,record) => {
          return PermissionsIcon(text,record)
        }
      },
      {
        title: '操作',
        className: 'min-w-200',
        render : (text) => {
          return (
            <span>
            <span>
              <Link to={`/cmdb/role/edit/${text.id}`}>编辑</Link>
            </span>
              {
                text.name === '超级管理员' ? '' : (
                <span>
                  <span className="ant-divider"/>
                  <span>
                  <a href="javascript:void(0);" onClick={() => this.handleRoleDelete(text)}>删除</a>
                  </span>
                </span>
                )
              }
          </span>
          )
        }
      }],
      reload:reload
    }

    return(
      <Row className={styles.role}>
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

Role.propTypes = {
  role: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    role: state['role'],
    loading: state.loading.effects
  }
}

export default connect(mapStateToProps)(Role)
