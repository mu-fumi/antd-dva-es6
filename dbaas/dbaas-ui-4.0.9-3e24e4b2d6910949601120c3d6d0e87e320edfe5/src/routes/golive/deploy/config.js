/**
 * Created by wengyian on 2017/8/16.
 */

import React from 'react'
import PropTypes from 'prop-types'
import {Row, Col, Input, Tabs, Modal, Button, Tooltip, Form, Collapse, Switch} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ConfigInput} from 'components'
import {routerRedux, Link} from 'dva/router'
import {classnames} from 'utils'
import _ from 'lodash'
import {constant, TimeFilter, Cache, Logger} from 'utils'
import HostModal from './hostModal'
import ChunkConfig from './chunkConfig'
import Json from 'utils/json'
import styles from './create.less'

const FormItem = Form.Item
const cache = new Cache()
const TabPane = Tabs.TabPane
const Panel = Collapse.Panel
const { MEMORY_ORDER } = constant


const formItemLayout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 12
  }
}

class Config extends React.Component {
  constructor(props) {
    super(props)

    let showVip = {}
    let showMaster = {}
    props.selectedService && props.selectedService.map(item => {
      /********20171215 服务的 visible 0 时不修改配置********/
      if (props.configList[item.id] && item.visible !== 0) {

        // 判断所选机器有没改变 如果有 清空所选主机备机
        let configItem = props.configList[item.id]
        // if(!_.isEqual(this.state.selectedService[i].host), item.host){
        //   console.log(222)
        // }

        const vipIndex = props.configList[item.id].findIndex(v => v.key === 'need_vip')
        if (vipIndex > -1 && !!Number(props.configList[item.id][vipIndex].value)) {
          showVip[item.id] = true
        } else {
          showVip[item.id] = false
        }
        const masterIndex = props.configList[item.id].findIndex(v => v.key === 'need_master')
        if (masterIndex > -1 && !!Number(props.configList[item.id][masterIndex].value)) {
          showMaster[item.id] = true
        } else {
          showMaster[item.id] = false
        }
      }
    })

    this.state = {
      configList: props.configList,
      selectedStack: props.selectedStack,
      deployInfo: props.deployInfo,
      selectedService: props.selectedService,
      showVip: showVip,
      showMaster,
    }

    this.prev = this.prev.bind(this)
    this.next = this.next.bind(this)
    this.showHostModal = this.showHostModal.bind(this)
    this.hostButton = this.hostButton.bind(this)
    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.configPane = this.configPane.bind(this)
    this.getChunkConfig = this.getChunkConfig.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    // 貌似不会执行
    // console.log('xxx')
    // let showVip = {}
    // if (!_.isEqual(nextProps.configList, this.state.configList) ||
    //   !_.isEqual(nextProps.selectedStack, this.state.selectedStack) ||
    //   !_.isEqual(nextProps.deployInfo, this.state.deployInfo) ||
    //   !_.isEqual(nextProps.selectedService, this.state.selectedService)
    // ) {
    //   console.log(111)
    //   nextProps.selectedService && nextProps.selectedService.map((item, i) => {
    //     if(nextProps.configList[item.id]){
    //       // 判断所选机器有没改变 如果有 清空所选主机备机
    //       let configItem = nextProps.configList[item.id]
    //       if(!_.isEqual(this.state.selectedService[i].host), item.host){
    //
    //       }
    //
    //       const index = nextProps.configList[item.id].findIndex(v => v.key === 'need_vip')
    //       if(index > -1 && !!Number(nextProps.configList[item.id][index].value)){
    //           showVip[item.id] = true
    //       } else{
    //         showVip[item.id] = false
    //       }
    //     }
    //   })
    //
    //   this.setState({
    //     configList: nextProps.configList,
    //     selectedStack: nextProps.selectedStack,
    //     deployInfo: nextProps.deployInfo,
    //     selectedService: nextProps.selectedService,
    //     showVip : showVip
    //   })
    // }
  }

  prev() {
    if (this.props.prev) {
      this.props.prev()
    }
  }

  handleShowVip(id, bool) {
    this.setState({
      showVip: {
        ...this.state.showVip,
        [id]: bool
      }
    })
  }

  handleShowMaster(id, formKey, bool) {
    this.setState({
      showMaster: {
        ...this.state.showMaster,
        [id]: bool
      }
    }, () => {
      // 让当前验证项强制通过
      // this.props.form.validateFields([`${formKey}-_-master`, `${formKey}-_-slave`], {force: true});
      // 不需要备库选择了
      this.props.form.validateFields([`${formKey}-_-master`], {force: true});
    })
  }

  hostButton(key) {
    return <Row className={styles["cursor-pointer"]} onClick={() => this.showHostModal(key)}>
      <IconFont type="plus"/>
    </Row>
  }

  showHostModal(key) {
    let service_id = key.split('-_-')[1]
    // 如果是 备库 剔除掉主库已选的机器
    let masterHost = ''
    if (key.includes('slave')) {
      const masterKey = key.slice(0, -5) + 'master'
      masterHost = this.props.form.getFieldValue(masterKey)
    }
    // console.log('masterHost===>', masterHost)
    let hostArr = []
    const index = this.state.selectedService.findIndex(v => Number(v.id) === Number(service_id))
    this.state.selectedService[index].host &&
    this.state.selectedService[index].host.forEach(val => {
      // if(val.machine_name != masterHost){
      // hostArr.push(val.machine_name)
      if (val.host_name !== masterHost) {
        hostArr.push(val.host_name)
      }
    })
    let selectedHost = this.props.form.getFieldValue(key)
    selectedHost = selectedHost ? selectedHost.split(',') : []
    this.setState({
      hostModalVisible: true,
      hostKey: key,
      hostArr,
      selectedHost,
    })
  }

  handleOk(data) {
    // 处理数据
    const key = this.state.hostKey
    // 如果是 主库 则删除掉备库里面的重复的值 主库的 data 是 string 所以可以直接用
    const keyArr = key.split('-_-')
    // 没有备库了 所以注释掉
    // if (keyArr[keyArr.length - 1] === 'master') {
    //   const slaveKey = key.slice(0, -6) + 'slave'
    //   const slaveHost = this.props.form.getFieldValue(slaveKey)
    //   const newSlaveHost = slaveHost.replace(data, '').replace(/^,|,&|,,/g, '')
    //   this.props.form.setFieldsValue({
    //     [slaveKey]: newSlaveHost
    //   })
    // }

    this.props.form.setFieldsValue({
      [key]: data ? data.join(',') : null
    })
    this.setState({
      hostModalVisible: false
    })
  }

  handleCancel() {
    this.setState({
      hostModalVisible: false
    })
  }

  getChunkConfig(data) {
    // console.log('getChunkConfig data===>', data)
    const {chunkConfig, restHost} = data
    this.setState({
      chunkConfig,
      restHost
    })
  }

  next() {
    const { memoryMarks, selectedService } = this.props

    this.props.form.validateFields((err, values) => {
      // Logger.info('values===>', values)
      let errTip = {}
      let canNext = true
      if (err) {
        // Logger.info('err===>', err)
        Object.keys(err).map(key => {
          const serviceName = key.split('-_-')[0].replace(/___/g, '.')
          const errKey = key.split('-_-')[2]
          err[key].errors.map((v, k) => {
            if(v.message) {
              errTip[serviceName] ? errTip[serviceName].push(v.message)
                : errTip[serviceName] = [v.message]
            }
          })
        })
        canNext = false
        // return false
      }
      // console.log('values===>', values)
      let newConfigList = _.cloneDeep(this.state.configList)
      // 遍历所有服务
      // 参数 表示是否已经赋值 chunk 了
      let hasChunkConfig = false
      Object.keys(values).map(val => {
        let serviceName = val.split('-_-')[0]
        let service_id = val.split('-_-')[1]
        let key = val.split('-_-')[2]
        let type = val.split('-_-')[3] //此项可能不存在 存在的应为 ： vip  master slave ...
        // 遍历统一服务下的所有配置项
        if (type === 'vip') {
          let index = newConfigList[service_id].findIndex(v => v.name === key)
          if (this.state.showVip[service_id]) {
            // 如果此时的 机器名已经存在在配置项中，就修改 不存在就新增
            if (index > -1) {
              newConfigList[service_id][index].vip = values[val]
            } else {
              newConfigList[service_id][newConfigList[service_id].length] = {
                name: key,
                vip: values[val],
                _key: 'vip'
              }
            }
          } else {
            // 如果 index > -1 说明有 newConfigList 里面已经有这项了 删除 =-1 就不用惯
            if (index > -1) {
              newConfigList[service_id].splice(index, 1)
            }
          }
        } else if (type === 'master' || type === 'slave') {
          // 没有备库选项了 可以直接注释掉吧

          // 只有当 need_master value 为 true 的时候才验证
          const needMaster = serviceName + '-_-' + service_id + '-_-need_master'
          const index = newConfigList[service_id].findIndex(v => v._key === 'master-_-slave')
          if (values[needMaster] === false || values[needMaster] === 0) {
            // delete
            /***********************20171128  修复bug************************************/
            /***********bug：选择主机后，下一步，在返回关闭配置主备选项，在下一步的时候会保存之前选择的主机*********************/
            if(index > -1){
              newConfigList[service_id].splice(index, 1)
            }
            /***************over****************/
            return
          }
          if (index > -1) {
            // newConfigList[service_id][index][type] = values[val]
            // // 验证主备重名的问题 主备机是否存在的错误 antd 的 err 已经处理了
            // const masterSlaveConfig = newConfigList[service_id][index]
            // if (masterSlaveConfig.master && masterSlaveConfig.slave) {
            //   const masterContent = masterSlaveConfig.master.trim()
            //   const slaveArr = masterSlaveConfig.slave.trim().split(',')
            //   // 已经排除 slave 为 '' 的情况 不会出现 [""]
            //   // 考虑靠 机器名可能出现 HCFDB1, HCFDB11 这种情况
            //   // 把备机改为数组 然后用字符串来 indexOf 数组内容 来判断是否重名
            //
            //   if (slaveArr.indexOf(masterContent) > -1) {
            //     errTip[serviceName] ?
            //       ( errTip[serviceName].indexOf('主机与备机重复') == -1 && errTip[serviceName].push('主机与备机重复'))
            //       : errTip[serviceName] = ['主机与备机重复']
            //     canNext = false
            //   }
            // }
            /********20171128 bug: 下一步后在上一步，修改了主机，在下一步 数据还是保存的之前的***************/
            /******** 将新值赋值 ***************/
            newConfigList[service_id][index][type] = values[val]
            /***************** over ******************/
          } else {
            const i = newConfigList[service_id].findIndex(v => v.key === 'need_master')
            if(i > -1){
              newConfigList[service_id].splice(i + 1, 0, {
                name: '主备关系',
                [type]: values[val],
                _key: 'master-_-slave'
              })
            }
          }
        } else { //如果不存在 type
          /********* 20180301 增加 chunk 的处理 **********/
          if (key === 'chunk') {
            const { chunkConfig, restHost } = this.state
            // Logger.info('chunkConfig===>', chunkConfig)
            if (!hasChunkConfig) {
              const targetIndex = newConfigList[service_id].findIndex(v => v._key === 'chunk')
              if (targetIndex > -1) {
                newConfigList[service_id][targetIndex] = {
                  name: 'chunk配置',
                  _key: 'chunk',
                  value: chunkConfig
                }
              } else {
                newConfigList[service_id].push({
                  name: 'chunk配置',
                  _key: 'chunk',
                  value: chunkConfig
                })
              }
              hasChunkConfig = true
              /****** 20180410 有 chunk 的配置 必须选完机器 *******/
              /****** 计算 chunk 使用的机器数 *******/
              // let chunkHostNum = 0
              // chunkConfig.forEach(v => {
              //   v.master && chunkHostNum++
              //   chunkHostNum += v.slave.split(',')
              // })
              // /****** 计算 service 存在的机器数 *******/
              // const targetChunkService = selectedService.find(v => v.id === Number(service_id))
              // let targetChunkServiceHostNum = 0
              // targetChunkService && (targetChunkServiceHostNum = targetChunkService.host.length)
              // /******* 比较两者数量 *****************/
              // if(chunkHostNum !== targetChunkServiceHostNum) {
              //   errTip[serviceName].push('')
              // }
              /***** 直接从 chunkConfig 组件里面拿出 restHost 不在自己计算了*****/
              if(restHost.length) {
                const msg = '请为 ' + restHost.join('，') + ' 分配所属Chunk及角色'
                let errService = serviceName.replace(/___/g, '.')
                errTip[errService] ? errTip[errService].push(msg)
                  : errTip[errService] = [msg]
                canNext = false
              }
            }
            return
          }
          for (let i = 0, length = newConfigList[service_id].length; i < length; i++) {
            // 如果当前 key 与 配置项的 key 相同
            if (key === newConfigList[service_id][i].key) {
              newConfigList[service_id][i].value = values[val]
              break
            }
          }
        }
      })
      if (!canNext) {
        // console.log('errTip===>', errTip)
        let content = Object.keys(errTip).map((key, index) => {
          return (
            <Row key={index}>
              <span>{key}：</span>
              {/*<span>{key.replace(/_/g, '.')}：</span>*/}
              <span>{errTip[key].join('，')}</span>
            </Row>
          )
        })
        Modal.error({
          title: '错误信息提示',
          content: content
        })
        return
      }
      // console.log('newConfigList===>', newConfigList)

      // 此处先不处理数据 等最后一步在统一处理为所需数据结构 只用存储到 redux 即可

      this.props.setConfig && this.props.setConfig(newConfigList)

      this.props.next && this.props.next()
    })
  }

  /******** 20180301 获取chunk 配置 *************/

  configPane(item, content) {
    let fixedConfig = []
    let editConfig = []

    // console.log('content===>', content)

    const {configList, deployInfo} = this.state
    const { form, memoryMarks, selectedService } = this.props
    const {getFieldDecorator} = form

    configList[item.id] && configList[item.id].map((val, index) => {
      /*******20171208 修复bug：fixedConfig 不显示，那就直接不渲染了算了********/
      if(val.protected === 1){
        return
      }
      /************** 不知道合适不 ***************/

      // const serviceName = item.name + '-_-' + item.version.replace(/\./g, '_')
      /*****************20171208 bug：antd 的 验证会从 . 位置截断，将 . 改为 ___*****************/
      const serviceName = item.name.replace(/\./g, '___')

      let value = val.value
      let disabled = !!val.protected

      // 将 switch 类型的值转换为 boolean
      if (val.type === 'switch') {
        value = !!Number(value)
      }


      // if (val.cluster_conf === 1) {
      //   //表示是内存 需要强制定义为 之前所选内存大小 改为：需要与前面数据库内存关联
      //   if (deployInfo.memory !== undefined) {
      //     // 转换出来的单位为 G 在对应的数组中位置为 1
      //     // 前面填写的内存 去掉单位
      //     let preMemory = parseInt(memoryMarks[deployInfo.memory])
      //     const mIndex = MEMORY_ORDER.indexOf(val.unit.toUpperCase())
      //     value = mIndex >= 1
      //       ? (preMemory * Math.pow(1024, mIndex - 1))
      //       : (preMemory / Math.pow(1024, mIndex - 1)).toFixed(2)
      //     // disabled = true
      //
      //   }
      // }

      // 不同类型的表单元素 需要的配置不一样
      let getFieldDecoratorOptions = {
        initialValue: value,
        rules: [{
          required: !!val.required,
          message: `${val.name}必填`
        }]
      }

      let configInputProps = {} //给 configInput 添加额外属性，现在只有 内存的 min max  额 端口也有范围了
      if(val.range !== null && val.range !== '' && val.range !== undefined){ //如果存在范围
        const min = val.range.split('-')[0]
        const max = val.range.split('-')[1]

        configInputProps = {
          min: Number(min),
          max: Number(max)
        }
      }

      if (val.name.includes('内存')) {//判断此配置项是否为内存项
        // _value 存取后端返回的范围
        val._value = val._value || value
        let min = val._value.split('-')[0]
        let max = val._value.split('-')[1] ? val._value.split('-')[1] : Infinity
        if (val.cluster_conf === 1) { //需要与前面数据库内存关联
          if (deployInfo.memory !== undefined) {
            // 转换出来的单位为 G 在对应的数组中位置为 1
            // 前面填写的内存 去掉单位
            let preMemory = parseInt(memoryMarks[deployInfo.memory])
            const mIndex = MEMORY_ORDER.indexOf(val.unit.toUpperCase())
            max = mIndex >= 1
              ? (preMemory * Math.pow(1024, mIndex - 1))
              : (preMemory / Math.pow(1024, mIndex - 1)).toFixed(2)
            // disabled = true
          }
        }
        const initialValue = value.split('-')[0]

        configInputProps = {
          min: Number(min),
          max: Number(max)
        }

        getFieldDecoratorOptions = {
          ...getFieldDecorator,
          initialValue: initialValue,
        }
      }

      if (val.type === 'switch') {
        getFieldDecoratorOptions = {
          ...getFieldDecoratorOptions,
          valuePropName: 'checked' //switch 需要设置这个
        }
      }
      if (val.key === 'need_vip') {
        getFieldDecoratorOptions = {
          ...getFieldDecoratorOptions,
          onChange: this.handleShowVip.bind(this, item.id),
        }
      }
      if (val.key === 'need_master') {
        getFieldDecoratorOptions = {
          ...getFieldDecoratorOptions,
          initialValue: !!Number(value),
          valuePropName: 'checked',
          onChange: this.handleShowMaster.bind(this, item.id, `${serviceName}-_-${item.id}-_-${val.key}`),
        }
      }

      // 判断是否需要有主备配置
      //  此处还需一个 val.value == 1 来决定是否显示
      let RowItem = ''
      if (val.key === 'need_master') {
        let target = configList[item.id].find(v => v._key === 'master-_-slave')
        let master = target ? target.master : ''
        let slave = target ? target.slave : ''
        let instanceShow = true
        if(val.type === 'inputSelect'){
          const service = selectedService.find(v => Number(v.id) === Number(item.id))
          if(service.host && service.host.length === 1){
            instanceShow = false
          }
        }
        RowItem = (
          <Row key={`${item.id}-_-${val.key}-_-master`}>
            {
              /*************** 20171128 实例必须配置主库 ***********************/
              /************** 根据 type *******************/
              /********** type 是 switch 就显示 switch + input *******************/
              /********** type 是 inputSelect 就只显示 主库选择的input *******************/
              /***************** 通过 display 来控制显示隐藏*************************/
            }
            {
            val.type === 'switch' &&
              <FormItem label={val.name} key={val.id} {...formItemLayout}>
                {
                  getFieldDecorator(`${serviceName}-_-${item.id}-_-${val.key}`, {
                    ...getFieldDecoratorOptions
                  })(
                    <ConfigInput type="switch" disabled={disabled}/>
                  )
                }
              </FormItem>}
            {
              instanceShow &&  <Row style={{display: this.state.showMaster[item.id] ? '' : 'none'}}>
                <FormItem label="主库" {...formItemLayout} className={styles["host-input"]}>
                  {getFieldDecorator(`${serviceName}-_-${item.id}-_-${val.key}-_-master`, {
                    initialValue: master,
                    rules: [{
                      required: this.state.showMaster[item.id],
                      message: '请选择主库'
                    }]
                  })(
                    <Input
                      // style={{width: '100%'}}
                      addonAfter={this.hostButton(`${serviceName}-_-${item.id}-_-${val.key}-_-master`)}
                      disabled={true}
                    />
                  )}
                </FormItem>
                {/*去掉备库*/}
                {/*<FormItem label="备库" {...formItemLayout}>*/}
                {/*{getFieldDecorator(`${serviceName}-_-${item.id}-_-${val.key}-_-slave`, {*/}
                {/*initialValue: slave,*/}
                {/*rules: [{*/}
                {/*required: this.state.showMaster[item.id],*/}
                {/*message: '请选择备库'*/}
                {/*}]*/}
                {/*})(*/}
                {/*<Input*/}
                {/*// style={{width: '100%'}}*/}
                {/*addonAfter={this.hostButton(`${serviceName}-_-${item.id}-_-${val.key}-_-slave`)}*/}
                {/*disabled={true}*/}
                {/*/>*/}
                {/*)}*/}
                {/*</FormItem>*/}
              </Row>
            }
          </Row>
        )
      } else if (val.key == undefined) { //指定的 vip 主备关系的配置信息 用户自己填的_key 不需要在另外生成ui
        return
      } //else if(val.key === 'need_master_salve_backup'){
      /***********20171208 实例组的配置主备从****************/
      /********** todo 怎么展示呢 有点尴尬啊 ************/
      /************ 被砍掉了 哈哈哈哈***************************/
     // }
      else if (val.key === 'chunk' && Number(val.value) === 1) {
        let target = configList[item.id].find(v => v._key === 'chunk')
        let chunk = []
        target && (chunk = target.value)
        const chunkConfigProps = {
          form,
          formItemLayout,
          host: item.host,
          chunk,
          preKey: `${serviceName}-_-${item.id}-_-${val.key}`,
          getChunkConfig: this.getChunkConfig,
          cluster_name: deployInfo.name
        }
        RowItem = <Row key={val.id}><ChunkConfig {...chunkConfigProps}/></Row>
      } else {
        RowItem = (
          <Row key={val.id}>
            <FormItem label={val.name} key={val.id} {...formItemLayout}>
              {
                getFieldDecorator(`${serviceName}-_-${item.id}-_-${val.key}`, {
                  ...getFieldDecoratorOptions
                })(
                  <ConfigInput type={val.type} disabled={disabled} {...configInputProps}/>
                )
              }
              {val.unit}
            </FormItem>
            { val.key === 'need_vip' ? content : ''}
          </Row>
        )
      }

      const isFixed = val.protected === 1
      isFixed ? fixedConfig.push(RowItem) : editConfig.push(RowItem)
    })
    // console.log('fixedConfig===>', fixedConfig)
    // console.log('editConfig===>', editConfig)

    // 如果没有可编辑配置 则显示无需配置
    if (editConfig && editConfig.length) {
      return (
        <Row>
          <Row>
            {editConfig}
          </Row>
          {/*新修改 不需要展示固定配置了*/}
          {/*<Row className={styles["overwrite-collapse"]} style={{display : 'none'}}>*/}
            {/*{*/}
              {/*fixedConfig.length ? (*/}
                {/*<Collapse>*/}
                  {/*<Panel header="固定配置：">{fixedConfig}</Panel>*/}
                {/*</Collapse>*/}
              {/*) : ''*/}
            {/*}*/}
          {/*</Row>*/}
        </Row>
      )
    }
    return <Row>此服务不需要配置</Row>
  }


  render() {
    const {form, memoryMarks} = this.props
    const {getFieldDecorator} = form

    const {
      configList, selectedStack, deployInfo, selectedService,
      hostModalVisible, hostArr, hostKey, selectedHost = [],
    } = this.state

    const stackName = selectedStack[0] && selectedStack[0].name
    const businessName = deployInfo.business && deployInfo.business.split('-_-')[0]
    const appName = deployInfo.app && deployInfo.app.split('-_-')[0]
    /********20171215 服务的 visible 0 时 服务不显示在已选中********/
      // const serviceName = deployInfo.service && deployInfo.service.map(v => {
      //       return v.split('-_-')[0]
      // }).join('，')

    const serviceName =  selectedService.length > 0
        && selectedService.filter( v => v.visible !== 0).map(v => v.name).join('，')
    // console.log('this.state===>', this.state)

    const hostModalProps = {
      visible: hostModalVisible || false,
      host: hostArr || [],
      onOk: this.handleOk,
      onCancel: this.handleCancel,
      hostKey: hostKey,
      selectedHost,
    }
    // console.log('hostModalProps===>', hostModalProps)

    // console.log('this.state===>', this.state)

    return (
      <Row>
        <Row className={styles["info-tip"]}>
          <span>已选套件： {stackName}，</span>
          <span className="mgl-8"
                style={{display : deployInfo.business !== undefined ? '' : 'none'}}>业务： {businessName}，</span>
          <span className="mgl-8"
                style={{display : deployInfo.app !== undefined ? '' : 'none'}}>应用： {appName}，</span>
          <span className="mgl-8"
                style={{display : deployInfo.name !== undefined ? '' : 'none'}}>名称： {deployInfo.name}</span>
          <span className="mgl-8"
                style={{display : deployInfo.memory !== undefined ? '' : 'none'}} >内存大小： {memoryMarks[deployInfo.memory]}，</span>
          <span className="mgl-8"
                style={{display : deployInfo.service !== undefined ? '' : 'none'}} >服务： {serviceName}</span>
        </Row>
        <Tabs tabPosition="left">
          {
            selectedService.map(item => {
              // console.log('item===>', item)
              // 判断是否需要 vip 主备关系
              /********20171215 服务的 visible 0 时不需要编辑配置********/
              if(item.visible === 0){
                return
              }

              let content = ''
              if (configList[item.id] && configList[item.id].findIndex(v => v.key === 'need_vip') > -1) {
                // this.setState({
                //   showVip : true
                // })
                // const serviceName = item.name + '-_-' + item.version.replace(/\./g, '_')
                const serviceName = item.name.replace('/\./g', '___')
                content = (<Row style={{display: (this.state.showVip[item.id] ? '' : 'none')}}>
                  {
                    item.host && Object.values(item.host).map((v, k) => {

                      // let label = <Tooltip title="主机的 vip">{v.machine_name}</Tooltip>
                      // let targetItem = configList[item.id].find(val => val.name == v.machine_name)
                      let label = <Tooltip title="主机的 vip">{v.host_name}</Tooltip>
                      let targetItem = configList[item.id].find(val => val.name === v.host_name)
                      return (
                        <Row key={v.host_name}>
                          <FormItem label={label} {...formItemLayout}>
                            {
                              getFieldDecorator(`${serviceName}-_-${item.id}-_-${v.host_name}-_-vip`, {
                                initialValue: targetItem ? targetItem.vip : '',
                              })(
                                <Input placeholder="请填写主机的vip"/>
                              )
                            }
                          </FormItem>
                        </Row>
                      )
                    })
                  }
                </Row>)
              }
              // console.log('content===>', content)
              // 未完待续

              return ( <TabPane key={item.id} tab={item.name}>
                <Form className={styles["config-form"]}>{
                  this.configPane(item, content)
                }
                </Form>
              </TabPane>)
            })
          }
        </Tabs>
        <HostModal {...hostModalProps}/>
        <Row className={classnames(styles["mgt-8"], 'text-right')}>
          <Button onClick={this.prev} className="mgr-16">上一步</Button>
          <Button type="primary" onClick={this.next}>下一步</Button>
        </Row>
      </Row>
    )

  }
}

Config.proptypes = {
  prev: PropTypes.func,
  next: PropTypes.func,
  setConfig: PropTypes.func,
  configList: PropTypes.array,
  selectedService: PropTypes.array,
  deployInfo: PropTypes.object,
  selectedStack: PropTypes.array
}

export default Form.create()(Config)
