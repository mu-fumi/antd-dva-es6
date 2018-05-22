/**
 * Created by zhangmm on 2017/9/2.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './business.less'
import { DataTable, Filter , IconFont } from 'components'
import { Link } from 'dva/router'
import { Row , Col , Modal } from 'antd'
const confirm = Modal.confirm

class Business extends Base{
  constructor(props){
    super(props)

    this.state = {//用于检验搜索输入
      validate: false
    }

    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '业务管理', selectedKey: '业务管理business'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
    this.push({
      type: 'business/resetFilter',
      fire: [Base.WillUnmount]
    })
    this.pageBtns = {
      element: ()=>{
        return (<Row>
          <Col className="pageBtn">
            <Link to="/cmdb/business/add" className="text-info">
              <IconFont type="plus"/>新增业务
            </Link>
          </Col>
          <Col className="pageBtn" onClick={this.handleBusinessReload}>
            <a href="javascript:void(0);">
              <IconFont type="reload"/>刷新
            </a>
          </Col>
        </Row>)
      }
    }

    this.handleBusinessReload = this.handleBusinessReload.bind(this)
  }

  handleBusinessReload(){
    if (this._keyword && this._keyword.length >= 36) { //校验是否大于36个字符
      return
    }
    this.props.dispatch({
      type:'business/handleKeyword',
      payload:{keyword:this._keyword}
    })
    this.props.dispatch({
      type : `business/handleReload`
    })
  }

  render(){
    const { location, dispatch, business } = this.props
    const { keyword, placeholder, reload } = business

    const searchProps = [{
      keyword,
      placeholder,
      onSearch(value) {
        if (value.length >= 36) {  //校验是否大于36个字符
          return
        }
        dispatch({
          type: `business/handleFilter`,
          payload: {
            keyword:value
          },
        })
      },
      onChange :(e) =>{
        this._keyword = e.target.value
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
        url:'/businesses',
        data:{
          name:keyword,
          type:1
        }
      },
      rowKey: 'id',
      columns:[{
        title: '业务名称',
        dataIndex: 'name',
        key: 'name',
        sorter:true,
        className: 'min-w-180',
        render : (text,record) => {
          return (
          <Link to={`/cmdb/business/${record.id}/detail`}>{text}</Link>
          )
        }
      },
      {
        title: '负责人',
        dataIndex: 'user_name',
        key: 'user_name',
        className: 'min-w-100',
        render:(text) =>{
          return<span>{!text ? "无" : text }</span>
        }
      },
      {
        title: '应用数',
        dataIndex: 'application_count',
        key: 'application_count',
        sorter:true,
        className: 'min-w-100',
        render :(text,record) => {
          let application_count = text ? Number(text) : 0
          if(application_count === 0){
            return <span>{application_count}</span>
          }else{
            return <Link target='_blank' to={`/cmdb/app?business_id=${record.id}`}>{application_count}</Link>
          }
        }
      },
      {
        title: '备注',
        dataIndex: 'desc',
        key: 'desc',
        //sorter:true,
        className: 'min-w-200',
        render:(text) =>{
          return<span>{!text ? "无" : text }</span>
        }
      },
      {
        title: '最后更新时间',
        dataIndex: 'updated_at',
        key: 'updated_at',
        sorter:true,
        className: 'min-w-180',
        render:(text) =>{
          return<span>{!text ? "无" : text }</span>
        }
      }],
      reload:reload,
    }

    return(
      <Row className={styles.business}>
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

Business.propTypes = {
  business: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    business: state['business'],
    loading: state.loading.effects
  }
}
export default connect(mapStateToProps)(Business)
