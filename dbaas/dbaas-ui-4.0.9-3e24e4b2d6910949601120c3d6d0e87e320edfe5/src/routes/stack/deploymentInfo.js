/**
 * Created by wengyian on 2017/7/10.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Input, Icon, message, Button, Modal, Steps, Form, Tabs, Tooltip } from 'antd'
import { DataTable, Search, Filter, IconFont } from 'components'
import { classnames } from 'utils'
import _ from 'lodash'
import styles from './stack.less'

const FormItem = Form.Item
const TabPane = Tabs.TabPane

let uuid = 0
// uuid 只增不减
class DeploymentInfo extends React.Component{
  constructor(props){
    super(props)

    let serviceObj = {}
    let idObj = {}
    props.chosenService.forEach((item, key) => {
      // 因为 antd 截取 id 时 遇到 . 会截取, 所以替换掉 .
      let version = item.version.replace(/\./g, '_')
      let name = item.name + '' + version
      serviceObj[`${name}-_-${item.id}`] = []
    })
    this.state = {
      services : props.chosenService,
      serviceObj,
      stackInfo : props.stackInfo,
      errMsg : [],
      stackId : props.stackId
    }
  }

  componentWillReceiveProps(nextProps){
    if(!_.isEqual(nextProps.chosenService, this.state.services) ||
        !_.isEqual(nextProps.stackInfo, this.state.stackInfo) ||
        nextProps.stackId !== this.state.stackId
      ){
      let serviceObj = {}
      nextProps.chosenService.forEach((item, key) => {
        let version = item.version.replace(/\./g, '_')
        let name = item.name + '' + version
        serviceObj[`${name}-_-${item.id}`] = []
      })
      this.setState({
        services : nextProps.chosenService,
        serviceObj,
        stackInfo : nextProps.stackInfo,
        stackId : nextProps.stackId
      })
    }
  }

  prev(){
    if(this.props.prev){
      this.props.prev()
    }
  }

  Ok(){
    this.props.form.validateFields((err, values) => {
      let isSubmit = true
      let errTip = {}
      if(err) {
        isSubmit = false
      }

      // console.log('values===>', values)
      let data = {}
      Object.keys(values).forEach((key, i) => {
        let type = key.split('-_-')[0]
        let id = key.split('-_-')[2]
        let order = key.split('-_-')[3]
        data[id] === undefined && (data[id] = {})
        data[id][order] === undefined && ( data[id][order] = {} )
        data[id][order][type] = values[key]
      })

      // 要提交的service
      let service = this.state.services.map((item, key) => {
        return {
          id : item.id,
          conf : []
        }
      })

      Object.keys(data).forEach((val, i) => {
        let conf = {}
        let errMsg = []
        let index = service.findIndex((item, key) => {
          return item.id == val
        })
        Object.keys(data[val]).forEach((item, key) => {
          // console.log('this===>', this)
          let version = this.state.services[index].version.replace(/\./g, '_')
          let serviceName = this.state.services[index].name + '' + version
          if(data[val][item].key == undefined || data[val][item].key.trim() == '' || data[val][item].val == undefined || data[val][item].val.trim() == ''){
            if(errTip[serviceName] === undefined){
              errTip[serviceName] = []
              errTip[serviceName].push(`配置信息不全`)
            }else{
              !errTip[serviceName].includes(`配置信息不全`) && errTip[serviceName].push(`配置信息不全`)
            }
            isSubmit = false
          }
          if(data[val][item].key != undefined ){
            let confKey = data[val][item].key.trim()
            if( confKey in conf ){
              // 出现同名 val
              // 因为 service 与 this.state.services 的 顺序一致
              // let serviceName = this.state.services[index].name
              if(errTip[serviceName] === undefined){
                errTip[serviceName] = []
                errTip[serviceName].push(`配置项 ${confKey} 重复`)
              }else{
                !errTip[serviceName].includes(`配置项 ${confKey} 重复`) && errTip[serviceName].push(`配置项 ${confKey} 重复`)
              }
              isSubmit = false
            }
            conf[confKey] = data[val][item].val.trim()
          }
        })
        isSubmit && index != -1 && (service[index].conf = conf)
      })

      if(!isSubmit){
        // 弹出错误信息
        let err_content = Object.keys(errTip).map((val) => {
          return (<Row>
            {val.replace(/_/g, '.') + ' ' + errTip[val]}
          </Row> )
        })
        // console.log('err_content===>', err_content)
        Modal.error({
          title : '配置信息错误提示：',
          content : err_content
        })
        return false
      }
      let params = {}
      if(this.props.type === 'edit'){
        params = {stack_id : this.state.stackId, service}
      }else{
        params = {...this.state.stackInfo, service}
      }

      if(this.props.onOk){
        this.props.onOk(params)
      }
    })
  }

  add(key){
    uuid++
    let serviceArr = this.state.serviceObj[key]
    serviceArr.push(uuid)
    this.setState({
      serviceObj : {
        ...this.state.serviceObj,
        [key]: serviceArr
      },
    })
  }

  remove(key, id){
    let serviceArr = this.state.serviceObj[key]
    serviceArr = serviceArr.filter((val, index) => val != id)
    this.setState({
      serviceObj : {
        ...this.state.serviceObj,
        [key] : serviceArr
      }
    })
  }

  render(){

    const { getFieldDecorator } = this.props.form

    return (
      <Row>
        <Tabs tabPosition="left">
          {
            this.state.services.map((item, key) => {
              let version = item.version.replace(/\./g, '_')
              let name = item.name + '' + version
              return (
                <TabPane
                  key={item.id}
                  tab={item.name + '' + item.version}
                >
                  <Row>
                    <Form>
                      {
                        Object.keys(this.state.serviceObj[`${name}-_-${item.id}`]).map((val, i) => {
                          let obj = this.state.serviceObj[`${name}-_-${item.id}`]
                          return (
                            <Row key={obj[val]}>
                              <Col span="4">
                                <FormItem>
                                  { getFieldDecorator(`key-_-${name}-_-${item.id}-_-${obj[val]}`, {
                                    rules : [{
                                      required : true,
                                      message : '请指定该配置信息',
                                      whitespace : true
                                    }]
                                  })(
                                    <Input placeholder="配置项"/>
                                  )}
                                </FormItem>
                              </Col>
                              <Col span="6" offset="1">
                                <FormItem>
                                  { getFieldDecorator(`val-_-${name}-_-${item.id}-_-${obj[val]}`, {
                                    rules : [{
                                      required : true,
                                      message : '请指定该配置信息',
                                      whitespace : true
                                    }]
                                  })(
                                    <Input placeholder="配置内容"/>
                                  )}
                                </FormItem>
                              </Col>
                              <Col>
                                <Tooltip title="点击删除配置信息">
                                  <IconFont
                                    type="minus-circle-o"
                                    className={styles['delete-conf']}
                                    onClick={this.remove.bind(this, `${name}-_-${item.id}`, obj[val])}
                                  />
                                </Tooltip>
                              </Col>
                            </Row>
                          )
                        })
                      }
                    </Form>
                  </Row>
                  <Row>
                    <a href="javascript:;" onClick={this.add.bind(this, `${name}-_-${item.id}`)}>
                      添加配置信息
                    </a>
                  </Row>
                </TabPane>
              )
            })
          }
        </Tabs>
        <Row style={{ marginTop : "16px", textAlign : "right" }}>
          <Button type="primary" onClick={this.prev.bind(this)}>上一步</Button>
          <Button type="primary" onClick={this.Ok.bind(this)} style={{marginLeft : "8px"}}>完成</Button>
        </Row>
      </Row>
    )
  }

}

DeploymentInfo.propTypes = {
  chosenService : PropTypes.array,
  stackInfo : PropTypes.object,
  form : PropTypes.object,
  onOk : PropTypes.func
}

export default Form.create()(DeploymentInfo)
