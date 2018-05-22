/**
 * Created by zhangmm on 2017/9/15.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './detail.less'
import { DataTable, Filter , IconFont } from 'components'
import { Link } from 'dva/router'
import { Row, Col, Tabs, Modal, Tooltip } from 'antd'
import Basic from './basic.js'
import Extend from './extend.js'
const TabPane = Tabs.TabPane
const confirm = Modal.confirm

class Detail extends Base{
  constructor(props){
    super(props)

    //设置返回按钮
    this.setGobackBtn()
    //返回时清空输入域里的值
    this.push({
      type:"detail/handleReset"
    })
    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '主机详情', selectedKey: '主机管理host'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
    this.pageBtns = {
      element: (params)=>{
        return (<Row>
          <Col className="pageBtn">
            <Link to={`/cmdb/host/${params.id}/edit`}>
              <IconFont type="edit"/>编辑主机
            </Link>
          </Col>
          {
            typeof params.serviceExist !== 'boolean' ?
              ''
              :
              (params.status === 1 ? (
                params.serviceExist ? (
                  <Tooltip title="当前主机下有服务，不能删除">
                  <Col className="pageBtn">
                    <a href="javascript:void(0);" disabled={params.serviceExist}>
                      <IconFont type="delete"/>删除主机
                    </a>
                  </Col>
                </Tooltip>
                ) : (
                  <Col className="pageBtn">
                    <a href="javascript:void(0);" onClick={this.handleHostDelete}>
                      <IconFont type="delete"/>删除主机
                    </a>
                  </Col>
                )
               ) : (
                <Col className="pageBtn">
                  <a href="javascript:void(0);" onClick={this.handleHostDelete}>
                    <IconFont type="delete"/>强制删除
                  </a>
                </Col>
              ))
          }
        </Row>)
      }
    }
    /* this.handleHostEdit = this.handleHostEdit.bind(this)*/
    this.handleHostDelete = this.handleHostDelete.bind(this)
    /*this.handleHostInduce = this.handleHostInduce.bind(this)*/
  }

/*  componentWillMount(){
    this.props.dispatch({
      type:'detail/getHostBasic',
      payload:{
        id:this.props.match.params.id,
      }
    })
    this.props.dispatch({
      type:'detail/getHostExtend',
      payload:{
        id:this.props.match.params.id,
      }
    })
  }*/

  handleHostDelete(){
    const id = this.props.match.params.id;
    const name = this.props.detail.name;
    const type = this.props.detail.basic.type;
    const status = this.props.detail.basic.connect_status;
    confirm({
      title: <Row className='wrap-break'>你确定要删除 <span className="text-bold-italic">{name}</span> 主机吗？</Row>,
      content:
        type === 1 ?
          (<Row>
          {/*<Row className='wrap-break'>你确定要删除 <span className="text-bold-italic">{name}</span> 主机吗？</Row>*/}
          <IconFont type="bulb" className="text-warning"/>
          <span>删除 RHCS 主机时会同时删除 RHCS 备机</span>
        </Row>)
        :(status !== 1 ?
          (<Row className='wrap-break'>该主机下没有相关的服务，并且状态异常，可执行删除操作，不一定可以删除成功</Row>)
          :
          (<Row className='wrap-break'>该主机下没有相关的服务，并且状态正常，可执行删除操作</Row>)),
      onOk:() => {
        status !== 1 ?
          ( confirm({
            title: <Row className='wrap-break'>真的要强制删除 <span className="text-bold-italic">{name}</span> 主机吗？</Row>,
            content: <Row>该主机状态异常，请谨慎删除！！</Row>,
            onOk() {
              this.props.dispatch({
                type : `detail/deleteHost`,
                payload : {
                  id : id
                }
              })
            },
          }))
          : (this.props.dispatch({
            type : `detail/deleteHost`,
            payload : {
              id : id
            }
        }))

      },
    })
  }

  render(){
    const { location, dispatch, detail } = this.props
    const { basic, extend } = detail
    //传给基本信息组件的id以及basic对象
    const basicProps = {
      basic:basic
    }

    //传给高级信息组件id
    const extendProps = {
      extend:extend
    }

    return(
      <Row className={styles.detail}>
        <Row className="inner-cont">
          <Tabs defaultActiveKey="1">
            <TabPane tab="基本信息" key="1"><Basic {...basicProps}/></TabPane>
            <TabPane tab="高级信息" key="2"><Extend {...extendProps}/></TabPane>
          </Tabs>
        </Row>
      </Row>
    )
  }
}

Detail.propTypes = {
  detail: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    detail: state['detail'],
    loading: state.loading.effects
  }
}

export default connect(mapStateToProps)(Detail)
