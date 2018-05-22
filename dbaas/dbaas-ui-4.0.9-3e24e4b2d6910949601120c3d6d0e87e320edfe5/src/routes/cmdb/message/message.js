/**
 * Created by zhangmm on 2017/9/7.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './message.less'
import { DataTable, Filter , IconFont, MessageIcon } from 'components'
import { Link } from 'dva/router'
import { Row , Col , Modal, Icon, message as mes } from 'antd'

//记录未读数
let isRead = []

class Message extends Base{

  constructor(props){
    super(props)

    this.push({
      type: 'message/resetFilter',
      fire: [Base.WillUnmount]
    })
    this.handleMessageReload = this.handleMessageReload.bind(this)
    this.handleMessageRead = this.handleMessageRead.bind(this)
    this.pageBtns = {
      element: ()=>{
        return (<Row>
          <Col className="pageBtn" onClick={this.handleMessageRead}>
            <IconFont type="iconfont-hasread" className='font-20'/>标记为已读
          </Col>
          <Col className="pageBtn" onClick={this.handleMessageReload}>
            <a href="javascript:void(0);">
              <IconFont type="reload"/>刷新
            </a>
          </Col>
        </Row>)
      }
    }
  }

  handleMessageReload(){
    this.props.dispatch({
      type : `message/handleReload`
    })
  }

  handleMessageRead(){
    if(isRead.length > 0){
      this.props.dispatch({
        type:'message/read',
        payload:{
          ids:isRead
        }
      })
    }else{
      mes.error('本页没有未阅读的消息')
    }
  }

  render(){
    const { location, dispatch, message } = this.props
    const { keyword, placeholder, reload } = message

    const searchProps = [{
      keyword,
      placeholder,
      onSearch(value) {
        dispatch({
          type: `message/handleFilter`,
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
        url:'/messages',
        data:{
          name:keyword
        }
      },
      rowKey: 'id',
      columns:[{
        title: '消息名称',
        dataIndex: 'title',
        key: 'title',
        sorter:true,
        render: (text, record) => {
          // let type = record.type === 1 ? 'text-success' :
          //   (record.type === -1 ? 'text-error' : (record.type === 2 ? 'text-warning' : 'text-info'))
          // let icon = record.type === 1 ? 'check-circle' :
          //   (record.type === -1 ? 'exclamation-circle' : (record.type === 2 ? 'exclamation-circle' : 'info-circle'))   Lizzy: 老版本两种情况都用exclamation感觉不合理，在MessageIcon中改了
          return (<span >
            <MessageIcon type={ record.type }/>
            <Link className="newtext" target="_blank" to={`/job/${record.link_id.split('/')
              [record.link_id.split('/').length-1]}`}>{text}</Link>
          </span>)
        }
      },
      {
        title: '状态',
        dataIndex: 'read',
        key: 'read',
        className: 'min-w-80',
        sorter:true,
        render: (text,record,index) => {
          if(index === 0){
            isRead = []
          }
          if(text=== 0){
            isRead.push(record.id)
          }
          let className = text === 0 ? 'text-warning' : 'text-success'
          text = text === 0 ? '未读' : '已读'
          return <span className={className}>{text}</span>
        }
      },
/*      {
        title: '消息内容',
        dataIndex: 'content',
        key: 'content',
        render: (text,record) => {
          return <Link target="_blank" to={`/job/${record.link_id.split('/')
            [record.link_id.split('/').length-1]}`}>{text}</Link>
        }
      },*/
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
        className: 'min-w-180',
        sorter:true,
        render:(text) =>{
          return<span>{!text ? "无" : text }</span>
        }
      },
      {
        title: '更新时间',
        dataIndex: 'updated_at',
        key: 'updated_at',
        className: 'min-w-180',
        sorter:true,
        render:(text) =>{
          return<span>{!text ? "无" : text }</span>
        }
      }],
      reload:reload
    }

    return(
      <Row className={styles.message}>
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

Message.propTypes = {
  message: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    message: state['message'],
    loading: state.loading.effects
  }
}

export default connect(mapStateToProps)(Message)




