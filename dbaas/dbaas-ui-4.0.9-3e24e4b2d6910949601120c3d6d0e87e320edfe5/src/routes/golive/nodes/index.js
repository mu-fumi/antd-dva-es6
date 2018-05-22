/**
 * Created by wengyian on 2017/9/8.
 */

import Base from 'routes/base'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, Spin, message, Tooltip, Button, Modal, Checkbox, Badge,} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon, NodeRunBadge,} from 'components'
import {routerRedux, Link,} from 'dva/router'
import {classnames, constant, TimeFilter} from 'utils'
import _ from 'lodash'
import styles from './index.less'
import TipModal from './tipModal'
import UpModal from './upModal'
import {judgeDelete} from 'services/nodes'
import queryString from 'query-string'

const {NODE_STATE, NODE_OPTION_STATE} = constant
class Nodes extends Base {
  constructor(props) {
    super(props)

    this.pageBtns = {
      element: () => {
        return <Row>
          <Col className="pageBtn">
            <Link to="/nodes/add" className="text-info">
              <IconFont type="plus"/>新增节点
            </Link>
          </Col>
          <Col className="pageBtn">
            <Link to="/nodes/history" className="text-info">
              <IconFont type="iconfont-lishijilu"/>节点管理历史记录
            </Link>
          </Col>
          <Col className="pageBtn" onClick={this.handleReload}>
            <a href="javascript:;">
              <IconFont type="reload"/>刷新
            </a>
          </Col>
        </Row>
      }
    }

    this.push({
      type: 'nodes/initFilter',
      fire: [Base.WillUnmount]
    })

    this.handleDelete = this.handleDelete.bind(this)
    this.handleStatus = this.handleStatus.bind(this)
    this.handleNodeChange = this.handleNodeChange.bind(this)
    this.handleCasChange = this.handleCasChange.bind(this)
    this.handleReload = this.handleReload.bind(this)
    this.handleChkChange = this.handleChkChange.bind(this)
    this.clearQuery = this.clearQuery.bind(this)
    this.modalContent = this.modalContent.bind(this)
    this.handleUpOk = this.handleUpOk.bind(this)
    this.handleUpCancel = this.handleUpCancel.bind(this)
  }

  handleReload=()=> {
    if (this._keywords === null || this._keywords === undefined) {
      this._keywords = ''
    }
    this.props.dispatch({
      type: 'nodes/handleKeywords',
      payload: this._keywords
    })
    this.props.dispatch({
      type: 'nodes/handleReload'
    })
  }

  handleChkChange(e) {
    this.props.dispatch({
      type: 'nodes/setForce',
      payload: e.target.checked
    })
  }

  handleDelete(record) {
    // const { nodes, dispatch } = this.props
    // const { force } = nodes
    /*******************20171123 删除前先判断建不建议删除 judgeDelete***************************/
    const res = judgeDelete({
      node_id: record.id
    }).then(res => {
      let tip = ''
      let className = "delete-tip-none"
      if (res.code !== 0) { // 建议的错误提示码 1003
        if (res.code === 1003) {
          tip = res.msg || res.err
          className = 'delete-tip-show'
        } else {
          message.error(res.err || res.msg)
          return
        }
      }
      const content = (
        <Row>
          {/*<Row>确定删除节点 {record.node_name}吗？</Row>*/}
          <Row className={styles["checkbox-container"]}>
            <Checkbox defaultChecked={this.props.nodes.force} onChange={this.handleChkChange}>强制删除</Checkbox>
          </Row>
          <Row style={{marginTop: '8px'}}>
            <IconFont type="bulb" className="text-warning"/>
            <span>强制删除即允许删除错误，也删除节点记录</span>
          </Row>
          <Row className={styles[className]}>{tip}</Row>
        </Row>
      )
      const _this = this

      Modal.confirm({
        title: '确定删除节点吗？',
        content: content,
        onOk: () => {
          this.props.dispatch({
            type: 'nodes/deleteNode',
            payload: {
              id: record.id,
              force: this.props.nodes.force ? 'yes' : 'no'
            }
          })
        },
        onCancel: () => {
          this.props.dispatch({
            type: 'nodes/setForce',
            payload: false
          })
        }
      })
    }).catch(res => {
      message.error(res.err || res.msg)
    })
  }

  handleStatus(id, status) {
    // status : 如果 0 就请求停止 否则请求启动
    if (status === 0) {
      Modal.confirm({
        title: '确定',
        content: '确定要停止所选节点吗？',
        onOk: () => {
          this.props.dispatch({
            type: 'nodes/setSpinning',
            payload: true
          })
          this.props.dispatch({
            type: 'nodes/downNode',
            payload: id
          })
        }
      })

    } else {
      this.props.dispatch({
        type: 'nodes/setSpinning',
        payload: true
      })
      this.props.dispatch({
        type : 'nodes/setUpId',
        payload : id
      })
      this.props.dispatch({
        type: 'nodes/upNode',
        payload: {
          id : id,
          force : 'no'
        }
      })
    }
    //
    // this.props.dispatch({
    //   type : 'nodes/switchStatus',
    //   payload : {
    //     id,
    //     status,
    //   }
    // })
  }

  handleNodeChange(id, name) {
    this.props.dispatch(
      routerRedux.push(`/configs/modify?node_id=${id}&node_name=${name}`)
    )
  }

  handleCasChange(data) {
    this.clearQuery()
    console.log('data===>', data)
    const key = ['business_id', 'app_id', 'relate_id-relate_type',]
    let params = {
      business_id: '',
      app_id: '',
      'relate_id-relate_type': '',
    }
    data.forEach((v, i) => {
      params[key[i]] = v
    })
    let relate_id = '', relate_type = ''
    if (params['relate_id-relate_type'] !== '') {
      relate_id = params['relate_id-relate_type'].split('-')[0]
      relate_type = params['relate_id-relate_type'].split('-')[1]
    }
    delete params['relate_id-relate_type']
    params.application_id = params.app_id
    delete params.app_id
    this.props.dispatch({
      type: 'nodes/handleFilter',
      payload: {
        ...params,
        relate_id,
        relate_type,
      }
    })
  }

  clearQuery() {
    const {location} = this.props
    const {search, pathname} = location

    const query = queryString.parse(search)
    if (Object.keys(query).length) {
      this.props.dispatch(
        routerRedux.replace(pathname)
      )
      this.props.dispatch({
        type: 'nodes/clearQuery',
        payload: query
      })
    }
  }

  handleUpOk(){
    const { upId } = this.props.nodes
    const data = {
      id : upId,
      force : 'yes'
    }
    this.props.dispatch({
      type : 'nodes/upNode',
      payload : data
    })

    this.props.dispatch({
      type : 'nodes/setUpModalVisible',
      payload : false
    })
  }

  handleUpCancel(){
    this.props.dispatch({
      type : 'nodes/setUpModalVisible',
      payload : false
    })
  }

  modalContent(taskType) {
    const types = ['', '启动', '删除', '下线', '增加']
    const typeTxt = types[taskType]
    return <Row>
      <Row>{typeTxt}节点任务已经提交。</Row>
      <Row>提交成功,本次任务已在后台执行,耗时较长,您稍候可以在任务列表查看进度及结果。</Row>
    </Row>
  }

  render() {
    const {dispatch, nodes} = this.props
    const {
      reload, filter, businessOptions, stackOptions,
      tipModalVisible, taskType, spinning, upModalVisible
    } = nodes

    const searchProps = [{
      placeholder: '关键字搜索',
      // keyword : filter.keywords,
      onSearch: (value) => {
        this.clearQuery()
        dispatch({
          type: 'nodes/handleFilter',
          payload: {keywords: value}
        })
      },
      onChange: (e) => {
        this._keywords = e.target.value
      }
    }]

    stackOptions['全部'] = ''

    const selectProps = [{
      label: '所属套件',
      options: stackOptions,
      props: {
        onChange: (value) => {
          this.clearQuery()
          dispatch({
            type: 'nodes/handleFilter',
            payload: {
              stack_id: value
            }
          })
        }
      }
    }, {
      label: '状态',
      options: NODE_OPTION_STATE,
      props: {
        onChange: (value) => {
          this.clearQuery()
          dispatch({
            type: 'nodes/handleFilter',
            payload: {
              alive: value
            }
          })
        }
      }
    }]

    const cascaderProps = [{
      label: '所属',
      props: {
        onChange: this.handleCasChange,
        length: 3,
        options: businessOptions
      },
    }]


    const filterProps = {
      searchProps,
      selectProps,
      cascaderProps
    }

    const belongTitle = <Tooltip title="业务-应用-集群 | 实例 | 实例组[-节点]">
      所属 <IconFont type="question-circle" className="text-info"/>
    </Tooltip>

    const dataTableProps = {
      fetch: {
        url: '/node',
        data: filter
      },
       bordered : true,
      title: () => {
        return (
          <Row>
            <IconFont type="bulb" className="text-warning"/>&nbsp;
            <span>提示：删除节点，启动节点在后台执行，请刷新列表查看最新状态</span>
          </Row>
        )
      },
      reload: reload,
      rowKey: 'id',
      columns: [{
        title: '节点名',
        dataIndex: 'node_name'
      }, {
        title: belongTitle,
        dataIndex: 'belongsTo'
      }, {
        title: '所属套件',
        dataIndex: 'stack_name'
      }, {
        title: 'IP',
        dataIndex: 'prefer_ip'
      }, {
        title: '端口',
        dataIndex: 'port'
      }, {
        title: '状态',
        dataIndex: 'alive',
        className: 'text-center',
        render: (text, record) => {
          // 先跳转到任务列表 后续到 详情哪里再说
          return (
            /****** 20180105 不跳了 *******/
              <NodeRunBadge type={text}/>
          )
        }
      }, {
        title: '类型',
        dataIndex: 'type',
      }, {
        title: '操作',
        render: (text, record) => {
          const aliveText = record.alive === NODE_STATE.RUNNING ? '停止' : (record.alive === NODE_STATE.ABNORMAL ? '启动' : '')
          return (
            <span>
              {
                aliveText &&
                <a
                  href="javascript:;"
                  onClick={() => this.handleStatus(record.id, record.alive)}
                >
                  {aliveText}
                </a>

              }
              {
                (record.alive === NODE_STATE.RUNNING || record.alive === NODE_STATE.ABNORMAL)
                && <span className="ant-divider"></span>
              }
              {
                record.alive === NODE_STATE.DELETING
                || <span>
                     <a href="javascript:;" onClick={() => this.handleDelete(record)}>删除</a>
                  </span>
              }
              {/******20171120 暂时先去掉配置变更 ***********/}
              {/*{*/}
                {/*record.alive === NODE_STATE.RUNNING*/}
                {/*&& <span className="ant-divider"></span>*/}
              {/*}*/}
              {/*{*/}
                {/*record.alive === NODE_STATE.RUNNING*/}
                {/*&& <a href="javascript:;" onClick={() => this.handleNodeChange(record.id, record.node_name)}>配置变更</a>*/}
              {/*}*/}
            </span>
          )
        }
      }]
    }
    const modalContent = this.modalContent(taskType)

    const tipModalProps = {
      title: '任务提示',
      visible: tipModalVisible,
      content: modalContent,
      onOk: () => {
        dispatch({
          type: 'nodes/toggleTipModalVisible'
        })
        dispatch({
          type: 'nodes/handleReload'
        })
      }
    }

    const upModalProps= {
      onOk : this.handleUpOk.bind(this),
      onCancel : this.handleUpCancel.bind(this),
      visible : upModalVisible,
    }


    return (
      <Row className={styles["nodes"]}>
        <Spin spinning={spinning}>
          <Row className={styles["mgtb-8"]}>
            <Filter {...filterProps}/>
          </Row>
          <DataTable {...dataTableProps} />
        </Spin>
        {/*<TipModal {...tipModalProps}/>
        <UpModal {...upModalProps}></UpModal>*/}
      </Row>
    )
  }
}

Nodes.propTypes = {
  node: PropTypes.object,
  location: PropTypes.object,
  loading: PropTypes.bool,
  dispatch: PropTypes.func
}

export default connect((state) => {
  return {
    loading: state.loading.models['nodes'],
    nodes: state['nodes']
  }
})(Nodes)


