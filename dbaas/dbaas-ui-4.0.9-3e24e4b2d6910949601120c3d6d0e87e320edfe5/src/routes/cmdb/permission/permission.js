/**
 * Created by zhangmm on 2017/8/28.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './permission.less'
import { DataTable, Filter , IconFont } from 'components'
import { Row , Col } from 'antd'

class Permission extends Base{
  constructor(props){
    super(props)

    this.state = {//用于检验搜索输入
      validate: false
    }

    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '权限管理', selectedKey: '权限管理permission'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
    this.push({
      type: 'permission/resetFilter',
      fire: [Base.WillUnmount]
    })
    this.handlePermissionReload = this.handlePermissionReload.bind(this)
    this.pageBtns = {
      element: ()=>{
        return (<Row>
          <Col className="pageBtn" onClick={this.handlePermissionReload}>
            <a href="javascript:void(0);">
              <IconFont type="reload"/>刷新
            </a>
          </Col>
        </Row>)
      }
    }
  }

  handlePermissionReload(){
    if (this.refs.inputSearch && this.refs.inputSearch.length >= 36) { //校验是否大于36个字符
      return
    }
    this.props.dispatch({
      type:'permission/handleKeyword',
      payload:{keyword:this.refs.inputSearch}
    })
    this.props.dispatch({
      type : `permission/handleReload`
    })
  }

  render(){
    const { location, dispatch, permission } = this.props
    const { keyword, placeholder, reload } = permission

    const searchProps = [{
      keyword,
      placeholder,
      onSearch(value) {
        if (value.length >= 36) {  //校验是否大于36个字符
          return
        }
        dispatch({
          type: `permission/handleFilter`,
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
        url:'/permissions',
        data:{
          name:keyword
        }
      },
      rowKey: 'id',
      columns:[{
        title: '权限',
        dataIndex: 'display_name',
        key: 'display_name'
      },
      {
        title: '等级',
        dataIndex: 'level_txt',
        key: 'level_txt',
        render:(text) =>{
          return<span>{!text ? "无" : text }</span>
        }
      }],
      reload:reload
    }

    return(
      <Row className={styles.permission}>
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

Permission.propTypes = {
  permission: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    permission: state['permission'],
    loading: state.loading.effects
  }
}

export default connect(mapStateToProps)(Permission)
