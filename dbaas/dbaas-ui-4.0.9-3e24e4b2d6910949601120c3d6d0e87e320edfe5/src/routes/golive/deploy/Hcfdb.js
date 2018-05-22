/**
 * Created by wengyian on 2017/12/12.
 */
import React from 'react'
import PropTypes from 'prop-types'
import {Row, Col, Input, message, Button, Modal, Checkbox, Form, Slider, Select} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, SliderInput,} from 'components'
import {routerRedux, Link} from 'dva/router'
import {classnames, Cache, convertMToG, constant} from 'utils'
import Json from 'utils/json'
import _ from 'lodash'
import {existDeployName} from 'services/deploy'

const FormItem = Form.Item
const Option = Select.Option
const { QUORUM_TYPES } = constant

class Hcfdb extends React.Component{
  constructor(props){
    super(props)
  }

  componentWillReceiveProps(nextProps){

  }

  render(){
    const {form, deployInfo = {}, template = '', formItemLayout = {},
      chunkKeeperList = [], zooKeeperList = []} = this.props
    const {getFieldDecorator} = form

    if (template !== 'HCFDB') {
      return null
    }

    return (
      <Row>
        <FormItem label="ChunkKeeper" {...formItemLayout}>
          { getFieldDecorator('CHUNKKEEPER', {
            initialValue: deployInfo.CHUNKKEEPER,
            rules : [{
              required : true,
              message : 'ChunkKeeper 必选'
            }]
          })(
            <Select>
              {
                chunkKeeperList && chunkKeeperList.map( v => {
                  return <Option key={v.id} value={v.name + '-_-' + v.id}>
                    {v.name}
                  </Option>
                })
              }
            </Select>
          )}
        </FormItem>
        <FormItem label="ZooKeeper" {...formItemLayout}>
          { getFieldDecorator('ZOOKEEPER', {
            initialValue: deployInfo.ZOOKEEPER,
            rules : [{
              required : true,
              message : 'ChunkKeeper 必选'
            }]
          })(
            <Select>
              {
                zooKeeperList &&zooKeeperList.map( v => {
                  return <Option key={v.id} value={v.name + '-_-' + v.id}>
                    {v.name}
                  </Option>
                })
              }
            </Select>
          )}
        </FormItem>
      </Row>
    )
  }
}

Hcfdb.propType = {
  form : PropTypes.object,
  deployInfo: PropTypes.object,
  formItemLayout: PropTypes.object,
  template: PropTypes.string,
  zooKeeperList: PropTypes.array,
  chunkKeeperList: PropTypes.array,
}

export default Hcfdb
