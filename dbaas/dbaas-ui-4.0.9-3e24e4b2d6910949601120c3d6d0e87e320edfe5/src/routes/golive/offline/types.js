/**
 * Created by wengyian on 2017/9/4.
 */
import Base from 'routes/base'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, Select, message, Checkbox, Button, Modal, Tooltip, Spin} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon, StateIcon, NodeBadge} from 'components'
import {routerRedux, Link} from 'dva/router'
import {classnames} from 'utils'
import _ from 'lodash'
import {constant, TimeFilter, Cache} from 'utils'
import * as moment from 'moment'
import styles from './types.less'
import TipModal from './tipModal'

const modelKey = 'offline/types'
const { RELATE_TYPE } = constant
const cookie = new Cache('cookie')

class Types extends Base{
  constructor(props){
    super(props)

    // console.log('props===>', props)

    const tag = props.types.tag || 'cluster'
    const options = {
      cluster : '集群',
      instance : '实例',
      set : '实例组',
    }
    let name ='下线' + options[tag]

    this.setGobackBtn()
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {activeName : name, selectedKey: "下线offline"},
      defer : true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey: ""},
      fire : [Base.WillUnmount]
    })

    this.push({
      type : `${modelKey}/initFilter`,
      fire : [Base.WillUnmount]
    })

    // this.state = {
    //   force : false
    // }

    this.handleOffline = this.handleOffline.bind(this)
    this.onSelect = this.onSelect.bind(this)
    this.onSelectedAll = this.onSelectedAll.bind(this)
    this.onOk = this.onOk.bind(this)
    this.changeChecked = this.changeChecked.bind(this)
    this.toggleTipModalVisible = this.toggleTipModalVisible.bind(this)
  }

  componentWillReceiveProps(nextProps){

  }

  handleOffline(){
    const { selectedItem, tag, relateType } = this.props.types
    if(selectedItem.length > 0){
      const key = `${tag}_name`
      const content =selectedItem.map(item => {
        return item[key]
      })
      let relateTypeTxt = '集群'
      switch (relateType){
        case RELATE_TYPE['cluster'] :
          relateTypeTxt = '集群'
              break
        case RELATE_TYPE['set'] :
          relateTypeTxt = '实例组'
              break
        case RELATE_TYPE['instance'] :
          relateTypeTxt = '实例'
              break
      }
      Modal.confirm({
        title : `确定下线所选${relateTypeTxt}吗？`,
        content : <Row>
          {/*<Row>确定下线 {content} 吗？</Row>*/}
          <Row className={styles["checkbox-container"]}>
            <Checkbox defaultChecked={this.props.types.force} onChange={this.changeChecked}>强制下线</Checkbox>
          </Row>
          <Row style={{marginTop : '8px'}}>
            <IconFont type="bulb" className="text-warning"/>
            <span>强制下线即允许下线错误，删除{relateTypeTxt}记录</span>
          </Row>
        </Row>,
        onOk : this.onOk,
        onCancel : () => {
          this.props.dispatch({
            type : `${modelKey}/setForce`,
            payload : false
          })

        }
      })
    }else{
      message.error('请选择要下线的内容')
    }
  }

  toggleTipModalVisible(){
    this.props.dispatch({
      type : `${modelKey}/toggleTipModalVisible`
    })
  }

  changeChecked(e){
    // this.setState({
    //   force : e.target.checked
    // })
    this.props.dispatch({
      type : `${modelKey}/setForce`,
      payload : e.target.checked
    })
  }

  onOk(){
    // todo 看后台需要什么样的数据
    const { tag, selectedItem } = this.props.types
    const offline_type = RELATE_TYPE[tag]
    /********* 20180329 下线需要字段 type 表示类型 *********/
    /********* 20180329 黎晶说为之后防止下线混合起来准备 暂时用途不大*********/
    const type = RELATE_TYPE[tag]
    const force = this.props.types.force ? 'yes' : 'no'
    const data = selectedItem.map(item => {
      return {
        offline_type,
        // app_id : 1,
        // offline_id : item.id
        offline_id : item
      }
    })

    // todo 测试用 记得删除
    // this.props.dispatch({
    //   type : `${modelKey}/toggleTipModalVisible`
    // })

    this.props.dispatch({
      type : `${modelKey}/setSpinningTrue`
    })

    this.props.dispatch({
      type : `${modelKey}/offline`,
      payload : {
        force,
        type,
        user_id : cookie.get('uid'),
        params : data,
      }
    })
  }

  onSelect(record, selected, selectedRows){
    // 统一传参数 选中状态， 影响的列
    this.props.dispatch({
      type : `${modelKey}/setSelected`,
      payload : {
        selected,
        changeRows : [record],
      }
    })
  }

  onSelectedAll(selected, selectedRows, changeRows){
    this.props.dispatch({
      type : `${modelKey}/setSelected`,
      payload : {
        selected,
        changeRows,
      }
    })
  }

  showTipModal(){
    // Modal.info({
    //   title : '任务提示：',
    //   content : '下线任务已在后台执行，您可以稍候在下线历史列表查看进度及结果。',
    //   onOk(){
    //     this.props.dispatch({
    //       type : `${modelKey}/handleReload`,
    //     })
    //   }
    // })
  }

  render(){
    const { types, dispatch } = this.props
    const { filter, selectedItem, tag, reload, tipModalVisible, spinning } = types

    const searchProps = [{
      placeholder : '关键字搜索',
      onSearch : (value) => {
        dispatch({
          type : `${modelKey}/handleFilter`,
          payload : { keyword : value}
        })
      }
    }]
    const filterProps = {
      searchProps,
    }


    // const selectedRowKeys = selectedItem.map( v => v.id)
    // 默认显示集群
    let tagTitle = '集群'
    let linkUrl = 'cluster'
    let tagDataIndex = 'cluster_name'
    /********201711205 bug：貌似没给 instance_name 这些***************/
    /*********** 20180103 bug: 修复下线跳转详情出错  ************/
    /*********** 20180103 增加 linkUrl 表示要跳转的位置  ************/

    if(tag === 'set'){
      tagTitle = '实例组'
      linkUrl = 'instance-group'
      // tagDataIndex = 'set_name'
    }else if(tag === 'instance'){
      tagTitle = '实例'
      linkUrl = 'instance'
      // tagDataIndex = 'instance_name'
    }

    const belongTitle = <Tooltip title="业务-应用-集群 | 实例 | 实例组[-节点]">
      所属 <IconFont type="question-circle" className="text-info"/>
    </Tooltip>

    const dataTableProps = {
      fetch : {
        url : `/deploy/${tag}/list`,
        data : filter
      },
      reload : reload,
      columns: [{
        title : `${tagTitle}`,
        dataIndex : `${tagDataIndex}`,
        render : (text, record) => {
          return <Row className={styles["name-container"]}>
              <Link to={`/cmdb/${linkUrl}/${record.id}`}>{text}</Link>
            </Row>
        }
      },{
        title: belongTitle,
        dataIndex: 'belong',
      },{
        title: '用户',
        dataIndex: 'user',
      },{
        title: '使用套件',
        dataIndex: 'stack',
      },{
        title: '节点状态',
        dataIndex: 'nodes_status',
        sorter : (a, b) => a.nodes_status - b.nodes_status,
        render: (text, record) => {
          return  <NodeBadge type={text} node_list={record.node_list}/>
        }
      },{
        title: '运行状态',
        dataIndex: 'run_status',
        sorter : (a, b) => a.run_status - b.run_status,
        render:(text) =>{
          return <StateIcon type={text}/>
        }
      },{
        title: '时间',
        dataIndex: 'time',
        sorter : (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
      }],
      rowSelection : {
        onSelect : this.onSelect,
        onSelectAll : this.onSelectedAll,
        selectedRowKeys : selectedItem,
      },
      rowKey : 'id',
    }

    const tipModalProps = {
      visible : tipModalVisible,
      title : '任务提示：',
      content : (
        <Row>
          <Row>下线任务已经提交。</Row>
          <Row>提交成功,本次任务已在后台执行,耗时较长,您稍候可以在任务列表查看进度及结果。</Row>
        </Row>
      ),
      onOk : () => {
        this.toggleTipModalVisible()
        this.props.dispatch(
          routerRedux.push('/offline')
        )
      },
      onCancel : () => {
        this.toggleTipModalVisible()
      }
    }

    return (
      <Row>
        <Spin spinning={spinning}>
          <Row className={styles["mgtb-8"]}>
            <Filter {...filterProps}/>
          </Row>
          <DataTable {...dataTableProps}/>
          <Row className={classnames(styles["mgt-8"], "text-right")} >
            <Button type="primary" onClick={this.handleOffline}>一键下线</Button>
          </Row>
          <TipModal {...tipModalProps}/>
        </Spin>
      </Row>
    )
  }
}

Types.propTypes = {
  types: PropTypes.object,
  location: PropTypes.object,
  loading: PropTypes.bool,
  dispatch: PropTypes.func
}

export default connect((state) => {
  return {
    loading : state.loading.models[modelKey],
    types : state[modelKey]
  }
})(Types)
