/**
 *
 * @copyright(c) 2017
 * @created by lizzy
 * @package dbaas-ui
 * @version :  2017-11-27 14:24 $
 */


import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Select, Spin, message } from 'antd'
import _ from 'lodash'
import { request, Logger } from 'utils'

const Option = Select.Option
const modelKey = 'monitor/trend';

class FuzzySelect extends React.Component {
  constructor(props) {
    super(props);
    this.fetchUser = _.debounce(this.fetchUser, 800);    // 节流控制
  }
  state = {
    data: [],
    value: [],
    fetching: false,
  }

  componentDidMount(){  //  初始待选项为所有主机
    this.fetchUser()
  }

  fetchUser = (value) => {
    this.setState({ fetching: true })
    const url = '/monitor/hosts'
    this.promise = request(url,
      {
        method: 'GET',
        data: {
          paginate: 0,
          keyword: value
        }}
    ).then((response) => {
      if (!this.refs.FuzzySelect) {
        return
      }
      if(response.code !== 0 || (!response.data)){
        const msg = response.error || response.msg
        message.error(msg)

        this.setState({
          fetching: false,
          data: []
        })
        return
      }
      this.props.handleHostNameIdRelations(response.data)  // 存储name，id映射关系
      const data = response.data.map(v => ({
        hostname: v.name,
        fetching: false,
      }))
      this.setState({
        data,
        fetching: false,
      })
    })
  }

  handleChange = (value) => {
    this.setState({
      value,
      // data: [],
      fetching: false,
    })
    if (this.props.onChange) {
      this.props.onChange(value)
    }
  }

  render() {
    const { fetching, data, value } = this.state
    return (
      <Select
        ref="FuzzySelect"
        mode="multiple"
        // labelInValue
        // defaultValue前端不显示，不生效
        value={this.props.selectedSimpleNodes} // 居然可以修改，能让前端显示，但不能让前端有值。。。
        placeholder="支持搜索集群、实例组、实例、主机名"
        notFoundContent={fetching ? <Spin size="small" /> : '暂无数据'}
        filterOption={false}
        onSearch={this.fetchUser}
        onChange={this.handleChange}
        style={{ width: '100%' }}
      >
        {data.map(v => <Option key={v.hostname}>{v.hostname}</Option>)}
      </Select>
    )
  }
}

FuzzySelect.propTypes = {
  selectedSimpleNodes: PropTypes.array,
}

export default FuzzySelect
