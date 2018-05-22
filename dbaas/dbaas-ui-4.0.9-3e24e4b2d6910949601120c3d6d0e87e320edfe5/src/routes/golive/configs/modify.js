/**
 * Created by zhangmm on 2017/9/29.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './modify.less'
import { DataTable, Filter , IconFont } from 'components'
import { routerRedux } from 'dva/router'
import { Row , Col , Modal, Steps, Spin } from 'antd'
import ChangeConfigs from './changeConfigs'
import ChooseConfigs from './chooseConfigs'
import ConfigsSummary from './configsSummary'
const confirm = Modal.confirm
const Step = Steps.Step

class Modify extends Base{
  constructor(props){
    super(props)

    //只要离开了顶层组件modify，就会将current置为0
/*    this.push({
      type:"modify/handleReset",
    })*/
    //设置返回按钮
    this.setGobackBtn()
    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '变更配置', selectedKey: '配置变更configs'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })

    this.next = this.next.bind(this)
    this.prev = this.prev.bind(this)
    this.handleFilter = this.handleFilter.bind(this)
    this.handleStackId = this.handleStackId.bind(this)
    this.handleSelectedRowKeys = this.handleSelectedRowKeys.bind(this)

    this.loadConfigure = this.loadConfigure.bind(this)
    //this.changeConfigure = this.changeConfigure.bind(this)
    this.saveConfiguration = this.saveConfiguration.bind(this)
    this.handleSpin = this.handleSpin.bind(this)

    this.handleLoading = this.handleLoading.bind(this)
    this.changeConfigure = this.changeConfigure.bind(this)
  }

  componentWillMount(){
    this.props.dispatch({
      type:'modify/getStackOption',
    })
  }

  componentWillUnmount(){
    this.props.dispatch({
      type:"modify/handleReset",
    })
  }

  next(){
    this.props.dispatch({
      type:'modify/handleCurrentPlus'
    })
  }

  prev(){
    const search = this.props.location.search
    const current = this.props.modify.current
    if(/^\?node_id=/.test(search) && current === 1){
      this.props.dispatch(
        routerRedux.push({
          pathname:`/nodes`
        })
      )
    }else{
      this.props.dispatch({
        type:'modify/handleCurrentMinus'
      })
    }
  }

  //step1
  handleFilter(data){
    this.props.dispatch({
      type:'modify/handleFilter',
      payload:data
    })
  }

  handleStackId(data){
    this.props.dispatch({
      type:'modify/handleStackId',
      payload:data
    })
  }

  handleSelectedRowKeys(selectedRowKeys,selectedRows,selectedRowStatus){
    this.props.dispatch({
      type:'modify/handleSelectedRowKeys',
      payload:{
        selectedRowKeys:selectedRowKeys
      }
    })
    this.props.dispatch({
      type:'modify/handleSelectedCluster',
      payload:{
        cluster:selectedRows
      }
    })
    this.props.dispatch({
      type:'modify/handleSelectedStatus',
      payload:{
        status:selectedRowStatus
      }
    })
  }

  //step2
  loadConfigure(){
    const nodeId = this.props.modify.nodeId
    if(nodeId){
      this.props.dispatch({
        type:'modify/getNodeConfigs',
        payload:{
          id:nodeId
        }
      })
    }else{
      this.props.dispatch({
        type:'modify/getConfigure',
        payload:{
          //stack_id:Number(this.props.modify.filter.stack_id),
          relate_ids:this.props.modify.selectedRowKeys.toString()
        }
      })
    }
  }

  saveConfiguration(params){
    this.props.dispatch({
      type:'modify/saveConfiguration',
      payload:{
        configuration:params,
      }
    })
  }

  handleSpin(){
    this.props.dispatch({
      type:'modify/handleSpin',
      payload:{
        spin:false
      }
    })
  }

  //step3
  handleLoading(){
    this.props.dispatch({
      type:'modify/handleLoading',
      payload:{
        loading:false
      }
    })
  }

  changeConfigure =() =>{
    const search = this.props.location.search
    const nodeId = this.props.modify.nodeId
    if(/^\?node_id=/.test(search)){
      this.props.dispatch({
        type:'modify/changeNodeConfigure',
        payload:{id:nodeId}
      })
    }else{
      this.props.dispatch({
        type:'modify/changeConfigure',
      })
    }
  }


  render(){
    const { location, dispatch, modify } = this.props
    const { current, filter , selectedRowKeys, stackOption, configure, nodeConfigure, params, cluster,
      loading, spin, configuration, nodeId, nodeName, status } = modify

    const changeConfigsProps = {
      next:this.next,
      filter:filter,
      handleFilter:this.handleFilter,
      handleStackId:this.handleStackId,
      selectedRowKeys:selectedRowKeys,
      handleSelectedRowKeys:this.handleSelectedRowKeys,
      stackOption:stackOption,
      status:status,
    }

    const chooseConfigsProps = {
      prev:this.prev,
      next:this.next,
      loadConfigure:this.loadConfigure,
      configure:configure,
      nodeConfigure:nodeConfigure,
      //stack_id:filter.stack_id,
      //changeConfigure:this.changeConfigure,
      cluster:cluster,
      saveConfiguration:this.saveConfiguration,
      nodeId:nodeId,
      nodeName:nodeName,
      location:location,
      spin:spin,
      handleSpin:this.handleSpin,
    }

    const configsSummaryProps = {
      prev:this.prev,
      handleChange:this.changeConfigure,
      params:params,
      loading: loading,
      handleLoading:this.handleLoading,
    }

    const steps = [{
      title: '变更配置',
      content: <ChangeConfigs {...changeConfigsProps}/>,
    }, {
      title: '选择配置项',
      content: <ChooseConfigs {...chooseConfigsProps}/>,
    }, {
      title: '修改信息汇总',
      content: <ConfigsSummary {...configsSummaryProps}/>,
    }]

    return(
      <Row className={styles.modify}>
        <Row className="inner-cont">
          <Steps current={current}>
            {steps.map(item => <Step key={item.title} title={item.title} />)}
          </Steps>
          <Row className={styles["mgt-16"]}>
            {steps[current].content}
          </Row>
        </Row>
      </Row>
    )
  }
}

Modify.propTypes = {
  modify: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    modify: state['modify'],
    loading: state.loading.effects
  }
}

export default connect(mapStateToProps)(Modify)
