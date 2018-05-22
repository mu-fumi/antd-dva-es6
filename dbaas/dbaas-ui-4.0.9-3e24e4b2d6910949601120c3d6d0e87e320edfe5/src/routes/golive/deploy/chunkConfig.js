/**
 * Created by wengyian on 2018/2/27.
 */
import React from 'react'
import PropTypes from 'prop-types'
import {Row, Col, Input, message, Button, Tooltip, Checkbox, Form, Slider, Select} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, SliderInput,} from 'components'
import {routerRedux, Link} from 'dva/router'
import {classnames, Cache, convertMToG, constant, Logger} from 'utils'
import Json from 'utils/json'
import {validateChunkName} from 'services/deploy'
import _ from 'lodash'
import HostModal from './hostModal'
import styles from './create.less'

const FormItem = Form.Item

let uuid = 0;
class ChunkConfig extends React.Component {
  constructor(props) {
    super(props)
    // Logger.info('props===>', props)

    let existSelectedHost = []
    let chunk = props.chunk.length ?  props.chunk.map(v => {
      let slaveArr = v.slave ? v.slave.split(',') : []
      existSelectedHost = [...existSelectedHost, v.master, ...slaveArr]
      return {
        ...v,
        id: uuid++
      }
    }) : [{
      id: uuid++,
      name: '',
      master: '',
      slave: ''
    }]
    // Logger.info('existSelectedHost===>', existSelectedHost)
    const hostArr = props.host && props.host.map(v => {
      return v.name
    })
    const restHost = hostArr.filter(v => !existSelectedHost.includes(v))
    // Logger.info('restHost===> constructor', restHost)
    this.state = {
      chunk,
      host: Json.loads(Json.dumps(props.host)),
      restHost,
    }

    this.add = this.add.bind(this)
    this.remove = this.remove.bind(this)
    this.hostButton = this.hostButton.bind(this)
    this.showHostModal = this.showHostModal.bind(this)
    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    // Logger.info('nextProps===>', nextProps)
  }

  componentWillMount() {
    // Logger.info('this.state.chunk===>', this.state.chunk)
    this.getChunkConfig(this.state.chunk)
  }

  add() {
    let { chunk } = this.state
    chunk.push({
      id: uuid++,
      name: '',
      master: '',
      slave: ''
    })
    this.setState({
      chunk
    }, () => {
      this.getChunkConfig(chunk)
    })
  }

  remove(id) {
    let { chunk, restHost } = this.state
    const removeChunk = chunk.find(v => v.id === id)
    const removeChunkHost = [removeChunk.master, ...(removeChunk.slave.split(','))]
    let newRestHost = [...restHost, ...removeChunkHost]
    newRestHost = newRestHost.filter(v => v !== '')
    const newChunk = chunk.filter(v => v.id !== id)
    this.setState({
      chunk: newChunk,
      restHost: newRestHost
    }, () => {
      this.getChunkConfig(newChunk)
    })
  }

  hostButton(id, type) {
    return <Row className={styles["cursor-pointer"]} onClick={() => this.showHostModal(id, type)}>
      <IconFont type="plus"/>
    </Row>
  }

  showHostModal(id, type) {
    // 根据 id 和 type 找出已选则的 host，将其加入到 restHost 中
    const { chunk, restHost } = this.state
    const targetChunk = chunk.find(v => v.id === id)
    const host = targetChunk[type]
    const hostArr = host.split(',')
    const selectedHost = [...hostArr]
    let newRestHost = hostArr.length ? [ ...hostArr, ...restHost] : [...restHost]
    newRestHost = newRestHost.filter(v => v !== '')
    this.setState({
      hostModalVisible: true,
      hostKey: `${id}-_-${type}`,
      restHost: newRestHost,
      selectedHost
    })
  }

  getChunkConfig (chunk) {
    const newChunk = chunk.map(v => {
      return {
        name: v.name,
        master: v.master,
        slave: v.slave
      }
    })
    const { restHost } = this.state
    if (this.props.getChunkConfig) {
      this.props.getChunkConfig({
        chunkConfig: newChunk,
        restHost
      })
    }
  }

  handleOk(data) {
    const { preKey } = this.props
    const { hostKey, restHost, chunk } = this.state
    const key = hostKey
    const keyArr = key && key.split('-_-')
    const type = keyArr[1], id = keyArr[0]
    const formKey = preKey + '-_-' + 'chunk' + type.slice(0, 1).toUpperCase() + type.slice(1) + '-' + id
    const newRestHost = restHost.filter(v => !data.includes(v))
    // Logger.info('newRestHost===> ok', newRestHost)
    this.props.form.setFieldsValue({
      [formKey]: data ? data.join(',') : null
    })
    const index = chunk.findIndex(v => v.id === Number(id))
    const newChunk = Json.loads(Json.dumps(chunk))
    if (index > -1){
      newChunk[index][type] = data ? data.join(',') : ''
    }
    // Logger.info('chunk===>', chunk)
    // Logger.info('newChunk===>', newChunk)
    this.setState({
      hostModalVisible: false,
      restHost: newRestHost,
      chunk: newChunk
    }, () => {
      this.getChunkConfig(newChunk)
    })
  }

  handleCancel() {
    const { hostKey, restHost, chunk } = this.state
    const key = hostKey
    const keyArr = key && key.split('-_-')
    const type = keyArr[1], id = keyArr[0]
    const targetChunk = chunk.find(v => v.id === Number(id))
    const hostArr = targetChunk[type].split(',')
    let newRestHost = restHost
    hostArr.length && (newRestHost = restHost.filter(v => !hostArr.includes(v)))
    newRestHost = newRestHost.filter(v => v !== '')
    this.setState({
      hostModalVisible: false,
      restHost: newRestHost
    })
  }

  nameChange(id, e) {
    const value = e.target.value
    const { chunk } = this.state
    const targetChunk = chunk.find(v => v.id === Number(id))
    targetChunk.name = value
    this.setState({
      chunk
    }, () => {
      this.getChunkConfig(chunk)
    })
  }

  validateName(id, rule, value, callback) {
    const { chunk } = this.state
    if (value === '') {
      return callback('')
    } else {
      const repeatedIndex = chunk.findIndex(v => v.name === value && v.id !== id)
      // 本地不重名
      if (repeatedIndex > -1) {
       return callback('chunk 名不能重复')
      } else {
        // 服务端验证和已有的是否重名
        if (value.length >= 2) {
          const {cluster_name} = this.props
          validateChunkName({
            cluster_name,
            chunk: value
          }).then(res => {
            if (res.code === 0) {
              return callback()
            } else if (res.code === 1426) {
              return callback(res.msg || res.err)
            } else {
              message.error(res.msg || res.err)
              callback(res.msg || res.err)
            }
          })
        }
      }
      return callback()
    }
  }

  render() {
    const {form, formItemLayout, preKey, cluster_name} = this.props
    const {getFieldDecorator} = form
    const { chunk, hostModalVisible, restHost, hostKey, selectedHost = [] } = this.state
    // Logger.info('restHost===> render', restHost)
    const hostModalProps = {
      visible: hostModalVisible || false,
      host: restHost || [],
      onOk: this.handleOk,
      onCancel: this.handleCancel,
      hostKey: hostKey,
      selectedHost,
    }

    return (
      <Row className={styles.chunkConfig}>
        {
          restHost.length &&
          <Row>
            <Button onClick={this.add}><IconFont type="plus"/>添加一个chunk</Button>
          </Row>
        }
        {
          chunk.map((v, i) => {
            return (
              <Row key={v.id} className={styles.chunkItem}>
                <Col className={styles["chunkItem-content"]}>
                  <FormItem label="集群_chunk名" {...formItemLayout}>
                    { getFieldDecorator(`${preKey}-_-chunkName-${v.id}`, {
                      initialValue: v.name,
                      rules: [{
                        required: true,
                        message: 'chunk 名必填'
                      }, {
                        max : 50,
                        min: 2,
                        message : '最多输入50个字符, 最少输入2个字符'
                      }, {
                        pattern: /^[\w\-]+$/,
                        message: '只能输入字母、数字、破折号（-）以及下划线（_）'
                      }, {
                        validator: this.validateName.bind(this, v.id)
                      }],
                      onChange: this.nameChange.bind(this, v.id)
                    })(
                      <Input addonBefore={cluster_name + '_'}/>
                    )}
                  </FormItem>
                  <FormItem label="主库" {...formItemLayout}>
                    { getFieldDecorator(`${preKey}-_-chunkMaster-${v.id}`, {
                      initialValue: v.master,
                      rules: [{
                        required: true,
                        message: '主库必选'
                      }]
                    })(
                      <Input addonAfter={this.hostButton(v.id, 'master')} disabled={true}/>
                    )}
                  </FormItem>
                  <FormItem label="备库" {...formItemLayout}>
                    { getFieldDecorator(`${preKey}-_-chunkSlave-${v.id}`, {
                      initialValue: v.slave
                    })(
                      <Input addonAfter={this.hostButton(v.id, 'slave')} disabled={true}/>
                    )}
                  </FormItem>
                </Col>
                { i > 0 &&
                  <Col className={styles["chunkItem-icon"]} onClick={() => this.remove(v.id)}>
                    <Tooltip title="删除本行chunk">
                      <IconFont type="minus-circle-o"/>
                    </Tooltip>
                  </Col>
                }
              </Row>
            )
          })
        }
        <HostModal {...hostModalProps}/>
      </Row>
    )
  }
}

ChunkConfig.propTypes = {
  form: PropTypes.object,
  formItemLayout: PropTypes.object,
  host: PropTypes.array,
  chunk: PropTypes.array,
  preKey: PropTypes.string,
  getChunkConfig: PropTypes.func,
  cluster_name: PropTypes.string,
}

export default ChunkConfig
