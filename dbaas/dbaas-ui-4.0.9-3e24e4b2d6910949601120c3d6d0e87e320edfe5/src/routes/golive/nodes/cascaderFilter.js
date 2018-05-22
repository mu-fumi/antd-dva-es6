/**
 * Created by wengyian on 2017/10/24.
 */

import React from 'react'
import PropTypes from 'prop-types'
import {classnames, constant} from 'utils'
import {Tooltip, Col, Row, Cascader, message, Form} from 'antd'
import {request} from 'utils'

const FormItem = Form.Item

class CascaderFilter extends React.Component {
  constructor(props) {
    super(props)

    const {options,} = props

    this.state = {
      options: [{
        value: '1',
        label: '业务1',
        isLeaf: false
      }, {
        value: '2',
        label: '业务2',
        isLeaf: false
      },]
    }
  }

  // getId(data){
  //   if('children' in data){
  //
  //     getId(data)
  //   }
  // }

  loadData = (selectedOptions) => {
    console.log('loadData selectedOptions===>', selectedOptions)

    const length = selectedOptions.length
    const targetOption = selectedOptions[length - 1];
    targetOption.loading = true;
    let url = '', params = {}
    const limitNum = this.props.length

    switch (length) {
      case 1 : //获取 应用
        url = '/applications'
        params = {
          method: 'get',
          data: {
            business_id: targetOption.value,
            paging: 0
          }
        }
        break
      case 2 : //获取 集群
        url = '/deploy/app/clusters'
        params = {
          method: 'get',
          data: {
            app_id: targetOption.value
          }
        }
    }
    this.promise = request(url, params).then((res) => {
      targetOption.loading = false;
      if (res.code !== 0) {
        message.error(res.error || res.msg)
      }
      let result = res.data
      targetOption.children = result.map(v => {
        // 最后一层不能有扩展了
        const isLeaf = length !== limitNum - 1 ? false : true
        // 两个接口返回值不一样
        const label = length !== 2 ? v.business_name : v.name

        return {
          isLeaf: isLeaf,
          value: v.id,
          label: label
        }
      })

      this.setState({
        options: [...this.state.options]
      })
    })

  }

  onChange = (selectedOptions) => {
    // console.log('onChange selectedOptions===>', selectedOptions)
    if (this.props.onChange())
      this.props.onChange(selectedOptions)
  }

  render() {

    const layout = {
      labelCol: {
        span : 1
      },
      wrapperCol: {
        span : 6
      },
    }

    return (

            <Cascader
              options={this.state.options}
              loadData={this.loadData}
              onChange={this.onChange}
              changeOnSelect
              style={{display : 'inline-block'}}
            />

    )
  }
}

CascaderFilter.propTypes = {}

export default CascaderFilter
