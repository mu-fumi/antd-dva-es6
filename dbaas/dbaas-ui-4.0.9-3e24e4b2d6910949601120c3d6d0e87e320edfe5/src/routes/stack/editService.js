/**
 * Created by wengyian on 2017/8/2.
 */
import Base from 'routes/base'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Input, message, Button, Modal, Steps, Form, Select, Radio } from 'antd'
import { DataTable, Layout, Search, Filter, IconFont } from 'components'
import { routerRedux, Link } from 'dva/router'
import { classnames } from 'utils'
import _ from 'lodash'
import { constant, TimeFilter } from 'utils'
import { SERVICE_TYPE } from 'utils/constant'
import styles from './service.less'

const modelKey = 'stack/editService'
const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group
const { TextArea } = Input

class EditService extends Base{

  constructor(props){
    super(props)

    this.setGobackBtn()
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {activeName : '编辑服务', selectedKey : '组件管理component'},
      defer : true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : { selectedKey : ''},
      fire : [Base.WillUnmount]
    })

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit(){
    this.props.form.validateFields((err, values) => {
      if(err){
        return false
      }
      values.package = {
        id : values.packageId
      }
      values.service_id = this.props.editService.serviceId
      delete values.packageId
      this.props.dispatch({
        type : `${modelKey}/updateService`,
        payload : values
      })
    })
}

  render(){
    const { location, editService, dispatch, loading, form } = this.props
    const { serviceInfo, versionList, serviceId } = editService
    const { getFieldDecorator, validateFields } = form

    const formItemLayout = {
      labelCol : {
        span : 2
      },
      wrapperCol : {
        span : 12
      }
    }

    return (
      <Row className={styles["mgt-10"]}>
        <Form
          layout="horizontal"
        >
          <FormItem label="名称" {...formItemLayout}>
            { getFieldDecorator('name', {
              initialValue: serviceInfo.name ? serviceInfo.name : '',
              rules: [{
                required: true,
                message: '请输入服务名称'
              }]
            })(
              <Input placeholder="请输入服务名称"/>
            ) }
          </FormItem>
          <FormItem label="版本" {...formItemLayout}>
            { getFieldDecorator('version', {
              initialValue: serviceInfo.version ? serviceInfo.version : '',
              rules: [{
                required: true,
                message: '请输入服务版本'
              }]
            })(
              <Input placeholder="请输入服务版本"/>
            ) }
          </FormItem>
          <FormItem label="类型" {...formItemLayout}>
            {
              getFieldDecorator('type', {
                initialValue: serviceInfo.type !== undefined ? String(serviceInfo.type) : '',
                rules: [{
                  required: true,
                  message: '请选择或输入服务类型'
                }]
              })(
                <Select>
                  { Object.keys(SERVICE_TYPE).map( (v, k) => {
                    return <Option key={k} value={SERVICE_TYPE[v]}>{v}</Option>
                  })}
                </Select>
              )
            }
          </FormItem>
          <FormItem label="描述" {...formItemLayout}>
            { getFieldDecorator('description', {
              initialValue: serviceInfo.description ? serviceInfo.description : '',
              rules: [],
            })(
              <TextArea placeholder="描述" />
            ) }
          </FormItem>
          <FormItem label="包版本" {...formItemLayout}>
            { getFieldDecorator('packageId', {
              initialValue : serviceInfo.package_id,
              rules : [{
                required: true,
                message: '请选择包'
              }],
            })(
              <RadioGroup style={{width : '100%'}}>
                <Row style={{display : serviceInfo["package_id"] === 0 ? '' : 'none'}}>{serviceInfo.package}</Row>
                {
                  Object.keys(versionList).map((v, k) => {
                    return (
                      <Row key={k}>
                        <Col span="8" style={{textAlign: 'right'}}>{v}</Col>
                        <Col span="1">：</Col>
                        <Col span="15">
                          {
                            versionList[v].map(val => {
                              return <Radio className={styles["radio-style"]} value={val.id} key={val.id}>{val.name}</Radio>
                            })
                          }
                        </Col>
                      </Row>
                    )
                  })
                }
              </RadioGroup>
            )
            }
          </FormItem>
          <Col offset={2}>
            <Button type="primary" onClick={this.handleSubmit}>
              保存
            </Button>
          </Col>
        </Form>
      </Row>
    )
  }
}

EditService.proptypes = {
  location : PropTypes.object,
  createService : PropTypes.object,
  dispatch : PropTypes.func,
  loading : PropTypes.bool,
  form : PropTypes.object
}

export default connect((state) => {
  return {
    loading : state.loading.models[modelKey],
    editService : state[modelKey]
  }
})(Form.create()(EditService))
