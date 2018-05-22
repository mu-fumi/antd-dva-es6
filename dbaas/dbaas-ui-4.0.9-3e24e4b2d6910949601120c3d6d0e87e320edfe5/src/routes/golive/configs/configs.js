/**
 * Created by zhangmm on 2017/9/13.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './configs.less'
import { DataTable, Filter , IconFont, ProgressIcon, StateIcon } from 'components'
import { Link } from 'dva/router'
import { Row , Col , Modal, Icon, Tooltip, Table, Badge } from 'antd'
import { classnames, TimeFilter } from 'utils'
import ConfigureModal from './configureModal.js'
const confirm = Modal.confirm

class Configs extends Base{
  constructor(props){
    super(props)
    this.handleConfigsReload = this.handleConfigsReload.bind(this)
    this.showModal = this.showModal.bind(this)
    this.onCancel = this.onCancel.bind(this)
    this.pageBtns = {
      element: ()=>{
        return (<Row>
          <Col className="pageBtn">
            <Link to="/configs/modify" className="text-info">
              <IconFont type="plus"/>发起变更
            </Link>
          </Col>
          <Col className="pageBtn">
            <a href="javascript:void(0);" onClick={this.handleConfigsReload}>
             <IconFont type="reload"/>刷新
            </a>
          </Col>
        </Row>)
      }
    }
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {activeName : '配置变更', selectedKey : '配置变更configs'},
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey: ''},
      fire : [Base.WillUnmount]
    })
  }

  handleConfigsReload(){
    this.props.dispatch({
      type : `configs/handleReload`
    })
  }

  showModal(dataSource){
    this.props.dispatch({
      type : `configs/handleDataSource`,
      payload:{
        dataSource:dataSource
      }
    })
    this.props.dispatch({
      type : `configs/handleModal`,
      payload:{
        visible:true
      }
    })
  }

  onCancel(){
    this.props.dispatch({
      type : `configs/handleModal`,
      payload:{
        visible:false
      }
    })
  }

  render(){
    const { location, dispatch, configs } = this.props
    const { filter, placeholder, visible, dataSource, reload } = configs

    const rangePickerProps = [{
      label: '时间',
      props: {
        onChange: (value, dateString) => {
          let time = TimeFilter.toUnix(value)
          dispatch({
            type: 'configs/handleFilter',
            payload: {
              time: time
            }
          })
        },
        onOk: (value) => {
          let time = TimeFilter.toUnix(value)
          dispatch({
            type: 'configs/handleFilter',
            payload: {
              time: time
            }
          })
        }
      }
    }]

    const searchProps = [{
      placeholder,
      onSearch(value) {
        dispatch({
          type: `configs/handleFilter`,
          payload: {
            keyword:value
          },
        })
      },
    }]

    const filterProps = {
      searchProps,
      rangePickerProps
    }

    const itemsTitle = <Tooltip title="点击鼠标会弹出当前配置项表">
      变更内容 <IconFont type="question-circle-o"/>
    </Tooltip>

    const tableProps = {
      fetch:{
        url:'/configure/history',
        data:filter
      },
      rowKey: 'id',
      columns:[{
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        sorter: (a, b) => a.id - b.id
      },
      {
        title: '目标',
        dataIndex: 'target',
        key: 'target',
        width:"200px",
        render:(text) =>{
          return <span className="text-ellipsis-1">{text}</span>
        }
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
      },
      {
        title: '所属',
        dataIndex: 'owner',
        key: 'owner',
      },
      {
        title: '操作人',
        dataIndex: 'user',
        key: 'user',
      },
      {
        title: itemsTitle,
        dataIndex: 'items',
        key: 'items',
        width:"400px",
        className:'pointer',
        render:(text) =>{
          let content = ''
          if(text.length > 3){
            content = text.map((v,k) =>{
              if(k <= 2){
                return (<span key={k} className="text-ellipsis-1">{v.key}</span>)
              }else if(k === 3){
                return (<span key={k}><Icon type="ellipsis" /></span>)
              }
            })
          }else{
            content = text.map((v,k) =>{
              return (<span key={k} className="text-ellipsis-1">{v.key}</span>)
            })
          }
          return <span onClick={() =>this.showModal(text)}>{content}</span>
        }
      },
      {
        title: '时间',
        dataIndex: 'date',
        key: 'date',
        sorter : (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        sorter : (a, b) => a.status - b.status,
        render:(text) =>{
          let status = ''
          let prompt = ''
          switch (text){
            default:
            case 0 :
              status = 'success'
              prompt = '成功'
              break
            case -1 :
              prompt = '异常'
              status = 'error'
              break
          }
          return <Tooltip title={prompt}>
                <span style={{cursor : 'pointer'}}>
                  <Badge status={status}></Badge>
                </span>
          </Tooltip>
        }
      }],
      reload:reload,
    }

    const modalProps = {
      visible: visible,
      title: '变更配置表',
      onCancel: this.onCancel,
      onOk: this.onCancel,
      dataSource: dataSource
    }

    return(
      <Row className={styles.configs}>
        <Row className="inner-cont">
          <Row className="mgrb">
            <Filter {...filterProps} />
          </Row>
          <DataTable {...tableProps} />
        </Row>
        <ConfigureModal {...modalProps} />
      </Row>
    )
  }
}

Configs.propTypes = {
  configs: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    configs: state['configs'],
    loading: state.loading.effects
  }
}

export default connect(mapStateToProps)(Configs)
