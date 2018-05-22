/**
 * Created by wengyian on 2018/2/26.
 */
import Base from 'routes/base'
import React from 'react'
import {connect} from 'dva'
import PropTypes from 'prop-types'
import {DataTable, Filter, IconFont, StateIcon} from 'components'
import {Link, routerRedux} from 'dva/router'
import {Row, Col, Modal, message} from 'antd'
import {constant, classnames, Logger} from 'utils'
import styles from './index.less'
import Json from 'utils/json'

const confirm = Modal.confirm
const { CLUSTER_STATE_OPTIONS, QUORUM_CLUSTER_TYPE_OPTIONS } = constant

class QuorumCluster extends Base {
  constructor (props) {
    super(props)

    this.handleReload = this.handleReload.bind(this)
    this.showImportModal = this.showImportModal.bind(this)
    this.hideImportModal = this.hideImportModal.bind(this)
    this.confirmImp = this.confirmImp.bind(this)
    this.cancelImp = this.cancelImp.bind(this)
    this.handleFile = this.handleFile.bind(this)

    this.pageBtns = {
      element: () => {
        return (
          <Row>
            <Col className="pageBtn" onClick={this.showImportModal}>
              <a href="javascript:void(0);">
                <IconFont type="plus"/>批量导入
              </a>
            </Col>
            <Col className="pageBtn" onClick={this.handleReload}>
              <a href="javascript:void(0);">
                <IconFont type="reload"/>刷新
              </a>
            </Col>
          </Row>
        )
      }
    }

    this.push({
      type: 'quorumCluster/resetFilter',
      fire: [Base.WillUnmount]
    })
  }

  handleReload () {
    this.props.dispatch({
      type: 'quorumCluster/handleReload'
    })
  }

  showImportModal () {
    this.props.dispatch({
      type: 'quorumCluster/handleImpModalVisible',
      payload: true
    })
  }

  hideImportModal () {
    this.props.dispatch({
      type: 'quorumCluster/handleImpModalVisible',
      payload: false
    })
  }

  confirmImp () {
    const file = this.props.quorumCluster.file
    // Logger.info('file===>', file)
    if (file) {
      let data = new FormData()
      data.append('excel', file)
      this.props.dispatch({
        type: 'quorumCluster/importQuorum',
        payload: data
      })
    } else {
      message.error('上传文件不能为空')
    }
  }

  cancelImp () {
    this.hideImportModal()
  }

  handleFile (e) {
    // Logger.info('e.target.files==>', e.target.files)
    this.props.dispatch({
      type: 'quorumCluster/handleFile',
      payload: e.target.files[0]
    })
  }

  handleShowAllIP (isShow, id) {
    this.props.dispatch({
      type: 'quorumCluster/handleShowAllIP',
      payload: {
        isShow,
        id
      }
    })
  }

  render () {
    const { quorumCluster, dispatch } = this.props
    const { filter, reload, importModalVisible, showAllIP, modalKey } = quorumCluster
    const searchProps = [{
      placeholder: '根据集群名、配置信息、连接信息搜索',
      onSearch(value) {
        dispatch({
          type: 'quorumCluster/handleFilter',
          payload: {
            keywords: value
          }
        })
      }
    }]
    const selectProps = [{
      label: '状态',
      options: CLUSTER_STATE_OPTIONS,
      props: {
        onChange: (value) => {
          dispatch({
            type: 'quorumCluster/handleFilter',
            payload: {
              status: value
            }
          })
        }
      }
    }, {
      label: '类型',
      options: QUORUM_CLUSTER_TYPE_OPTIONS,
      props: {
        onChange: (value) => {
          dispatch({
            type: 'quorumCluster/handleFilter',
            payload: {
              type: value
            }
          })
        }
      }
    }]
    const filterProps = {
      searchProps,
      selectProps,
    }
    const columns = [{
      title: '名称',
      dataIndex: 'name'
    }, {
      title: 'IP',
      dataIndex: 'info',
      render: (text, record) => {
        const parseText = Json.loads(text)
        const ipList = parseText.iplist.split(',')
        if (ipList.length <= 0) {
          return '---'
        } else if (ipList.length === 1) {
          return ipList[0]
        } else {
          if (showAllIP[record.id]) {
            return (
              <Row>
                <Col className={styles["all-ip"]}>
                  {ipList.map(v => {
                    return <Row>{v}</Row>
                  })}
                </Col>
                <Col className={styles["minus-container"]} onClick={() => this.handleShowAllIP(false, record.id)}>
                  <IconFont type="minus-square-o"/>
                </Col>
              </Row>
            )
          } else {
            return (
              <Row>
                {ipList[0]}
                <IconFont type="plus-square-o" className={styles["plusIcon"]}
                  onClick={() => this.handleShowAllIP(true, record.id)}
                />
              </Row>
            )
          }

        }

      }
    }, {
      title: '状态',
      dataIndex: 'run_status',
      render: (text, record) => {
        return <StateIcon type={text}/>
      }
    }, {
      title: '类型',
      dataIndex: 'arch',
      render: (text, record) => {
        return Number(text) === 1 ? 'ChunkKeeper' : 'ZooKeeper'
      }
    }]

    const tableProps = {
      fetch: {
        url: '/quorum',
        data: filter
      },
      columns: columns,
      reload: reload,
      rowKey: 'id',
      rowSelection: {},
    }

    const importModalProps = {
      title: '批量导入仲裁集群配置',
      visible: importModalVisible,
      onOk: this.confirmImp,
      onCancel: this.cancelImp,
      key: modalKey
    }
    return (
      <Row className={styles.quorumCluster}>
        <Row className={styles["filter-container"]}>
          <Filter {...filterProps}/>
        </Row>
        <DataTable {...tableProps}/>
        <Modal {...importModalProps}>
          <Row>
            <Col span="12">
              <input className="ant-input" style={{padding:'2px 7px'}}
                type="file" onChange={this.handleFile}/>
            </Col>
            <Col span="8">
              <div className={styles['modal-download']}>
                <a href="/api/v2/quorum/download">下载导入模板</a>
              </div>
            </Col>
          </Row>
        </Modal>
      </Row>
    )
  }
}

QuorumCluster.propTypes = {
  quorumCluster: PropTypes.object,
  loading: PropTypes.bool,
  location: PropTypes.object,
  dispatch: PropTypes.func
}

export default connect((state) => {
  return {
    loading: state.loading.models['quorumCluster'],
    quorumCluster: state['quorumCluster']
  }
})(QuorumCluster)

