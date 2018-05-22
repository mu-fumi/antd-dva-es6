/**
 * Created by zhangmm on 2017/11/01.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './detail.less'
import { DataTable, Filter , IconFont } from 'components'
import { Link , browserHistory } from 'dva/router'
import { Row , Col , Modal, Tooltip } from 'antd'
import DetailLine from './detailLine.js'
const confirm = Modal.confirm

class Detail extends Base{
  constructor(props){
    super(props)

    this.setGobackBtn()
    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '业务详情', selectedKey: '业务管理business'},
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
                 <Tooltip title="仅允许此业务的负责人操作">
                 <Col className="pageBtn">
                   <a href="javascript:void(0);" disabled={params.disabled}>
                     <IconFont type="edit"/>编辑业务
                   </a>
                 </Col>
                 </Tooltip>
                 <Tooltip title="仅允许此业务的负责人操作">
                 <Col className="pageBtn">
                   <a href="javascript:void(0);" disabled={params.disabled}>
                     <IconFont type="delete"/>删除业务
                   </a>
                 </Col>
                 </Tooltip>
               </Row>
               :
               <Row>
                 <Col className="pageBtn">
                   <Link to={`/cmdb/business/${params.id}/edit`} disabled={params.disabled}>
                     <IconFont type="edit"/>编辑业务
                   </Link>
                 </Col>
                 <Col className="pageBtn">
                   <a href="javascript:void(0);" onClick={this.handleBusinessDelete} disabled={params.disabled}>
                     <IconFont type="delete"/>删除业务
                   </a>
                 </Col>
               </Row>)
           }
         </Row>)
      }
    }
    this.push({
      type:"busDetail/handleReset"
    })

    this.handleBusinessDelete = this.handleBusinessDelete.bind(this)
  }

  handleBusinessDelete(){
    const { name, application_count } = this.props.detail.business
    if(Number(application_count) === 0){
      const id = this.props.match.params.id
      confirm({
        title : <span className="wrap-break">确定要删除 <span className="text-bold-italic">{name}</span> 业务吗？</span>,
        content : <span>该业务下没有相关的应用，可以执行删除操作</span>,
        onOk : () => {
          this.props.dispatch({
            type : `busDetail/deleteBusiness`,
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
          <span className="text-bold-italic">{name}</span> 业务下存在应用，执行该操作需要先删除相关应用！</span>,
      })
    }
  }

  render(){
    const { location, dispatch, detail } = this.props
    const { business } = detail
    const businessProps = {
      business:business
    }

    return(
      <Row className={styles.detail}>
        <Row className="inner-cont">
          <Row className="mgrb">
            <DetailLine {...businessProps}/>
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
    detail: state['busDetail'],
    loading: state.loading.effects
  }
}

export default connect(mapStateToProps)(Detail)
