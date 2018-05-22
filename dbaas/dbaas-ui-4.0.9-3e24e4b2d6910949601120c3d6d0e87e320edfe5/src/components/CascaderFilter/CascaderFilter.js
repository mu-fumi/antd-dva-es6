/**
 * Created by wengyian on 2017/10/24.
 */
/**
 * Created by wengyian on 2017/10/24.
 */

import React from 'react'
import PropTypes from 'prop-types'
import {classnames, constant, request} from 'utils'
import {Tooltip, Col, Row, Cascader, message, Form} from 'antd'
import _ from 'lodash'
import styles from './CasscaderFilter.less'


const FormItem = Form.Item
const {RELATE_TYPE} = constant

class CascaderFilter extends React.Component {
  constructor(props) {
    super(props)

    const {options} = props

    this.state = {
      options: options
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.options, this.state.options)) {
      this.setState({
        options: nextProps.options
      })
    }

    // console.log('nextProps===>', nextProps)
  }

  // getId(data){
  //   if('children' in data){
  //
  //     getId(data)
  //   }
  // }

  loadData = (selectedOptions) => {
    // console.log('selectedOptions===>', selectedOptions)

    const length = selectedOptions.length
    const targetOption = selectedOptions[length - 1];
    targetOption.loading = true;
    let url = '', params = {}
    const limitNum = this.props.length || 2

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
      case 2 : //获取 集群 此处获取的不止是集群 可能还有实例
        // 接口暂时没有 暂时用这个先 最后传 relate_id relate_type
        url = '/app/belongings'
        params = {
          method: 'get',
          data: {
            app_id: targetOption.value
          }
        }
    }
    this.promise = request(url, params).then((res) => {
      if (res.code !== 0) {
        message.error(res.error || res.msg)
      }
      targetOption.loading = false
      let result = res.data
      const isLeaf = length !== limitNum - 1 ? false : true
      switch (length) {
        case 1 :
          if (result.length === 0) {
              targetOption.children = [{
                isLeaf: true,
                disabled: true,
                value: '暂无数据',
                label: '暂无数据'
              }]
          } else {
            targetOption.children = result.map(v => {
              // 最后一层不能有扩展了
              const label = v.name
              return {
                isLeaf: isLeaf,
                value: v.id,
                label: label
              }
            })
          }
          break
        case 2 :
          const newChildren = []
          // 最后一层不能有扩展了
          const label = ['集群', '实例组', '实例']
          let isEmpty = true
          if (_.isPlainObject(result)) {
            Object.keys(result).forEach((key, i) => {
              const type = RELATE_TYPE[key]
              newChildren.push({
                isLeaf: isLeaf,
                value: key,
                disabled: true,
                label: label[type]
              })
              if (_.isEmpty(result[key])) {
                newChildren.pop()
              } else {
                isEmpty = false
                Object.keys(result[key]).forEach(v => {
                  newChildren.push({
                    isLeaf: isLeaf,
                    value: v + '-' + type,
                    label: <Row style={{marginLeft: '8px'}}>{result[key][v]}</Row>
                  })
                })
              }
            })
            // console.log('newChildren===>', newChildren)
            if(isEmpty){
              newChildren.push({
                isLeaf : true,
                value : '暂无数据',
                label : '暂无数据',
                disabled : true
              })
            }
          }
          targetOption.children = [...newChildren]
          break
      }
      this.setState({
        options: [...this.state.options]
      })
    }).catch(err => {
      message.error(err)
      targetOption.loading = false
    })
  }

  displayRender = (labels, selectedOptions) => {
    // console.log('labels===>', labels)
    const lastLabel = labels[labels.length - 1]
    if (typeof lastLabel === 'object') { //建议判断 是 react元素 此处做简化处理
      labels.pop()
      let text = lastLabel.props.children
      labels.push(text)
    }
    return labels.join(' / ')
  }

  onChange = (selectedOptions) => {
    // console.log('onChange selectedOptions===>', selectedOptions)
    if (this.props.onChange)
      this.props.onChange(selectedOptions)
  }

  render() {

    const layout = {
      labelCol: {
        span: 1
      },
      wrapperCol: {
        span: 6
      },
    }

    return (
      <Cascader
        options={this.state.options}
        loadData={this.loadData}
        onChange={this.onChange}
        changeOnSelect
        style={{display: 'inline-block'}}
        displayRender={this.displayRender}
        className={styles['cascader']}
        placeholder="请选择"
        popupClassName={styles["cascader-popup"]}
        defaultValue={this.props.defaultValue || []}
      />
    )
  }
}

CascaderFilter.propTypes = {
  options: PropTypes.array,
  onChange: PropTypes.func,
  length: PropTypes.number,
  props : PropTypes.object
}

export default CascaderFilter
