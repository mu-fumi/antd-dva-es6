/**
 * Created by wengyian on 2017/9/4.
 */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, message, Button, Modal, Tooltip, Form, Tabs, Badge, Progress} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, HostFilter} from 'components'
import {routerRedux, Link} from 'dva/router'
import {classnames, Cache, constant, Logger} from 'utils'
import Json from 'utils/json'
import _ from 'lodash'
import styles from './create.less'
import IPModal from 'routes/cmdb/host/ipModal'
import HostComponent from './hostComponent'

const FormItem = Form.Item
const TabPane = Tabs.TabPane
const {HOST_STATUS, HOST_TYPE} = constant

class Host extends React.Component{
  constructor(props){
    super(props)

    let hostObj = {}
    let keywords = {}
    /******** 20180109 下一步之后保留筛选条件 *******/
    let pages = {}
    JSON.parse(props.selectedService).forEach(item => {
      /**********20171215 新增 visible 0 不显示 1 显示************/
      /********** visible 0 的时候 服务对应的主机配置都不用修改 所以不渲染*********/
      if(item.visible !== 0){
        let key = item.name + '-_-' + item.version + '-_-' + item.id
        // 如果存在 就赋值给hostObj
        hostObj[key] = item.host || []
        // keywords[key] = ''
         keywords[key] = item.keyword || ''
         pages[key] = item.page || 1
      }
    })

    /******************20171130 修改：实例还是变回了单选 *******************/
    /********************20171128 修改：实例可以多选主机 去掉单选***************************/
    // 如果是实例 只能选择一台机器 其他随意
    let isInstance = false
    if(props.selectedStack && props.selectedStack[0].tag == '实例'){
      isInstance = true
    }
    /***********************over**************************/

    this.state = {
      hostObj,
      selectedService : Json.loads(props.selectedService),
      selectedStack : props.selectedStack,
      /******************20171130 修改：实例还是变回了单选 *******************/
      /********************20171128 修改：实例可以多选主机 去掉单选***************************/
      isInstance,
      /***********************over**************************/
      keywords,
      showTip : false, //显示需要添加机器的参数
      pages, // 每个服务筛选条件的页码
    }

    this.content = this.content.bind(this)
    this.next = this.next.bind(this)
    this.prev = this.prev.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.checkMax = this.checkMax.bind(this)
    this.showIPModal = this.showIPModal.bind(this)
    this.handleIPCancel = this.handleIPCancel.bind(this)
    this.changeSelect = this.changeSelect.bind(this)
    this.handlePage = this.handlePage.bind(this)
    // this.onSelected = this.onSelected.bind(this)
    // this.onSelectedAll = this.onSelectedAll.bind(this)
    // this.showHostFilter = this.showHostFilter.bind(this)
    // this.hostFilterOk = this.hostFilterOk.bind(this)
  }

  componentWillReceiveProps(nextProps){
    // 貌似不会执行
    // if(!_.isEqual(nextProps.selectedService, this.state.selectedService) ||
    //   !_.isEqual(nextProps.selectedStack, this.state.selectedStack)
    // ){
    //   let hostObj = {}
    //   nextProps.selectedService.forEach(item => {
    //     let key = item.name + '-_-' + item.version + '-_-' + item.id
    //     // 如果存在 就赋值给hostObj
    //     hostObj[key] = item.host || []
    //   })
    //
    //   // 如果是实例 只能选择一台机器 其他随意
    //   let isInstance = false
    //   if(nextProps.selectedStack && nextProps.selectedStack[0].tag == '实例'){
    //     isInstance = true
    //   }
    //
    //   this.setState({
    //     hostObj : hostObj,
    //     selectedService : nextProps.selectedService,
    //     selectedStack : nextProps.selectedStack,
    //     isInstance,
    //   })
    // }
  }

  /***********20171122 table 列相关****************/
  showIPModal(hostIP) {
    if (this.props.showIPModal) {
      this.props.showIPModal(hostIP)
    }
  }

  handleIPCancel() {
    if (this.props.handleIPCancel) {
      this.props.handleIPCancel()
    }
  }
  /*****************over**********************/

  next(){
    // 验证错误
    let { hostObj, selectedService, keywords, pages } = this.state

    let errTip = {}
    let canNext = true
    Object.keys(hostObj).forEach(key => {
      let serviceName = key.split('-_-')[0]
      let serviceId = key.split('-_-')[2]
      const index = selectedService.findIndex( v => Number(v.id) === Number(serviceId))
      if (index < 0) {return}
      // const lestHost = selectedService.filter(v => v.id == serviceId)[0].need_host

      /******************20171130 修改：实例还是变回了单选 *******************/
      /******************20171128 修改：实例也要可以多选机器**********************/
      // 因为实例时 我修改了 选择主机 为单选 所以最多只能选到一台 无需在判断大于1台的情况
      /***********************20171128 所以上面这行注释没用了 哈哈哈*******************/
      /********************20171130 你高兴的太早了 哈哈 我回来了 ****************/
      // 集群 对上限无要求 只用比最少数多即可
      const minHost = selectedService[index].need_host.split('-')[0]
      // if(selectedService[index].need_host > 0){
      if(minHost > 0){
        // 新增 最大节点数量提示 修改了 need_host 格式 由 num  变成了 min-max或者 num
        // if(hostObj[key].length < selectedService[index].need_host){
        if(hostObj[key].length < minHost){
          errTip[serviceName] == undefined && (errTip[serviceName] = [])
          const prefixErr = this.state.isInstance ? '' : '至少'
          // errTip[serviceName].push(`${prefixErr}需要配置${selectedService[index].need_host}台机器`)
          errTip[serviceName].push(`${prefixErr}需要配置${minHost}台机器`)
          canNext = false
        }else{
          selectedService[index].host = [...hostObj[key]]
          /********* 20180109 *********/
          selectedService[index].keyword = keywords[key]
          selectedService[index].page = pages[key]
        }
      }
      // 当 need_host 为0 的时候 没有选机器这样 所以不需要去配置这个信息了
      // 先注释掉吧 也许以后有用
      // else{
      //   selectedService[serviceId].host = [...hostObj[key]]
      // }
    })

    if(!canNext){
      const content = Object.keys(errTip).map((key, index) => {
        const service = key.split('-_-')[0]
        return (
          <Row key={index}>
            <span>{service}：</span>
            <span>{errTip[key]}</span>
          </Row>
        )
      })
      Modal.error({
        title : '错误提示',
        content : content
      })
      return
    }

    // 当新选择了机器时 需要把配置里面有主备配置的一项清空 不让主备配置里面出现没有的机器
    const propsService = JSON.parse(this.props.selectedService)
    this.state.selectedService.map((item, i) => {
      if(!_.isEqual(item.host, propsService[i].host)){
        if(this.props.clearMasterSlave){
          this.props.clearMasterSlave(item.id)
        }
        if(this.props.clearChunkConfig) {
          this.props.clearChunkConfig(item.id)
        }
      }
    })

    this.props.setSelectedServiceHost
    && this.props.setSelectedServiceHost(this.state.selectedService)
    this.props.next && this.props.next()
    // 将 state 中的 hostObj 赋值到 selectedService 中
  }

  prev(){
    this.props.prev && this.props.prev()
  }

  checkMax(id, length){//服务id， 机器数量
    const selectedService = Json.loads(this.props.selectedService)
    const service = selectedService.find(v => v.id ===  Number(id))
    if(service){
      const {need_host, name} = service
      let max = need_host.split('-')[1]
      if(max){
        if(length > Number(max)){
          message.warning(`机器超过${max}台可能会使集群性能下降`, 1 )
        }
      }
    }
  }

  /******* 20171218 合并onSelected 和 onSelectedAll *******/
  changeSelect(serviceKey, selected, changeRows){
    let isMysql= serviceKey.toLowerCase().includes('mysql')
    let nodeguardKey = Object.keys(this.state.hostObj).find( v => v.toLowerCase().includes('nodeguard'))
    let nodeguardHostList = []
    if(isMysql && nodeguardKey){
      nodeguardHostList = [...this.state.hostObj[nodeguardKey]]
    }

    /******* 20180328 hcf2.0 的 spider 和 gateway 是相互关联的 *********/
    let isSpider = serviceKey.toLowerCase().includes('spider_gateway')
    let gatewayAgentKey = Object.keys(this.state.hostObj).find( v => v.toLowerCase().includes('gateway_agent'))
    let gatewayAgentHostList = []
    if(isSpider && gatewayAgentKey){
      gatewayAgentHostList = [...this.state.hostObj[gatewayAgentKey]]
    }

    let zabbixKey =  Object.keys(this.state.hostObj).find(v => v.toLowerCase().includes('zabbix-agent'))
    let zabbixHostList = []
    if (zabbixKey) {
      // 找到 zabbix 服务的 hostObj key
      zabbixHostList = [...this.state.hostObj[zabbixKey]]
    }

    let oldHostList = [...this.state.hostObj[serviceKey]]
    if(this.state.isInstance){
      oldHostList = selected ? changeRows : []
      /**************** 20171122 新增：zabbix 服务 主机默认选上，而且禁止操作 **************/
      // 新增的也加入到 zabbix中，如果不重复加入，重复的不加
      if(zabbixKey){
        zabbixHostList = selected ? changeRows : []
      }
    }else{
      if(selected){
        oldHostList.push(...changeRows)
        /*************20171207 新增：nodeguard 和 mysql 关联**************/
        if(isMysql && nodeguardKey){
          nodeguardHostList.push(...changeRows)
        }

        /********* 20180328 spider_gateway 和 gateway_agent 关联 ***********/
        if(isSpider && gatewayAgentKey){
          gatewayAgentHostList.push(...changeRows)
        }

        /**************** 20171122 新增：zabbix 服务 主机默认选上，而且禁止操作 **************/
        // 新增的也加入到 zabbix中，如果不重复加入，重复的不加
        changeRows.forEach(v => {
          if(zabbixKey && zabbixHostList.find(val => val.id === v.id) === undefined){
            zabbixHostList.push(v)
          }
        })
        /**************************over*************************/
      }else{
        if(zabbixKey){
          zabbixHostList = [...this.state.hostObj[zabbixKey]]
        }


        /************20171207 修复： 删除zabbix所选时，需要判断除了当前操作服务外别的服务是否有选此主机***************/
        /************ 针对mysql 和 nodeguard 两者数据一样 不用再判断 nodeguard 的情况了 ***************/
        /************ 主要是为了避免 取消选择 mysql 时，nodeguard 的还未反馈到数据中，会影响 zabbix 的数据 ***************/
        /************ 20180308 主要是为了避免 取消选择 spider_gateway 时，gateway_agent 的还未反馈到数据中，会影响 zabbix 的数据 ***************/
        let otherHostKey = Object.keys(this.state.hostObj).filter(v => {
          return v.toLowerCase().includes('zabbix-agent') === false
            && v !== serviceKey
            && v.toLowerCase().includes('nodeguard') === false
            && v.toLowerCase().includes('gateway_agent') === false
        })

        // 遍历所有变化的主机
        changeRows.forEach(val => {
          oldHostList = oldHostList.filter(v => v.id != val.id)
          /*************20171207 新增：nodeguard 和 mysql 关联**************/
          if(isMysql && nodeguardKey){
            nodeguardHostList =  nodeguardHostList.filter(v => v.id != val.id)
          }
          /*************20170328 新增：gateway_agent 和 spider_gateway 关联**************/
          if(isSpider && gatewayAgentKey){
            gatewayAgentHostList =  gatewayAgentHostList.filter(v => v.id != val.id)
          }
          // 针对zabbix 如果别的服务里面还有这个 就不用删除，如果没有 就删除
          if(zabbixKey){
            let hasRecord = false
            for(let i = 0; i < otherHostKey.length; i++){
              for(let k = 0; k < this.state.hostObj[otherHostKey[i]].length; k++){
                if(this.state.hostObj[otherHostKey[i]][k].id === val.id){
                  hasRecord = true
                  break
                }
              }
              if(hasRecord){
                break
              }
            }
            !hasRecord && (zabbixHostList = zabbixHostList.filter( v => v.id != val.id))
          }
        })
      }
    }

    const serviceId = serviceKey && serviceKey.split('-_-')[2]
    this.checkMax(serviceId, oldHostList.length)

    let editHostObj = {
      [nodeguardKey] : nodeguardHostList,
      [serviceKey] : oldHostList,
      [zabbixKey] : zabbixHostList,
      /********** 20180328 gateway_agent 关联了 spider_gateway **********/
      [gatewayAgentKey] : gatewayAgentHostList
    }
    zabbixKey || (delete editHostObj[zabbixKey])
    /**********此处用 短路时 页面显示有问题 不知道为啥 *********/
    if(!(isMysql && nodeguardKey)){
      delete editHostObj[nodeguardKey]
    }

    /****** 20180328 如果不是spider_gateway 就删掉 *******/
    if(!(isSpider && gatewayAgentKey)){
      delete editHostObj[gatewayAgentKey]
    }

    this.setState({
      hostObj : {
        ...this.state.hostObj,
        ...editHostObj
      }
    })
  }

  onSelected(serviceKey, record, selected, selectedRows){
    // 所以用 record 来记录 这个是操作的行的数据
    // 如果 selected 为 true 就加入到对应数组 否则就从对应数组踢出相应数组
    // 如果 selected 为false, 并且 serviceKey 不是 zabbix服务， 那么在 已选zabbix 中删除这个机器(如果有zabbix)
    /******* 20171218 合并onSelected 和 onSelectedAll *******/
    this.changeSelect(serviceKey, selected, [record])

    //
    // /*************20171207 新增：nodeguard 和 mysql 关联**************/
    // /************* 选了 mysql 就把 nodeguard 也给选上 **************/
    // /*************  实例里面不会出现 nodeguard 和 mysql 同时出现的情况 **************/
    // let isMysql= serviceKey.toLowerCase().includes('mysql')
    // let nodeguardKey = Object.keys(this.state.hostObj).find( v => v.toLowerCase().includes('nodeguard'))
    // let nodeguardHostList = []
    // if(isMysql && nodeguardKey){
    //   nodeguardHostList = [...this.state.hostObj[nodeguardKey]]
    // }
    //
    // let zabbixKey = Object.keys(this.state.hostObj).find(v => v.toLowerCase().includes('zabbix-agent'))
    // let zabbixHostList = []
    // if (zabbixKey) {
    //   // 找到 zabbix 服务的 hostObj key
    //   zabbixHostList = [...this.state.hostObj[zabbixKey]]
    // }
    //
    // let oldHostList = [...this.state.hostObj[serviceKey]]
    //   /******************20171130 修改：实例还是变回了单选 *******************/
    // /*************20171128 修改： 实例也多选了 所以不需要在单独个实例加选择逻辑了***************/
    // if(this.state.isInstance){
    //   oldHostList = selected ? [record] : []
    //    /**************** 20171122 新增：zabbix 服务 主机默认选上，而且禁止操作 **************/
    //   // 新增的也加入到 zabbix中，如果不重复加入，重复的不加
    //   if(zabbixKey){
    //     zabbixHostList = selected ? [record] : []
    //   }
    // //   /**************************over*************************/
    // }else{
    //   if(selected){
    //     oldHostList.push(record)
    //     /*************20171207 新增：nodeguard 和 mysql 关联**************/
    //     if(isMysql && nodeguardKey){
    //       nodeguardHostList.push(record)
    //     }
    //
    //     /**************** 20171122 新增：zabbix 服务 主机默认选上，而且禁止操作 **************/
    //     // 新增的也加入到 zabbix中，如果不重复加入，重复的不加
    //     if(zabbixKey && zabbixHostList.find(v => v.id === record.id) === undefined){
    //       zabbixHostList.push(record)
    //     }
    //   }else{
    //     /**************************over*************************/
    //     oldHostList =  oldHostList.filter(v => v.id != record.id)
    //
    //     /*************20171207 新增：nodeguard 和 mysql 关联**************/
    //     if(isMysql && nodeguardKey){
    //       nodeguardHostList =  nodeguardHostList.filter(v => v.id != record.id)
    //     }
    //
    //     if(zabbixKey){
    //       /************20171207 修复： 删除zabbix所选时，需要判断除了当前操作服务外别的服务是否有选此主机***************/
    //       /************ 针对mysql 和 nodeguard 两者数据一样 不用再判断 nodeguard 的情况了 ***************/
    //       /************ 主要是为了避免 取消选择 mysql 时，nodeguard 的还未反馈到数据中，会影响 zabbix 的数据 ***************/
    //       let otherHostKey = Object.keys(this.state.hostObj).filter(v => {
    //         return v.toLowerCase().includes('zabbix-agent') === false
    //           && v !== serviceKey
    //           && v.toLowerCase().includes('nodeguard') === false
    //       })
    //       let hasRecord = false
    //       for(let i = 0; i < otherHostKey.length; i++){
    //         for(let k = 0; k < this.state.hostObj[otherHostKey[i]].length; k++){
    //           if(this.state.hostObj[otherHostKey[i]][k].id === record.id){
    //             hasRecord = true
    //             break
    //           }
    //         }
    //         if(hasRecord){
    //           break
    //         }
    //       }
    //       zabbixHostList = [...this.state.hostObj[zabbixKey]]
    //       !hasRecord && (zabbixHostList = zabbixHostList.filter( v => v.id != record.id))
    //     }
    //   }
    // }
    //
    // const serviceId = serviceKey && serviceKey.split('-_-')[2]
    // this.checkMax(serviceId, oldHostList.length)
    //
    // let editHostObj = {
    //   [nodeguardKey] : nodeguardHostList,
    //   [serviceKey] : oldHostList,
    //   [zabbixKey] : zabbixHostList
    // }
    // zabbixKey || (delete editHostObj[zabbixKey])
    // /**********此处用 短路时 页面显示有问题 不知道为啥 *********/
    // if(!(isMysql && nodeguardKey)){
    //   delete editHostObj[nodeguardKey]
    // }
    //
    // this.setState({
    //   hostObj : {
    //     ...this.state.hostObj,
    //     ...editHostObj
    //   }
    // })
  }

  onSelectedAll(serviceKey, selected, selectedRows, changeRows){
    /******* 20171218 合并onSelected 和 onSelectedAll *******/
    this.changeSelect(serviceKey, selected, changeRows)

    // /*************20171207 新增：nodeguard 和 mysql 关联**************/
    // /************* 选了 mysql 就把 nodeguard 也给选上 **************/
    // /*************  实例里面不会出现 nodeguard 和 mysql 同时出现的情况 **************/
    // let isMysql= serviceKey.toLowerCase().includes('mysql')
    // let nodeguardKey = Object.keys(this.state.hostObj).find( v => v.toLowerCase().includes('nodeguard'))
    // let nodeguardHostList = []
    // if(isMysql && nodeguardKey){
    //   nodeguardHostList = [...this.state.hostObj[nodeguardKey]]
    // }
    //
    // let zabbixKey =  Object.keys(this.state.hostObj).find(v => v.toLowerCase().includes('zabbix-agent'))
    // let zabbixHostList = []
    // if (zabbixKey) {
    //   // 找到 zabbix 服务的 hostObj key
    //   zabbixHostList = [...this.state.hostObj[zabbixKey]]
    // }
    //
    // let oldHostList = [...this.state.hostObj[serviceKey]]
    // if(selected){
    //   oldHostList.push(...changeRows)
    //   /*************20171207 新增：nodeguard 和 mysql 关联**************/
    //   if(isMysql && nodeguardKey){
    //     nodeguardHostList.push(...changeRows)
    //   }
    //
    //   /**************** 20171122 新增：zabbix 服务 主机默认选上，而且禁止操作 **************/
    //   // 新增的也加入到 zabbix中，如果不重复加入，重复的不加
    //   changeRows.forEach(v => {
    //     if(zabbixKey && zabbixHostList.find(val => val.id === v.id) === undefined){
    //       zabbixHostList.push(v)
    //     }
    //   })
    //   /**************************over*************************/
    // }else{
    //   if(zabbixKey){
    //     zabbixHostList = [...this.state.hostObj[zabbixKey]]
    //   }
    //
    //   /************20171207 修复： 删除zabbix所选时，需要判断除了当前操作服务外别的服务是否有选此主机***************/
    //   /************ 针对mysql 和 nodeguard 两者数据一样 不用再判断 nodeguard 的情况了 ***************/
    //   /************ 主要是为了避免 取消选择 mysql 时，nodeguard 的还未反馈到数据中，会影响 zabbix 的数据 ***************/
    //   let otherHostKey = Object.keys(this.state.hostObj).filter(v => {
    //     return v.toLowerCase().includes('zabbix-agent') === false
    //       && v !== serviceKey
    //       && v.toLowerCase().includes('nodeguard') === false
    //   })
    //
    //   changeRows.forEach(val => {
    //     oldHostList = oldHostList.filter(v => v.id != val.id)
    //     /*************20171207 新增：nodeguard 和 mysql 关联**************/
    //     if(isMysql && nodeguardKey){
    //       nodeguardHostList =  nodeguardHostList.filter(v => v.id != val.id)
    //     }
    //     if(zabbixKey){
    //       let hasRecord = false
    //       for(let i = 0; i < otherHostKey.length; i++){
    //         for(let k = 0; k < this.state.hostObj[otherHostKey[i]].length; k++){
    //           if(this.state.hostObj[otherHostKey[i]][k].id === val.id){
    //             hasRecord = true
    //             break
    //           }
    //         }
    //         if(hasRecord){
    //           break
    //         }
    //       }
    //       !hasRecord && (zabbixHostList = zabbixHostList.filter( v => v.id != val.id))
    //     }
    //   })
    // }
    //
    // const serviceId = serviceKey && serviceKey.split('-_-')[2]
    // this.checkMax(serviceId, oldHostList.length)
    //
    //
    // let editHostObj = {
    //   [nodeguardKey] : nodeguardHostList,
    //   [serviceKey] : oldHostList,
    //   [zabbixKey] : zabbixHostList
    // }
    // zabbixKey || (delete editHostObj[zabbixKey])
    // /**********此处用 短路时 页面显示有问题 不知道为啥 *********/
    // if(!(isMysql && nodeguardKey)){
    //   delete editHostObj[nodeguardKey]
    // }
    //
    // this.setState({
    //   hostObj : {
    //     ...this.state.hostObj,
    //     ...editHostObj
    //   }
    // })
  }

  handleSearch(value, key){
    this.setState({
      keywords: {
        ...this.state.keywords,
        [key] : value
      }
    })
  }

  handlePage(value, key){
    this.setState({
      pages : {
        ...this.state.pages,
        [key] : value
      }
    })
  }

  // 已经不需要这个 content 了 移到hostComponent 里面了
  content(key){
    const { memoryMarks } = this.props

    const searchProps = {
      placeholder : '根据关键字过滤',
      onSearch: (value) => this.handleSearch(value, key),
    }

    /******************20171122 修改table 列数据**************************/
    // const columns =  [{
    //   title : '主机名',
    //   // dataIndex : 'machine_name',
    //   dataIndex : 'host_name',
    // },{
    //   // title : '主机IP',
    //   // dataIndex : 'machine_ip'
    //   title : '连接IP',
    //   dataIndex : 'connect_ip'
    // },{
    //   title : '城市',
    //   dataIndex : 'city'
    // },{
    //   title : '数据中心',
    //   dataIndex : 'idc'
    // }]
    // 新增 处理 进度条 + 百分比
    const ProgressNum = (text1, denominator1, type) => {
      const text = text1 === '' ? 0 : text1
      const denominator = denominator1 === '' ? 0 : denominator1
      let number = Number((Number(text) / Number(denominator) * 100).toFixed(2))
      let title = ''
      let className = ''
      if (number < 30) {
        className = 'bg-success'
      } else if (number < 80) {
        className = 'bg-primary'
      } else if (number < 90) {
        className = 'bg-warning'
      } else {
        className = 'bg-error'
      }
      switch (type) {
        case 'memory_rate' :
          title = "占比:" + number + '%    ' + text + 'MB' + '/' + denominator + 'MB'
          if (denominator === 0) title = '可用内存:' + text + 'MB,' + '内存大小:' + denominator + 'MB.'
          break
        case 'disk_rate' :
          title = "占比:" + number + '%    ' + text + 'MB' + '/' + denominator + 'MB'
          if (denominator === 0) title = '可用磁盘:' + text + 'MB,' + '磁盘大小:' + denominator + 'MB.'
          break
        case 'load_rate' :
          title = "占比:" + number + '%    ' + text + '/' + 3
          if (denominator === 0) title = 'CPU负载:' + text + ',' + '总负载:' + denominator + '.'
          break
      }
      return (
        <Row className={styles[className]}>
          <Tooltip title={title}>
            <Progress percent={number} showInfo={false}/>
          </Tooltip>
        </Row>
      )
    }

    const memoryTitle =
      <span>
        内存&nbsp;
        <Tooltip title="可用内存/内存大小">
          <IconFont className="text-info" type="question-circle"/>
        </Tooltip>
      </span>

    const diskTitle =
      <span>
        磁盘&nbsp;
        <Tooltip title="可用磁盘/磁盘大小">
          <IconFont className="text-info" type="question-circle"/>
        </Tooltip>
      </span>

    const loadTitle =
      <span>
        负载&nbsp;
        <Tooltip title="CPU负载/总负载">
          <IconFont className="text-info" type="question-circle"/>
        </Tooltip>
      </span>

    let columns = [{
      title: '主机名', dataIndex: 'name', key: 'name', width: 150, className: 'text-center',
      // render:(text,record) => {
      //   return <Link to={`cmdb/host/${record.id}`}>{text}</Link>
      // }
    },
      {
        title: 'IP', dataIndex: 'connect_ip', key: 'connect_ip', className: 'text-center', width: 150,
        render: (text, record) => {
          return (
            <Row>
              <span>{text}</span>&nbsp;&nbsp;
              <IconFont type="plus-square-o" style={{cursor: 'pointer'}}
                        onClick={() => this.showIPModal(record.host_ip)}/>
            </Row>
          )
        }
      },
      {
        title: '状态', dataIndex: 'connect_status', key: 'connect_status', width: 100, className: 'text-center',
        filters: [
          {
            text: '环境未初始化',
            value: '0'
          },
          {
            text: '运行中',
            value: '1'
          },
          {
            text: 'Agent异常',
            value: '2'
          },
          {
            text: 'SSH连接异常',
            value: '3'
          }
        ],
        render: (text, record) => {
          let status = ''
          let desc = ''
          switch (Number(text)) {
            case HOST_STATUS.HOST_NOT_INIT:
              status = 'default'
              desc = '环境未初始化'
              break
            case HOST_STATUS.HOST_RUNNING:
              status = 'success'
              desc = '运行中'
              break
            case HOST_STATUS.HOST_AGENT_ABNORMAL:
              status = 'error'
              desc = 'Agent异常'
              break
            case HOST_STATUS.HOST_SSH_ABNORMAL:
              status = 'error'
              desc = 'SSH连接异常'
              break
          }
          return (
            <Tooltip title={desc}>
              <span style={{cursor: 'pointer'}}>
                <Badge status={status}/>
              </span>
            </Tooltip>
          )
        }
      },
      {
        title: '类型', dataIndex: 'type', key: 'type', className: 'text-center', width: 100,
        render: (text) => {
          text = text === HOST_TYPE['NORMAL'] ? '普通主机'
            : (text === HOST_TYPE['RHCS'] ? 'RHCS主机'
              :(text === HOST_TYPE['RHCS_SLAVE'] ? 'RHCS备机' : ''))
          return <span>{text}</span>
        }
      },
      {
        title: memoryTitle, dataIndex: 'free_memory', key: 'free_memory', className: 'text-center', width: 130,
        render: (text, record) => {
          return ProgressNum(text, record.memory, 'memory_rate')
        }
      },
      {
        title: diskTitle, dataIndex: 'free_disk', key: 'free_disk', className: 'text-center', width: 130,
        render: (text, record) => {
          return ProgressNum(text, record.disk_size, 'disk_rate')
        }
      },
      {
        title: loadTitle, dataIndex: 'cpu_load', key: 'cpu_load', className: 'text-center', width: 130,
        render: (text) => {
          return ProgressNum(text, 3, 'load_rate')
        }
      },
      {
        title: '运行服务数', dataIndex: 'running_services', key: 'running_services', className: 'text-center', width: 100,
        // render:(text,record) =>{
        //   if(text === 0 || text === undefined || text === ''){
        //     return <span>{text}</span>
        //   }else{
        //     return <Link onClick={this.handleRunningServices.bind(this,record.serviceList)}>{text}</Link>
        //   }
        // }
      },
      {
        title: '城市', dataIndex: 'city', key: 'city', className: 'text-center', width: 100,
      },
      {
        title: '数据中心', dataIndex: 'idc', key: 'idc', className: 'text-center', width: 100,
      },
      {
        title: '系统架构', dataIndex: 'os_arch', key: 'os_arch', className: 'text-center', width: 150,
      },
      {
        title: '系统版本', dataIndex: 'os_version', key: 'os_version', className: 'text-center', width: 150,
      },
      {
        title: '网卡', dataIndex: 'interfaces', key: 'interfaces', className: 'text-center', width: 100,
      },
      {
        title: '最大运行服务数', dataIndex: 'max_running_services', key: 'max_running_services',
        className: 'text-center', width: 150,
      }]
    /***********************over************************************/
    // 需要修改的数据
    // const dataSource = this.state.hostObj ? this.state.hostObj[key] : []

    // 获取属于这个服务的keyword
    const keywords = this.state.keywords[key]
    const filter = {
      mem : memoryMarks[this.props.deployInfo.memory],
      name : keywords,
    }
    const selectedRowKeys = this.state.hostObj[key].length ? this.state.hostObj[key].map(v => v.id) : []
    let showTip = false
    let width = 0
    columns.forEach((v) =>
      width += v.width
    )
    let dataTableProps = {
      fetch : {
        // url : '/machines',
        url : '/hosts',
        data : filter,
      },
      columns,
      rowSelection : {
          /******************20171130 修改：实例还是变回了单选 *******************/
        /**********20171128 修改：实例可以多选了 table 默认 Checkbox  **********/
        type : this.state.isInstance ? 'radio' : 'checkbox',
        /****************over****************/
        onSelect : this.onSelected.bind(this, key),
        onSelectAll : this.onSelectedAll.bind(this, key),
        selectedRowKeys,
        getCheckboxProps : (record) => ({
          disabled : record.type === HOST_TYPE['RHCS_SLAVE']
        })
      },
      rowKey : 'id',
      cb : (params) => {
        const { pagination } = params
        const { total } = pagination
        if(total=== 0){
          this.setState({
            showTip : true
          })
        }
      },
      locale : {
        emptyText : '暂无符合条件机器。可通过主机管理，新增合适的机器'
      },
      scroll : { x : width}
    }

    // 如果是监控服务 需要把别的服务选的机器合并去重作为监控的 dataSource
    /***********20171207 nodeguard 服务主机与 mysql一致 不需要再去选择*************/
    if(key.toLowerCase().includes('zabbix-agent') || key.toLowerCase().includes('nodeguard')){
      // 拷贝一个 hostObj 避免操作原对象
      /****************************20171122 zabbix 默认必选，不可操作******************************************/
      // let newHostObj = JSON.parse(JSON.stringify(this.state.hostObj))
      // const newKeys = Object.keys(newHostObj).filter(v => !v.toLowerCase().includes('zabbix-agent'))
      // let dataSource = []
      // newKeys.forEach((v, i) => {
      //   if(newHostObj[v].length){
      //     for(let k = 0; k < newHostObj[v].length; k++){
      //       if(!dataSource.find(val => val.id == newHostObj[v][k].id)){
      //         dataSource.push( newHostObj[v][k])
      //       }
      //     }
      //   }
      // })
      let dataSource = this.state.hostObj[key]
      /***********************************over***********************************/

      // console.log('dataSource===>', dataSource)
      delete dataTableProps.fetch
      dataTableProps.locale.emptyText =  key.toLowerCase().includes('nodeguard')
        ? '配置 mysql 主机' : '请先配置其他服务'
      dataTableProps.pagination = false
      dataTableProps.dataSource = dataSource
      /********************************* 20171122 zabbix 不可操作*********************************/
      dataTableProps.rowSelection.getCheckboxProps = record => ({
        disabled : true
      })
      /***********************************over***********************************/
    }

    return (
      <Row>
        <Row>
          <span>已选主机： </span>
          <span>{
            this.state.hostObj[key].length
              // ? this.state.hostObj[key].map( v => v.machine_name ).join('，')
              ? this.state.hostObj[key].map( v => v.host_name ).join('，')
              : ('请选择主机')
          }</span>
        </Row>
        <Row className={styles["mgtb-8"]}>
        {
          key.toLowerCase().includes('zabbix-agent')
            ? <Row className={styles["tip-container"]}>
                <IconFont type="info-circle" className="text-info"/>&nbsp;
                <span>提示：zabbix 节点与数据库节点不统一将会导致无法提供监控服务，所以不提供 zabbix 相关的机器选择。</span>
              </Row>
            : (key.toLowerCase().includes('nodeguard')
              ? <Row className={styles["tip-container"]}>
                  <IconFont type="info-circle" className="text-info"/>&nbsp;
                  <span>提示：nodeguard 节点与 mysql 节点一致，所以不提供 nodeguard 相关的机器选择。</span>
                </Row>
              : <Col span={4}>
                  <Search {...searchProps} />
                </Col>
               )
        }
        </Row>
        <DataTable {...dataTableProps}/>
        {/*{this.state.showTip && <span style={{float : 'left'}}>暂无此内存下的主机，请添加!</span>}*/}
      </Row>
    )
  }

  render(){
    const {form, selectedService, selectedStack, deployInfo, memoryMarks,
      hostIP, hostVisible} = this.props
    const stackName = selectedStack[0] && selectedStack[0].name

    const businessName = deployInfo.business && deployInfo.business.split('-_-')[0]
    const appName = deployInfo.app && deployInfo.app.split('-_-')[0]
    /********20171215 服务的 visible 0 时 服务不显示在已选中********/
    // const serviceName = deployInfo.service && deployInfo.service.map(v => {
    //       return v.split('-_-')[0]
    // }).join('，')

    const serviceName =  Json.loads(selectedService).length > 0
            && Json.loads(selectedService).filter( v => v.visible !== 0).map(v => v.name).join('，')
    // console.log('this.state===>', this.state)

    /************20171122 table 列相关**************/
    const ipModalProps = {
      title: '主机ip详情',
      visible: hostVisible,
      onCancel: this.handleIPCancel,
      onOk: this.handleIPCancel,
      hostIP: hostIP
    }
    /*****************over***************/

    const hostComponentProps = {
      onSelect : this.onSelected.bind(this),
      onSelectAll : this.onSelectedAll.bind(this),
      hostObj : this.state.hostObj,
      selectedService : selectedService,
      memoryMarks : memoryMarks,
      hostIP : hostIP,
      hostVisible,
      handleIPCancel : this.handleIPCancel,
      keywords :this.state.keywords,
      deployInfo,
      isInstance: this.state.isInstance,
      showIPModal : this.props.showIPModal,
      handleSearch : this.handleSearch,
      /********* 20180109 保留筛选条件 *********/
      pages : this.state.pages,
      handlePage : this.handlePage
    }

    return (
      <Row className={styles["host"]}>
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
        <HostComponent {...hostComponentProps}/>
        {/*<Tabs tabPosition="left" className="mgt-16">*/}
          {/*{*/}
            {/*JSON.parse(selectedService).map(item => {*/}
              {/********20171215 服务的 visible 0 时不需要选择主机********/}
              {/*if(item.visible !== 0){*/}
                {/*return (*/}
                  {/*<TabPane key={item.id} tab={`${item.name}`}>*/}
                    {/*{*/}
                      {/*item.need_host*/}
                        {/*? this.content(`${item.name}-_-${item.version}-_-${item.id}`)*/}
                        {/*: <Row>此服务不需要配置机器</Row>*/}
                    {/*}*/}
                  {/*</TabPane>*/}
                {/*)*/}
              {/*}*/}
            {/*})*/}
          {/*}*/}
        {/*</Tabs>*/}
        <Row className={classnames('text-right', styles["button-row"])}>
          <Button
            onClick={this.prev}
            className="mgr-16"
          >
            上一步
          </Button>
          <Button
            type="primary"
            onClick={this.next}
          >
            下一步
          </Button>
        </Row>
        {/**********20171122 table 列相关***********/}
        {/*<IPModal {...ipModalProps}/>*/}
        {/**********over*****/}
      </Row>
    )
  }
}
Host.proptypes = {
  prev: PropTypes.func,
  next: PropTypes.func,
  selectedService : PropTypes.array,
  selectedStack : PropTypes.array,
  deployInfo : PropTypes.object,
  setSelectedServiceHost : PropTypes.func,
  clearMasterSlave : PropTypes.func,
  clearChunkConfig : PropTypes.func,
  showIPModal: PropTypes.func,
  handleIPCancel: PropTypes.func,
  hostIP: PropTypes.object,
  hostVisible: PropTypes.bool,
  keywords : PropTypes.object,
  pages : PropTypes.object,
}

export default Form.create()(Host)
