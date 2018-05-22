/**
 * Created by zhangmm on 2017/9/30.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Input, Icon, message, Button, Modal, Form, Tooltip, Card, Select, Spin } from 'antd'
import { DataTable, Search, Filter, IconFont, ConfigInput } from 'components'
import { classnames, constant, Cache } from 'utils'
import _ from 'lodash'
const FormItem = Form.Item
const Option = Select.Option
const cookie = new Cache('cookie')
import styles from './modify.less'
import ConfigModal from './configModal.js'
import ItemModal from './itemModal.js'

class ChooseConfigs extends React.Component{
  constructor(props){
    super(props)

    this.handleNext = this.handleNext.bind(this)
    this.handlePrev = this.handlePrev.bind(this)
    this.handleInput = this.handleInput.bind(this)
    this.handleSwitch = this.handleSwitch.bind(this)
    this.handleSlider = this.handleSlider.bind(this)
    this.handleInputNumber = this.handleInputNumber.bind(this)
    this.handleSelect = this.handleSelect.bind(this)
    this.handleParams = this.handleParams.bind(this)
    this.showModal = this.showModal.bind(this)
    this.hideModal = this.hideModal.bind(this)
    this.showItemModal = this.showItemModal.bind(this)
    this.hideItemModal = this.hideItemModal.bind(this)

    this.state = {
      visible: false,
      text: '',
      type:'',
      itemVisible:false,
      itemText:'',
      itemType:''
    }
  }

  componentWillMount(){
    if(this.props.loadConfigure){
      this.props.loadConfigure()
    }
  }

  componentDidMount(){
    if(this.props.handleSpin){
      this.props.handleSpin()
    }
  }

  handleNext(){
    //e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values)
        if(this.handleParams){
          this.handleParams(values)
        }
        //在处理参数之后进行下一步操作
        if(this.props.next){
          this.props.next()
        }
      }
    })
  }

  handlePrev(){
    if(this.props.prev){
      this.props.prev()
    }
  }

  handleInput(id,e){
    this.props.form.setFieldsValue({
      [id]:e.target.value
    })
  }

  handleSwitch(id,value){
    this.props.form.setFieldsValue({
      [id]:value
    })
  }

  handleSlider(id,value){
    this.props.form.setFieldsValue({
      [id]:value
    })
  }

  handleInputNumber(id,value){
    this.props.form.setFieldsValue({
      [id]:value
    })
  }

  handleSelect(id,value){
    this.props.form.setFieldsValue({
      [id]:value
    })
  }

  handleParams(values){
    let params = {}
    let alteration = {}
    let configure = this.props.configure
    Object.keys(configure).map((v1,k1) =>{
      let connect = {}
      Object.keys(configure[v1]).map((v2,k2) =>{
        configure[v1][v2].forEach((v3,k3) =>{
          connect[v3.item] = {
            "before":v3.value,
            "after":typeof values[v3.item] === 'boolean'?
              (values[v3.item] ? "ON" : "OFF") : (values[v3.item].toString()),
            "type":v3.type
          }
        })
      })
      alteration = {
        [v1]:{
          ...connect
        }
      }
    })
    params = {
      "user_id":cookie.get('uid').toString(),
      //"stack_id":this.props.stack_id,
      "alteration":alteration,
    }
    if(this.props.saveConfiguration){
      this.props.saveConfiguration(params)
    }
  }

  showModal(text,type){
    let list = []
    type.map((v1,k1) =>{
      for(let i in v1){
        list.push(v1[i])
      }
    })
    this.setState({
      visible: true,
      text: text,
      type:list.toString()
    })
  }

  hideModal(){
    this.setState({
      visible: false,
      text: '',
      type:''
    })
  }

  showItemModal(text,type){
    this.setState({
      itemVisible: true,
      itemText: text,
      itemType:type
    })
  }

  hideItemModal(){
    this.setState({
      itemVisible: false,
      itemText: '',
      itemType:''
    })
  }

  render(){
    const {form, configure, nodeConfigure, cluster, nodeName, location, spin} = this.props
    const {getFieldDecorator} = form

    const modalProps = {
      title:'当前值',
      type:this.state.type,
      text:this.state.text,
      visible:this.state.visible,
      onCancel:this.hideModal,
      onOk:this.hideModal,
    }

    const itemProps = {
      title:'配置项描述',
      type:this.state.itemType,
      text:this.state.itemText,
      visible:this.state.itemVisible,
      onCancel:this.hideItemModal,
      onOk:this.hideItemModal,
    }

    const length = cluster.length

    const col_configs =
      (/^\?node_id=/.test(location.search) && nodeName) ?
      <Col span={8}>{nodeName}</Col>
      :
      cluster.map((val,k) =>{
        for(let i in val){
          return <Col  key={k} span={8/length}>{val[i]}</Col>
        }
      })

    return (
      <Row className={styles.chooseConfigs}>
        <Spin spinning={spin}>
        <Form>
        <Row className="mgrt-24">
          {
            Object.keys(configure).map((v,k) =>{
              if(k === 0){
                return (
                  <Row key={k}>
                    {
                      Object.keys(configure[v]).map((value,key) =>{
                        return (
                          <Col  key={key}>
                            <Card title={value} bordered={true} className="card-margin">
                              <Row className="row-title">
                                <Col span={6}>配置项</Col>
                                { col_configs }
                                <Col span={10}>修改</Col>
                              </Row>
                              {
                                configure[v][value].map((value,key) =>{
                                  // 不同类型的表单元素 需要的配置不一样
                                  let getFieldDecoratorOptions = {
                                    rules: [{
                                      required: false,
                                      message: `${value.item}必填`
                                    }]
                                  }

                                  let uniqueProps = {}
                                  let select = ''

                                  switch (value.type)
                                  {
                                    case 'string':
                                      getFieldDecoratorOptions = {
                                        initialValue: value.default || value.value,
                                        ...getFieldDecoratorOptions,
                                        onChange: this.handleInput.bind(this,value.item),
                                      }
                                      uniqueProps = {
                                        ...uniqueProps,
                                        placeholder:"请输入修改值",
                                      }
                                      break;
                                    case 'boolean':
                                      getFieldDecoratorOptions = {
                                        initialValue: (value.default || value.value) === 'ON' ? true : false,
                                        ...getFieldDecoratorOptions,
                                        valuePropName: 'checked',
                                        onChange: this.handleSwitch.bind(this,value.item),
                                      }
                                      uniqueProps = {
                                        ...uniqueProps,
                                        checkedChildren:"ON",
                                        unCheckedChildren:"OFF"
                                      }
                                      break;
                                    case 'integer':
                                      let min = value.range.split('-')[0]
                                      let max = value.range.split('-')[1]
                                      let int_30 = Math.ceil(value.range.split('-')[1]*0.3)
                                      let int_60 = Math.ceil(value.range.split('-')[1]*0.6)

                                      let marks = {
                                        [min]: min,
                                        [int_30]: int_30,
                                        [int_60]: int_60,
                                        [max]: {
                                          style: {
                                            color: '#f50',
                                          },
                                          label: <strong>{max}</strong>,
                                        },
                                      }
                                      getFieldDecoratorOptions = {
                                        initialValue: Number(value.default || value.value),
                                        ...getFieldDecoratorOptions,
                                        onChange: this.handleSlider.bind(this,value.item),
                                      }
                                      uniqueProps = {
                                        ...uniqueProps,
                                        marks:marks,
                                        min:Number(min),
                                        max:Number(max)
                                      }
                                      break;
                                    case 'unsigned':
                                      let min1 = value.range.split('-')[0]
                                      getFieldDecoratorOptions = {
                                        initialValue: Number(value.default || value.value),
                                        ...getFieldDecoratorOptions,
                                        onChange: this.handleInputNumber.bind(this,value.item),
                                      }
                                      uniqueProps = {
                                        ...uniqueProps,
                                        placeholder:"请输入数值",
                                        min:Number(min1),
                                      }
                                      break;
                                    case 'enumeration':
                                      let enuList = value.range.split('/')
                                      let defaultEnu = value.default || value.value

                                      select = <Select placeholder="请选择修改值">
                                        {
                                          enuList.map((v,k) => {
                                            return <Option value={v} key={k}>{v}</Option>
                                          })
                                        }
                                      </Select>

                                      getFieldDecoratorOptions = {
                                        initialValue: defaultEnu,
                                        ...getFieldDecoratorOptions,
                                        onChange: this.handleSelect.bind(this,value.item),
                                      }
                                      break;
                                  }

                                  const obj =  Object.keys(configure).map((val1,key1) =>{
                                    //console.log("configure[val1]================================>1",configure[val1])
                                    return Object.keys(configure[val1]).map((val2,key2) =>{
                                      //console.log("configure[val1][val2]================================>1",configure[val1][val2])
                                      return configure[val1][val2].map((val3,key3) =>{
                                        if(val3['item'] === value['item']){
                                          return <Col span={8/length} className="col-6-style" key={key3}>
                                           {
                                             val3['value'] ?
                                               (
                                               val3['type'] === 'string' ?
                                                 <a className="text-ellipsis-1" href="javascript:void(0);"
                                                 onClick={this.showModal.bind(this,val3['value'],cluster)}>
                                                   {val3['value']}
                                                 </a>
                                               :
                                                 <span className="text-ellipsis-1">{val3['value']}</span>
                                               )
                                             :
                                               <Tooltip title="暂无数据" placement="left"><Icon type="frown-o"/>
                                               </Tooltip>
                                           }
                                           </Col>
                                        }
                                      })
                                    })
                                  })

                                  //console.log("obj=================>",key,obj)

                                  return (
                                    <Row key={key} className="row-cont">
                                      <Tooltip title={value.item} placement="left" key={key} overlayClassName="tooltip-style">
                                        <Col span={6} className="col-7-style">
                                          <a className="text-ellipsis-1" href="javascript:void(0);"
                                                onClick={this.showItemModal.bind(this,value['desc'],value['item'])}>{value['item']}</a>
                                        </Col>
                                      </Tooltip>
                                      {
                                        !(/^\?node_id=/.test(location.search) && nodeName) ?
                                          obj
                                          :
                                          <Col span={8} className="col-6-style">{value['value'] ?
                                            (
                                              value['type'] === 'string' ?
                                                <a className="text-ellipsis-1" href="javascript:void(0);"
                                                      onClick={this.showModal.bind(this,value['value'],cluster)}>{value['value']}</a>
                                                :
                                                <span className="text-ellipsis-1">{value['value']}</span>
                                            )
                                            :
                                            <Tooltip title="暂无数据" placement="left"><Icon type="frown-o"/></Tooltip>}
                                          </Col>
                                      }
                                      <Col span={10}>
                                        <FormItem>
                                          {
                                            getFieldDecorator(`${value.item}`, {
                                              ...getFieldDecoratorOptions
                                            })(
                                              value.type === 'enumeration' ? (
                                                select
                                              ) : (
                                                <ConfigInput type={value['type']} {...uniqueProps}/>
                                              )
                                            )
                                          }
                                        </FormItem>
                                      </Col>
                                    </Row>
                                  )
                                })
                              }
                            </Card>
                          </Col>
                        )
                      })
                    }
                  </Row>
                )
              }
            })
          }
        </Row>
        <Row className="text-right">
          <Button onClick={this.handlePrev} className="mgr-16">上一步</Button>
          <Button type="primary" onClick={this.handleNext}>下一步</Button>
        </Row>
        </Form>
        <ConfigModal {...modalProps}/>
        <ItemModal {...itemProps}/>
        </Spin>
      </Row>
    )
  }
}

ChooseConfigs.propTypes = {
  prev : PropTypes.func,
  next : PropTypes.func,
  loadConfigure : PropTypes.func,
  configure : PropTypes.object,
  nodeConfigure : PropTypes.object,
  //stack_id : PropTypes.string,
  location : PropTypes.object,
  cluster : PropTypes.array,
  saveConfiguration : PropTypes.func,
  nodeName : PropTypes.string,
  spin : PropTypes.bool,
  handleSpin : PropTypes.func,
}
export default Form.create()(ChooseConfigs)
