/**
 * Created by wengyian on 2017/8/22.
 */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, Input, Icon, message, Button, Modal, Steps, Form, Tabs, Tooltip} from 'antd'
import {DataTable, Search, Filter, IconFont} from 'components'
import {classnames, constant, Cache, Logger} from 'utils'
import _ from 'lodash'
import  styles  from './create.less'
import TipModal from './tipModal'
import {routerRedux} from 'dva/router'

const {NODE_TYPE, QUORUM_TYPES} = constant
const cache = new Cache('cookie')

class Summary extends React.Component {
  constructor(props) {
    super(props)

    this.prev = this.prev.bind(this)
    this.submit = this.submit.bind(this)
    this.configTable = this.configTable.bind(this)
    this.convertToG = this.convertToG.bind(this)
  }

  componentWillReceiveProps(nextProps) {

  }

  configTable(config) {
    // let obj = JSON.parse(JSON.stringify(config))
    const { deployInfo } = this.props
    const cluster_name = deployInfo.name
    const columns = [{
      title: '配置项',
      dataIndex: 'configKey',
      width: '50%'
    }, {
      title: '值',
      dataIndex: 'configVal',
      width : '50%'
    }]
    let dataSource = []
    Object.keys(config).forEach(key => {
      if (config[key].conf !== 1 && config[key].protected !== 1) {
        if (config[key].key) {
          // 20180301 key === chunk 的也不需要显示
          if ((config[key].key === 'need_master' && config[key].type === 'inputSelect') || config[key].key === 'chunk') {
            return
          } else if (config[key].type === 'switch') {
            /*************20171207 修改 修改 true false 显示 为 是 否***********/
            const configVal = (config[key].value === '1' || config[key].value === true) ? '是' : '否'
            dataSource.push({
              id: key,
              configKey: config[key].name,
              configVal
            })
          } else {
            dataSource.push({
              id: key,
              configKey: config[key].name,
              configVal: String(config[key].value) + config[key].unit
            })
          }
        } else if (config[key]._key) {
          if (config[key]._key === 'vip') {
            dataSource.push({
              id: key,
              configKey: config[key].name,
              configVal: config[key].vip
            })
          } else if (config[key]._key === 'master-_-slave') {
            dataSource.push({
              id: key,
              configKey: config[key].name,
              configVal: '主库：' + config[key].master
              // 备库没有了
              // configVal: '主库：' + config[key].master + '，备库：' + config[key].slave
            })
          } else if (config[key]._key === 'chunk') {
            const newDataSource = config[key].value.map((v, i) => {
              return {
                id: key + '_' + i,
                configKey: config[key].name.slice(0, 5) + (i + 1) + config[key].name.slice(5),
                configVal: <Row><Row>名称：{cluster_name + '_' + v.name}</Row><Row>主库：{v.master}</Row>{v.slave && <Row>备库：{v.slave}</Row>}</Row>
              }
            })
            // Logger.info('newDataSource===>', newDataSource)
            newDataSource.length && (dataSource = dataSource.concat(newDataSource))
            // Logger.info('dataSource==>', dataSource)
          }
          // console.log('congfig[key]===>', config[key])
        }

      }
    })
    // console.log('dataSource===>', dataSource)
    const tableProps = {
      columns,
      dataSource,
      size: 'small',
      pagination: false,
      rowKey: 'id',
      bordered: true,
      locale: {
        emptyText: '无需配置'
      }
    }

    if (dataSource.length === 0) {
      return <Row className="text-center">无需配置</Row>
    } else {
      return <DataTable {...tableProps}/>
    }
  }

  prev() {
    this.props.prev && this.props.prev()
  }

  convertToG(val, unit) {
    if (unit === undefined) {
      const newVal = parseFloat(val)
      unit = val.replace(newVal, '')
      val = newVal
    }
    let returnDate = val
    switch (unit.toUpperCase()) {
      case 'M' :
        returnDate = val / 1024
        break
      case 'G' :
        returnDate = val
        break
    }
    return returnDate
  }

  submit() {
    // 整理所有数据成后台需要的结构
    const {selectedStack, selectedService, deployInfo, configList, memoryMarks} = this.props

    const service = selectedService.map(value => {
      let conf = {}
      let host = value.host ? value.host.map(val => {
        // type  1: 主机 2：备机 3：网关 没有主备关系也是1
        // pname 默认都是0 备机则为对应主机名
        /*********20171212 修改：type 根据类型来决定显示*************/
        /*********** 现在新增了 GATEWAY ************/

        let type = NODE_TYPE['MASTER']
        switch (value.name.toUpperCase()){
          case "ZABBIX-AGENT" :
            type = NODE_TYPE['ZABBIX_AGENT']
                break
          case "GATEWAY FOR SET" :
            type = NODE_TYPE['GATEWAY']
        }
        return {
          // name : val.machine_name,
          name: val.host_name,
          vip: '',
          pname: 0,
          type: type
        }
      }) : []
      /*********** 20171222 修复服务隐藏情况下 参数处理出错 ************/
      // if(value.visible === 0){
      //   conf = {...configList[value.id]}
      // }else{
        configList[value.id] && configList[value.id].forEach(item => {
          /********20171215 服务的 visible 0 时不需要展示********/
          if (item.key) {
            if (item.type === 'switch') { // 将 true false 转为 1， 0  有可能没经历过修改 后台给的值 就是 '0'
              conf[item.key] = (item.value !== false && item.value !== '0' && item.value !== 0) ? 1 : 0
            } else {
              if (item.name.includes('内存')) {
                const {memory} = deployInfo
                let newMemory = ''
                // console.log('item===>', item)
                if (item.cluster_conf === 1) {
                  newMemory = this.convertToG(memoryMarks[memory])
                } else {
                  newMemory = this.convertToG(item.value, item.unit)
                }
                // console.log('newMemory===>', newMemory)
                conf[item.key] = newMemory
              } else {
                conf[item.key] = item.value
              }
            }
          } else if (item._key) {
            if (item._key === 'vip') {
              const index = host.findIndex(v => v.name == item.name)
              index > -1 && (host[index].vip = item.vip)
            }
            if (value.name.toUpperCase() !== 'ZABBIX_AGENT') {
              if (item._key === 'master-_-slave') {
                // let {master, slave} = item
                // const slaveArr = slave.split(',')
                // host.forEach((val, index, arr) => {
                //   if (slaveArr.includes(val.name)) {
                //     val.pname = master
                //     val.type = 2
                //   }
                // })
                let {master} = item
                host.forEach((val, index, arr) => {
                  // 本身是主机 那就不管 是备机 就改 type 为2 pname 为 主机
                  if (val.name !== master) {
                    val.pname = master
                    val.type = NODE_TYPE['SLAVE']
                  }
                })
              }
              /****** 20180301 处理 _key 为 chunk 的东西*******/
              if (item._key === 'chunk') {
                const chunkValue = item.value // [{master: '', slave: ''}]
                chunkValue.length && chunkValue.map( v => {
                  const { master, slave, name } = v
                  const masterIndex = host.findIndex(val => val.name === master)
                  masterIndex > -1 && (host[masterIndex].chunk = deployInfo.name + '_' + name)
                  masterIndex > -1 && (host[masterIndex].type = NODE_TYPE['MASTER'])
                  const slaveArr = slave.split(',')
                  slaveArr.forEach(val => {
                    const slaveIndex = host.findIndex(value => value.name === val)
                    slaveIndex > -1 && (host[slaveIndex].chunk = deployInfo.name + '_' + name)
                    slaveIndex > -1 && (host[slaveIndex].type = NODE_TYPE['SLAVE'])
                    slaveIndex > -1 && (host[slaveIndex].pname = master)
                  })
                })
              }
              // Logger.info('host===>', host)
            }
          }
        })
      // }


      // console.log('host===>', host)
      // console.log('conf===>', conf)

      // const conf = configList[val.id].filter(v => v.key)
      // console.log('conf===>', conf)
      // const vip = ''
      // const host = ''

      return {
        id: value.id,
        conf: conf,
        host: host,
      }
    })

    const quorumParams = Object.keys(QUORUM_TYPES)
    let quorum = {}
    quorumParams.forEach( v => {
      if(deployInfo[v] !== undefined){
        const id = deployInfo[v].split('-_-')[1]
        quorum[QUORUM_TYPES[v]] = id
      }
    })

    let data = {
      user_id: cache.get('uid'),
      app_id: deployInfo.app.split('-_-')[1],
      business_id: deployInfo.business.split('-_-')[1],
      stack_id: selectedStack[0].id,
      cluster_name: deployInfo.name,
      description: deployInfo.description || '',
      cluster_memory: memoryMarks[deployInfo.memory],
      service: service
    }

    if(!_.isEmpty(quorum)){
      data = {quorum, ...data}
    }

    // console.log('data===>', data)

    this.props.setSpinning
    && this.props.setSpinning(true)

    this.props.submitDeploy &&
    this.props.submitDeploy(data)
  }

  render() {

    const {
      selectedStack, selectedService, deployInfo, configList,
      tipModalVisible, toggleTipModalVisible, memoryMarks, goIndex
    } = this.props

    let host = selectedService.map(item => {
      item.host && item.host.map(v => v.name).join('， ')
    })

    let tableRows = 0
    // 每个服务配置多长
    let serviceRows = {}
    // 选了几个服务
    /********20171215 服务的 visible 0 时不需要展示********/
    // let serviceLength = selectedService.length
    let serviceLength = selectedService.filter(v => v.visible !== 0).length
    Object.keys(configList).forEach(key => {
      const service = selectedService.find(v => v.id == key)
      /********20171215 服务的 visible 0 时不需要展示********/
      const { name, visible} = service
      if(visible !== 0){
        serviceRows[name] = 0
        configList[key].forEach(v => {
          if (v.protected !== 1) {
            // 不显示 key chunk 的那列
            if (v.key !== 'chunk') {
              tableRows++
              serviceRows[name]++
            }
            // chunk 的需要根据chunk 的数量来决定
            if (v._key === 'chunk') {
              const length = v.value.length
              tableRows += length
              serviceRows[name] += length
            }
          }
        })
      }
    })
    // console.log('tableRows===>', tableRows)
    // console.log('serviceRows===>', serviceRows)

    let columns = [{
      title: '名称',
      dataIndex: 'name',
      width : 250,
      render: (text, row, index) => {
        let obj = {
          children: text,
          props: {
            rowSpan: 0
          }
        }
        if (index == 0) {
          obj.props.rowSpan = serviceLength || 1
        }
        return obj
      }
    }, {
      title: '业务',
      dataIndex: 'business',
      render: (text, row, index) => {
        let obj = {
          children: text,
          props: {
            rowSpan: 0
          }
        }
        if (index == 0) {
          obj.props.rowSpan = serviceLength || 1
        }
        return obj
      }
    }, {
      title: '应用',
      dataIndex: 'app',
      render: (text, row, index) => {
        let obj = {
          children: text,
          props: {
            rowSpan: 0
          }
        }
        if (index == 0) {
          obj.props.rowSpan = serviceLength || 1
        }
        return obj
      }
    }, {
      title: '套件',
      dataIndex: 'stack',
      render: (text, row, index) => {
        let obj = {
          children: text,
          props: {
            rowSpan: 0
          }
        }
        if (index == 0) {
          obj.props.rowSpan = serviceLength || 1
        }
        return obj
      }
    },
      //   {
      //   title : '数据库内存',
      //   dataIndex : 'memory',
      //   render : (text, row, index) => {
      //     let obj = {
      //       children : text,
      //       props : {
      //         rowSpan : 0
      //       }
      //     }
      //     if(index == 0){
      //       obj.props.rowSpan = serviceLength || 1
      //     }
      //     return obj
      //   }
      // },
      //   {
      //   title : '描述',
      //   dataIndex : 'description',
      //   render : (text, row, index) => {
      //     let obj = {
      //       children : text,
      //       props : {
      //         rowSpan : 0
      //       }
      //     }
      //     if(index == 0){
      //       obj.props.rowSpan = serviceLength || 1
      //     }
      //     return obj
      //   }
      // },
      {
        title: '服务',
        dataIndex: 'service',
      }, {
        title: '主机',
        dataIndex: 'host',
        render: (text, row, index) => {
          return text.join('，')
        },
        className: styles["break-word"],
        width: 200
      }, {
        title: '服务配置',
        dataIndex: 'config',
        className: styles["config-table"],
        render: (text, record, index) => {
          return this.configTable(text, record.host)
        }
      }]

    /*************20171211 需求：基本信息分模板加载****************/
    /*************20171211 有些数据没有了 需要删掉 ****************/
    const dynamicColums = ['business', 'name', 'app', 'memory', 'service',
      'description']
    dynamicColums.forEach( v => {
      if(deployInfo[v] === undefined){
        const index = columns.findIndex(val => val.dataIndex === v)
        index > -1 && columns.splice(index, 1)
      }
    })

    const dataSource = []
    selectedService.forEach((v, i) => {
      /********20171215 服务的 visible 0 时不需要展示********/
      if(v.visible !== 0){
        dataSource.push({
          id: v.id,
          name: deployInfo.name,
          business: deployInfo.business && deployInfo.business.split('-_-')[0],
          app: deployInfo.app && deployInfo.app.split('-_-')[0],
          stack: selectedStack[0] && selectedStack[0].name,
          memory: memoryMarks[deployInfo.memory],
          description: deployInfo.description,
          service: v.name,
          host: v.host ? v.host.map(v => v.host_name) : [],
          config: configList[v.id]
        })
      }
    })
    // console.log('dataSource===>', dataSource)

    const tableProps = {
      rowKey: 'id',
      columns: columns,
      dataSource,
      bordered: true,
      pagination: false,
      locale: {
        emptyText: '无需配置'
      },
      className: styles["txt-c-table"]
    }

    const tipModalProps = {
      title: '任务提示：',
      onOk: () => {
        toggleTipModalVisible()
        /***** 20171221 routerRedux 需要走dispatch *******/
        /***** 所以走方法传入*******/
        goIndex()
      },
      visible: tipModalVisible,
      content: '部署任务已提交后台执行，您可以稍候在部署历史列表查看进度及结果'
    }

    return (
      <Row>
        <DataTable {...tableProps}/>
        <Row className={classnames("text-right", styles["mgt-16"])}>
          <Button className="mgr-16" onClick={this.prev}>上一步</Button>
          <Button type="primary" onClick={this.submit}>部署</Button>
        </Row>
        <TipModal {...tipModalProps}/>
      </Row>

    )
  }
}

Summary.propTypes = {
  prev: PropTypes.func,
  submitDeploy: PropTypes.func,
  setSpinning: PropTypes.func,
  selectedStack: PropTypes.array,
  selectedService: PropTypes.array,
  configList: PropTypes.object,
  deployInfo: PropTypes.object,
  tipModalVisible: PropTypes.bool,
  toggleTipModalVisible: PropTypes.func,
  goIndex: PropTypes.func,
}

export default Summary


{/* <Row>
 <Row>
 <span className={styles["font-bold"]}>名称：</span> {deployInfo.name}
 </Row>
 <Row>
 <span className={styles["font-bold"]}>内存：</span> {memoryMarks[deployInfo.memory]}
 </Row>
 <Row>
 <span className={styles["font-bold"]}>描述：</span> {deployInfo.description || '无'}
 </Row>
 <Row>
 <span className={styles["font-bold"]}>套件：</span> {selectedStack[0] && selectedStack[0].name}
 </Row>
 <Row>
 <span className={styles["font-bold"]}>版本：</span> {selectedStack[0] && selectedStack[0].version}
 </Row>
 <Row>
 {
 selectedService.map((item, key) => {
 return (
 <Row key={key}>
 <Row><span className={styles["font-bold"]}>服务：</span> {item.name}</Row>
 <Row>
 <Row><span className={styles["font-bold"]}>机器：</span> {item.host ? item.host.map( v => v.machine_name ).join('， ') : '不需要配置机器'}</Row>
 <Row>
 <Col><span className={styles["font-bold"]}>服务配置：</span> </Col>
 <Col>{
 configList[item.id].length ? configList[item.id].map((v, k) => {
 // if(v.key == 'need_master'){return ''}
 return (
 <Row key={k}>
 <span>{v.name}：</span>
 <span>{
 // v.key 表示是后台传过来的配置项 v._key 是我自己加的配置项
 v.key ? (v.value !== undefined ? v.value.toString() + v.unit : '')
 : ( v._key == 'vip' ? v.vip
 : v._key == 'master-_-slave' ? '主机：' + v.master + "，备机：" + v.slave
 : '' )
 }</span>
 </Row>
 )
 })
 :(<Row>无</Row>)
 }</Col></Row>
 </Row>
 </Row>
 )
 })
 }
 </Row>
 <Row className="text-right">
 <Button className="mgr-16" onClick={this.prev}>上一步</Button>
 <Button type="primary" onClick={this.submit}>部署</Button>
 </Row>
 </Row>*/
}
