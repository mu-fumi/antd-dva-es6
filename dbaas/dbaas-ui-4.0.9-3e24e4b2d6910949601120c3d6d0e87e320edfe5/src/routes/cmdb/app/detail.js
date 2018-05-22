/**
 * Created by zhangmm on 2017/11/01.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './detail.less'
import { DataTable, Filter , IconFont } from 'components'
import { Link } from 'dva/router'
import { Row , Col , Modal, Tooltip } from 'antd'
import DetailLine from './detailLine.js'
const confirm = Modal.confirm

class Detail extends Base{
  constructor(props){
    super(props)

    this.setGobackBtn()
    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '应用详情', selectedKey: '应用管理application'},
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
        return (
          <Row>
            {
              typeof params.disabled !== 'boolean' ?
                ""
                :
                (params.disabled ?
                <Row>
                  <Tooltip title="非高权用户，负责人和用户不同时，不允许修改">
                    <Col className="pageBtn">
                      <a href="javascript:void(0);" disabled={params.disabled}>
                        <IconFont type="edit"/>编辑应用
                      </a>
                    </Col>
                  </Tooltip>
                  <Tooltip title="非高权用户，负责人和用户不同时，不允许删除">
                    <Col className="pageBtn">
                      <a href="javascript:void(0);" disabled={params.disabled}>
                        <IconFont type="delete"/>删除应用
                      </a>
                    </Col>
                  </Tooltip>
                </Row>
                :
                <Row>
                  <Col className="pageBtn">
                    <Link to={`/cmdb/app/${params.id}/edit`} disabled={params.disabled}>
                      <IconFont type="edit"/>编辑应用
                    </Link>
                  </Col>
                  <Col className="pageBtn">
                    <a href="javascript:void(0);" onClick={this.handleAppDelete} disabled={params.disabled}>
                      <IconFont type="delete"/>删除应用
                    </a>
                  </Col>
                </Row>)
            }
          </Row>)
      }
    }
    this.push({
      type:"appDetail/handleReset"
    })

    this.handleAppDelete = this.handleAppDelete.bind(this)
  }

  handleAppDelete(){
    const { name, cluster_count, set_count, instance_count } = this.props.detail.app
    if(Number(cluster_count === 0) && Number(set_count === 0)
      && Number(instance_count === 0)){
      const id = this.props.match.params.id
      confirm({
        title : <span className="wrap-break">确定要删除 <span className="text-bold-italic">{name}</span> 应用吗？</span>,
        content : <span>该应用下没有相关的集群、实例或者实例组，可移执行删除操作</span>,
        onOk : () => {
          this.props.dispatch({
            type : `appDetail/deleteApp`,
            payload : {
              id : id
            }
          })
        }
      })
    }else{
      Modal.warning({
        title: '提示',
        content: <span className="wrap-break">
          <span className="text-bold-italic">{name}</span> 应用下存在集群、实例或者实例组，执行该操作需要先删除相关集群、实例或者实例组！</span>,
      })
    }
  }

  render(){
    const { location, dispatch, detail } = this.props
    const { app } = detail

    const appProps = {
      app:app
    }

    return(
      <Row className={styles.detail}>
        <Row className="inner-cont">
          <Row className="mgrb">
            <DetailLine {...appProps}/>
          </Row>
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
    detail: state['appDetail'],
    loading: state.loading.effects
  }
}

export default connect(mapStateToProps)(Detail)
