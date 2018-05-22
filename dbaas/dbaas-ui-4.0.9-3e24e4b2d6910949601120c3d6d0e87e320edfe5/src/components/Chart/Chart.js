/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-05-31 15:09 $
 */

import React, {Component} from 'react';
import { Row, Col, Spin, message } from 'antd'
import { Echart } from 'components'
import { request, Logger } from 'utils'
import lodash from 'lodash'
import PropTypes from 'prop-types'

class Chart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      option: {title: '', values:[]},
      showOption: {title: '', values:[]},
      fetchData: {},
    }
  }

  componentDidMount () {
    // console.log('<---componentDidMount--->')
    if (this.props.fetch) {
      this.fetch()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.reload !== this.props.reload || !lodash.isEqual(nextProps.fetch, this.props.fetch)) {
      this.props = nextProps
      this.fetch()
    }
    if (nextProps.selectedCard !== this.props.selectedCard) {
      // console.log('before', nextProps.selectedCard, this.state.showOption.values)
      // 进行磁盘或网卡筛选时，只显示选中card相关的线
      const option = this.state.option

      if (nextProps.selectedCard === '全部') {
        this.setState({
          showOption: option
        })
        return
      }

      // 提取[]中的磁盘名称
      const regex = /.*\[(.*)\].*/
      // console.log(regex.exec('CFDB186:8224[/ddd]')[1])

      const keys = Object.keys(option.values).filter(v => regex.exec(v)[1] === nextProps.selectedCard)
      const values = {}
      keys.map(v => {
        values[v] = option.values[v]
      })
      this.setState({
        showOption: {...this.state.showOption, values}
      })
      // console.log(keys, values)
    }
  }

  fetch = () => {
    if(!('fetch' in this.props) || !(this.props['fetch']) || !('url' in this.props['fetch'])){
      return
    }
    const { fetch: { url, data, required = [] } } = this.props

    // 如果data中必须的参数为空，则不发起请求
    let broken = false
    required.map((v)=>{
      if ((!data[v]) || data[v].length === 0) {   // 参数本身为空或者为空数组
        broken = true
      }
    })
    if (broken) return

    const { fetchData } = this.state

    this.setState({ loading: true })
    this.promise = request(url,
      {
        method: 'GET',
        data: {
          ...data,
          ...fetchData,
        }}
    ).then((response) => {
      if (!this.refs.Echart) {
        return
      }
      if(response.code !== 0){
        const msg = response.error || response.msg
        message.error(msg, 3)

        this.setState({
          loading: false,
          option: {title: '', values:[]}  // 这里不要写成[]或{}
        })
        return
      }

      this.setState({
        loading: false,
        option: response.data,
        showOption: response.data,
      })
    })
  }

  render() {
    const { type = 'line' } = this.props
    // console.log(this.state.option)
    return (
      <Spin spinning={this.state.loading}  >
        <Echart ref="Echart" type={type} option={this.state.showOption} />
      </Spin>
    )
  }
}

Chart.propTypes = {
  type: PropTypes.string,
  option: PropTypes.object,
  fetch: PropTypes.objectOf((propValue, key, componentName, location, propFullName) => {
    const propTypes = {
      url: PropTypes.string,
      data: PropTypes.object,
      required: PropTypes.array,
    }
    return PropTypes.checkPropTypes(propTypes, propValue[key], location, componentName)
  }),
  selectedCard: PropTypes.string,
};


export default Chart
